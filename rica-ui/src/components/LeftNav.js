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
          className={`nav-btn ${activeItem === 'devices' ? 'active' : ''} ${hoverItem === 'devices' ? 'hover' : ''}`} 
          title="Device Manager"
          onClick={() => handleNavClick('devices')}
          onMouseEnter={() => setHoverItem('devices')}
          onMouseLeave={() => setHoverItem(null)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 16.95H6.21C2.84 16.95 2 16.11 2 12.74V6.74C2 3.37 2.84 2.53 6.21 2.53H16.74C20.11 2.53 20.95 3.37 20.95 6.74" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 21.47V16.95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12.95H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.74 21.47H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 12.8V18.51C22 20.88 21.41 21.47 19.04 21.47H15.49C13.12 21.47 12.53 20.88 12.53 18.51V12.8C12.53 10.43 13.12 9.84 15.49 9.84H19.04C21.41 9.84 22 10.43 22 12.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17.25 18.25C17.9404 18.25 18.5 17.6904 18.5 17C18.5 16.3096 17.9404 15.75 17.25 15.75C16.5596 15.75 16 16.3096 16 17C16 17.6904 16.5596 18.25 17.25 18.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {!collapsed && <span>Device Manager</span>}
        </button>
        
        <button 
          className={`nav-btn ${activeItem === 'sims' ? 'active' : ''} ${hoverItem === 'sims' ? 'hover' : ''}`} 
          title="Simulations"
          onClick={() => handleNavClick('sims')}
          onMouseEnter={() => setHoverItem('sims')}
          onMouseLeave={() => setHoverItem(null)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.9981 7.79L15.5781 5.37C14.8381 4.63 13.7181 4.63 12.9781 5.37L10.5581 7.79C10.2181 8.13 10.0781 8.6 10.1781 9.05C10.2781 9.51 10.6381 9.87 11.0981 9.97C11.5581 10.07 12.0281 9.93 12.3681 9.59L13.9981 7.96V14.96C13.9981 15.5 14.4481 15.95 14.9981 15.95C15.5481 15.95 15.9981 15.5 15.9981 14.96V7.96L17.6281 9.59C17.9681 9.93 18.4381 10.07 18.8981 9.97C19.3581 9.87 19.7181 9.51 19.8181 9.05C19.9181 8.6 19.7781 8.13 19.4381 7.79H17.9981Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.00195 16.21L8.42195 18.63C9.16195 19.37 10.2819 19.37 11.0219 18.63L13.4419 16.21C13.7819 15.87 13.9219 15.4 13.8219 14.95C13.7219 14.49 13.3619 14.13 12.9019 14.03C12.4419 13.93 11.9719 14.07 11.6319 14.41L10.0019 16.04V9.04C10.0019 8.49 9.55195 8.04 9.00195 8.04C8.45195 8.04 8.00195 8.49 8.00195 9.04V16.04L6.37195 14.41C6.03195 14.07 5.56195 13.93 5.10195 14.03C4.64195 14.13 4.28195 14.49 4.18195 14.95C4.08195 15.4 4.22195 15.87 4.56195 16.21H6.00195Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {!collapsed && <span>Simulations</span>}
        </button>
          
          <button 
            className={`nav-btn ${activeItem === 'fabric' ? 'active' : ''} ${hoverItem === 'fabric' ? 'hover' : ''}`} 
            title="Fabric"
            onClick={() => handleNavClick('fabric')}
            onMouseEnter={() => setHoverItem('fabric')}
            onMouseLeave={() => setHoverItem(null)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.5 9.09H20.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.6947 13.7H15.7037" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.6947 16.7H15.7037" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.9955 13.7H12.0045" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.9955 16.7H12.0045" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.29431 13.7H8.30329" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.29431 16.7H8.30329" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {!collapsed && <span>Fabric</span>}
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
