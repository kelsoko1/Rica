import React, { createContext, useContext, useState, useEffect } from 'react';
import headlessServerHealthService from './HeadlessServerHealthService';

// Create context
const HeadlessServerStatusContext = createContext(null);

/**
 * Provider component for headless server health
 */
export const HeadlessServerStatusProvider = ({ children }) => {
  const [serverStatus, setServerStatus] = useState({
    auto: { isHealthy: false, lastChecked: null, error: null },
    code: { isHealthy: false, lastChecked: null, error: null },
    ollama: { isHealthy: false, lastChecked: null, error: null }
  });
  
  // Initialize health checks
  useEffect(() => {
    // Start health checks
    headlessServerHealthService.startHealthChecks();
    
    // Add listener for status updates
    const handleStatusUpdate = (status) => {
      setServerStatus(status);
    };
    
    headlessServerHealthService.addListener(handleStatusUpdate);
    
    // Clean up on unmount
    return () => {
      headlessServerHealthService.removeListener(handleStatusUpdate);
    };
  }, []);
  
  // Check health of a specific server
  const checkServerHealth = async (serverType) => {
    await headlessServerHealthService.checkServerHealth(serverType);
    return headlessServerHealthService.getServerStatus(serverType);
  };
  
  // Check health of all servers
  const checkAllServers = async () => {
    await headlessServerHealthService.checkAllServers();
    return headlessServerHealthService.getAllServerStatus();
  };
  
  // Get status of a specific server
  const getServerStatus = (serverType) => {
    return headlessServerHealthService.getServerStatus(serverType);
  };
  
  // Get status of all servers
  const getAllServerStatus = () => {
    return headlessServerHealthService.getAllServerStatus();
  };
  
  // Context value
  const value = {
    serverStatus,
    checkServerHealth,
    checkAllServers,
    getServerStatus,
    getAllServerStatus
  };
  
  return (
    <HeadlessServerStatusContext.Provider value={value}>
      {children}
    </HeadlessServerStatusContext.Provider>
  );
};

/**
 * Hook for using headless server health context
 */
export const useHeadlessServerStatus = () => {
  const context = useContext(HeadlessServerStatusContext);
  
  if (!context) {
    throw new Error('useHeadlessServerStatus must be used within a HeadlessServerStatusProvider');
  }
  
  return context;
};

export default HeadlessServerStatusContext;
