import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import tenantService from '../services/tenantService';
import creditService from '../services/creditService';
import './TenantProvisioning.css';

const TenantProvisioning = () => {
  const { currentUser } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [selectedTier, setSelectedTier] = useState('pay-as-you-go');
  const [userCredits, setUserCredits] = useState(0);
  const [pricingEstimates, setPricingEstimates] = useState(null);
  const [provisioningStatus, setProvisioningStatus] = useState('idle'); // idle, provisioning, success, error

  useEffect(() => {
    if (currentUser) {
      loadTenantInfo();
      loadUserCredits();
      loadPricingEstimates();
    }
  }, [currentUser]);

  const loadTenantInfo = async () => {
    try {
      const data = await tenantService.getMyTenant();
      if (data.tenant) {
        setTenantInfo(data.tenant);
      }
    } catch (error) {
      console.error('Error loading tenant info:', error);
    }
  };

  const loadUserCredits = () => {
    if (currentUser) {
      const credits = creditService.getUserCredits(currentUser.uid);
      setUserCredits(credits);
    }
  };

  const loadPricingEstimates = async () => {
    try {
      const estimates = await tenantService.getPricingEstimates();
      setPricingEstimates(estimates);
    } catch (error) {
      console.error('Error loading pricing estimates:', error);
    }
  };

  const handleProvisionTenant = async () => {
    if (!currentUser) {
      setError('Please log in to provision a tenant');
      return;
    }

    setLoading(true);
    setError(null);
    setProvisioningStatus('provisioning');

    try {
      const result = await tenantService.provisionTenant(selectedTier);
      setTenantInfo(result.tenant);
      setProvisioningStatus('success');
      
      // Reload credits after provisioning
      loadUserCredits();

      // Redirect to tenant after 3 seconds
      setTimeout(() => {
        tenantService.redirectToTenant();
      }, 3000);

    } catch (error) {
      console.error('Error provisioning tenant:', error);
      setError(error.message);
      setProvisioningStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeTier = async (newTier) => {
    if (!tenantInfo) return;

    setLoading(true);
    setError(null);

    try {
      await tenantService.updateTenantTier(tenantInfo.tenantId, newTier);
      await loadTenantInfo();
      loadUserCredits();
    } catch (error) {
      console.error('Error upgrading tier:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTierInfo = (tier) => {
    const tiers = {
      'pay-as-you-go': {
        name: 'Pay As You Go',
        description: 'Perfect for trying out Rica',
        features: [
          'Rica UI Dashboard',
          'Activepieces Automation',
          'Code Server (VS Code)',
          'Ollama AI Assistant',
          '5 Browser Profiles',
          '2 Teams',
          '5GB Storage'
        ],
        minCredits: 10
      },
      'personal': {
        name: 'Personal',
        description: 'For individual security professionals',
        features: [
          'All Pay-As-You-Go features',
          'OpenCTI Threat Intelligence',
          'OpenBAS Security Simulations',
          '20 Browser Profiles',
          '5 Teams',
          '20GB Storage',
          'Priority Support'
        ],
        minCredits: 50
      },
      'team': {
        name: 'Team',
        description: 'For security teams and organizations',
        features: [
          'All Personal features',
          '100 Browser Profiles',
          '20 Teams',
          '50GB Storage',
          'Advanced Analytics',
          'Dedicated Support',
          'Custom Integrations'
        ],
        minCredits: 100
      }
    };

    return tiers[tier] || tiers['pay-as-you-go'];
  };

  if (!currentUser) {
    return (
      <div className="tenant-provisioning">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to provision your Rica environment</p>
        </div>
      </div>
    );
  }

  if (tenantInfo) {
    return (
      <div className="tenant-provisioning">
        <div className="tenant-active">
          <div className="tenant-header">
            <h2>Your Rica Environment</h2>
            <span className={`status-badge ${tenantInfo.status || 'active'}`}>
              {tenantInfo.status || 'Active'}
            </span>
          </div>

          <div className="tenant-details">
            <div className="detail-item">
              <label>Environment URL:</label>
              <a href={tenantInfo.url} target="_blank" rel="noopener noreferrer">
                {tenantInfo.url}
              </a>
            </div>

            <div className="detail-item">
              <label>Subscription Tier:</label>
              <span className="tier-name">{getTierInfo(tenantInfo.subscriptionTier).name}</span>
            </div>

            <div className="detail-item">
              <label>Created:</label>
              <span>{new Date(tenantInfo.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="detail-item">
              <label>Available Credits:</label>
              <span className="credits-amount">{userCredits} credits</span>
            </div>
          </div>

          <div className="tenant-features">
            <h3>Active Features</h3>
            <div className="features-grid">
              {tenantInfo.features && Object.entries(tenantInfo.features).map(([feature, enabled]) => (
                <div key={feature} className={`feature-item ${enabled ? 'enabled' : 'disabled'}`}>
                  <span className="feature-icon">{enabled ? '✓' : '✗'}</span>
                  <span className="feature-name">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="tenant-actions">
            <button 
              className="btn-primary"
              onClick={() => tenantService.redirectToTenant()}
            >
              Open Rica Environment
            </button>

            {tenantInfo.subscriptionTier !== 'team' && (
              <button 
                className="btn-secondary"
                onClick={() => {
                  const nextTier = tenantInfo.subscriptionTier === 'pay-as-you-go' ? 'personal' : 'team';
                  handleUpgradeTier(nextTier);
                }}
                disabled={loading}
              >
                Upgrade to {tenantInfo.subscriptionTier === 'pay-as-you-go' ? 'Personal' : 'Team'}
              </button>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-provisioning">
      <div className="provisioning-header">
        <h1>Provision Your Rica Environment</h1>
        <p>Choose a subscription tier and get your isolated Rica environment in minutes</p>
      </div>

      <div className="credits-info">
        <div className="credits-badge">
          <span className="credits-label">Available Credits:</span>
          <span className="credits-amount">{userCredits}</span>
        </div>
        {userCredits < 10 && (
          <div className="credits-warning">
            <p>⚠️ You need at least 10 credits to provision an environment</p>
            <button className="btn-link" onClick={() => window.location.href = '/credits'}>
              Buy Credits
            </button>
          </div>
        )}
      </div>

      <div className="tier-selection">
        <h2>Select Your Tier</h2>
        <div className="tiers-grid">
          {['pay-as-you-go', 'personal', 'team'].map((tier) => {
            const info = getTierInfo(tier);
            const estimate = pricingEstimates?.[tier];
            const canAfford = userCredits >= info.minCredits;

            return (
              <div 
                key={tier}
                className={`tier-card ${selectedTier === tier ? 'selected' : ''} ${!canAfford ? 'disabled' : ''}`}
                onClick={() => canAfford && setSelectedTier(tier)}
              >
                <div className="tier-header">
                  <h3>{info.name}</h3>
                  <p className="tier-description">{info.description}</p>
                </div>

                <div className="tier-pricing">
                  {estimate && (
                    <>
                      <div className="price-item">
                        <span className="price-label">Hourly:</span>
                        <span className="price-value">{estimate.hourlyCredits} credits</span>
                      </div>
                      <div className="price-item">
                        <span className="price-label">Daily:</span>
                        <span className="price-value">{estimate.dailyCredits} credits</span>
                      </div>
                      <div className="price-item">
                        <span className="price-label">Monthly:</span>
                        <span className="price-value">{estimate.monthlyCredits} credits</span>
                      </div>
                      <div className="price-item estimated-cost">
                        <span className="price-label">Est. Monthly Cost:</span>
                        <span className="price-value">${estimate.estimatedMonthlyCost}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="tier-features">
                  <h4>Features:</h4>
                  <ul>
                    {info.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="tier-requirements">
                  <p className={canAfford ? 'requirement-met' : 'requirement-unmet'}>
                    {canAfford ? '✓' : '✗'} Minimum {info.minCredits} credits required
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="provisioning-actions">
        <button
          className="btn-primary btn-large"
          onClick={handleProvisionTenant}
          disabled={loading || userCredits < getTierInfo(selectedTier).minCredits}
        >
          {loading ? 'Provisioning...' : `Provision ${getTierInfo(selectedTier).name} Environment`}
        </button>
      </div>

      {provisioningStatus === 'provisioning' && (
        <div className="provisioning-progress">
          <div className="progress-spinner"></div>
          <h3>Provisioning Your Environment</h3>
          <p>This may take a few minutes. Please don't close this window.</p>
          <div className="progress-steps">
            <div className="step active">Creating namespace...</div>
            <div className="step">Deploying Rica UI...</div>
            <div className="step">Setting up headless servers...</div>
            <div className="step">Configuring network...</div>
          </div>
        </div>
      )}

      {provisioningStatus === 'success' && (
        <div className="provisioning-success">
          <div className="success-icon">✓</div>
          <h3>Environment Provisioned Successfully!</h3>
          <p>Redirecting you to your Rica environment...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <h4>Provisioning Failed</h4>
          <p>{error}</p>
        </div>
      )}

      <div className="provisioning-info">
        <h3>What happens when you provision?</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-icon">🔒</span>
            <h4>Isolated Environment</h4>
            <p>Your own Kubernetes namespace with complete isolation from other users</p>
          </div>
          <div className="info-item">
            <span className="info-icon">⚡</span>
            <h4>Instant Deployment</h4>
            <p>All services deployed and configured automatically in minutes</p>
          </div>
          <div className="info-item">
            <span className="info-icon">💳</span>
            <h4>Credit-Based Billing</h4>
            <p>Pay only for what you use with transparent credit consumption</p>
          </div>
          <div className="info-item">
            <span className="info-icon">🔧</span>
            <h4>Fully Managed</h4>
            <p>Automatic updates, backups, and monitoring included</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantProvisioning;
