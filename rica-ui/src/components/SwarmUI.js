import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import './SwarmUI.css';
import ErrorBoundary from './ErrorBoundary';
import { trackEvent } from '../services/analyticsService';
import { FaGlobe, FaUsers, FaCog, FaSignOutAlt, FaSearch, FaSync, FaFilter, FaPlus, FaPlay, FaCopy, FaTrash, FaEdit, FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const SwarmUI = ({ profile, onClose }) => {
  // Navigation and view state
  const [activeView, setActiveView] = useState('browsers');
  const [activeTab, setActiveTab] = useState('profiles');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Profile management state
  const [profiles, setProfiles] = useState([]);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [runningProfiles, setRunningProfiles] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  
  // Browser session state
  const [activeBrowserSession, setActiveBrowserSession] = useState(null);
  const [browserTabs, setBrowserTabs] = useState([]);
  const [activeBrowserTabId, setActiveBrowserTabId] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const iframeRef = useRef(null);

  // Keep tabsRef in sync with tabs state
  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  useEffect(() => {
    // Create initial tab
    if (profile && tabs.length === 0) {
      try {
        const initialUrl = profile?.socialAccounts?.length > 0
          ? getSocialPlatformUrl(profile.socialAccounts[0].platform)
          : profile.defaultStartUrl || 'about:blank';
        
        createNewTab(initialUrl);
        
        // Track browser session start for analytics
        trackEvent('swarm_browser_session_start', {
          profileId: profile.id,
          profileName: profile.name,
          browserType: profile.browserType,
          initialUrl
        });
      } catch (err) {
        console.error('Error initializing SwarmUI:', err);
        setError('Failed to initialize browser. Please try again.');
      }
    }
    
    // Cleanup function for when component unmounts
    return () => {
      // Track browser session end
      if (profile) {
        trackEvent('swarm_browser_session_end', {
          profileId: profile.id,
          profileName: profile.name,
          tabCount: tabsRef.current.length
        });
      }
    };
  }, [profile]);
  
  // Check connection status periodically
  useEffect(() => {
    const checkConnection = () => {
      const isOnline = navigator.onLine;
      setConnectionStatus(isOnline ? 'connected' : 'disconnected');
    };
    
    const intervalId = setInterval(checkConnection, 30000); // Check every 30 seconds
    window.addEventListener('online', () => setConnectionStatus('connected'));
    window.addEventListener('offline', () => setConnectionStatus('disconnected'));
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', () => setConnectionStatus('connected'));
      window.removeEventListener('offline', () => setConnectionStatus('disconnected'));
    };
  }, []);

  const getSocialPlatformUrl = useCallback((platform) => {
    const urls = {
      facebook: 'https://www.facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://www.instagram.com',
      linkedin: 'https://www.linkedin.com',
      tiktok: 'https://www.tiktok.com',
      pinterest: 'https://www.pinterest.com',
      reddit: 'https://www.reddit.com',
      youtube: 'https://www.youtube.com',
      discord: 'https://discord.com',
      telegram: 'https://web.telegram.org',
      github: 'https://github.com',
      twitch: 'https://www.twitch.tv'
    };
    return urls[platform] || 'about:blank';
  }, []);

  const createNewTab = useCallback((url = 'about:blank') => {
    const newTab = {
      id: Date.now(),
      url,
      title: 'New Tab',
      favicon: null,
      isLoading: false
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setUrlInput(url);
    
    // Track tab creation for analytics
    trackEvent('swarm_tab_created', {
      url,
      profileId: profile?.id,
      tabCount: tabs.length + 1
    });
  }, [tabs, profile]);

  const closeTab = useCallback((tabId) => {
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    
    if (newTabs.length === 0) {
      createNewTab();
    } else if (tabId === activeTabId) {
      // Switch to the next tab, or the previous if we're closing the last tab
      const newActiveTab = newTabs[Math.min(tabIndex, newTabs.length - 1)];
      setActiveTabId(newActiveTab.id);
      setUrlInput(newActiveTab.url);
    }
    
    setTabs(newTabs);
    
    // Track tab closure for analytics
    trackEvent('swarm_tab_closed', {
      profileId: profile?.id,
      tabCount: newTabs.length
    });
  }, [tabs, activeTabId, profile]);

  const handleUrlSubmit = useCallback((e) => {
    e.preventDefault();
    let url = urlInput;
    
    // Add protocol if missing
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    // Update current tab
    const updatedTabs = tabs.map(tab =>
      tab.id === activeTabId
        ? { ...tab, url, isLoading: true }
        : tab
    );
    setTabs(updatedTabs);
    setIframeKey(prev => prev + 1); // Force iframe refresh
    
    // Track URL navigation for analytics
    trackEvent('swarm_url_navigation', {
      url,
      profileId: profile?.id,
      tabId: activeTabId
    });
  }, [urlInput, tabs, activeTabId, profile]);

  const handleIframeLoad = useCallback(() => {
    const updatedTabs = tabs.map(tab =>
      tab.id === activeTabId
        ? { ...tab, isLoading: false }
        : tab
    );
    setTabs(updatedTabs);
    
    // Try to get the page title
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow.document.title) {
        const updatedTabs = tabs.map(tab =>
          tab.id === activeTabId
            ? { ...tab, title: iframe.contentWindow.document.title }
            : tab
        );
        setTabs(updatedTabs);
      }
    } catch (e) {
      // Ignore cross-origin errors
      console.debug('Cross-origin error when accessing iframe content:', e.message);
    }
  }, [tabs, activeTabId]);

  // Handle error retry
  const handleRetry = () => {
    setError(null);
    setIframeKey(prev => prev + 1);
    
    // Reload the current tab
    if (activeTabId) {
      const activeTab = tabs.find(tab => tab.id === activeTabId);
      if (activeTab) {
        const updatedTabs = tabs.map(tab =>
          tab.id === activeTabId
            ? { ...tab, isLoading: true }
            : tab
        );
        setTabs(updatedTabs);
      }
    }
  };

  // If there's an error, show error UI
  if (error) {
    return (
      <div className="swarm-ui swarm-error">
        <div className="browser-header">
          <div className="profile-info">
            <span className="profile-icon">
              {profile?.browserType === 'firefox' ? '🦊' : '🌐'}
            </span>
            <span className="profile-name">{profile?.name || 'Browser'}</span>
            {profile?.proxy && <span className="proxy-tag">Proxy</span>}
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Browser Error</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={handleRetry}>Try Again</button>
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className="swarm-ui">
      <div className="browser-header">
        <div className="profile-info">
          <span className="profile-icon">
            {profile?.browserType === 'firefox' ? '🦊' : '🌐'}
          </span>
          <span className="profile-name">{profile?.name || 'Browser'}</span>
          {profile?.proxy && <span className="proxy-tag">Proxy</span>}
          <span className={`connection-status ${connectionStatus}`}>
            {connectionStatus === 'connected' ? '🟢 Online' : '🔴 Offline'}
          </span>
        </div>
        <button className="close-btn" onClick={onClose} aria-label="Close browser">×</button>
      </div>

      <div className="browser-toolbar">
        <div className="tab-bar">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
              onClick={() => {
                setActiveTabId(tab.id);
                setUrlInput(tab.url);
              }}
            >
              {tab.favicon && <img src={tab.favicon} alt="" className="tab-favicon" />}
              <span className="tab-title">
                {tab.isLoading ? 'Loading...' : (tab.title || 'New Tab')}
              </span>
              <button
                className="tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button className="new-tab-btn" onClick={() => createNewTab()}>+</button>
        </div>

        <div className="url-bar">
          <form onSubmit={handleUrlSubmit}>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter URL"
            />
          </form>
        </div>
      </div>

      <div className="browser-content">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab-content ${tab.id === activeTabId ? 'active' : ''}`}
          >
            {tab.isLoading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <span>Loading {tab.url}...</span>
              </div>
            )}
            <iframe
              ref={tab.id === activeTabId ? iframeRef : null}
              key={`${tab.id}-${iframeKey}`}
              src={tab.url}
              title={tab.title}
              onLoad={handleIframeLoad}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <div className="browser-footer">
        <div className="social-accounts">
          {profile?.socialAccounts?.map((account, index) => (
            <button
              key={index}
              className="social-account-btn"
              onClick={() => {
                const url = getSocialPlatformUrl(account.platform);
                createNewTab(url);
              }}
            >
              {account.platform === 'facebook' && '📘'}
              {account.platform === 'twitter' && '🐦'}
              {account.platform === 'instagram' && '📸'}
              {account.platform === 'linkedin' && '💼'}
              {account.platform === 'tiktok' && '🎵'}
              {account.platform === 'pinterest' && '📌'}
              {account.platform === 'reddit' && '🤖'}
              {account.platform === 'youtube' && '▶️'}
              {account.platform === 'discord' && '💬'}
              {account.platform === 'telegram' && '✈️'}
              {account.platform === 'github' && '🐱'}
              {account.platform === 'twitch' && '🎮'}
              <span>{account.username}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default memo(SwarmUI);
