import React, { useState, useEffect } from 'react';
import './HeadlessServerContainer.css';
import AutoFrame from './AutoFrame';
import CodeServerFrame from './CodeServerFrame';
import VircadiaFrame from './VircadiaFrame';
import ErrorBoundary from './ErrorBoundary';
import headlessServerHealthService from '../services/HeadlessServerHealthService';

/**
 * HeadlessServerContainer - A component that manages all headless server iframes
 * This component provides a unified interface for accessing all headless servers
 * directly from the Rica UI without requiring users to navigate to specific ports
 */
const HeadlessServerContainer = ({ serverType }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [serverHealth, setServerHealth] = useState(null);

  // Define server configurations
  const serverConfigs = {
    auto: {
      name: 'Auto (Activepieces)',
      component: AutoFrame,
      description: 'Automation workflow platform'
    },
    code: {
      name: 'Code Server',
      component: CodeServerFrame,
      description: 'VS Code in browser for development'
    },
    metaverse: {
      name: 'Metaverse (Vircadia)',
      component: VircadiaFrame,
      description: 'Virtual world and metaverse platform'
    }
  };

  // Get the current server config
  const currentServer = serverConfigs[serverType] || null;

  // Handle iframe load events and server health checks
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    // Start health checks if not already started
    headlessServerHealthService.startHealthChecks();
    
    // Get initial server health status
    const initialStatus = headlessServerHealthService.getServerStatus(serverType);
    setServerHealth(initialStatus);
    
    // Add listener for server health updates
    const handleHealthUpdate = (status) => {
      const serverStatus = status[serverType];
      setServerHealth(serverStatus);
      
      // If server is not healthy, show error
      if (serverStatus && !serverStatus.isHealthy) {
        setHasError(true);
        setIsLoading(false);
        setErrorMessage(`Unable to connect to ${currentServer?.name || 'server'}. ${serverStatus.error}`);  
      }
    };
    
    headlessServerHealthService.addListener(handleHealthUpdate);
    
    // Simulate checking server availability
    const checkServerAvailability = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => {
      clearTimeout(checkServerAvailability);
      headlessServerHealthService.removeListener(handleHealthUpdate);
    };
  }, [serverType]);

  // Handle iframe errors
  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
    
    // Use health service error if available
    if (serverHealth && !serverHealth.isHealthy && serverHealth.error) {
      setErrorMessage(`Unable to connect to ${currentServer?.name || 'server'}. ${serverHealth.error}`);
    } else {
      setErrorMessage(`Unable to connect to ${currentServer?.name || 'server'}. Please check if the server is running.`);
    }
  };

  // Retry loading the iframe
  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    
    // Trigger a new health check
    headlessServerHealthService.checkServerHealth(serverType)
      .then(() => {
        // Get updated status
        const updatedStatus = headlessServerHealthService.getServerStatus(serverType);
        setServerHealth(updatedStatus);
        
        // If server is now healthy, remove error
        if (updatedStatus && updatedStatus.isHealthy) {
          setHasError(false);
        }
      });
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  // If no server type is provided or invalid server type
  if (!currentServer) {
    return (
      <div className="headless-server-container error-state">
        <div className="server-error">
          <div className="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.9941 16H12.0031" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Invalid Server Type</h3>
          <p>The requested server type "{serverType}" is not available.</p>
        </div>
      </div>
    );
  }

  // Render the appropriate component based on server type
  const ServerComponent = currentServer.component;

  return (
    <div className="headless-server-container">
      <div className="server-header">
        <h2>{currentServer.name}</h2>
        <p>{currentServer.description}</p>
      </div>
      
      {isLoading ? (
        <div className="server-loading">
          <div className="loading-spinner"></div>
          <p>Connecting to {currentServer.name}...</p>
          {serverHealth && !serverHealth.isHealthy && (
            <div className="server-warning">
              <p>Warning: Server health check failed. Attempting connection anyway...</p>
            </div>
          )}
        </div>
      ) : hasError ? (
        <div className="server-error">
          <div className="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.9941 16H12.0031" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Connection Error</h3>
          <p>{errorMessage}</p>
          <button className="retry-button" onClick={handleRetry}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.24 16.45L13.56 14.77C13.1 14.31 12.8 13.63 12.8 12.91V8.91" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Retry Connection
          </button>
        </div>
      ) : (
        <ErrorBoundary>
          <div className="server-content">
            <ServerComponent onError={handleIframeError} />
          </div>
        </ErrorBoundary>
      )}
    </div>
  );
};

export default HeadlessServerContainer;
