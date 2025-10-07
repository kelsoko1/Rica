import React, { useState } from 'react';
import './ThreatDashboard.css';

const ThreatDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state
  React.useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  // Animation classes for elements as they mount
  React.useEffect(() => {
    const elements = document.querySelectorAll('.stat-card, .threat-row');
    elements.forEach((el, i) => {
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, i * 100);
    });
  }, []);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedView, setSelectedView] = useState('overview');

  const mockData = {
    trends: {
      totalThreats: '+12%',
      activeIncidents: '-5%',
      criticalVulnerabilities: '+3%',
      mitigatedThreats: '+18%'
    },
    threats: [
      { id: 1, type: 'Malware', name: 'Ransomware Attack', severity: 'High', lastSeen: '2025-09-18' },
      { id: 2, type: 'Phishing', name: 'Credential Harvest', severity: 'Medium', lastSeen: '2025-09-17' },
      { id: 3, type: 'Vulnerability', name: 'Zero-day Exploit', severity: 'Critical', lastSeen: '2025-09-16' }
    ],
    stats: {
      totalThreats: 156,
      activeIncidents: 12,
      criticalVulnerabilities: 8,
      mitigatedThreats: 45
    }
  };

  return (
    <div className={`threat-dashboard ${isLoading ? 'loading' : ''}`}>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <svg viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
            </svg>
          </div>
        </div>
      )}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Threat Intelligence</h1>
          <div className="time-range-selector">
            <button 
              className={selectedTimeRange === '24h' ? 'active' : ''} 
              onClick={() => {
                setIsLoading(true);
                setSelectedTimeRange('24h');
                setTimeout(() => setIsLoading(false), 500);
              }}
            >
              24h
            </button>
            <button 
              className={selectedTimeRange === '7d' ? 'active' : ''} 
              onClick={() => {
                setIsLoading(true);
                setSelectedTimeRange('7d');
                setTimeout(() => setIsLoading(false), 500);
              }}
            >
              7d
            </button>
            <button 
              className={selectedTimeRange === '30d' ? 'active' : ''} 
              onClick={() => {
                setIsLoading(true);
                setSelectedTimeRange('30d');
                setTimeout(() => setIsLoading(false), 500);
              }}
            >
              30d
            </button>
          </div>
        </div>
        <div className="header-right">
          <button className="refresh-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20.49 9C19.9828 7.56678 19.1209 6.2854 17.9845 5.27542C16.8482 4.26543 15.4745 3.55976 13.9917 3.22426C12.5089 2.88876 10.9652 2.93436 9.50481 3.35677C8.04437 3.77918 6.71475 4.56473 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0656 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7346 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Refresh
          </button>
        </div>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon threats">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Threats</h3>
            <div className="stat-value">
              {mockData.stats.totalThreats}
              <span className="trend positive">{mockData.trends.totalThreats}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon incidents">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64149 19.6871 1.81442 19.9905C1.98736 20.2939 2.23672 20.5467 2.53771 20.7239C2.83869 20.901 3.18074 20.9962 3.53 21H20.47C20.8193 20.9962 21.1613 20.901 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Active Incidents</h3>
            <div className="stat-value">
              {mockData.stats.activeIncidents}
              <span className="trend negative">{mockData.trends.activeIncidents}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon vulnerabilities">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6L12 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Critical Vulnerabilities</h3>
            <div className="stat-value">
              {mockData.stats.criticalVulnerabilities}
              <span className="trend positive">{mockData.trends.criticalVulnerabilities}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon mitigated">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Mitigated Threats</h3>
            <div className="stat-value">
              {mockData.stats.mitigatedThreats}
              <span className="trend positive">{mockData.trends.mitigatedThreats}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="view-selector">
          <button 
            className={selectedView === 'overview' ? 'active' : ''} 
            onClick={() => setSelectedView('overview')}
          >
            Overview
          </button>
          <button 
            className={selectedView === 'threats' ? 'active' : ''} 
            onClick={() => setSelectedView('threats')}
          >
            Threats
          </button>
          <button 
            className={selectedView === 'indicators' ? 'active' : ''} 
            onClick={() => setSelectedView('indicators')}
          >
            Indicators
          </button>
          <button 
            className={selectedView === 'reports' ? 'active' : ''} 
            onClick={() => setSelectedView('reports')}
          >
            Reports
          </button>
        </div>

        <div className="threat-list">
          <h2>Recent Threats</h2>
          <div className="threat-table">
            <div className="threat-header">
              <div className="threat-cell">Type</div>
              <div className="threat-cell">Name</div>
              <div className="threat-cell">Severity</div>
              <div className="threat-cell">Last Seen</div>
            </div>
            {mockData.threats.map(threat => (
              <div key={threat.id} className="threat-row">
                <div className="threat-cell">{threat.type}</div>
                <div className="threat-cell">{threat.name}</div>
                <div className="threat-cell">
                  <span className={`severity ${threat.severity.toLowerCase()}`}>
                    {threat.severity}
                  </span>
                </div>
                <div className="threat-cell">{threat.lastSeen}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatDashboard;
