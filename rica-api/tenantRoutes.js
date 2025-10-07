/**
 * Tenant Management API Routes
 * 
 * Provides REST API endpoints for tenant provisioning, management, and monitoring
 */

import express from 'express';
const router = express.Router();
import tenantManager from './tenantManager.js';
import creditResourceManager from './creditResourceManager.js';

// Middleware to verify Firebase authentication
// In production, this should verify the Firebase ID token
const authenticateUser = async (req, res, next) => {
  try {
    // For now, we'll extract user info from headers
    // In production, verify Firebase ID token
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];
    
    if (!userId || !userEmail) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = { userId, userEmail };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * POST /api/tenants/provision
 * Provision a new tenant environment
 */
router.post('/provision', authenticateUser, async (req, res) => {
  try {
    const { subscriptionTier, userCredits } = req.body;
    const { userId, userEmail } = req.user;

    // Check if user already has a tenant
    const existingTenant = tenantManager.getTenantByUserId(userId);
    if (existingTenant) {
      return res.status(400).json({
        error: 'User already has a tenant',
        tenant: {
          tenantId: existingTenant.tenantId,
          url: existingTenant.url,
          status: existingTenant.status
        }
      });
    }

    // Check if user has enough credits
    const creditCheck = await creditResourceManager.canProvisionTenant(
      userId,
      userCredits || 0,
      subscriptionTier || 'pay-as-you-go'
    );

    if (!creditCheck.allowed) {
      return res.status(402).json({
        error: 'Insufficient credits',
        details: creditCheck
      });
    }

    // Provision tenant
    const tenant = await tenantManager.provisionTenant(
      userEmail,
      subscriptionTier || 'pay-as-you-go',
      userId
    );

    // Start credit tracking
    creditResourceManager.startCreditTracking(tenant.tenantId, userId);

    res.status(201).json({
      success: true,
      tenant: {
        tenantId: tenant.tenantId,
        url: tenant.url,
        namespace: tenant.namespace,
        subscriptionTier: tenant.subscriptionTier,
        status: tenant.status,
        createdAt: tenant.createdAt,
        features: tenant.tierConfig.features,
        limits: {
          maxProfiles: tenant.tierConfig.maxProfiles,
          maxTeams: tenant.tierConfig.maxTeams,
          maxStorage: tenant.tierConfig.maxStorage
        }
      },
      creditInfo: creditCheck
    });

  } catch (error) {
    console.error('Error provisioning tenant:', error);
    res.status(500).json({
      error: 'Failed to provision tenant',
      message: error.message
    });
  }
});

/**
 * DELETE /api/tenants/:tenantId
 * Deprovision a tenant environment
 */
router.delete('/:tenantId', authenticateUser, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { userId } = req.user;

    // Verify tenant belongs to user
    const tenant = tenantManager.getTenant(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    if (tenant.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Stop credit tracking and get final usage
    const finalCreditsUsed = creditResourceManager.stopCreditTracking(tenantId);

    // Deprovision tenant
    const result = await tenantManager.deprovisionTenant(tenantId);

    res.json({
      success: true,
      ...result,
      finalCreditsUsed
    });

  } catch (error) {
    console.error('Error deprovisioning tenant:', error);
    res.status(500).json({
      error: 'Failed to deprovision tenant',
      message: error.message
    });
  }
});

/**
 * GET /api/tenants/my-tenant
 * Get current user's tenant information
 */
router.get('/my-tenant', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.user;

    const tenant = tenantManager.getTenantByUserId(userId);
    if (!tenant) {
      return res.status(404).json({
        error: 'No tenant found for user',
        hasActiveTenant: false
      });
    }

    // Get tenant status
    const status = await tenantManager.getTenantStatus(tenant.tenantId);

    // Get credit usage
    const creditUsage = creditResourceManager.getCreditUsageReport(tenant.tenantId);

    res.json({
      success: true,
      tenant: {
        tenantId: tenant.tenantId,
        url: tenant.url,
        namespace: tenant.namespace,
        subscriptionTier: tenant.subscriptionTier,
        createdAt: tenant.createdAt,
        features: tenant.tierConfig.features,
        limits: {
          maxProfiles: tenant.tierConfig.maxProfiles,
          maxTeams: tenant.tierConfig.maxTeams,
          maxStorage: tenant.tierConfig.maxStorage
        }
      },
      status,
      creditUsage
    });

  } catch (error) {
    console.error('Error getting tenant:', error);
    res.status(500).json({
      error: 'Failed to get tenant information',
      message: error.message
    });
  }
});

/**
 * GET /api/tenants/:tenantId/status
 * Get tenant status and resource usage
 */
router.get('/:tenantId/status', authenticateUser, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { userId } = req.user;

    // Verify tenant belongs to user
    const tenant = tenantManager.getTenant(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    if (tenant.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const status = await tenantManager.getTenantStatus(tenantId);

    res.json({
      success: true,
      status
    });

  } catch (error) {
    console.error('Error getting tenant status:', error);
    res.status(500).json({
      error: 'Failed to get tenant status',
      message: error.message
    });
  }
});

