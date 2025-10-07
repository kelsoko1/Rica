import React, { useState, useEffect } from 'react';
import './ProfileManager.css';
import SocialAccountsGrid from './SocialAccountsGrid';
import ErrorBoundary from './ErrorBoundary';

const EMPTY_PROFILE = {
  name: '',
  platform: 'windows',
  browserType: 'chrome',
  proxy: '',
  notes: '',
  socialAccounts: [],
  isShared: false,
  sharedWithTeams: [],
  status: 'inactive'
};

// Generate a random fingerprint for browser profiles
const generateRandomFingerprint = () => {
  const platforms = ['Win32', 'MacIntel', 'Linux x86_64'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const languages = ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE'];
  const timezones = ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'];
  const resolutions = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 2560, height: 1440 }
  ];
  
  const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
  const randomBrowser = browsers[Math.floor(Math.random() * browsers.length)];
  const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
  const randomTimezone = timezones[Math.floor(Math.random() * timezones.length)];
  const randomResolution = resolutions[Math.floor(Math.random() * resolutions.length)];
  
  return {
    userAgent: `Mozilla/5.0 (${randomPlatform}) AppleWebKit/537.36 (KHTML, like Gecko) ${randomBrowser}/120.0.0.0 Safari/537.36`,
    platform: randomPlatform,
    language: randomLanguage,
    timezone: randomTimezone,
    screenResolution: `${randomResolution.width}x${randomResolution.height}`,
    webglVendor: 'Intel Inc.',
    webglRenderer: 'Intel Iris OpenGL Engine',
    canvasNoise: Math.random().toString(36).substring(7),
    audioNoise: Math.random().toString(36).substring(7),
    hardwareConcurrency: Math.floor(Math.random() * 8) + 2,
    deviceMemory: [2, 4, 8, 16][Math.floor(Math.random() * 4)],
    colorDepth: 24,
    pixelRatio: [1, 1.5, 2][Math.floor(Math.random() * 3)]
  };
};

