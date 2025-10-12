import React, { useState, useEffect } from 'react';
import './MonetizationDashboard.css';

/**
 * MonetizationDashboard - Component for managing Vircadia world monetization
 * Allows users to enable ads, view earnings, and manage ad placements
 */
export default function MonetizationDashboard({ userId, worldId }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [userId, worldId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load monetization settings
      const settingsResponse = await fetch(`/api/ads/analytics/settings/${worldId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const settingsData = await settingsResponse.json();
      if (settingsData.success) {
        setSettings(settingsData.settings);
      }

      // Load revenue data
      const revenueResponse = await fetch(`/api/ads/revenue?startDate=${getLast30Days()}&endDate=${getToday()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const revenueData = await revenueResponse.json();
      if (revenueData.success) {
        setRevenue(revenueData.revenue);
      }

      // Load ad placements
      const placementsResponse = await fetch('/api/ads/placements', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const placementsData = await placementsResponse.json();
      if (placementsData.success) {
        setPlacements(placementsData.placements);
      }

      // Load available campaigns
      const campaignsResponse = await fetch('/api/ads/campaigns', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const campaignsData = await campaignsResponse.json();
      if (campaignsData.success) {
        setCampaigns(campaignsData.campaigns);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAds = async (enabled) => {
    try {
      const response = await fetch(`/api/ads/analytics/settings/${worldId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ads_enabled: enabled,
          ...settings
        })
      });

      const data = await response.json();
      if (data.success) {
        setSettings(prev => ({ ...prev, ads_enabled: enabled }));
      }
    } catch (error) {
      console.error('Error toggling ads:', error);
    }
  };

  const requestPayout = async () => {
    try {
      const amount = prompt('Enter payout amount (minimum $10):');
      if (!amount || parseFloat(amount) < 10) {
        alert('Minimum payout is $10');
        return;
      }

      const response = await fetch('/api/ads/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: parseFloat(amount) })
      });

      const data = await response.json();
      if (data.success) {
        alert('Payout request submitted successfully!');
        loadDashboardData(); // Refresh data
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
      alert('Failed to request payout');
    }
  };

  const getLast30Days = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  };

  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="monetization-dashboard loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="monetization-dashboard">
      <div className="dashboard-header">
        <h2>Vircadia World Monetization</h2>
        <p>Enable ads in your virtual world to earn revenue based on user engagement</p>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button
          className={`tab-btn ${activeTab === 'placements' ? 'active' : ''}`}
          onClick={() => setActiveTab('placements')}
        >
          Ad Placements
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>${revenue?.total_earnings || '0.00'}</h3>
                  <p>Total Earnings</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{revenue?.total_impressions || '0'}</h3>
                  <p>Total Impressions</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🌍</div>
                <div className="stat-info">
                  <h3>{revenue?.active_worlds || '0'}</h3>
                  <p>Active Worlds</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-info">
                  <h3>${revenue?.avg_daily_earnings || '0.00'}</h3>
                  <p>Avg Daily Earnings</p>
                </div>
              </div>
            </div>

            <div className="monetization-toggle">
              <h3>Enable Monetization</h3>
              <p>Earn money by showing ads to visitors in your virtual world</p>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings?.ads_enabled || false}
                  onChange={(e) => toggleAds(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              <span className="toggle-status">
                {settings?.ads_enabled ? 'Ads Enabled' : 'Ads Disabled'}
              </span>
            </div>

            {settings?.ads_enabled && (
              <div className="payout-section">
                <h3>Request Payout</h3>
                <p>Minimum payout: $10.00</p>
                <button className="payout-btn" onClick={requestPayout}>
                  Request Payout
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-tab">
            <h3>Monetization Settings</h3>

            <div className="settings-form">
              <div className="setting-group">
                <label>Revenue Share</label>
                <select
                  value={settings?.revenue_share_percent || 70}
                  onChange={(e) => setSettings(prev => ({ ...prev, revenue_share_percent: parseFloat(e.target.value) }))}
                >
                  <option value={70}>70% Creator / 30% Platform</option>
                  <option value={60}>60% Creator / 40% Platform</option>
                  <option value={80}>80% Creator / 20% Platform</option>
                </select>
              </div>

              <div className="setting-group">
                <label>Minimum Users for Ads</label>
                <input
                  type="number"
                  value={settings?.min_user_threshold || 5}
                  onChange={(e) => setSettings(prev => ({ ...prev, min_user_threshold: parseInt(e.target.value) }))}
                  min="1"
                  max="50"
                />
              </div>

              <div className="setting-group">
                <label>Max Ads per Session</label>
                <input
                  type="number"
                  value={settings?.max_ads_per_session || 3}
                  onChange={(e) => setSettings(prev => ({ ...prev, max_ads_per_session: parseInt(e.target.value) }))}
                  min="1"
                  max="10"
                />
              </div>

              <button className="save-settings-btn" onClick={() => toggleAds(settings?.ads_enabled)}>
                Save Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === 'placements' && (
          <div className="placements-tab">
            <div className="placements-header">
              <h3>Ad Placements</h3>
              <button className="add-placement-btn">Add Placement</button>
            </div>

            <div className="placements-list">
              {placements.length === 0 ? (
                <p className="no-placements">No ad placements configured</p>
              ) : (
                placements.map(placement => (
                  <div key={placement.id} className="placement-card">
                    <div className="placement-info">
                      <h4>{placement.campaign_name}</h4>
                      <p>Advertiser: {placement.advertiser_name}</p>
                      <p>Type: {placement.placement_type}</p>
                      <p>Impressions today: {placement.impressions_today}</p>
                    </div>
                    <div className="placement-actions">
                      <button className="edit-btn">Edit</button>
                      <button className="remove-btn">Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <h3>Performance Analytics</h3>
            <p>Detailed analytics will be available once you enable monetization</p>

            {settings?.ads_enabled && (
              <div className="analytics-placeholder">
                <p>Analytics dashboard coming soon...</p>
                <p>This will show real-time user engagement, impression data, and revenue trends.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
