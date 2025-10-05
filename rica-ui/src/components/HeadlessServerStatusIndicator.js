import React from 'react';
import { useHeadlessServerStatus } from '../services/HeadlessServerStatusManager';
import './HeadlessServerStatusIndicator.css';

/**
 * HeadlessServerStatusIndicator - A component that displays the status of headless servers
 */
const HeadlessServerStatusIndicator = () => {
  const { serverStatus, checkAllServers } = useHeadlessServerStatus();
  
  // Count healthy and unhealthy servers
  const healthyCount = Object.values(serverStatus).filter(status => status.isHealthy).length;
  const totalCount = Object.keys(serverStatus).length;
  
  // Determine overall status
  const allHealthy = healthyCount === totalCount;
  const someHealthy = healthyCount > 0;
  const noneHealthy = healthyCount === 0;
  
  // Handle refresh click
  const handleRefresh = () => {
    checkAllServers();
  };
  
  return (
    <div className="headless-server-status-indicator">
      <div className="status-summary">
        <div className={`status-icon ${allHealthy ? 'healthy' : someHealthy ? 'warning' : 'error'}`}>
          {allHealthy ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 12L10.5 14.5L16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : someHealthy ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 9L9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 9L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <div className="status-text">
          {allHealthy ? (
            <span>All servers online</span>
          ) : someHealthy ? (
            <span>{healthyCount}/{totalCount} servers online</span>
          ) : (
            <span>All servers offline</span>
          )}
        </div>
      </div>
      
      <button className="refresh-button" onClick={handleRefresh} title="Refresh server status">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15.24 16.45L13.56 14.77C13.1 14.31 12.8 13.63 12.8 12.91V8.91" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <div className="server-details">
        {Object.entries(serverStatus).map(([serverType, status]) => (
          <div key={serverType} className="server-item">
            <div className={`server-status ${status.isHealthy ? 'healthy' : 'error'}`}></div>
            <div className="server-name">
              {serverType === 'fabric' ? 'Fabric (OpenCTI)' : 
               serverType === 'sims' ? 'Simulations (OpenBAS)' : 
               serverType === 'auto' ? 'Auto (Activepieces)' : 
               serverType === 'code' ? 'Code Server' : 
               serverType === 'ollama' ? 'Ollama (DeepSeek)' : serverType}
            </div>
            {status.lastChecked && (
              <div className="server-last-checked">
                {new Date(status.lastChecked).toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeadlessServerStatusIndicator;
