import React, { useState, useEffect, useCallback, memo } from 'react';
import './SwarmUI.css';
import ErrorBoundary from './ErrorBoundary';
import { trackEvent } from '../services/analyticsService';
import { 
  FaGlobe, FaUsers, FaCog, FaSignOutAlt, FaSearch, FaSync, 
  FaFilter, FaPlus, FaPlay, FaCopy, FaTrash, FaEdit, FaTimes, 
  FaCheck, FaExclamationTriangle, FaRobot, FaChartLine 
} from 'react-icons/fa';

// Generate a random fingerprint for CamouFox anti-detect engine
const generateCamouFoxFingerprint = () => {
  const platforms = ['Win32', 'MacIntel', 'Linux x86_64'];
  const languages = ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE'];
  const timezones = ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'];
  const resolutions = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 2560, height: 1440 }
  ];
  
  const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
  const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
  const randomTimezone = timezones[Math.floor(Math.random() * timezones.length)];
  const randomResolution = resolutions[Math.floor(Math.random() * resolutions.length)];
  
  return {
    userAgent: `Mozilla/5.0 (${randomPlatform}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`,
    platform: randomPlatform,
    language: randomLanguage,
    timezone: randomTimezone,
    screenResolution: `${randomResolution.width}x${randomResolution.height}`,
    webglVendor: 'Intel Inc.',
    webglRenderer: 'Intel Iris OpenGL Engine',
    canvasNoise: Math.random().toString(36).substring(7),
    hardwareConcurrency: Math.floor(Math.random() * 8) + 2,
    deviceMemory: [2, 4, 8, 16][Math.floor(Math.random() * 4)]
  };
};

const SwarmUI = ({ profile: initialProfile, onClose }) => {
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
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Load profiles from localStorage
  useEffect(() => {
    const savedProfiles = localStorage.getItem('swarmProfiles');
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles));
    } else {
      // Create some default profiles
      const defaultProfiles = [
        {
          id: Date.now(),
          name: 'Facebook - Zen',
          status: 'No status',
          proxy: 'SmartProxy',
          proxyDetails: '18 hours ago - US - 149.40.56.18',
          tags: ['Active', 'New'],
          fingerprint: generateCamouFoxFingerprint(),
          lastUsed: new Date().toISOString(),
          created: new Date().toISOString()
        },
        {
          id: Date.now() + 1,
          name: 'Facebook - Trevor',
          status: 'No status',
          proxy: 'SP HTTP',
          proxyDetails: '18 hours ago - US - 206.71.50.48.18',
          tags: [],
          fingerprint: generateCamouFoxFingerprint(),
          lastUsed: new Date().toISOString(),
          created: new Date().toISOString()
        },
        {
          id: Date.now() + 2,
          name: 'Facebook - Neal',
          status: 'No status',
          proxy: 'SmartProxy',
          proxyDetails: '18 hours ago - US - 149.40.56.18',
          tags: ['New', 'Active'],
          fingerprint: generateCamouFoxFingerprint(),
          lastUsed: new Date().toISOString(),
          created: new Date().toISOString()
        }
      ];
      setProfiles(defaultProfiles);
      localStorage.setItem('swarmProfiles', JSON.stringify(defaultProfiles));
    }
  }, []);

  // Save profiles to localStorage whenever they change
  useEffect(() => {
    if (profiles.length > 0) {
      localStorage.setItem('swarmProfiles', JSON.stringify(profiles));
    }
  }, [profiles]);

  // Handle profile start
  const handleStartProfile = useCallback((profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    setActiveBrowserSession(profile);
    setRunningProfiles([...runningProfiles, profileId]);
    
    // Create initial tab
    const initialTab = {
      id: Date.now(),
      url: 'https://www.google.com',
      title: 'New Tab',
      isLoading: false
    };
    setBrowserTabs([initialTab]);
    setActiveBrowserTabId(initialTab.id);
    setUrlInput(initialTab.url);

    trackEvent('swarm_profile_started', {
      profileId: profile.id,
      profileName: profile.name
    });
  }, [profiles, runningProfiles]);

  // Handle profile duplicate
  const handleDuplicateProfile = useCallback((profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    const newProfile = {
      ...profile,
      id: Date.now(),
      name: `${profile.name} (Copy)`,
      fingerprint: generateCamouFoxFingerprint(),
      created: new Date().toISOString()
    };

    setProfiles([...profiles, newProfile]);
    trackEvent('swarm_profile_duplicated', { originalId: profileId, newId: newProfile.id });
  }, [profiles]);

  // Handle profile delete
  const handleDeleteProfile = useCallback((profileId) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      setProfiles(profiles.filter(p => p.id !== profileId));
      setSelectedProfiles(selectedProfiles.filter(id => id !== profileId));
      trackEvent('swarm_profile_deleted', { profileId });
    }
  }, [profiles, selectedProfiles]);

  // Handle create new profile
  const handleCreateProfile = useCallback(() => {
    const newProfile = {
      id: Date.now(),
      name: `New Profile ${profiles.length + 1}`,
      status: 'No status',
      proxy: 'No proxy',
      proxyDetails: '',
      tags: ['New'],
      fingerprint: generateCamouFoxFingerprint(),
      lastUsed: new Date().toISOString(),
      created: new Date().toISOString()
    };

    setProfiles([...profiles, newProfile]);
    setShowCreateModal(false);
    trackEvent('swarm_profile_created', { profileId: newProfile.id });
  }, [profiles]);

  // Handle profile selection
  const handleSelectProfile = useCallback((profileId) => {
    if (selectedProfiles.includes(profileId)) {
      setSelectedProfiles(selectedProfiles.filter(id => id !== profileId));
    } else {
      setSelectedProfiles([...selectedProfiles, profileId]);
    }
  }, [selectedProfiles]);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedProfiles.length === profiles.length) {
      setSelectedProfiles([]);
    } else {
      setSelectedProfiles(profiles.map(p => p.id));
    }
  }, [profiles, selectedProfiles]);

  // Filter profiles based on search query
  const filteredProfiles = profiles.filter(profile => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      profile.name.toLowerCase().includes(query) ||
      profile.status.toLowerCase().includes(query) ||
      profile.proxy.toLowerCase().includes(query) ||
      profile.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredProfiles.length / rowsPerPage);
  const paginatedProfiles = filteredProfiles.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Browser tab management
  const handleCreateBrowserTab = useCallback(() => {
    const newTab = {
      id: Date.now(),
      url: 'https://www.google.com',
      title: 'New Tab',
      isLoading: false
    };
    setBrowserTabs([...browserTabs, newTab]);
    setActiveBrowserTabId(newTab.id);
    setUrlInput(newTab.url);
  }, [browserTabs]);

  const handleCloseBrowserTab = useCallback((tabId) => {
    const newTabs = browserTabs.filter(t => t.id !== tabId);
    if (newTabs.length === 0) {
      setActiveBrowserSession(null);
      setBrowserTabs([]);
      setActiveBrowserTabId(null);
    } else {
      setBrowserTabs(newTabs);
      if (tabId === activeBrowserTabId) {
        setActiveBrowserTabId(newTabs[0].id);
        setUrlInput(newTabs[0].url);
      }
    }
  }, [browserTabs, activeBrowserTabId]);

  const handleUrlSubmit = useCallback((e) => {
    e.preventDefault();
    let url = urlInput;
    
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    const updatedTabs = browserTabs.map(tab =>
      tab.id === activeBrowserTabId
        ? { ...tab, url, isLoading: true }
        : tab
    );
    setBrowserTabs(updatedTabs);
  }, [urlInput, browserTabs, activeBrowserTabId]);

  // If browser session is active, show browser view
  if (activeBrowserSession) {
    return (
      <ErrorBoundary>
        <div className="swarm-ui-gologin">
          <div className="browser-session-header">
            <div className="browser-session-info">
              <FaGlobe className="browser-icon" />
              <span className="browser-profile-name">{activeBrowserSession.name}</span>
              <span className="browser-engine-badge">CamouFox</span>
              {activeBrowserSession.proxy && (
                <span className="browser-proxy-badge">{activeBrowserSession.proxy}</span>
              )}
            </div>
            <button 
              className="browser-close-btn" 
              onClick={() => {
                setActiveBrowserSession(null);
                setBrowserTabs([]);
                setActiveBrowserTabId(null);
                setRunningProfiles(runningProfiles.filter(id => id !== activeBrowserSession.id));
              }}
            >
              <FaTimes />
            </button>
          </div>

          <div className="browser-tabs-bar">
            {browserTabs.map(tab => (
              <div
                key={tab.id}
                className={`browser-tab ${tab.id === activeBrowserTabId ? 'active' : ''}`}
                onClick={() => {
                  setActiveBrowserTabId(tab.id);
                  setUrlInput(tab.url);
                }}
              >
                <span className="browser-tab-title">{tab.title}</span>
                <button
                  className="browser-tab-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseBrowserTab(tab.id);
                  }}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
            <button className="browser-new-tab-btn" onClick={handleCreateBrowserTab}>
              <FaPlus />
            </button>
          </div>

          <div className="browser-url-bar">
            <form onSubmit={handleUrlSubmit}>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter URL"
                className="browser-url-input"
              />
            </form>
          </div>

          <div className="browser-content-area">
            {browserTabs.map(tab => (
              <div
                key={tab.id}
                className={`browser-tab-content ${tab.id === activeBrowserTabId ? 'active' : ''}`}
              >
                <iframe
                  src={tab.url}
                  title={tab.title}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Main GoLogin-style interface
  return (
    <ErrorBoundary>
      <div className="swarm-ui-gologin">
        {/* Left Sidebar */}
        <div className="gologin-sidebar">
          <div className="gologin-logo">
            <FaGlobe className="logo-icon" />
            <span className="logo-text">Swarm</span>
          </div>

          <nav className="gologin-nav">
            <button
              className={`nav-item ${activeView === 'browsers' ? 'active' : ''}`}
              onClick={() => setActiveView('browsers')}
            >
              <FaGlobe />
              <span>Browsers</span>
            </button>
            <button
              className={`nav-item ${activeView === 'teams' ? 'active' : ''}`}
              onClick={() => setActiveView('teams')}
            >
              <FaUsers />
              <span>Teams</span>
            </button>
            <button
              className={`nav-item ${activeView === 'automation' ? 'active' : ''}`}
              onClick={() => setActiveView('automation')}
            >
              <FaRobot />
              <span>Automation</span>
            </button>
            <button
              className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveView('settings')}
            >
              <FaCog />
              <span>Settings</span>
            </button>
          </nav>

          <div className="gologin-sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">TI</div>
              <div className="user-details">
                <div className="user-plan">Trial</div>
                <div className="user-days">3 days</div>
              </div>
            </div>
            <button className="logout-btn">
              <FaSignOutAlt />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="gologin-main">
          {/* Top Bar */}
          <div className="gologin-topbar">
            <div className="topbar-left">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="topbar-right">
              <button className="topbar-btn" onClick={() => setProfiles([...profiles])}>
                <FaSync /> Refresh
              </button>
              <button 
                className={`topbar-btn ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter /> Filters
              </button>
              <button className="topbar-btn-primary" onClick={handleCreateProfile}>
                <FaPlus /> Create profile
              </button>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="gologin-content-tabs">
            <button
              className={`content-tab ${activeTab === 'profiles' ? 'active' : ''}`}
              onClick={() => setActiveTab('profiles')}
            >
              <FaGlobe /> Profiles
            </button>
            <button
              className={`content-tab ${activeTab === 'proxies' ? 'active' : ''}`}
              onClick={() => setActiveTab('proxies')}
            >
              Proxies
            </button>
            <button
              className={`content-tab ${activeTab === 'tags' ? 'active' : ''}`}
              onClick={() => setActiveTab('tags')}
            >
              Tags
            </button>
            <button
              className={`content-tab ${activeTab === 'statuses' ? 'active' : ''}`}
              onClick={() => setActiveTab('statuses')}
            >
              Statuses
            </button>
            <button
              className={`content-tab ${activeTab === 'extras' ? 'active' : ''}`}
              onClick={() => setActiveTab('extras')}
            >
              <FaCog /> Extras
            </button>
          </div>

          {/* Profiles Table */}
          {activeTab === 'profiles' && (
            <div className="gologin-table-container">
              <table className="gologin-table">
                <thead>
                  <tr>
                    <th className="checkbox-col">
                      <input
                        type="checkbox"
                        checked={selectedProfiles.length === profiles.length && profiles.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Name ↓</th>
                    <th>Status</th>
                    <th>Proxy</th>
                    <th>Tags</th>
                    <th className="actions-col">
                      <FaCog />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProfiles.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        <div className="empty-state-content">
                          <FaGlobe className="empty-icon" />
                          <h3>No profiles found</h3>
                          <p>Create your first browser profile to get started</p>
                          <button className="btn-primary" onClick={handleCreateProfile}>
                            <FaPlus /> Create Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedProfiles.map(profile => (
                      <tr key={profile.id} className={runningProfiles.includes(profile.id) ? 'running' : ''}>
                        <td className="checkbox-col">
                          <input
                            type="checkbox"
                            checked={selectedProfiles.includes(profile.id)}
                            onChange={() => handleSelectProfile(profile.id)}
                          />
                        </td>
                        <td className="name-col">
                          <div className="profile-name-cell">
                            <FaGlobe className="profile-icon" />
                            <span>{profile.name}</span>
                          </div>
                        </td>
                        <td className="status-col">
                          <span className="status-text">{profile.status}</span>
                        </td>
                        <td className="proxy-col">
                          <div className="proxy-cell">
                            <div className="proxy-name">{profile.proxy}</div>
                            {profile.proxyDetails && (
                              <div className="proxy-details">{profile.proxyDetails}</div>
                            )}
                          </div>
                        </td>
                        <td className="tags-col">
                          <div className="tags-cell">
                            {profile.tags.map((tag, idx) => (
                              <span key={idx} className={`tag tag-${tag.toLowerCase()}`}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="actions-col">
                          <div className="action-buttons">
                            <button
                              className="btn-start"
                              onClick={() => handleStartProfile(profile.id)}
                              title="Start profile"
                            >
                              <FaPlay /> Start
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => handleDuplicateProfile(profile.id)}
                              title="Duplicate"
                            >
                              <FaCopy />
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => setEditingProfile(profile)}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn-icon btn-danger"
                              onClick={() => handleDeleteProfile(profile.id)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {filteredProfiles.length > 0 && (
                <div className="gologin-pagination">
                  <div className="pagination-info">
                    Rows per page:
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  <div className="pagination-range">
                    {(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filteredProfiles.length)} of {filteredProfiles.length}
                  </div>
                  <div className="pagination-controls">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      ‹
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Other tabs content */}
          {activeTab === 'proxies' && (
            <div className="tab-content-placeholder">
              <FaChartLine className="placeholder-icon" />
              <h3>Proxies Management</h3>
              <p>Configure and manage your proxy settings</p>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="tab-content-placeholder">
              <FaChartLine className="placeholder-icon" />
              <h3>Tags Management</h3>
              <p>Organize your profiles with tags</p>
            </div>
          )}

          {activeTab === 'statuses' && (
            <div className="tab-content-placeholder">
              <FaChartLine className="placeholder-icon" />
              <h3>Status Management</h3>
              <p>Track and manage profile statuses</p>
            </div>
          )}

          {activeTab === 'extras' && (
            <div className="tab-content-placeholder">
              <FaCog className="placeholder-icon" />
              <h3>Extra Settings</h3>
              <p>Additional configuration options</p>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default memo(SwarmUI);
