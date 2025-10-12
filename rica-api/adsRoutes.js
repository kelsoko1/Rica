/**
 * Vircadia Ads API Routes
 *
 * REST API endpoints for the Vircadia monetization system
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import adsManager from '../adsManager.js';
import vircadiaAnalytics from '../vircadiaAnalytics.js';

const router = express.Router();

/**
 * Middleware to verify JWT token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

/**
 * Create a new ad campaign
 * POST /api/ads/campaigns
 */
router.post('/campaigns', authenticateToken, async (req, res) => {
  try {
    const campaignData = {
      name: req.body.name,
      advertiserId: req.user.userId,
      advertiserName: req.body.advertiserName,
      budget: req.body.budget,
      cpm: req.body.cpm,
      endDate: req.body.endDate,
      targeting: req.body.targeting
    };

    const result = await adsManager.createCampaign(campaignData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get available ad campaigns
 * GET /api/ads/campaigns
 */
router.get('/campaigns', authenticateToken, async (req, res) => {
  try {
    const result = await adsManager.getAvailableCampaigns();
    res.json(result);
  } catch (error) {
    console.error('Error getting campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve campaigns'
    });
  }
});

/**
 * Add ad placement to a world
 * POST /api/ads/placements
 */
router.post('/placements', authenticateToken, async (req, res) => {
  try {
    const placementData = {
      campaignId: req.body.campaignId,
      worldId: req.body.worldId,
      worldCreatorId: req.user.userId,
      placementType: req.body.placementType,
      position: req.body.position,
      dimensions: req.body.dimensions
    };

    const result = await adsManager.addAdPlacement(placementData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding ad placement:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get creator's ad placements
 * GET /api/ads/placements
 */
router.get('/placements', authenticateToken, async (req, res) => {
  try {
    const result = await adsManager.getCreatorPlacements(req.user.userId);
    res.json(result);
  } catch (error) {
    console.error('Error getting placements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve placements'
    });
  }
});

/**
 * Record ad impression
 * POST /api/ads/impressions
 */
router.post('/impressions', authenticateToken, async (req, res) => {
  try {
    const result = await adsManager.recordImpression(
      req.body.placementId,
      req.user.userId,
      req.body.sessionId,
      req.body.durationSeconds
    );
    res.json(result);
  } catch (error) {
    console.error('Error recording impression:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get creator revenue summary
 * GET /api/ads/revenue
 */
router.get('/revenue', authenticateToken, async (req, res) => {
  try {
    const startDate = req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = req.query.endDate || new Date().toISOString().split('T')[0];

    const result = await adsManager.getCreatorRevenue(req.user.userId, startDate, endDate);
    res.json(result);
  } catch (error) {
    console.error('Error getting revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve revenue data'
    });
  }
});

/**
 * Request payout
 * POST /api/ads/payouts
 */
router.post('/payouts', authenticateToken, async (req, res) => {
  try {
    const result = await adsManager.requestPayout(req.user.userId, req.body.amount);
    res.json(result);
  } catch (error) {
    console.error('Error requesting payout:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Record user session in Vircadia world
 * POST /api/analytics/sessions
 */
router.post('/analytics/sessions', authenticateToken, async (req, res) => {
  try {
    const result = await vircadiaAnalytics.recordSession(
      req.body.worldId,
      req.user.userId,
      req.body.sessionData
    );
    res.json(result);
  } catch (error) {
    console.error('Error recording session:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get world analytics
 * GET /api/analytics/worlds/:worldId
 */
router.get('/analytics/worlds/:worldId', authenticateToken, async (req, res) => {
  try {
    const result = await vircadiaAnalytics.getWorldAnalytics(req.params.worldId, req.query.days);
    res.json(result);
  } catch (error) {
    console.error('Error getting world analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics'
    });
  }
});

/**
 * Get monetization settings for a world
 * GET /api/analytics/settings/:worldId
 */
router.get('/analytics/settings/:worldId', authenticateToken, async (req, res) => {
  try {
    const result = await vircadiaAnalytics.getMonetizationSettings(req.params.worldId);
    res.json(result);
  } catch (error) {
    console.error('Error getting monetization settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve settings'
    });
  }
});

/**
 * Update monetization settings
 * PUT /api/analytics/settings/:worldId
 */
router.put('/analytics/settings/:worldId', authenticateToken, async (req, res) => {
  try {
    const result = await vircadiaAnalytics.updateMonetizationSettings(req.params.worldId, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating monetization settings:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get active users in a world (real-time)
 * GET /api/analytics/active-users/:worldId
 */
router.get('/analytics/active-users/:worldId', authenticateToken, async (req, res) => {
  try {
    const result = await vircadiaAnalytics.getActiveUsers(req.params.worldId);
    res.json(result);
  } catch (error) {
    console.error('Error getting active users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve active users'
    });
  }
});

/**
 * Get top performing worlds for ad targeting
 * GET /api/analytics/top-worlds
 */
router.get('/analytics/top-worlds', authenticateToken, async (req, res) => {
  try {
    const result = await vircadiaAnalytics.getTopPerformingWorlds(req.query.limit);
    res.json(result);
  } catch (error) {
    console.error('Error getting top worlds:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve top worlds'
    });
  }
});

/**
 * Calculate daily revenue (admin endpoint)
 * POST /api/ads/calculate-revenue
 */
router.post('/calculate-revenue', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (you can implement proper admin check here)
    const result = await adsManager.calculateDailyRevenue();
    res.json(result);
  } catch (error) {
    console.error('Error calculating revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate revenue'
    });
  }
});

export default router;
