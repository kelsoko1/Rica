import React, { useState, useEffect } from 'react';
import ProfileManager from './ProfileManager';
import './BrowserTabs.css';

const BrowserTabs = ({ onTabChange }) => {
  const [showProfiles, setShowProfiles] = useState(true);
  const [activeProfile, setActiveProfile] = useState(null);
  const [tabs, setTabs] = useState([
    { id: 1, title: 'New Tab', url: 'about:blank', active: true }
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [nextTabId, setNextTabId] = useState(2);
  const [fingerprint, setFingerprint] = useState({
    userAgent: '',
    platform: '',
    language: '',
    screenResolution: '',
    timezone: '',
    webGLVendor: '',
    webGLRenderer: ''
  });

  useEffect(() => {
    // Initialize with random fingerprint
    generateNewFingerprint();
  }, []);

  const generateNewFingerprint = () => {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ];
    
    const platforms = ['Win32', 'MacIntel', 'Linux x86_64'];
    const languages = ['en-US', 'en-GB', 'fr-FR', 'de-DE'];
    const resolutions = ['1920x1080', '2560x1440', '1366x768'];
    const timezones = ['UTC', 'UTC+1', 'UTC-5', 'UTC+8'];
    
    const newFingerprint = {
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      language: languages[Math.floor(Math.random() * languages.length)],
      screenResolution: resolutions[Math.floor(Math.random() * resolutions.length)],
      timezone: timezones[Math.floor(Math.random() * timezones.length)],
      webGLVendor: 'Intel Inc.',
      webGLRenderer: 'Intel Iris OpenGL Engine'
    };

    setFingerprint(newFingerprint);
  };

  const addNewTab = () => {
    const newTab = {
      id: nextTabId,
      title: 'New Tab',
      url: 'about:blank',
      active: true
    };

    setTabs(prevTabs => 
      prevTabs.map(tab => ({...tab, active: false})).concat(newTab)
    );
    setActiveTabId(nextTabId);
    setNextTabId(prev => prev + 1);
  };

  const closeTab = (tabId, event) => {
    event.stopPropagation();
    
    if (tabs.length === 1) {
      addNewTab();
    }
    
    setTabs(prevTabs => {
      const tabIndex = prevTabs.findIndex(tab => tab.id === tabId);
      const newTabs = prevTabs.filter(tab => tab.id !== tabId);
      
      if (tabId === activeTabId) {
        const newActiveTab = newTabs[Math.min(tabIndex, newTabs.length - 1)];
        if (newActiveTab) {
          newActiveTab.active = true;
          setActiveTabId(newActiveTab.id);
        }
      }
      
      return newTabs;
    });
  };

  const activateTab = (tabId) => {
    setTabs(prevTabs =>
      prevTabs.map(tab => ({
        ...tab,
        active: tab.id === tabId
      }))
    );
    setActiveTabId(tabId);
  };

  const updateTabUrl = (tabId, newUrl) => {
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === tabId
          ? { ...tab, url: newUrl, title: newUrl }
          : tab
      )
    );
  };

  const handleProfileSelect = (profile) => {
    setActiveProfile(profile);
    setShowProfiles(false);
    setFingerprint(profile.fingerprint);
  };

  const handleBackToProfiles = () => {
    setShowProfiles(true);
    setActiveProfile(null);
    setTabs([{ id: 1, title: 'New Tab', url: 'about:blank', active: true }]);
  };

  if (showProfiles) {
    return <ProfileManager onProfileSelect={handleProfileSelect} />;
  }

  return (
    <div className="browser-container">
      <div className="browser-toolbar">
        <div className="profile-bar">
          <button className="back-to-profiles" onClick={handleBackToProfiles}>
            ← Back to Profiles
          </button>
          {activeProfile && (
            <div className="active-profile">
              <span className="profile-name">{activeProfile.name}</span>
              {activeProfile.proxy && (
                <span className="profile-proxy">Proxy: {activeProfile.proxy}</span>
              )}
            </div>
          )}
        </div>
        <div className="tab-bar">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`tab ${tab.active ? 'active' : ''}`}
              onClick={() => activateTab(tab.id)}
            >
              <span className="tab-title">{tab.title}</span>
              <button
                className="close-tab"
                onClick={(e) => closeTab(tab.id, e)}
              >
                ×
              </button>
            </div>
          ))}
          <button className="new-tab" onClick={addNewTab}>
            +
          </button>
        </div>
        
        <div className="url-bar">
          <input
            type="text"
            value={tabs.find(tab => tab.active)?.url || ''}
            onChange={(e) => updateTabUrl(activeTabId, e.target.value)}
            placeholder="Enter URL"
          />
          <button className="refresh-fingerprint" onClick={generateNewFingerprint}>
            🔄 Rotate Fingerprint
          </button>
        </div>
      </div>

      <div className="fingerprint-info">
        <h3>Current Browser Fingerprint:</h3>
        <div className="fingerprint-details">
          <div>User Agent: {fingerprint.userAgent}</div>
          <div>Platform: {fingerprint.platform}</div>
          <div>Language: {fingerprint.language}</div>
          <div>Screen Resolution: {fingerprint.screenResolution}</div>
          <div>Timezone: {fingerprint.timezone}</div>
          <div>WebGL Vendor: {fingerprint.webGLVendor}</div>
          <div>WebGL Renderer: {fingerprint.webGLRenderer}</div>
        </div>
      </div>

      <div className="browser-content">
        <div className="browser-frame">
          <div className="browser-controls">
            <div className="browser-buttons">
              <button className="browser-btn back" title="Back">←</button>
              <button className="browser-btn forward" title="Forward">→</button>
              <button className="browser-btn reload" title="Reload">↻</button>
            </div>
            <div className="browser-security">
              <span className="security-badge">
                <span className="security-icon">🔒</span>
                Secure Connection
              </span>
            </div>
          </div>
          <div className="browser-viewport">
            <div className="placeholder-content">
              <div className="browser-welcome">
                <div className="welcome-icon">
                  <span className="icon-glow"></span>
                  🌐
                </div>
                <h3>Secure Browsing Session</h3>
                <div className="status-info">
                  <div className="status-item">
                    <span className="status-icon">🛡️</span>
                    Anti-Detection Active
                  </div>
                  <div className="status-item">
                    <span className="status-icon">🕵️</span>
                    Fingerprint Protected
                  </div>
                  <div className="status-item">
                    <span className="status-icon">🔌</span>
                    Proxy Connected
                  </div>
                </div>
                <p>Your browsing session is secured with advanced anti-detection measures and unique fingerprints</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserTabs;
