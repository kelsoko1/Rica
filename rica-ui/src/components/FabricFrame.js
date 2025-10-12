import React, { useState, useEffect } from 'react';
import './FabricFrame.css';
import './IframeContainer.css';

const FabricFrame = ({ onError }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [navOpen, setNavOpen] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  
  const toggleNav = () => {
    setNavOpen(!navOpen);
    localStorage.setItem('fabricNavOpen', String(!navOpen));
  };

  useEffect(() => {
    const savedNavState = localStorage.getItem('fabricNavOpen');
    if (savedNavState !== null) {
      setNavOpen(savedNavState === 'true');
    }
  }, []);

  // Direct iframe integration
  const renderDirectIframe = () => {
    return (
      <div className="iframe-container">
        <iframe
          src="http://localhost:2020"
          title=" Threat Intelligence Platform"
          className="external-iframe"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
          allow="clipboard-read; clipboard-write"
          onLoad={() => setIframeLoaded(true)}
          onError={() => onError && onError()}
        />
      </div>
    );
  };

  // Rich UI version (original implementation)
  const renderRichUI = () => {
    return (
      <div className="fabric-container">
        {/* Left Navigation */}
        <div className={`fabric-leftbar ${navOpen ? 'open' : 'closed'}`}>
          <div className="leftbar-header">
            <div className="toggle-button" onClick={toggleNav}>
              {navOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
        <div className="leftbar-content">
          {/* Navigation Menu Items */}
          <div className="menu-list">
            <div 
              className={`menu-item ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('dashboard')}
            >
              <div className="menu-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3H10V10H3V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 3H21V10H14V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 14H21V21H14V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 14H10V21H3V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {navOpen && <div className="menu-text">Dashboard</div>}
            </div>
            
            <div 
              className={`menu-item ${activeSection === 'threats' ? 'active' : ''}`}
              onClick={() => setActiveSection('threats')}
            >
              <div className="menu-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {navOpen && <div className="menu-text">Threats</div>}
            </div>
            
            <div 
              className={`menu-item ${activeSection === 'observations' ? 'active' : ''}`}
              onClick={() => setActiveSection('observations')}
            >
              <div className="menu-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {navOpen && <div className="menu-text">Observations</div>}
            </div>
            
            <div 
              className={`menu-item ${activeSection === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveSection('analytics')}
            >
              <div className="menu-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {navOpen && <div className="menu-text">Analytics</div>}
            </div>
            
            <div 
              className={`menu-item ${activeSection === 'techniques' ? 'active' : ''}`}
              onClick={() => setActiveSection('techniques')}
            >
              <div className="menu-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {navOpen && <div className="menu-text">Techniques</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="fabric-main">
        <div className="fabric-header">
          <h1>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h1>
        </div>
        <div className="fabric-content">
          {activeSection === 'dashboard' && (
            <div className="dashboard-content">
              <div className="dashboard-stats">
                <div className="stat-card">
                  <h3>Threats</h3>
                  <div className="stat-value">24</div>
                </div>
                <div className="stat-card">
                  <h3>Indicators</h3>
                  <div className="stat-value">156</div>
                </div>
                <div className="stat-card">
                  <h3>Vulnerabilities</h3>
                  <div className="stat-value">38</div>
                </div>
                <div className="stat-card">
                  <h3>Reports</h3>
                  <div className="stat-value">12</div>
                </div>
              </div>
              
              <div className="dashboard-row">
                <div className="dashboard-panel">
                  <h3>Recent Activity</h3>
                  <div className="activity-list">
                    <div className="activity-item">
                      <div className="activity-icon threat"></div>
                      <div className="activity-content">
                        <div className="activity-title">New threat actor identified</div>
                        <div className="activity-time">2 hours ago</div>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon observation"></div>
                      <div className="activity-content">
                        <div className="activity-title">Suspicious network traffic detected</div>
                        <div className="activity-time">5 hours ago</div>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon vulnerability"></div>
                      <div className="activity-content">
                        <div className="activity-title">Critical vulnerability reported</div>
                        <div className="activity-time">1 day ago</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="dashboard-panel">
                  <h3>Threat Map</h3>
                  <div className="threat-map">
                    <div className="map-placeholder">
                      <div className="map-point" style={{ top: '30%', left: '45%' }}></div>
                      <div className="map-point" style={{ top: '40%', left: '70%' }}></div>
                      <div className="map-point" style={{ top: '35%', left: '25%' }}></div>
                      <div className="map-point" style={{ top: '60%', left: '55%' }}></div>
                      <div className="map-point" style={{ top: '25%', left: '80%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'threats' && (
            <div className="threats-content">
              <div className="threats-filters">
                <input type="text" placeholder="Search threats..." />
                <div className="filter-buttons">
                  <button className="filter-button active">All</button>
                  <button className="filter-button">APT Groups</button>
                  <button className="filter-button">Malware</button>
                  <button className="filter-button">Campaigns</button>
                </div>
              </div>
              
              <div className="threats-grid">
                {/* Sample threat cards */}
                {Array.from({ length: 6 }).map((_, index) => (
                  <div className="threat-card" key={index}>
                    <div className="threat-header">
                      <div className="threat-type">APT Group</div>
                      <div className="threat-severity high"></div>
                    </div>
                    <h3>APT{29 + index}</h3>
                    <p>Advanced persistent threat group targeting government and defense sectors.</p>
                    <div className="threat-footer">
                      <div className="threat-tags">
                        <span className="tag">Espionage</span>
                        <span className="tag">Data Theft</span>
                      </div>
                      <div className="threat-date">Last updated: 2 days ago</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeSection === 'observations' && (
            <div className="observations-content">
              <div className="observations-header">
                <div className="search-bar">
                  <input type="text" placeholder="Search observations..." />
                </div>
                <div className="filter-dropdown">
                  <select>
                    <option>All Types</option>
                    <option>IP Address</option>
                    <option>Domain</option>
                    <option>File Hash</option>
                    <option>URL</option>
                  </select>
                </div>
              </div>
              
              <div className="observations-table">
                <div className="table-header">
                  <div className="table-cell">Type</div>
                  <div className="table-cell">Value</div>
                  <div className="table-cell">First Seen</div>
                  <div className="table-cell">Last Seen</div>
                  <div className="table-cell">Score</div>
                </div>
                
                {/* Sample observation rows */}
                {Array.from({ length: 10 }).map((_, index) => (
                  <div className="table-row" key={index}>
                    <div className="table-cell">
                      <div className="obs-type">
                        {index % 3 === 0 ? 'IP Address' : index % 3 === 1 ? 'Domain' : 'File Hash'}
                      </div>
                    </div>
                    <div className="table-cell">
                      {index % 3 === 0 
                        ? `192.168.${index}.${index + 10}` 
                        : index % 3 === 1 
                          ? `malicious-domain-${index}.com` 
                          : `44f88${index}c7fc56a24d8a1a7a9${index}d`}
                    </div>
                    <div className="table-cell">{`2025-09-${10 + index}`}</div>
                    <div className="table-cell">{`2025-09-${18 + (index % 3)}`}</div>
                    <div className="table-cell">
                      <div className={`score-badge ${index % 4 === 0 ? 'high' : index % 4 === 1 ? 'medium' : 'low'}`}>
                        {index % 4 === 0 ? 'High' : index % 4 === 1 ? 'Medium' : 'Low'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeSection === 'analytics' && (
            <div className="analytics-content">
              <div className="analytics-filters">
                <div className="date-range">
                  <label>Time Range:</label>
                  <select>
                    <option>Last 24 hours</option>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Custom range</option>
                  </select>
                </div>
              </div>
              
              <div className="analytics-grid">
                <div className="analytics-panel wide">
                  <h3>Threat Activity Over Time</h3>
                  <div className="chart-placeholder">
                    <div className="chart-line"></div>
                    <div className="chart-line"></div>
                    <div className="chart-line"></div>
                  </div>
                </div>
                
                <div className="analytics-panel">
                  <h3>Top Attack Vectors</h3>
                  <div className="chart-placeholder">
                    <div className="chart-bar" style={{ width: '80%' }}></div>
                    <div className="chart-bar" style={{ width: '65%' }}></div>
                    <div className="chart-bar" style={{ width: '45%' }}></div>
                    <div className="chart-bar" style={{ width: '30%' }}></div>
                  </div>
                </div>
                
                <div className="analytics-panel">
                  <h3>Affected Sectors</h3>
                  <div className="chart-placeholder circle">
                    <div className="chart-segment"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'techniques' && (
            <div className="techniques-content">
              <div className="techniques-header">
                <div className="search-bar">
                  <input type="text" placeholder="Search techniques..." />
                </div>
                <div className="view-toggle">
                  <button className="view-button active">Grid</button>
                  <button className="view-button">Matrix</button>
                  <button className="view-button">Tree</button>
                </div>
              </div>
              
              <div className="techniques-grid">
                {/* Sample technique cards */}
                {Array.from({ length: 8 }).map((_, index) => (
                  <div className="technique-card" key={index}>
                    <div className="technique-id">T{1000 + index}</div>
                    <h3>
                      {index % 4 === 0 
                        ? 'Spear Phishing' 
                        : index % 4 === 1 
                          ? 'Drive-by Compromise' 
                          : index % 4 === 2
                            ? 'Supply Chain Compromise'
                            : 'Credential Access'}
                    </h3>
                    <p>
                      {index % 4 === 0 
                        ? 'Sending targeted emails with malicious attachments or links to gain initial access.' 
                        : index % 4 === 1 
                          ? 'Gaining access to systems through a user visiting a compromised website.' 
                          : index % 4 === 2
                            ? 'Compromising software supply chain to distribute malware.'
                            : 'Stealing account credentials to gain access to systems and data.'}
                    </p>
                    <div className="technique-meta">
                      <div className="technique-tactics">
                        <span className="tactic-tag">
                          {index % 4 === 0 
                            ? 'Initial Access' 
                            : index % 4 === 1 
                              ? 'Execution' 
                              : index % 4 === 2
                                ? 'Persistence'
                                : 'Credential Access'}
                        </span>
                      </div>
                      <div className="technique-detection">
                        <span className={`detection-level ${index % 3 === 0 ? 'high' : index % 3 === 1 ? 'medium' : 'low'}`}>
                          {index % 3 === 0 ? 'High' : index % 3 === 1 ? 'Medium' : 'Low'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    );
  };

  // Use direct iframe integration
  return renderDirectIframe();
};

export default FabricFrame;