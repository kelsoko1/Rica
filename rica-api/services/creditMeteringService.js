const { Pool } = require('pg');
const Redis = require('ioredis');
const { promisify } = require('util');
const client = require('prom-client');
const rateLimit = require('express-rate-limit');
const CircuitBreaker = require('opossum');
const retry = require('async-retry');

// Initialize Redis client with connection pooling
const redis = new Redis.Cluster([
  {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  }
], {
  scaleReads: 'slave', // Distribute reads across replicas
  enableOfflineQueue: false, // Disable queuing when Redis is down
  retryStrategy: (times) => {
    const delay = Math.min(times * 100, 5000);
    return delay;
  }
});

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Max number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Prometheus metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const creditDeductionCounter = new client.Counter({
  name: 'credit_deductions_total',
  help: 'Total number of credit deductions',
  labelNames: ['tenant_id', 'resource_type', 'status']
});

const creditBalanceGauge = new client.Gauge({
  name: 'credit_balance',
  help: 'Current credit balance per tenant',
  labelNames: ['tenant_id']
});

// Credit costs per resource unit (per hour)
const PRICING = {
  // Core Services
  rica_ui: 1,              // per hour
  activepieces: 2,          // per hour
  code_server: 2,           // per hour
  ollama: 4,                // per hour
  vircadia: 3,              // per hour

  // Resource-based
  cpu: 0.04,                // per 1000m CPU per hour
  memory: 0.008,            // per 1Gi RAM per hour
  storage: 0.0002,          // per 1Gi storage per hour

  // API Calls
  activepieces_call: 0.001,  // per API call
  ollama_token: 0.00001,    // per token processed
  vircadia_minute: 0.005,   // per minute in metaverse
  codeserver_minute: 0.002, // per minute of usage

  // Network
  bandwidth_in: 0.0000001,  // per MB in
  bandwidth_out: 0.0000002  // per MB out
};

// Ad revenue conversion rates
const AD_REVENUE = {
  video_ad_view: 0.01,      // Credits per completed video ad
  banner_impression: 0.001, // Credits per 1000 impressions
  interstitial_ad: 0.005,   // Credits per interstitial ad
  sponsored_content: 0.02   // Credits per sponsored content view
};

class CreditMeteringService {
  constructor() {
    // Initialize circuit breakers
    this.redisCircuitBreaker = new CircuitBreaker(this.redisOperation.bind(this), {
      timeout: 5000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000
    });

    // Set up periodic tasks
    this.initializePeriodicTasks();
  }

  /**
   * Initialize periodic tasks
   */
  initializePeriodicTasks() {
    // Flush Redis data to PostgreSQL every 5 minutes
    setInterval(() => this.flushAllUsageToDatabase(), 5 * 60 * 1000);

    // Update credit balances every hour
    setInterval(() => this.updateCreditBalances(), 60 * 60 * 1000);
  }

  /**
   * Wrapper for Redis operations with circuit breaker
   */
  async redisOperation(operation, ...args) {
    return this.redisCircuitBreaker.fire(operation, ...args);
  }

  /**
   * Record resource usage and deduct credits
   */
  async recordUsage(tenantId, resourceType, amount, metadata = {}) {
    try {
      const cost = this.calculateCost(resourceType, amount);
      const timestamp = Date.now();

      const usage = {
        tenantId,
        resourceType,
        amount,
        cost,
        metadata,
        timestamp
      };

      // Store in Redis for real-time tracking
      await this.redisOperation('zadd', `usage:${tenantId}`, timestamp, JSON.stringify(usage));

      // Deduct credits atomically
      const remaining = await this.deductCredits(tenantId, cost);

      // Update metrics
      creditDeductionCounter.inc({
        tenant_id: tenantId,
        resource_type: resourceType,
        status: 'success'
      }, cost);

      creditBalanceGauge.set({ tenant_id: tenantId }, remaining);

      // Check for low balance
      if (remaining < 5) {
        await this.sendLowCreditAlert(tenantId, remaining);
      }

      return { success: true, cost, remaining };
    } catch (error) {
      console.error(`Error recording usage for tenant ${tenantId}:`, error);
      creditDeductionCounter.inc({
        tenant_id: tenantId,
        resource_type: resourceType,
        status: 'error'
      });

      throw error;
    }
  }

