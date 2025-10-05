import React, {useState, useEffect} from 'react';
import LeftNav from './components/LeftNav';


import ThreatDashboard from './components/ThreatDashboard';
import AutoFrame from './components/AutoFrame';
import HeadlessServerContainer from './components/HeadlessServerContainer';
import TeamsManager from './components/TeamsManager';
import TopMenuResizer from './components/TopMenuResizer';
import CustomLeftSidebar from './components/CustomLeftSidebar';
import StarrySidebar from './components/StarrySidebar';
import ErrorBoundary from './components/ErrorBoundary';
import HeadlessServerStatusIndicator from './components/HeadlessServerStatusIndicator';
import { HeadlessServerStatusProvider } from './services/HeadlessServerStatusManager';
import './components/Workspace.css';
import './components/TopMenuResizer.css';
import './components/MainContent.css';
import './components/TopbarStyles.css';

export default function App(){
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [mobileNavVisible, setMobileNavVisible] = useState(false);
  // Start with no active item by default
  const [activeNavItem, setActiveNavItem] = useState(null);

  const [leftNavWidth, setLeftNavWidth] = useState(240); // Default width for left nav
  const [topMenuHeight, setTopMenuHeight] = useState(64); // Default height for top menu
  const [starrySidebarOpen, setStarrySidebarOpen] = useState(false); // State for Starry sidebar
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Handle any window resize logic here if needed
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Set CSS variable for topbar height to ensure consistency
  useEffect(() => {
    document.documentElement.style.setProperty('--topbar-height', `${topMenuHeight}px`);
    
    // Add resize event listener to update topbar height on window resize
    const handleResize = () => {
      // Check if we need to adjust topbar height based on screen width
      const isMobile = window.innerWidth <= 768;
      const isSmallMobile = window.innerWidth <= 480;
      
      // Only adjust if the user hasn't manually resized
      const userResized = localStorage.getItem('ricaTopMenuHeight');
      if (!userResized) {
        if (isSmallMobile && topMenuHeight !== 50) {
          setTopMenuHeight(50);
        } else if (isMobile && !isSmallMobile && topMenuHeight !== 56) {
          setTopMenuHeight(56);
        } else if (!isMobile && topMenuHeight !== 64) {
          setTopMenuHeight(64);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [topMenuHeight, setTopMenuHeight]);
  
  const handleNavItemChange = (item) => {
    setActiveNavItem(item);
  };

  const toggleMobileNav = () => {
    setMobileNavVisible(!mobileNavVisible);
  };
  
  const toggleStarrySidebar = () => {
    setStarrySidebarOpen(!starrySidebarOpen);
  };

  return (
    <ErrorBoundary>
      <HeadlessServerStatusProvider>
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
        onClose={toggleStarrySidebar} 
        currentFile={null} 
        onFileEdit={() => {}}
      />
      
      <div className={`center-area resizable ${leftCollapsed ? 'left-collapsed' : ''} ${starrySidebarOpen ? 'starry-open' : ''}`}>
        <div className="topbar" style={{ height: `${topMenuHeight}px` }}>
          <div className="topbar-content" style={{ height: `${topMenuHeight}px` }}>
            <div className="top-left">
              {/* Only show status indicator when a headless server is active */}
              {activeNavItem === 'auto' && (
                <HeadlessServerStatusIndicator />
              )}
            </div>
            <div className="top-right">
            
            <button 
              className={`starry-toggle ${starrySidebarOpen ? 'active' : ''}`} 
              onClick={toggleStarrySidebar}
              title={starrySidebarOpen ? "Hide Starry" : "Show Starry"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 17.75L5.82799 20.995L7.00699 14.122L2.00699 9.255L8.90699 8.255L11.993 2.002L15.079 8.255L21.979 9.255L16.979 14.122L18.158 20.995L12 17.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Starry</span>
            </button>
            
            <div className="credits">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <strong id="bal">25</strong>
            </div>
            
            <div className="user-menu">
              <div className="user-avatar">KD</div>
              <div className="user-info">
                <div className="user-name">Kelvin Demo</div>
                <div className="user-role">Security Analyst</div>
              </div>
            </div>
          </div>
          <TopMenuResizer 
            height={topMenuHeight}
            setHeight={setTopMenuHeight}
            minHeight={40}
            maxHeight={120}
          />
          </div>
        </div>

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
              {activeNavItem === 'threats' && <ThreatDashboard className="threat-dashboard fade-in" />}
              {activeNavItem === 'project' && <HeadlessServerContainer serverType="code" className="code-server-frame fade-in" />}
              {activeNavItem === 'auto' && <HeadlessServerContainer serverType="auto" className="auto-frame fade-in" />}
              {activeNavItem === 'teams' && <TeamsManager className="teams-manager fade-in" />}
            </div>
          )}
        </div>
      </div>
    </div>
      </HeadlessServerStatusProvider>
    </ErrorBoundary>
  );
}
