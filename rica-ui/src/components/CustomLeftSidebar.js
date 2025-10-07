import React, { useState } from 'react';
import './CustomLeftSidebar.css';

export default function CustomLeftSidebar({ collapsed, onToggle, onNavItemChange, activeItem }) {
  // Add a hover state for visual feedback
  const [hoverItem, setHoverItem] = useState(null);
  
  const handleNavClick = (item) => {
    if (onNavItemChange) {
      onNavItemChange(item);
    }
  };
  
  return (
    <div className={`custom-left-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand section hidden */}
      {/* <div className="brand">
        <div className="logo">R</div>
        {!collapsed && <div className="brand-text">Rica</div>}
      </div> */}
      
      <nav className="nav-items">
        <button 
          className={`nav-btn ${activeItem === 'project' ? 'active' : ''} ${hoverItem === 'project' ? 'hover' : ''}`} 
          title="Project Explorer"
          onClick={() => handleNavClick('project')}
          onMouseEnter={() => setHoverItem('project')}
          onMouseLeave={() => setHoverItem(null)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11V17C22 21 21 22 17 22H7C3 22 2 21 2 17V7C2 3 3 2 7 2H8.5C10 2 10.33 2.44 10.9 3.2L12.4 5.2C12.78 5.7 13 6 14 6H17C21 6 22 7 22 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 2H17C19 2 20 3 20 5V6.38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {!collapsed && <span>Project Explorer</span>}
        </button>
        
        <button 
          className={`nav-btn ${activeItem === 'auto' ? 'active' : ''} ${hoverItem === 'auto' ? 'hover' : ''}`} 
          title="Automation"
          onClick={() => handleNavClick('auto')}
          onMouseEnter={() => setHoverItem('auto')}
          onMouseLeave={() => setHoverItem(null)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 12L10.5 14.5L16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 18V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 12H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {!collapsed && <span>Auto</span>}
        </button>

        <button 
          className={`nav-btn ${activeItem === 'teams' ? 'active' : ''} ${hoverItem === 'teams' ? 'hover' : ''}`} 
          title="Teams"
          onClick={() => handleNavClick('teams')}
          onMouseEnter={() => setHoverItem('teams')}
          onMouseLeave={() => setHoverItem(null)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 7.16C17.94 7.15 17.87 7.15 17.81 7.16C16.43 7.11 15.33 5.98 15.33 4.58C15.33 3.15 16.48 2 17.91 2C19.34 2 20.49 3.16 20.49 4.58C20.48 5.98 19.38 7.11 18 7.16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16.97 14.44C18.34 14.67 19.85 14.43 20.91 13.72C22.32 12.78 22.32 11.24 20.91 10.3C19.84 9.59001 18.31 9.35 16.94 9.59" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5.96998 7.16C6.02998 7.15 6.09998 7.15 6.15998 7.16C7.53998 7.11 8.63998 5.98 8.63998 4.58C8.63998 3.15 7.48998 2 6.05998 2C4.62998 2 3.47998 3.16 3.47998 4.58C3.48998 5.98 4.58998 7.11 5.96998 7.16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 14.44C5.63 14.67 4.12 14.43 3.06 13.72C1.65 12.78 1.65 11.24 3.06 10.3C4.13 9.59001 5.66 9.35 7.03 9.59" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 14.63C11.94 14.62 11.87 14.62 11.81 14.63C10.43 14.58 9.32996 13.45 9.32996 12.05C9.32996 10.62 10.48 9.47 11.91 9.47C13.34 9.47 14.49 10.63 14.49 12.05C14.48 13.45 13.38 14.59 12 14.63Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.08997 17.78C7.67997 18.72 7.67997 20.26 9.08997 21.2C10.69 22.27 13.31 22.27 14.91 21.2C16.32 20.26 16.32 18.72 14.91 17.78C13.32 16.72 10.69 16.72 9.08997 17.78Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {!collapsed && <span>Teams</span>}
        </button>
      </nav>
      
      <div className="sidebar-footer">
        {/* Starry Button */}
        <button 
          className="sidebar-action-btn starry-btn"
          onClick={() => {
            // Toggle Starry sidebar - will be handled by parent
            const event = new CustomEvent('toggleStarry');
            window.dispatchEvent(event);
          }}
          title="Starry AI Assistant"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 17.75L5.82799 20.995L7.00699 14.122L2.00699 9.255L8.90699 8.255L11.993 2.002L15.079 8.255L21.979 9.255L16.979 14.122L18.158 20.995L12 17.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {!collapsed && <span>Starry</span>}
        </button>
        
        {/* Credits Button */}
        <button 
          className="sidebar-action-btn credits-btn"
          onClick={() => window.location.href = 'http://localhost:3030/payment-history'}
          title="View Billing & Tokens"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {!collapsed && <span className="credits-info"><strong>25</strong> Credits</span>}
        </button>
        
        {/* User Menu Button */}
        <button 
          className="sidebar-action-btn user-btn"
          onClick={() => window.location.href = 'http://localhost:3030/profile'}
          title="Account Settings"
        >
          <div className="user-avatar-small">KD</div>
          {!collapsed && (
            <div className="user-info-small">
              <div className="user-name-small">Kelvin Demo</div>
              <div className="user-role-small">Security Analyst</div>
            </div>
          )}
        </button>
        
        <div className="sidebar-divider"></div>
        
        <button className="collapse-btn" onClick={onToggle} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );
}