  /**
   * Calculate cost based on pricing model
   */
  calculateCost(resourceType, amount) {
    const rate = PRICING[resourceType];
    if (rate === undefined) {
      throw new Error(`Unknown resource type: ${resourceType}`);
    }
    return parseFloat((amount * rate).toFixed(8)); // Ensure we don't have floating point issues
  }

  /**
   * Atomic credit deduction with Redis Lua script
   */
  async deductCredits(tenantId, amount) {
    const script = `
      local key = KEYS[1]
      local deduct = tonumber(ARGV[1])
      local current = tonumber(redis.call('get', key) or '0')

      -- Check if enough credits
      if current < deduct then
        return redis.error_reply('INSUFFICIENT_CREDITS')
      end

      -- Deduct credits
      local remaining = current - deduct
      redis.call('set', key, remaining)

      -- Record the transaction
      redis.call('zadd', 'transactions:' .. key, ARGV[2],
        string.format('{"type":"debit","amount":%f,"balance":%f,"timestamp":%s}',
          deduct, remaining, ARGV[2]))

      return remaining
    `;

    try {
      const result = await this.redisOperation('eval', script, 1,
        `credits:${tenantId}`,
        amount.toString(),
        Date.now().toString()
      );

      return parseFloat(result);
    } catch (error) {
      if (error.message.includes('INSUFFICIENT_CREDITS')) {
        throw new Error('Insufficient credits');
      }
      throw error;
    }
  }

  /**
   * Add credits to a tenant's balance
   */
  async addCredits(tenantId, amount, source = 'manual', reference = '') {
    const script = `
      local key = KEYS[1]
      local add = tonumber(ARGV[1])
      local current = tonumber(redis.call('get', key) or '0')
      local new_balance = current + add

      -- Update balance
      redis.call('set', key, new_balance)

      -- Record the transaction
      redis.call('zadd', 'transactions:' .. key, ARGV[2],
        string.format('{"type":"credit","amount":%f,"source":"%s","reference":"%s","balance":%f,"timestamp":%s}',
          add, ARGV[3], ARGV[4], new_balance, ARGV[2]))

      return new_balance
    `;

    const result = await this.redisOperation('eval', script, 1,
      `credits:${tenantId}`,
      amount.toString(),
      Date.now().toString(),
      source,
      reference
    );

    // Update metrics
    creditBalanceGauge.set({ tenant_id: tenantId }, result);

    return parseFloat(result);
  }

  /**
   * Process ad revenue and add credits
   */
  async processAdRevenue(tenantId, adType, count = 1, metadata = {}) {
    const revenue = AD_REVENUE[adType] * count;

    if (revenue <= 0) {
      throw new Error(`Invalid ad type: ${adType}`);
    }

    const result = await this.addCredits(
      tenantId,
      revenue,
      'ad_revenue',
      `${adType}:${count}`
    );

    // Log ad revenue
    await this.logAdRevenue(tenantId, adType, count, revenue, metadata);

    return {
      success: true,
      adType,
      count,
      creditsEarned: revenue,
      newBalance: result
    };
  }

  /**
   * Log ad revenue to database
   */
  async logAdRevenue(tenantId, adType, count, creditsEarned, metadata) {
    const query = `
      INSERT INTO ad_revenue_log (
        tenant_id,
        ad_type,
        count,
        credits_earned,
        metadata,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id
    `;

    try {
      await pool.query(query, [
        tenantId,
        adType,
        count,
        creditsEarned,
        JSON.stringify(metadata)
      ]);
    } catch (error) {
      console.error('Error logging ad revenue:', error);
      // Don't fail the operation, just log the error
    }
  }