/**
 * PUT /api/tenants/:tenantId/tier
 * Update tenant subscription tier
 */
router.put('/:tenantId/tier', authenticateUser, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { newTier, userCredits } = req.body;
    const { userId } = req.user;

    // Verify tenant belongs to user
    const tenant = tenantManager.getTenant(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    if (tenant.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Check if user has enough credits for new tier
    const creditCheck = await creditResourceManager.canProvisionTenant(
      userId,
      userCredits || 0,
      newTier
    );

    if (!creditCheck.allowed) {
      return res.status(402).json({
        error: 'Insufficient credits for tier upgrade',
        details: creditCheck
      });
    }

    // Update tier
    const updatedTenant = await tenantManager.updateTenantTier(tenantId, newTier);

    // Update credit tracking with new hourly rate
    creditResourceManager.stopCreditTracking(tenantId);
    creditResourceManager.startCreditTracking(tenantId, userId);

    res.json({
      success: true,
      tenant: {
        tenantId: updatedTenant.tenantId,
        subscriptionTier: updatedTenant.subscriptionTier,
        features: updatedTenant.tierConfig.features,
        limits: {
          maxProfiles: updatedTenant.tierConfig.maxProfiles,
          maxTeams: updatedTenant.tierConfig.maxTeams,
          maxStorage: updatedTenant.tierConfig.maxStorage
        }
      }
    });

  } catch (error) {
    console.error('Error updating tenant tier:', error);
    res.status(500).json({
      error: 'Failed to update tenant tier',
      message: error.message
    });
  }
});

/**
 * GET /api/tenants/:tenantId/credits
 * Get credit usage report for tenant
 */
router.get('/:tenantId/credits', authenticateUser, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { userId } = req.user;

    // Verify tenant belongs to user
    const tenant = tenantManager.getTenant(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    if (tenant.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const report = creditResourceManager.getCreditUsageReport(tenantId);

    res.json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Error getting credit usage:', error);
    res.status(500).json({
      error: 'Failed to get credit usage',
      message: error.message
    });
  }
});

/**
 * POST /api/tenants/:tenantId/check-credits
 * Check if tenant has sufficient credits
 */
router.post('/:tenantId/check-credits', authenticateUser, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { currentCredits } = req.body;
    const { userId } = req.user;

    // Verify tenant belongs to user
    const tenant = tenantManager.getTenant(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    if (tenant.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await creditResourceManager.checkTenantCredits(tenantId, currentCredits);

    res.json({
      success: true,
      creditCheck: result
    });

  } catch (error) {
    console.error('Error checking credits:', error);
    res.status(500).json({
      error: 'Failed to check credits',
      message: error.message
    });
  }
});

/**
 * POST /api/tenants/:tenantId/suspend
 * Suspend tenant due to insufficient credits
 */
router.post('/:tenantId/suspend', authenticateUser, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { reason } = req.body;
    const { userId } = req.user;

    // Verify tenant belongs to user
    const tenant = tenantManager.getTenant(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    if (tenant.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await creditResourceManager.suspendTenant(
      tenantId,
      reason || 'Insufficient credits'
    );

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error suspending tenant:', error);
    res.status(500).json({
      error: 'Failed to suspend tenant',
      message: error.message
    });
  }
});

/**
 * POST /api/tenants/:tenantId/resume
 * Resume suspended tenant
 */
router.post('/:tenantId/resume', authenticateUser, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { userId } = req.user;

    // Verify tenant belongs to user
    const tenant = tenantManager.getTenant(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    if (tenant.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await creditResourceManager.resumeTenant(tenantId, userId);

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error resuming tenant:', error);
    res.status(500).json({
      error: 'Failed to resume tenant',
      message: error.message
    });
  }
});

/**
 * GET /api/tenants/pricing/estimate
 * Get estimated monthly cost for a subscription tier
 */
router.get('/pricing/estimate', async (req, res) => {
  try {
    const { tier } = req.query;

    if (!tier) {
      // Return estimates for all tiers
      const estimates = {
        'pay-as-you-go': creditResourceManager.getEstimatedMonthlyCost('pay-as-you-go'),
        'personal': creditResourceManager.getEstimatedMonthlyCost('personal'),
        'team': creditResourceManager.getEstimatedMonthlyCost('team')
      };

      return res.json({
        success: true,
        estimates
      });
    }

    const estimate = creditResourceManager.getEstimatedMonthlyCost(tier);

    res.json({
      success: true,
      estimate
    });

  } catch (error) {
    console.error('Error calculating estimate:', error);
    res.status(500).json({
      error: 'Failed to calculate estimate',
      message: error.message
    });
  }
});

export default router;
