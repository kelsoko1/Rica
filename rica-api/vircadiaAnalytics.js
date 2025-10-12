/**
 * Vircadia Analytics Service
 *
 * Tracks user engagement in virtual worlds and calculates monetization metrics
 * Provides real-time analytics for ad revenue optimization
 */

import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  database: process.env.DB_NAME || 'rica_auth',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
});

class VircadiaAnalytics {
  constructor() {
    this.engagementMetrics = {
      minEngagementTime: 30, // Minimum seconds for valid engagement
      engagementMultiplier: 1.5, // Higher multiplier for engaged users
      peakHours: [19, 20, 21, 22], // 7-10 PM in 24-hour format
      weekendMultiplier: 1.2 // Higher rates on weekends
    };
  }

  /**
   * Initialize analytics database tables
   */
  async initializeDatabase() {
    try {
      // Create world_sessions table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS world_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          world_id UUID NOT NULL,
          user_id UUID NOT NULL,
          session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          session_end TIMESTAMP,
          duration_seconds INTEGER DEFAULT 0,
          engagement_score DECIMAL(5,2) DEFAULT 0,
          peak_hour_bonus BOOLEAN DEFAULT false,
          weekend_bonus BOOLEAN DEFAULT false,
          device_type VARCHAR(50),
          location_data JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create world_analytics table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS world_analytics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          world_id UUID NOT NULL,
          date_recorded DATE DEFAULT CURRENT_DATE,
          total_sessions INTEGER DEFAULT 0,
          unique_users INTEGER DEFAULT 0,
          total_duration_hours DECIMAL(10,2) DEFAULT 0,
          avg_session_duration DECIMAL(8,2) DEFAULT 0,
          peak_concurrent_users INTEGER DEFAULT 0,
          engagement_rate DECIMAL(5,2) DEFAULT 0,
          monetization_score DECIMAL(5,2) DEFAULT 0,
          revenue_potential DECIMAL(10,2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(world_id, date_recorded)
        );
      `);

      // Create monetization_settings table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS monetization_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          world_id UUID NOT NULL,
          ads_enabled BOOLEAN DEFAULT false,
          max_ads_per_session INTEGER DEFAULT 3,
          ad_frequency_seconds INTEGER DEFAULT 300,
          min_user_threshold INTEGER DEFAULT 5,
          revenue_share_percent DECIMAL(5,2) DEFAULT 70.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create indexes for better performance
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_world_sessions_world ON world_sessions(world_id);
        CREATE INDEX IF NOT EXISTS idx_world_sessions_user ON world_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_world_sessions_start ON world_sessions(session_start);
        CREATE INDEX IF NOT EXISTS idx_world_analytics_world_date ON world_analytics(world_id, date_recorded);
        CREATE INDEX IF NOT EXISTS idx_monetization_settings_world ON monetization_settings(world_id);
      `);

      console.log('Vircadia analytics database initialized successfully');
    } catch (error) {
      console.error('Error initializing analytics database:', error);
      throw error;
    }
  }

  /**
   * Record user session in a Vircadia world
   */
  async recordSession(worldId, userId, sessionData) {
    try {
      const {
        sessionStart,
        sessionEnd,
        deviceType,
        locationData
      } = sessionData;

      const duration = sessionEnd && sessionStart
        ? Math.floor((new Date(sessionEnd) - new Date(sessionStart)) / 1000)
        : 0;

      // Calculate engagement score
      const engagementScore = this.calculateEngagementScore(duration, sessionData);

      // Check for bonuses
      const sessionStartDate = new Date(sessionStart);
      const isPeakHour = this.engagementMetrics.peakHours.includes(sessionStartDate.getHours());
      const isWeekend = sessionStartDate.getDay() === 0 || sessionStartDate.getDay() === 6;

      await pool.query(`
        INSERT INTO world_sessions
        (world_id, user_id, session_start, session_end, duration_seconds,
         engagement_score, peak_hour_bonus, weekend_bonus, device_type, location_data)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        worldId, userId, sessionStart, sessionEnd, duration,
        engagementScore, isPeakHour, isWeekend, deviceType,
        JSON.stringify(locationData || {})
      ]);

      // Update daily analytics
      await this.updateWorldAnalytics(worldId);

      return {
        success: true,
        sessionId: 'recorded',
        engagementScore,
        bonuses: { peakHour: isPeakHour, weekend: isWeekend }
      };
    } catch (error) {
      console.error('Error recording session:', error);
      throw error;
    }
  }

  /**
   * Calculate engagement score for monetization
   */
  calculateEngagementScore(duration, sessionData) {
    let score = 0;

    // Base score from duration
    if (duration >= this.engagementMetrics.minEngagementTime) {
      score = Math.min(duration / 60, 10); // Max 10 points for duration
    }

    // Apply engagement multiplier
    score *= this.engagementMetrics.engagementMultiplier;

    // Additional points for interactions (if available)
    if (sessionData.interactions) {
      score += Math.min(sessionData.interactions * 0.5, 5);
    }

    return Math.round(score * 100) / 100;
  }

  /**
   * Update daily analytics for a world
   */
  async updateWorldAnalytics(worldId) {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Calculate daily metrics
      const metricsResult = await pool.query(`
        SELECT
          COUNT(*) as total_sessions,
          COUNT(DISTINCT user_id) as unique_users,
          SUM(duration_seconds)::DECIMAL / 3600 as total_duration_hours,
          AVG(duration_seconds)::DECIMAL / 60 as avg_session_duration,
          AVG(engagement_score) as engagement_rate,
          MAX(engagement_score) as max_engagement
        FROM world_sessions
        WHERE world_id = $1
          AND DATE(session_start) = $2
      `, [worldId, today]);

      const metrics = metricsResult.rows[0];

      if (metrics.total_sessions > 0) {
        // Calculate monetization score
        const monetizationScore = this.calculateMonetizationScore(metrics);

        // Calculate revenue potential
        const revenuePotential = this.calculateRevenuePotential(metrics, monetizationScore);

        await pool.query(`
          INSERT INTO world_analytics
          (world_id, total_sessions, unique_users, total_duration_hours,
           avg_session_duration, engagement_rate, monetization_score, revenue_potential)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (world_id, date_recorded)
          DO UPDATE SET
            total_sessions = EXCLUDED.total_sessions,
            unique_users = EXCLUDED.unique_users,
            total_duration_hours = EXCLUDED.total_duration_hours,
            avg_session_duration = EXCLUDED.avg_session_duration,
            engagement_rate = EXCLUDED.engagement_rate,
            monetization_score = EXCLUDED.monetization_score,
            revenue_potential = EXCLUDED.revenue_potential
        `, [
          worldId,
          parseInt(metrics.total_sessions),
          parseInt(metrics.unique_users),
          parseFloat(metrics.total_duration_hours || 0),
          parseFloat(metrics.avg_session_duration || 0),
          parseFloat(metrics.engagement_rate || 0),
          monetizationScore,
          revenuePotential
        ]);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating world analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate monetization score based on engagement metrics
   */
  calculateMonetizationScore(metrics) {
    const {
      total_sessions,
      unique_users,
      total_duration_hours,
      avg_session_duration,
      engagement_rate
    } = metrics;

    // Base score from user count (0-40 points)
    const userScore = Math.min(unique_users * 2, 40);

    // Engagement quality score (0-30 points)
    const engagementScore = Math.min(engagement_rate * 3, 30);

    // Duration score (0-20 points)
    const durationScore = Math.min(total_duration_hours / 10, 20);

    // Session quality score (0-10 points)
    const sessionScore = avg_session_duration > 10 ? 10 : avg_session_duration;

    return Math.round((userScore + engagementScore + durationScore + sessionScore) * 100) / 100;
  }

  /**
   * Calculate potential revenue for a world
   */
  calculateRevenuePotential(metrics, monetizationScore) {
    const { unique_users, total_duration_hours } = metrics;

    // Base potential from user count
    const userPotential = unique_users * 0.50; // $0.50 per unique user per day

    // Engagement bonus
    const engagementBonus = total_duration_hours * 0.10; // $0.10 per hour of engagement

    // Monetization score multiplier
    const scoreMultiplier = monetizationScore / 100;

    return Math.round((userPotential + engagementBonus) * scoreMultiplier * 100) / 100;
  }

  /**
   * Get analytics for a specific world
   */
  async getWorldAnalytics(worldId, days = 30) {
    try {
      const result = await pool.query(`
        SELECT * FROM world_analytics
        WHERE world_id = $1
          AND date_recorded >= CURRENT_DATE - INTERVAL '${days} days'
        ORDER BY date_recorded DESC
      `, [worldId]);

      // Calculate trends
      const analytics = result.rows;
      const trends = this.calculateTrends(analytics);

      return {
        success: true,
        analytics,
        trends,
        summary: {
          totalSessions: analytics.reduce((sum, day) => sum + parseInt(day.total_sessions || 0), 0),
          totalUsers: analytics.reduce((sum, day) => sum + parseInt(day.unique_users || 0), 0),
          avgEngagement: analytics.length > 0
            ? analytics.reduce((sum, day) => sum + parseFloat(day.engagement_rate || 0), 0) / analytics.length
            : 0,
          totalRevenuePotential: analytics.reduce((sum, day) => sum + parseFloat(day.revenue_potential || 0), 0)
        }
      };
    } catch (error) {
      console.error('Error getting world analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate trend data for analytics
   */
  calculateTrends(analytics) {
    if (analytics.length < 2) return {};

    const sorted = analytics.sort((a, b) => new Date(a.date_recorded) - new Date(b.date_recorded));

    // Calculate percentage changes
    const sessionsChange = this.calculatePercentageChange(
      sorted[0].total_sessions,
      sorted[sorted.length - 1].total_sessions
    );

    const usersChange = this.calculatePercentageChange(
      sorted[0].unique_users,
      sorted[sorted.length - 1].unique_users
    );

    const engagementChange = this.calculatePercentageChange(
      sorted[0].engagement_rate,
      sorted[sorted.length - 1].engagement_rate
    );

    return {
      sessionsChange,
      usersChange,
      engagementChange,
      trend: sessionsChange > 0 ? 'up' : sessionsChange < 0 ? 'down' : 'stable'
    };
  }

  /**
   * Calculate percentage change between two values
   */
  calculatePercentageChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Get monetization settings for a world
   */
  async getMonetizationSettings(worldId) {
    try {
      const result = await pool.query(`
        SELECT * FROM monetization_settings WHERE world_id = $1
      `, [worldId]);

      if (result.rows.length === 0) {
        // Return default settings
        return {
          success: true,
          settings: {
            ads_enabled: false,
            max_ads_per_session: 3,
            ad_frequency_seconds: 300,
            min_user_threshold: 5,
            revenue_share_percent: 70.00
          }
        };
      }

      return {
        success: true,
        settings: result.rows[0]
      };
    } catch (error) {
      console.error('Error getting monetization settings:', error);
      throw error;
    }
  }

  /**
   * Update monetization settings for a world
   */
  async updateMonetizationSettings(worldId, settings) {
    try {
      await pool.query(`
        INSERT INTO monetization_settings (world_id, ads_enabled, max_ads_per_session,
          ad_frequency_seconds, min_user_threshold, revenue_share_percent)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (world_id)
        DO UPDATE SET
          ads_enabled = EXCLUDED.ads_enabled,
          max_ads_per_session = EXCLUDED.max_ads_per_session,
          ad_frequency_seconds = EXCLUDED.ad_frequency_seconds,
          min_user_threshold = EXCLUDED.min_user_threshold,
          revenue_share_percent = EXCLUDED.revenue_share_percent,
          updated_at = CURRENT_TIMESTAMP
      `, [
        worldId,
        settings.ads_enabled || false,
        settings.max_ads_per_session || 3,
        settings.ad_frequency_seconds || 300,
        settings.min_user_threshold || 5,
        settings.revenue_share_percent || 70.00
      ]);

      return { success: true };
    } catch (error) {
      console.error('Error updating monetization settings:', error);
      throw error;
    }
  }

  /**
   * Get real-time active users for a world (for ad targeting)
   */
  async getActiveUsers(worldId) {
    try {
      const result = await pool.query(`
        SELECT
          COUNT(*) as active_users,
          COUNT(DISTINCT user_id) as unique_active_users
        FROM world_sessions
        WHERE world_id = $1
          AND session_start >= NOW() - INTERVAL '10 minutes'
          AND (session_end IS NULL OR session_end >= NOW() - INTERVAL '10 minutes')
      `, [worldId]);

      return {
        success: true,
        activeUsers: result.rows[0]
      };
    } catch (error) {
      console.error('Error getting active users:', error);
      throw error;
    }
  }

  /**
   * Get top performing worlds for ad targeting
   */
  async getTopPerformingWorlds(limit = 10) {
    try {
      const result = await pool.query(`
        SELECT
          wa.world_id,
          wa.monetization_score,
          wa.revenue_potential,
          wa.unique_users,
          wa.engagement_rate,
          ws.world_name
        FROM world_analytics wa
        LEFT JOIN world_settings ws ON wa.world_id = ws.world_id
        WHERE wa.date_recorded = CURRENT_DATE
        ORDER BY wa.monetization_score DESC
        LIMIT $1
      `, [limit]);

      return {
        success: true,
        topWorlds: result.rows
      };
    } catch (error) {
      console.error('Error getting top performing worlds:', error);
      throw error;
    }
  }
}

export default new VircadiaAnalytics();
