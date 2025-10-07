/**
 * Tenant Service
 * 
 * Handles communication with the tenant management API
 * Manages tenant provisioning, status, and credit integration
 */

import { auth } from '../config/firebase';
import creditService from './creditService';
import analyticsService from './analyticsService';

const API_BASE_URL = process.env.REACT_APP_TENANT_API_URL || 'http://localhost:3001/api/tenants';

class TenantService {
  /**
   * Get authentication headers
   */
  getAuthHeaders() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    return {
      'Content-Type': 'application/json',
      'x-user-id': user.uid,
      'x-user-email': user.email
    };
  }

  /**
   * Provision a new tenant environment
   */
  async provisionTenant(subscriptionTier = 'pay-as-you-go') {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user's current credits
      const userCredits = creditService.getUserCredits(user.uid);

      // Track provisioning attempt
      analyticsService.trackEvent('tenant_provision_attempt', {
        userId: user.uid,
        subscriptionTier,
        userCredits
      });

      const response = await fetch(`${API_BASE_URL}/provision`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          subscriptionTier,
          userCredits
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Track provisioning failure
        analyticsService.trackEvent('tenant_provision_failed', {
          userId: user.uid,
          subscriptionTier,
          error: data.error,
          reason: data.details?.reason
        });

        throw new Error(data.error || 'Failed to provision tenant');
      }

      // Store tenant info in localStorage
      localStorage.setItem('rica_tenant_info', JSON.stringify(data.tenant));

      // Track successful provisioning
      analyticsService.trackEvent('tenant_provisioned', {
        userId: user.uid,
        tenantId: data.tenant.tenantId,
        subscriptionTier: data.tenant.subscriptionTier,
        creditsRequired: data.creditInfo.requiredCredits
      });

      return data;

    } catch (error) {
      console.error('Error provisioning tenant:', error);
      throw error;
    }
  }

  /**
   * Get current user's tenant information
   */
  async getMyTenant() {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/my-tenant`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          // User doesn't have a tenant yet
          return { hasActiveTenant: false };
        }
        throw new Error(data.error || 'Failed to get tenant information');
      }

      // Store tenant info in localStorage
      localStorage.setItem('rica_tenant_info', JSON.stringify(data.tenant));

      return data;

    } catch (error) {
      console.error('Error getting tenant:', error);
      throw error;
    }
  }

  /**
   * Get tenant status
   */
  async getTenantStatus(tenantId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${tenantId}/status`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get tenant status');
      }

      return data.status;

    } catch (error) {
      console.error('Error getting tenant status:', error);
      throw error;
    }
  }

  /**
   * Update tenant subscription tier
   */
  async updateTenantTier(tenantId, newTier) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user's current credits
      const userCredits = creditService.getUserCredits(user.uid);

      // Track tier update attempt
      analyticsService.trackEvent('tenant_tier_update_attempt', {
        userId: user.uid,
        tenantId,
        newTier,
        userCredits
      });

      const response = await fetch(`${API_BASE_URL}/${tenantId}/tier`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          newTier,
          userCredits
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Track tier update failure
        analyticsService.trackEvent('tenant_tier_update_failed', {
          userId: user.uid,
          tenantId,
          newTier,
          error: data.error
        });

        throw new Error(data.error || 'Failed to update tenant tier');
      }

      // Update stored tenant info
      const storedTenant = this.getStoredTenantInfo();
      if (storedTenant) {
        storedTenant.subscriptionTier = newTier;
        storedTenant.features = data.tenant.features;
        storedTenant.limits = data.tenant.limits;
        localStorage.setItem('rica_tenant_info', JSON.stringify(storedTenant));
      }

      // Track successful tier update
      analyticsService.trackEvent('tenant_tier_updated', {
        userId: user.uid,
        tenantId,
        newTier
      });

      return data.tenant;

    } catch (error) {
      console.error('Error updating tenant tier:', error);
      throw error;
    }
  }

  /**
   * Get credit usage report
   */
  async getCreditUsageReport(tenantId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${tenantId}/credits`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get credit usage report');
      }

      return data.report;

    } catch (error) {
      console.error('Error getting credit usage report:', error);
      throw error;
    }
  }

  /**
   * Check if tenant has sufficient credits
   */
  async checkTenantCredits(tenantId) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const currentCredits = creditService.getUserCredits(user.uid);

      const response = await fetch(`${API_BASE_URL}/${tenantId}/check-credits`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ currentCredits })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check credits');
      }

      return data.creditCheck;

    } catch (error) {
      console.error('Error checking tenant credits:', error);
      throw error;
    }
  }

  /**
   * Suspend tenant
   */
  async suspendTenant(tenantId, reason) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Track suspension
      analyticsService.trackEvent('tenant_suspended', {
        userId: user.uid,
        tenantId,
        reason
      });

      const response = await fetch(`${API_BASE_URL}/${tenantId}/suspend`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to suspend tenant');
      }

      return data;

    } catch (error) {
      console.error('Error suspending tenant:', error);
      throw error;
    }
  }

  /**
   * Resume tenant
   */
  async resumeTenant(tenantId) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Track resumption
      analyticsService.trackEvent('tenant_resumed', {
        userId: user.uid,
        tenantId
      });

      const response = await fetch(`${API_BASE_URL}/${tenantId}/resume`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resume tenant');
      }

      return data;

    } catch (error) {
      console.error('Error resuming tenant:', error);
      throw error;
    }
  }

  /**
   * Deprovision tenant
   */
  async deprovisionTenant(tenantId) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Track deprovisioning
      analyticsService.trackEvent('tenant_deprovision_attempt', {
        userId: user.uid,
        tenantId
      });

      const response = await fetch(`${API_BASE_URL}/${tenantId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to deprovision tenant');
      }

      // Remove stored tenant info
      localStorage.removeItem('rica_tenant_info');

      // Track successful deprovisioning
      analyticsService.trackEvent('tenant_deprovisioned', {
        userId: user.uid,
        tenantId,
        finalCreditsUsed: data.finalCreditsUsed
      });

      return data;

    } catch (error) {
      console.error('Error deprovisioning tenant:', error);
      throw error;
    }
  }

  /**
   * Get pricing estimates
   */
  async getPricingEstimates(tier = null) {
    try {
      const url = tier 
        ? `${API_BASE_URL}/pricing/estimate?tier=${tier}`
        : `${API_BASE_URL}/pricing/estimate`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get pricing estimates');
      }

      return tier ? data.estimate : data.estimates;

    } catch (error) {
      console.error('Error getting pricing estimates:', error);
      throw error;
    }
  }

  /**
   * Get stored tenant info from localStorage
   */
  getStoredTenantInfo() {
    try {
      const stored = localStorage.getItem('rica_tenant_info');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting stored tenant info:', error);
      return null;
    }
  }

  /**
   * Check if user has an active tenant
   */
  hasActiveTenant() {
    const tenantInfo = this.getStoredTenantInfo();
    return tenantInfo !== null;
  }

  /**
   * Get tenant URL
   */
  getTenantUrl() {
    const tenantInfo = this.getStoredTenantInfo();
    return tenantInfo?.url || null;
  }

  /**
   * Redirect to tenant URL
   */
  redirectToTenant() {
    const url = this.getTenantUrl();
    if (url) {
      window.location.href = url;
    } else {
      console.error('No tenant URL available');
    }
  }

  /**
   * Initialize tenant monitoring
   * Checks credit status periodically
   */
  startTenantMonitoring(tenantId, onCreditWarning, onCriticalCredits) {
    // Check credits every 5 minutes
    const interval = setInterval(async () => {
      try {
        const creditCheck = await this.checkTenantCredits(tenantId);

        if (creditCheck.status === 'critical' && onCriticalCredits) {
          onCriticalCredits(creditCheck);
        } else if (creditCheck.status === 'warning' && onCreditWarning) {
          onCreditWarning(creditCheck);
        }

      } catch (error) {
        console.error('Error monitoring tenant credits:', error);
      }
    }, 5 * 60 * 1000);

    // Return cleanup function
    return () => clearInterval(interval);
  }
}

export default new TenantService();
