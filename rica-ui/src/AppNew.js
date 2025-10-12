import React, { useState, useEffect } from 'react';
import ThreatDashboard from './components/ThreatDashboard';
import BrowserTabs from './components/BrowserTabs';
import TeamsManager from './components/TeamsManager';
import CodeServer from './components/CodeServer';
import AutoFrame from './components/AutoFrame';
import CustomLeftSidebar from './components/CustomLeftSidebar';
import StarrySidebar from './components/StarrySidebar';
import ErrorBoundary from './components/ErrorBoundary';
import './components/Workspace.css';
import './components/TopMenuResizer.css';
import './components/MainContent.css';

export default function App(){
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [mobileNavVisible, setMobileNavVisible] = useState(false);
  // Start with no active item by default
  const [activeNavItem, setActiveNavItem] = useState(null);

  const [starrySidebarOpen, setStarrySidebarOpen] = useState(false); // State for Starry sidebar
  
  // Handle toggleStarry event from sidebar
  useEffect(() => {
    const handleToggleStarry = () => {
      setStarrySidebarOpen(prev => !prev);
    };
    
    window.addEventListener('toggleStarry', handleToggleStarry);
    return () => window.removeEventListener('toggleStarry', handleToggleStarry);
  }, []);
  

  
  const handleNavItemChange = (item) => {
    setActiveNavItem(item);
    
    };
  




  return (
    <ErrorBoundary>
      <div className={'app ' + (leftCollapsed ? 'left-collapsed' : '')}>
      {/* Mobile overlay */}
      <div 
        className={`mobile-overlay ${mobileNavVisible ? 'visible' : ''}`}
        onClick={() => setMobileNavVisible(false)}
      />
      
      {/* Custom Left Sidebar */}
      <CustomLeftSidebar 
        collapsed={leftCollapsed}
        onToggle={() => setLeftCollapsed(s => !s)}
        onNavItemChange={handleNavItemChange}
        activeItem={activeNavItem}
      />
      
      {/* Right Starry Sidebar */}
      <StarrySidebar 
        open={starrySidebarOpen} 
        onClose={() => setStarrySidebarOpen(false)}
      />
      
      <div className={`center-area resizable ${leftCollapsed ? 'left-collapsed' : ''} ${starrySidebarOpen ? 'starry-open' : ''}`}>
        <div className="workspace">
          {!activeNavItem ? (
            <div className="workspace-placeholder">
              <div className="icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7.99998 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2>Welcome to Rica</h2>
              <p>Select an option from the sidebar to explore threat intelligence, simulations, or launch the browser</p>
            </div>
          ) : (
            <div className="workspace-content-container">
              {activeNavItem === 'browser' && <BrowserTabs className="browser-tabs fade-in" />}

              {activeNavItem === 'threats' && <ThreatDashboard className="threat-dashboard fade-in" />}
              {activeNavItem === 'teams' && <TeamsManager className="teams-manager fade-in" />}
              {activeNavItem === 'project' && <CodeServer className="code-server fade-in" />}
              {activeNavItem === 'auto' && <AutoFrame className="auto-frame fade-in" />}
            </div>
          )}
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
