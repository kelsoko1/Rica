import React, { useState, useEffect } from 'react';
import './LeftNav.css';

export default function LeftNav({collapsed, onToggle, className, onNavItemChange}){
  // Initialize with no active item by default
  const [activeItem, setActiveItem] = useState(null);
  
  // Add a hover state for visual feedback
  const [hoverItem, setHoverItem] = useState(null);
  
  // Sync with parent component if activeItem changes
  useEffect(() => {
    if (onNavItemChange) {
      onNavItemChange(activeItem);
    }
  }, [activeItem, onNavItemChange]);
  
  const handleNavClick = (item) => {
    setActiveItem(item);
    
    // Notify parent component about the change
    if (onNavItemChange) {
      onNavItemChange(item);
    }
  };
  
  // Logo click handler removed to prevent redirection

  return (
    <div className={'left-nav ' + (collapsed ? 'collapsed' : '') + (className ? ' ' + className : '')}>
      <div className="brand">
        <div className="logo">R</div>
        {!collapsed && <div className="brand-text">Rica</div>}
      </div>
      
      <nav className="nav-items">
        
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

          <button 
            className={`nav-btn ${activeItem === 'project' ? 'active' : ''} ${hoverItem === 'project' ? 'hover' : ''}`} 
            title="Project Explorer"
            onClick={() => handleNavClick('project')}
            onMouseEnter={() => setHoverItem('project')}
            onMouseLeave={() => setHoverItem(null)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 15.5L10 12.5L7 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 15.5L17 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {!collapsed && <span>Project Explorer</span>}
          </button>
      </nav>
      
      <div className="left-footer">
        <button className="collapse" onClick={onToggle} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
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
