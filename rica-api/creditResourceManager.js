/**
 * Credit-Based Resource Manager
 * 
 * Integrates the credit system with tenant resource management
 * Monitors credit usage and enforces resource limits based on available credits
 */

import tenantManager from './tenantManager.js';

// Credit costs for different features (credits per hour)
const FEATURE_CREDIT_COSTS = {
  'rica-ui': 1,           // 1 credit per hour
  'activepieces': 2,      // 2 credits per hour
  'code-server': 2,       // 2 credits per hour
  'ollama': 4,            // 4 credits per hour (LLM usage)
  'storage': 0.1          // 0.1 credits per GB per hour
};

// Minimum credits required to provision a tenant
const MIN_CREDITS_FOR_PROVISIONING = {
  'pay-as-you-go': 10,
  'personal': 50,
  'team': 100
};

class CreditResourceManager {
  constructor() {
    this.creditUsageTracking = new Map(); // Track credit usage per tenant
    this.creditCheckInterval = null;
  }

  /**
   * Initialize credit monitoring
   */
  initialize() {
    // Check credits every 5 minutes
    this.creditCheckInterval = setInterval(() => {
      this.checkAllTenantsCredits();
    }, 5 * 60 * 1000);

    console.log('Credit Resource Manager initialized');
  }

  /**
   * Stop credit monitoring
   */
  shutdown() {
    if (this.creditCheckInterval) {
      clearInterval(this.creditCheckInterval);
      this.creditCheckInterval = null;
    }
    console.log('Credit Resource Manager shutdown');
  }

  /**
   * Check if user has enough credits to provision a tenant
   */
  async canProvisionTenant(userId, userCredits, subscriptionTier) {
    const minCredits = MIN_CREDITS_FOR_PROVISIONING[subscriptionTier] || MIN_CREDITS_FOR_PROVISIONING['pay-as-you-go'];
    
    if (userCredits < minCredits) {
      return {
        allowed: false,
        reason: `Insufficient credits. Need at least ${minCredits} credits to provision ${subscriptionTier} tier.`,
        requiredCredits: minCredits,
        currentCredits: userCredits,
        shortfall: minCredits - userCredits
      };
    }

    return {
      allowed: true,
      requiredCredits: minCredits,
      currentCredits: userCredits
    };
  }

  /**
   * Calculate credit usage for a tenant
   */
  calculateTenantCreditUsage(tenant, hoursUsed = 1) {
    const tierConfig = tenant.tierConfig;
    let totalCredits = 0;

    // Calculate credits for enabled features
    if (tierConfig.features.activepieces) {
      totalCredits += FEATURE_CREDIT_COSTS['activepieces'] * hoursUsed;
    }
    if (tierConfig.features.codeServer) {
      totalCredits += FEATURE_CREDIT_COSTS['code-server'] * hoursUsed;
    }
    if (tierConfig.features.ollama) {
      totalCredits += FEATURE_CREDIT_COSTS['ollama'] * hoursUsed;
    }

    // Always include Rica UI
    totalCredits += FEATURE_CREDIT_COSTS['rica-ui'] * hoursUsed;

    // Add storage costs
    const storageGB = this.parseStorageToGB(tierConfig.storageRequest);
    totalCredits += FEATURE_CREDIT_COSTS['storage'] * storageGB * hoursUsed;

    return Math.ceil(totalCredits);
  }