  /**
   * Get current credit balance
   */
  async getBalance(tenantId) {
    const balance = await this.redisOperation('get', `credits:${tenantId}`);
    return parseFloat(balance || 0);
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(tenantId, limit = 100, offset = 0) {
    const transactions = await this.redisOperation(
      'zrevrange',
      `transactions:credits:${tenantId}`,
      offset,
      offset + limit - 1,
      'WITHSCORES'
    );

    return transactions.map(([data, timestamp]) => ({
      ...JSON.parse(data),
      timestamp: parseInt(timestamp)
    }));
  }

  /**
   * Flush all usage data from Redis to PostgreSQL
   */
  async flushAllUsageToDatabase() {
    try {
      // Get all tenant usage keys
      const keys = await this.redisOperation('keys', 'usage:*');

      for (const key of keys) {
        const tenantId = key.split(':')[1];
        await this.flushTenantUsageToDatabase(tenantId);
      }
    } catch (error) {
      console.error('Error flushing usage data:', error);
    }
  }

  /**
   * Flush a single tenant's usage to database
   */
  async flushTenantUsageToDatabase(tenantId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get all usage records
      const usageData = await this.redisOperation('zrange', `usage:${tenantId}`, 0, -1);

      if (usageData.length === 0) {
        await client.query('COMMIT');
        return { success: true, recordsProcessed: 0 };
      }

      // Prepare batch insert
      const query = `
        INSERT INTO usage_records (
          tenant_id,
          resource_type,
          amount,
          cost,
          metadata,
          recorded_at
        ) VALUES ${usageData.map((_, i) =>
          `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, to_timestamp($${i * 6 + 6} / 1000.0))`
        ).join(', ')}
        ON CONFLICT DO NOTHING
      `;

      const params = usageData.flatMap(data => {
        const record = JSON.parse(data);
        return [
          record.tenantId,
          record.resourceType,
          record.amount,
          record.cost,
          JSON.stringify(record.metadata || {}),
          record.timestamp
        ];
      });

      await client.query(query, params);

      // Clear processed records
      await this.redisOperation('del', `usage:${tenantId}`);

      await client.query('COMMIT');

      return { success: true, recordsProcessed: usageData.length };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error flushing usage for tenant ${tenantId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update credit balances from database
   */
  async updateCreditBalances() {
    const client = await pool.connect();

    try {
      const result = await client.query(
        'SELECT tenant_id, balance FROM tenant_balances'
      );

      const pipeline = redis.pipeline();

      for (const row of result.rows) {
        pipeline.set(`credits:${row.tenant_id}`, row.balance);
      }

      await pipeline.exec();

      return { success: true, tenantsUpdated: result.rowCount };
    } catch (error) {
      console.error('Error updating credit balances:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Send low credit alert
   */
  async sendLowCreditAlert(tenantId, remaining) {
    // In a real implementation, this would:
    // 1. Send email/SMS notification
    // 2. Trigger webhook if configured
    // 3. Log the event

    console.log(`⚠️ Low credits alert for tenant ${tenantId}: ${remaining} credits remaining`);

    // Example webhook call (commented out)
    /*
    try {
      await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'low_credits',
          tenantId,
          remaining,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error sending webhook:', error);
    }
    */
  }

  /**
   * Get usage statistics
   */
  async getUsageStatistics(tenantId, startTime, endTime = Date.now()) {
    const query = `
      SELECT
        resource_type,
        SUM(amount) as total_amount,
        SUM(cost) as total_cost,
        COUNT(*) as record_count
      FROM usage_records
      WHERE
        tenant_id = $1 AND
        recorded_at BETWEEN to_timestamp($2 / 1000.0) AND to_timestamp($3 / 1000.0)
      GROUP BY resource_type
      ORDER BY total_cost DESC
    `;

    const result = await pool.query(query, [tenantId, startTime, endTime]);

    return {
      tenantId,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      statistics: result.rows
    };
  }

  /**
   * Get current rate limits
   */
  getRateLimits() {
    return {
      // Global rate limits (per minute)
      global: {
        windowMs: 60 * 1000, // 1 minute
        max: 1000, // 1000 requests per minute per IP
        message: 'Too many requests, please try again later.'
      },

      // Per-tenant rate limits
      perTenant: {
        windowMs: 60 * 1000, // 1 minute
        max: 100, // 100 requests per minute per tenant
        message: 'Too many requests, please try again later.'
      },

      // Ad revenue rate limits
      adRevenue: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 1000, // 1000 ad events per hour per tenant
        message: 'Too many ad events, please try again later.'
      }
    };
  }
}

// Create singleton instance
const creditMeteringService = new CreditMeteringService();

// Export middleware for Express
const creditMiddleware = (req, res, next) => {
  req.creditMeter = creditMeteringService;
  next();
};

// Export metrics endpoint
const metricsMiddleware = async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate metrics' });
  }
};

module.exports = {
  creditMeteringService,
  creditMiddleware,
  metricsMiddleware,
  PRICING,
  AD_REVENUE
};
