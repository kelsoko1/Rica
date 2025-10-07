import React, { useState, useEffect, useRef } from 'react';
import './SocialAccountsGrid.css';

// Default empty profile
const DEFAULT_PROFILE = {
  id: null,
  name: '',
  socialAccounts: [],
  status: 'inactive'
};

const SocialAccountsGrid = ({ profile, onAccountAction }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [automationMode, setAutomationMode] = useState(false);
  const gridRef = useRef(null);
  const [virtualizedAccounts, setVirtualizedAccounts] = useState([]);
  
  // Ensure we have a valid profile with socialAccounts
  const safeProfile = profile || DEFAULT_PROFILE;
  const socialAccounts = safeProfile?.socialAccounts || [];
  const [isScrolling, setIsScrolling] = useState(false);

  const platforms = {
    facebook: { name: 'Facebook', icon: '📘', color: '#1877F2' },
    twitter: { name: 'Twitter/X', icon: '🐦', color: '#1DA1F2' },
    instagram: { name: 'Instagram', icon: '📸', color: '#E4405F' },
    linkedin: { name: 'LinkedIn', icon: '💼', color: '#0A66C2' },
    tiktok: { name: 'TikTok', icon: '🎵', color: '#000000' },
    pinterest: { name: 'Pinterest', icon: '📌', color: '#E60023' },
    reddit: { name: 'Reddit', icon: '🤖', color: '#FF4500' },
    youtube: { name: 'YouTube', icon: '▶️', color: '#FF0000' },
    discord: { name: 'Discord', icon: '💬', color: '#5865F2' },
    telegram: { name: 'Telegram', icon: '✈️', color: '#0088CC' },
    whatsapp: { name: 'WhatsApp', icon: '💭', color: '#25D366' },
    medium: { name: 'Medium', icon: '📝', color: '#000000' },
    github: { name: 'GitHub', icon: '🐱', color: '#181717' },
    twitch: { name: 'Twitch', icon: '🎮', color: '#9146FF' },
    spotify: { name: 'Spotify', icon: '🎵', color: '#1DB954' }
  };

  const automationActions = {
    post: { name: 'Create Post', icon: '✏️' },
    like: { name: 'Like Posts', icon: '❤️' },
    follow: { name: 'Follow Users', icon: '👥' },
    comment: { name: 'Comment', icon: '💬' },
    message: { name: 'Send Messages', icon: '✉️' },
    share: { name: 'Share Content', icon: '🔄' },
    schedule: { name: 'Schedule Posts', icon: '⏰' },
    analyze: { name: 'Analytics', icon: '📊' }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [socialAccounts, searchQuery, selectedPlatform]);

  const handleScroll = () => {
    if (!gridRef.current) return;
    
    const grid = gridRef.current;
    const rect = grid.getBoundingClientRect();
    const visibleHeight = window.innerHeight;
    const totalHeight = grid.scrollHeight;
    
    // Calculate which items should be visible
    const startIndex = Math.floor((window.scrollY - rect.top) / 200);
    const endIndex = Math.ceil((window.scrollY - rect.top + visibleHeight) / 200);
    
    const filtered = filterAccounts();
    const visible = filtered.slice(
      Math.max(0, startIndex - 10),
      Math.min(filtered.length, endIndex + 10)
    );
    
    setVirtualizedAccounts(visible);
    setIsScrolling(false);
  };

  const filterAccounts = () => {
    return socialAccounts.filter(account => {
      const matchesSearch = 
        account.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = selectedPlatform === 'all' || account.platform === selectedPlatform;
      return matchesSearch && matchesPlatform;
    });
  };

  const handleAutomationAction = (account, action) => {
    onAccountAction(account, action);
  };

  const renderAccountCard = (account) => (
    <div 
      key={account.id} 
      className={`account-card ${account.status || ''} ${viewMode}`}
      style={{
        '--platform-color': platforms[account.platform]?.color || '#666'
      }}
    >
      <div className="account-header">
        <span className="platform-icon">{platforms[account.platform]?.icon}</span>
        <span className="platform-name">{platforms[account.platform]?.name}</span>
        {account.status === 'active' && <span className="status-dot"></span>}
      </div>
      
      <div className="account-info">
        <h3>{account.username}</h3>
        {account.notes && <p className="account-notes">{account.notes}</p>}
        <div className="account-stats">
          <span>Followers: {account.stats?.followers || 0}</span>
          <span>Posts: {account.stats?.posts || 0}</span>
        </div>
      </div>

      {automationMode && (
        <div className="automation-actions">
          {Object.entries(automationActions).map(([key, action]) => (
            <button
              key={key}
              className="automation-btn"
              onClick={() => handleAutomationAction(account, key)}
              title={action.name}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}

      <div className="account-actions">
        <button 
          className="launch-btn"
          onClick={() => onAccountAction(account, 'launch')}
        >
          Launch
        </button>
        <button 
          className="edit-btn"
          onClick={() => onAccountAction(account, 'edit')}
        >
          Edit
        </button>
        <button 
          className="delete-btn"
          onClick={() => onAccountAction(account, 'delete')}
        >
          Delete
        </button>
      </div>
    </div>
  );

  if (!profile || !profile.socialAccounts) {
    return (
      <div className="social-accounts-grid empty-state">
        <div className="empty-message">
          <h3>No Profile Selected</h3>
          <p>Please select a profile to view social accounts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="social-accounts-grid">
      <div className="grid-controls">
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="platform-filter"
          >
            <option value="all">All Platforms</option>
            {Object.entries(platforms).map(([key, platform]) => (
              <option key={key} value={key}>
                {platform.icon} {platform.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
          <button
            className={`automation-toggle ${automationMode ? 'active' : ''}`}
            onClick={() => setAutomationMode(!automationMode)}
          >
            🤖 Automation
          </button>
        </div>
      </div>

      <div 
        className={`accounts-container ${viewMode}`}
        ref={gridRef}
      >
        {virtualizedAccounts.map(renderAccountCard)}
      </div>

      <div className="accounts-summary">
        <span>Total Accounts: {socialAccounts.length}</span>
        <span>Active: {socialAccounts.filter(a => a.status === 'active').length}</span>
        <span>Filtered: {filterAccounts().length}</span>
      </div>
    </div>
  );
};

export default SocialAccountsGrid;