const ProfileManager = () => {
  const [profiles, setProfiles] = useState([]);
  const [showNewProfile, setShowNewProfile] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedView, setSelectedView] = useState('profiles');
  const [activeProfiles, setActiveProfiles] = useState([]);
  const [automationTasks, setAutomationTasks] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);

  const [newProfile, setNewProfile] = useState({
    name: '',
    platform: 'windows',
    browserType: 'chrome',
    proxy: '',
    notes: '',
    isShared: false,
    sharedWithTeams: [],
    customFingerprint: {
      userAgent: '',
      language: '',
      screenResolution: '',
      timezone: '',
      webGLVendor: '',
      webGLRenderer: ''
    },
    socialAccounts: [],
    defaultStartUrl: '',
    automationScripts: []
  });

  // Load saved profiles and sync with running browsers on component mount
  useEffect(() => {
    const savedProfiles = localStorage.getItem('browserProfiles');
    if (savedProfiles) {
      const loadedProfiles = JSON.parse(savedProfiles);
      setProfiles(loadedProfiles);
      
      // Set all profiles as inactive on load
      const updatedProfiles = loadedProfiles.map(profile => ({
        ...profile,
        status: 'inactive'
      }));
      setProfiles(updatedProfiles);
    }
  }, []);

  // Save profiles whenever they change
  useEffect(() => {
    localStorage.setItem('browserProfiles', JSON.stringify(profiles));
  }, [profiles]);

  const handleCreateProfile = () => {
    const profile = {
      ...newProfile,
      id: Date.now(),
      created: new Date().toISOString(),
      fingerprint: generateRandomFingerprint(),
      cookies: [],
      lastUsed: null,
      owner: 'current-user',
      status: 'inactive',
      isShared: false,
      sharedWithTeams: []
    };

    setProfiles([...profiles, profile]);
    setShowNewProfile(false);
    setNewProfile({
      name: '',
      platform: 'windows',
      browserType: 'chrome',
      proxy: '',
      notes: ''
    });
  };

  const handleSocialViewChange = (profile) => {
    if (profile && profile.socialAccounts) {
      setSelectedProfile(profile);
      setSelectedView('social');
    } else {
      alert('This profile has no social accounts configured');
    }
  };

  const handleLaunchProfile = async (profile) => {
    try {
      const updatedProfile = {
        ...profile,
        lastUsed: new Date().toISOString(),
        status: 'active'
      };
      setProfiles(profiles.map(p => 
        p.id === profile.id ? updatedProfile : p
      ));
      setActiveProfiles([...activeProfiles, profile.id]);
      setActiveProfile(updatedProfile);
      alert('Profile "' + profile.name + '" launched successfully!');
    } catch (error) {
      console.error('Error launching profile:', error);
      alert('An error occurred while launching the profile.');
    }
  };

  const handleStopProfile = async (profile) => {
    try {
      const updatedProfile = {
        ...profile,
        status: 'inactive'
      };
      setProfiles(profiles.map(p => 
        p.id === profile.id ? updatedProfile : p
      ));
      setActiveProfiles(activeProfiles.filter(id => id !== profile.id));
    } catch (error) {
      console.error('Error stopping profile:', error);
      alert('An error occurred while stopping the profile.');
    }
  };

  const handleAutomationAction = async (account, action) => {
    setSelectedAccount(account);
    
    switch (action) {
      case 'post':
      case 'schedule':
        setShowAutomationModal(true);
        break;
      case 'like':
      case 'follow':
      case 'comment':
        await handleQuickAction(account, action);
        break;
      default:
        console.log(`Unhandled action: ${action}`);
    }
  };

  const handleQuickAction = async (account, action) => {
    const task = {
      action,
      params: {
        count: 10,
        content: 'Great post! 👍',
      }
    };

    try {
      // Automation functionality removed with Swarm browser
      alert(`${action} automation would start here (browser integration removed)`);
      console.log('Automation task:', task);
    } catch (error) {
      console.error('Automation error:', error);
      alert('Error starting automation');
    }
  };

  const filteredProfiles = profiles.filter(profile => 
    profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSocialPlatformUrl = (platform) => {
    const urls = {
      facebook: 'https://www.facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://www.instagram.com',
      linkedin: 'https://www.linkedin.com',
      tiktok: 'https://www.tiktok.com',
      pinterest: 'https://www.pinterest.com'
    };
    return urls[platform] || 'about:blank';
  };

  const getBrowserIcon = (browserType) => {
    switch (browserType) {
      case 'chrome':
        return '🌐';
      case 'firefox':
        return '🦊';
      default:
        return '🌐';
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'windows':
        return '🪟';
      case 'macos':
        return '🍎';
      case 'linux':
        return '🐧';
      default:
        return '💻';
    }
  };

  const renderEditModal = () => {
    if (showEditModal && editingProfile) {
      return (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Profile</h2>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={editingProfile.name}
                onChange={(e) => setEditingProfile({
                  ...editingProfile,
                  name: e.target.value
                })}
              />
            </div>
            <div className="form-group">
              <label>Platform</label>
              <select
                value={editingProfile.platform}
                onChange={(e) => setEditingProfile({
                  ...editingProfile,
                  platform: e.target.value
                })}
              >
                <option value="windows">Windows</option>
                <option value="macos">MacOS</option>
                <option value="linux">Linux</option>
              </select>
            </div>
            <div className="form-group">
              <label>Browser Type</label>
              <select
                value={editingProfile.browserType}
                onChange={(e) => setEditingProfile({
                  ...editingProfile,
                  browserType: e.target.value
                })}
              >
                <option value="chrome">Chrome</option>
                <option value="firefox">Firefox</option>
              </select>
            </div>
            <div className="form-group">
              <label>Proxy (optional)</label>
              <input
                type="text"
                value={editingProfile.proxy}
                placeholder="socks5://user:pass@host:port"
                onChange={(e) => setEditingProfile({
                  ...editingProfile,
                  proxy: e.target.value
                })}
              />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={editingProfile.notes}
                onChange={(e) => setEditingProfile({
                  ...editingProfile,
                  notes: e.target.value
                })}
              />
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProfile(null);
                }}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={() => {
                  setProfiles(profiles.map(p =>
                    p.id === editingProfile.id ? editingProfile : p
                  ));
                  setShowEditModal(false);
                  setEditingProfile(null);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderSocialModal = () => {
    if (showShareModal && selectedProfile) {
      return (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Share Profile</h2>
            <div className="form-group">
              <label>Share with teams:</label>
              <input
                type="text"
                value={selectedProfile.sharedWithTeams.join(', ')}
                onChange={(e) => setSelectedProfile({
                  ...selectedProfile,
                  sharedWithTeams: e.target.value.split(',').map(team => team.trim())
                })}
              />
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowShareModal(false);
                  setSelectedProfile(null);
                }}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={() => {
                  setProfiles(profiles.map(p =>
                    p.id === selectedProfile.id ? selectedProfile : p
                  ));
                  setShowShareModal(false);
                  setSelectedProfile(null);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderAutomationModal = () => {
    if (showAutomationModal && selectedAccount) {
      return (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Schedule Post</h2>
            <div className="form-group">
              <label>Content</label>
              <textarea
                value={automationTasks[0]?.params?.content || ''}
                onChange={(e) => setAutomationTasks([{
                  action: 'schedule',
                  params: {
                    content: e.target.value,
                    schedule_time: automationTasks[0]?.params?.schedule_time || new Date().toISOString()
                  }
                }])}
                rows={4}
              />
            </div>
            <div className="form-group">
              <label>Schedule Time</label>
              <input
                type="datetime-local"
                value={automationTasks[0]?.params?.schedule_time?.slice(0, 16) || ''}
                onChange={(e) => setAutomationTasks([{
                  ...automationTasks[0],
                  params: {
                    ...automationTasks[0]?.params,
                    schedule_time: new Date(e.target.value).toISOString()
                  }
                }])}
              />
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowAutomationModal(false);
                  setSelectedAccount(null);
                  setAutomationTasks([]);
                }}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={async () => {
                  try {
                    // Browser automation removed with Swarm
                    alert('Post scheduling functionality removed (browser integration removed)');
                    console.log('Automation tasks:', automationTasks);
                    setShowAutomationModal(false);
                    setSelectedAccount(null);
                    setAutomationTasks([]);
                  } catch (error) {
                    console.error('Scheduling error:', error);
                    alert('Error scheduling post');
                  }
                }}
              >
                Schedule Post
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleClose = () => {
    if (activeProfile) {
      handleStopProfile(activeProfile);
    }
    // Reset all state
    setActiveProfile(null);
    setSelectedProfile(null);
    setSelectedView('profiles');
    setShowEditModal(false);
    setShowShareModal(false);
    setShowAutomationModal(false);
    setEditingProfile(null);
    setSelectedAccount(null);
    setAutomationTasks([]);
  };

  // Check if there are no profiles to display
  const hasNoProfiles = profiles.length === 0;

  return (
    <ErrorBoundary>
      <div className="profile-manager">
        <div className="profile-manager-header">
          <div className="header-left">
            <div className="logo">🌐</div>
            <h1>Profile Manager</h1>
          </div>
          <div className="header-right">
            <button className="close-btn" onClick={handleClose} aria-label="Close">×</button>
          </div>
        </div>
        <div className="profile-manager-content">
          {renderEditModal()}
          {renderSocialModal()}
          {renderAutomationModal()}
          <div className="profiles-sidebar">
            <div className="view-selector">
              <button
                className={`view-btn ${selectedView === 'profiles' ? 'active' : ''}`}
                onClick={() => setSelectedView('profiles')}
              >
                Profiles
              </button>
              <button
                className={`view-btn ${selectedView === 'social' ? 'active' : ''}`}
                onClick={() => selectedProfile ? setSelectedView('social') : null}
                disabled={!selectedProfile}
              >
                Social Accounts
              </button>
            </div>

            <div className="profile-header">
              <h2>Profiles</h2>
              <button
                className="new-profile-btn"
                onClick={() => setShowNewProfile(true)}
              >
                + NEW
              </button>
            </div>

            <div className="search-filters">
              <input
                type="text"
                placeholder="Search profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="main-content">
              {selectedView === 'profiles' ? (
                <div className="profiles-list">
                  {hasNoProfiles ? (
                    <div className="empty-state">
                      <div className="empty-icon">📋</div>
                      <h3>No Profiles Yet</h3>
                      <p>Create your first browser profile to get started</p>
                      <button 
                        className="new-profile-btn" 
                        onClick={() => setShowNewProfile(true)}
                      >
                        + Create Profile
                      </button>
                    </div>
                  ) : filteredProfiles.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">🔍</div>
                      <h3>No Matching Profiles</h3>
                      <p>Try a different search term</p>
                    </div>
                  ) : (
                    filteredProfiles.map(profile => (
                      <div key={profile.id} className={`profile-card ${profile.status === 'active' ? 'active' : ''}`}>
                        <div className="profile-card-header">
                          <div className="profile-icon">
                            {getBrowserIcon(profile.browserType)}
                            {getPlatformIcon(profile.platform)}
                          </div>
                          <div className="profile-name">{profile.name}</div>
                          <div className="profile-status">
                            {profile.status === 'active' && <span className="status-dot"></span>}
                          </div>
                        </div>
                        <div className="profile-info">
                          <div className="profile-tags">
                            {profile.proxy && <span className="proxy-tag">Proxy</span>}
                            {profile.isShared && <span className="shared-tag">Shared</span>}
                          </div>
                          {profile.notes && <p className="profile-notes">{profile.notes}</p>}
                          <div className="account-summary">
                            <span>Social Accounts: {profile.socialAccounts?.length || 0}</span>
                            <span>Active: {profile.socialAccounts?.filter(a => a.status === 'active').length || 0}</span>
                          </div>
                        </div>
                        <div className="profile-actions">
                          {profile.status === 'active' ? (
                            <button 
                              className="stop-btn"
                              onClick={() => handleStopProfile(profile)}
                            >
                              Stop
                            </button>
                          ) : (
                            <button 
                              className="launch-btn"
                              onClick={() => handleLaunchProfile(profile)}
                            >
                              Launch
                            </button>
                          )}
                          <button 
                            className="edit-btn"
                            onClick={() => {
                              setEditingProfile(profile);
                              setShowEditModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className="social-btn"
                            onClick={() => handleSocialViewChange(profile)}
                            disabled={!profile.socialAccounts?.length}
                          >
                            Social
                          </button>
                          <button 
                            className="share-btn"
                            onClick={() => {
                              setSelectedProfile(profile);
                              setShowShareModal(true);
                            }}
                          >
                            Share
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => {
                              const confirmed = window.confirm('Are you sure you want to delete this profile?');
                              if (confirmed) {
                                setProfiles(profiles.filter(p => p.id !== profile.id));
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <>
                  <div className="view-header">
                    <button
                      className="back-btn"
                      onClick={() => {
                        setSelectedView('profiles');
                        setSelectedProfile(null);
                      }}
                    >
                      ← Back to Profiles
                    </button>
                    {selectedProfile && (
                      <h2>{selectedProfile.name} - Social Accounts</h2>
                    )}
                  </div>
                  <ErrorBoundary>
                    <SocialAccountsGrid
                      profile={selectedProfile}
                      onAccountAction={handleAutomationAction}
                      key={selectedProfile?.id} // Force remount on profile change
                    />
                  </ErrorBoundary>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

    </ErrorBoundary>
  );
};

export default ProfileManager;
