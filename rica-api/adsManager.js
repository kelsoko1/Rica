/**
 * Vircadia Ads Management Service
 * 
 * Manages advertisement system for Vircadia virtual worlds
 * Provides monetization features for world creators through ad revenue sharing
 */

import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  database: process.env.DB_NAME || 'rica_auth',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
});

class AdsManager {
  constructor() {
    this.revenueShare = {
      creator: 0.70,  // 70% to world creator
      platform: 0.30  // 30% to Rica platform
    };
    this.cpmRate = 5.00; // $5 per 1000 ad impressions
    this.minPayout = 10.00; // Minimum payout threshold
  }

  /**
   * Initialize ads database tables
   */
  async initializeDatabase() {
    try {
      // Create ads_campaigns table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ads_campaigns (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          advertiser_id UUID NOT NULL,
          advertiser_name VARCHAR(255),
          budget DECIMAL(10,2) DEFAULT 0,
          spent DECIMAL(10,2) DEFAULT 0,
          cpm DECIMAL(5,2) DEFAULT 5.00,
          status VARCHAR(50) DEFAULT 'active',
          start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          end_date TIMESTAMP,
          targeting JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create ads_placements table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ads_placements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          campaign_id UUID REFERENCES ads_campaigns(id) ON DELETE CASCADE,
          world_id UUID NOT NULL,
          world_creator_id UUID NOT NULL,
          placement_type VARCHAR(50) DEFAULT 'billboard',
          position JSONB DEFAULT '{}',
          dimensions JSONB DEFAULT '{}',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create ads_impressions table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ads_impressions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          placement_id UUID REFERENCES ads_placements(id) ON DELETE CASCADE,
          user_id UUID NOT NULL,
          session_id VARCHAR(255),
          impression_type VARCHAR(50) DEFAULT 'view',
          duration_seconds INTEGER DEFAULT 0,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create ads_revenue table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ads_revenue (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          world_creator_id UUID NOT NULL,
          world_id UUID NOT NULL,
          campaign_id UUID REFERENCES ads_campaigns(id) ON DELETE CASCADE,
          impressions INTEGER DEFAULT 0,
          clicks INTEGER DEFAULT 0,
          revenue DECIMAL(10,2) DEFAULT 0,
          platform_share DECIMAL(10,2) DEFAULT 0,
          creator_share DECIMAL(10,2) DEFAULT 0,
          date_recorded DATE DEFAULT CURRENT_DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create ads_payouts table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ads_payouts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          creator_id UUID NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          payout_method VARCHAR(50) DEFAULT 'credit_balance',
          transaction_id VARCHAR(255),
          requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          processed_at TIMESTAMP
        );
      `);

      // Create indexes for better performance
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_ads_campaigns_advertiser ON ads_campaigns(advertiser_id);
        CREATE INDEX IF NOT EXISTS idx_ads_placements_world ON ads_placements(world_id);
        CREATE INDEX IF NOT EXISTS idx_ads_impressions_placement ON ads_impressions(placement_id);
        CREATE INDEX IF NOT EXISTS idx_ads_revenue_creator ON ads_revenue(world_creator_id);
        CREATE INDEX IF NOT EXISTS idx_ads_revenue_date ON ads_revenue(date_recorded);
      `);

      console.log('Ads management database initialized successfully');
    } catch (error) {
      console.error('Error initializing ads database:', error);
      throw error;
    }
  }

  /**
   * Create a new ad campaign
   */
  async createCampaign(campaignData) {
    try {
      const { name, advertiserId, advertiserName, budget, cpm, endDate, targeting } = campaignData;

      const result = await pool.query(`
        INSERT INTO ads_campaigns (name, advertiser_id, advertiser_name, budget, cpm, end_date, targeting)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [name, advertiserId, advertiserName, budget, cpm || this.cpmRate, endDate, JSON.stringify(targeting || {})]);

      return {
        success: true,
        campaign: result.rows[0]
      };
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  /**
   * Add ad placement to a Vircadia world
   */
  async addAdPlacement(placementData) {
    try {
      const { campaignId, worldId, worldCreatorId, placementType, position, dimensions } = placementData;

      const result = await pool.query(`
        INSERT INTO ads_placements (campaign_id, world_id, world_creator_id, placement_type, position, dimensions)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [campaignId, worldId, worldCreatorId, placementType || 'billboard', JSON.stringify(position || {}), JSON.stringify(dimensions || {})]);

      return {
        success: true,
        placement: result.rows[0]
      };
    } catch (error) {
      console.error('Error adding ad placement:', error);
      throw error;
    }
  }

  /**
   * Record ad impression
   */
  async recordImpression(placementId, userId, sessionId, durationSeconds = 0) {
    try {
      await pool.query(`
        INSERT INTO ads_impressions (placement_id, user_id, session_id, duration_seconds)
        VALUES ($1, $2, $3, $4)
      `, [placementId, userId, sessionId, durationSeconds]);

      // Update campaign spending
      await this.updateCampaignSpending(placementId);

      return { success: true };
    } catch (error) {
      console.error('Error recording impression:', error);
      throw error;
    }
  }

  /**
   * Update campaign spending based on impressions
   */
  async updateCampaignSpending(placementId) {
    try {
      // Get placement details
      const placementResult = await pool.query(`
        SELECT campaign_id FROM ads_placements WHERE id = $1
      `, [placementId]);

      if (placementResult.rows.length === 0) return;

      const campaignId = placementResult.rows[0].campaign_id;

      // Count impressions for this campaign
      const impressionsResult = await pool.query(`
        SELECT COUNT(*) as impression_count
        FROM ads_impressions ai
        JOIN ads_placements ap ON ai.placement_id = ap.id
        WHERE ap.campaign_id = $1 AND ai.timestamp >= CURRENT_DATE
      `, [campaignId]);

      const impressions = parseInt(impressionsResult.rows[0].impression_count);

      // Get campaign CPM rate
      const campaignResult = await pool.query(`
        SELECT cpm FROM ads_campaigns WHERE id = $1
      `, [campaignId]);

      const cpm = parseFloat(campaignResult.rows[0].cpm);
      const cost = (impressions / 1000) * cpm;

      // Update campaign spending
      await pool.query(`
        UPDATE ads_campaigns
        SET spent = $1
        WHERE id = $2
      `, [cost, campaignId]);

    } catch (error) {
      console.error('Error updating campaign spending:', error);
    }
  }

  /**
   * Calculate and record daily revenue for world creators
   */
  async calculateDailyRevenue() {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get all active placements and their impression data
      const revenueResult = await pool.query(`
        SELECT
          ap.world_creator_id,
          ap.world_id,
          ap.campaign_id,
          COUNT(ai.id) as impressions,
          ac.cpm,
          (COUNT(ai.id)::DECIMAL / 1000) * ac.cpm as total_revenue
        FROM ads_placements ap
        JOIN ads_impressions ai ON ap.id = ai.placement_id
        JOIN ads_campaigns ac ON ap.campaign_id = ac.id
        WHERE ai.timestamp >= $1::DATE
          AND ai.timestamp < ($1::DATE + INTERVAL '1 day')
        GROUP BY ap.world_creator_id, ap.world_id, ap.campaign_id, ac.cpm
      `, [today]);

      // Process each revenue record
      for (const row of revenueResult.rows) {
        const creatorShare = row.total_revenue * this.revenueShare.creator;
        const platformShare = row.total_revenue * this.revenueShare.platform;

        await pool.query(`
          INSERT INTO ads_revenue
          (world_creator_id, world_id, campaign_id, impressions, revenue, platform_share, creator_share)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (world_creator_id, world_id, campaign_id, date_recorded)
          DO UPDATE SET
            impressions = EXCLUDED.impressions,
            revenue = EXCLUDED.revenue,
            platform_share = EXCLUDED.platform_share,
            creator_share = EXCLUDED.creator_share
        `, [
          row.world_creator_id,
          row.world_id,
          row.campaign_id,
          row.impressions,
          row.total_revenue,
          platformShare,
          creatorShare
        ]);
      }

      return { success: true, recordsProcessed: revenueResult.rows.length };
    } catch (error) {
      console.error('Error calculating daily revenue:', error);
      throw error;
    }
  }

  /**
   * Get revenue summary for a world creator
   */
  async getCreatorRevenue(creatorId, startDate, endDate) {
    try {
      const result = await pool.query(`
        SELECT
          SUM(creator_share) as total_earnings,
          SUM(impressions) as total_impressions,
          COUNT(DISTINCT world_id) as active_worlds,
          AVG(creator_share) as avg_daily_earnings
        FROM ads_revenue
        WHERE world_creator_id = $1
          AND date_recorded >= $2
          AND date_recorded <= $3
      `, [creatorId, startDate, endDate]);

      return {
        success: true,
        revenue: result.rows[0]
      };
    } catch (error) {
      console.error('Error getting creator revenue:', error);
      throw error;
    }
  }

  /**
   * Request payout for a creator
   */
  async requestPayout(creatorId, amount) {
    try {
      if (amount < this.minPayout) {
        throw new Error(`Minimum payout is $${this.minPayout}`);
      }

      // Check if creator has enough earnings
      const earningsResult = await pool.query(`
        SELECT SUM(creator_share) as total_earnings
        FROM ads_revenue
        WHERE world_creator_id = $1
      `, [creatorId]);

      const totalEarnings = parseFloat(earningsResult.rows[0].total_earnings || 0);

      if (amount > totalEarnings) {
        throw new Error('Insufficient earnings for payout request');
      }

      // Create payout request
      await pool.query(`
        INSERT INTO ads_payouts (creator_id, amount, status)
        VALUES ($1, $2, 'pending')
      `, [creatorId, amount]);

      return {
        success: true,
        message: `Payout request for $${amount} submitted successfully`
      };
    } catch (error) {
      console.error('Error requesting payout:', error);
      throw error;
    }
  }

  /**
   * Get available ad campaigns for world placement
   */
  async getAvailableCampaigns() {
    try {
      const result = await pool.query(`
        SELECT * FROM ads_campaigns
        WHERE status = 'active'
          AND (budget = 0 OR spent < budget)
          AND (end_date IS NULL OR end_date > CURRENT_TIMESTAMP)
        ORDER BY created_at DESC
      `);

      return {
        success: true,
        campaigns: result.rows
      };
    } catch (error) {
      console.error('Error getting available campaigns:', error);
      throw error;
    }
  }

  /**
   * Get world creator's active ad placements
   */
  async getCreatorPlacements(creatorId) {
    try {
      const result = await pool.query(`
        SELECT
          ap.*,
          ac.name as campaign_name,
          ac.advertiser_name,
          COUNT(ai.id) as impressions_today
        FROM ads_placements ap
        JOIN ads_campaigns ac ON ap.campaign_id = ac.id
        LEFT JOIN ads_impressions ai ON ap.id = ai.placement_id
          AND ai.timestamp >= CURRENT_DATE
        WHERE ap.world_creator_id = $1
        GROUP BY ap.id, ac.name, ac.advertiser_name
        ORDER BY ap.created_at DESC
      `, [creatorId]);

      return {
        success: true,
        placements: result.rows
      };
    } catch (error) {
      console.error('Error getting creator placements:', error);
      throw error;
    }
  }
}

export default new AdsManager();