  /**
   * Parse storage string to GB
   */
  parseStorageToGB(storageString) {
    const match = storageString.match(/^(\d+)(Gi|Mi|Ki)$/);
    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'Gi':
        return value;
      case 'Mi':
        return value / 1024;
      case 'Ki':
        return value / (1024 * 1024);
      default:
        return 0;
    }
  }

  /**
   * Start tracking credit usage for a tenant
   */
  startCreditTracking(tenantId, userId) {
    const now = Date.now();
    this.creditUsageTracking.set(tenantId, {
      userId,
      startTime: now,
      lastCheckTime: now,
      totalCreditsUsed: 0,
      hourlyRate: 0
    });

    const tenant = tenantManager.getTenant(tenantId);
    if (tenant) {
      const hourlyRate = this.calculateTenantCreditUsage(tenant, 1);
      const tracking = this.creditUsageTracking.get(tenantId);
      tracking.hourlyRate = hourlyRate;
      this.creditUsageTracking.set(tenantId, tracking);
    }

    console.log(`Started credit tracking for tenant: ${tenantId}`);
  }

  /**
   * Stop tracking credit usage for a tenant
   */
  stopCreditTracking(tenantId) {
    const tracking = this.creditUsageTracking.get(tenantId);
    if (tracking) {
      const finalUsage = this.calculateCurrentUsage(tenantId);
      this.creditUsageTracking.delete(tenantId);
      console.log(`Stopped credit tracking for tenant: ${tenantId}, total credits used: ${finalUsage}`);
      return finalUsage;
    }
    return 0;
  }

  /**
   * Calculate current credit usage for a tenant
   */
  calculateCurrentUsage(tenantId) {
    const tracking = this.creditUsageTracking.get(tenantId);
    if (!tracking) return 0;

    const now = Date.now();
    const hoursElapsed = (now - tracking.lastCheckTime) / (1000 * 60 * 60);
    const creditsUsed = tracking.hourlyRate * hoursElapsed;

    return tracking.totalCreditsUsed + creditsUsed;
  }

  /**
   * Update credit usage tracking
   */
  updateCreditTracking(tenantId) {
    const tracking = this.creditUsageTracking.get(tenantId);
    if (!tracking) return;

    const now = Date.now();
    const hoursElapsed = (now - tracking.lastCheckTime) / (1000 * 60 * 60);
    const creditsUsed = tracking.hourlyRate * hoursElapsed;

    tracking.totalCreditsUsed += creditsUsed;
    tracking.lastCheckTime = now;
    this.creditUsageTracking.set(tenantId, tracking);

    return {
      creditsUsed,
      totalCreditsUsed: tracking.totalCreditsUsed,
      hourlyRate: tracking.hourlyRate
    };
  }

  /**
   * Check credits for a specific tenant
   */
  async checkTenantCredits(tenantId, currentUserCredits) {
    const tracking = this.creditUsageTracking.get(tenantId);
    if (!tracking) return { status: 'ok' };

    const usage = this.updateCreditTracking(tenantId);
    const remainingCredits = currentUserCredits - usage.totalCreditsUsed;

    // Calculate hours remaining
    const hoursRemaining = remainingCredits / usage.hourlyRate;

    const result = {
      tenantId,
      userId: tracking.userId,
      currentCredits: currentUserCredits,
      creditsUsed: usage.totalCreditsUsed,
      remainingCredits,
      hourlyRate: usage.hourlyRate,
      hoursRemaining,
      status: 'ok'
    };

    // Check if credits are running low
    if (hoursRemaining < 1) {
      result.status = 'critical';
      result.warning = 'Less than 1 hour of credits remaining';
    } else if (hoursRemaining < 24) {
      result.status = 'warning';
      result.warning = 'Less than 24 hours of credits remaining';
    } else if (remainingCredits < 50) {
      result.status = 'low';
      result.warning = 'Credit balance is low';
    }

    return result;
  }

  /**
   * Check all tenants' credits
   */
  async checkAllTenantsCredits() {
    const tenants = tenantManager.listTenants();
    const results = [];

    for (const tenant of tenants) {
      const tracking = this.creditUsageTracking.get(tenant.tenantId);
      if (!tracking) continue;

      // In production, fetch actual user credits from database
      // For now, we'll skip the check
      // const userCredits = await getUserCredits(tenant.userId);
      // const result = await this.checkTenantCredits(tenant.tenantId, userCredits);
      // results.push(result);

      // Update tracking
      this.updateCreditTracking(tenant.tenantId);
    }

    return results;
  }

  /**
   * Get credit usage report for a tenant
   */
  getCreditUsageReport(tenantId) {
    const tracking = this.creditUsageTracking.get(tenantId);
    if (!tracking) {
      return {
        error: 'Tenant not found or not being tracked'
      };
    }

    const tenant = tenantManager.getTenant(tenantId);
    const currentUsage = this.calculateCurrentUsage(tenantId);
    const now = Date.now();
    const totalHours = (now - tracking.startTime) / (1000 * 60 * 60);

    return {
      tenantId,
      userId: tracking.userId,
      subscriptionTier: tenant?.subscriptionTier,
      startTime: new Date(tracking.startTime).toISOString(),
      totalHours: totalHours.toFixed(2),
      hourlyRate: tracking.hourlyRate,
      totalCreditsUsed: currentUsage.toFixed(2),
      features: tenant?.tierConfig?.features,
      breakdown: {
        ricaUi: FEATURE_CREDIT_COSTS['rica-ui'] * totalHours,
        activepieces: tenant?.tierConfig?.features?.activepieces ? FEATURE_CREDIT_COSTS['activepieces'] * totalHours : 0,
        codeServer: tenant?.tierConfig?.features?.codeServer ? FEATURE_CREDIT_COSTS['code-server'] * totalHours : 0,
        ollama: tenant?.tierConfig?.features?.ollama ? FEATURE_CREDIT_COSTS['ollama'] * totalHours : 0
      }
    };
  }

  /**
   * Suspend tenant due to insufficient credits
   */
  async suspendTenant(tenantId, reason) {
    console.log(`Suspending tenant ${tenantId}: ${reason}`);
    
    // In production, this would:
    // 1. Scale down deployments to 0 replicas
    // 2. Update tenant status to 'suspended'
    // 3. Notify user
    // 4. Stop credit tracking

    const tracking = this.creditUsageTracking.get(tenantId);
    if (tracking) {
      const finalUsage = this.stopCreditTracking(tenantId);
      return {
        tenantId,
        status: 'suspended',
        reason,
        finalCreditsUsed: finalUsage
      };
    }

    return {
      tenantId,
      status: 'suspended',
      reason
    };
  }

  /**
   * Resume tenant after credits are added
   */
  async resumeTenant(tenantId, userId) {
    console.log(`Resuming tenant ${tenantId}`);
    
    // In production, this would:
    // 1. Scale deployments back to normal
    // 2. Update tenant status to 'active'
    // 3. Restart credit tracking
    // 4. Notify user

    this.startCreditTracking(tenantId, userId);

    return {
      tenantId,
      status: 'active'
    };
  }

  /**
   * Get estimated monthly cost for a subscription tier
   */
  getEstimatedMonthlyCost(subscriptionTier) {
    const tierConfig = tenantManager.TIER_CONFIGS?.[subscriptionTier];
    if (!tierConfig) return 0;

    // Create a mock tenant to calculate costs
    const mockTenant = {
      tierConfig: tierConfig
    };

    const hourlyCredits = this.calculateTenantCreditUsage(mockTenant, 1);
    const monthlyCredits = hourlyCredits * 24 * 30; // 30 days

    return {
      tier: subscriptionTier,
      hourlyCredits,
      dailyCredits: hourlyCredits * 24,
      monthlyCredits,
      estimatedMonthlyCost: (monthlyCredits * 0.04).toFixed(2) // $0.04 per credit
    };
  }
}

export default new CreditResourceManager();
