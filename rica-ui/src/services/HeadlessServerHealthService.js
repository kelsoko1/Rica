/**
 * HeadlessServerHealthService
 * 
 * This service provides health check functionality for the headless servers.
 * It periodically checks the status of each server and provides methods to get the current status.
 */

class HeadlessServerHealthService {
  constructor() {
    this.serverStatus = {
      auto: { isHealthy: false, lastChecked: null, error: null },
      code: { isHealthy: false, lastChecked: null, error: null },
      metaverse: { isHealthy: false, lastChecked: null, error: null }
    };
    
    this.serverUrls = {
      auto: process.env.REACT_APP_AUTO_URL || 'http://localhost:2020',
      code: process.env.REACT_APP_CODE_SERVER_URL || 'http://localhost:2021',
      ollama: process.env.REACT_APP_OLLAMA_URL || 'http://localhost:2022',
      metaverse: process.env.REACT_APP_VIRCADIA_URL || 'http://localhost:2023'
    };
    
    this.checkIntervalMs = 60000; // Check every minute
    this.checkInterval = null;
    this.listeners = [];
  }
  
  /**
   * Start periodic health checks for all servers
   */
  startHealthChecks() {
    // Clear any existing interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    // Check immediately
    this.checkAllServers();
    
    // Set up periodic checks
    this.checkInterval = setInterval(() => {
      this.checkAllServers();
    }, this.checkIntervalMs);
  }
  
  /**
   * Stop periodic health checks
   */
  stopHealthChecks() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
  
  /**
   * Check the health of all servers
   */
  async checkAllServers() {
    const serverTypes = Object.keys(this.serverUrls);
    
    for (const serverType of serverTypes) {
      await this.checkServerHealth(serverType);
    }
    
    // Notify all listeners
    this.notifyListeners();
  }
  
  /**
   * Check the health of a specific server
   * @param {string} serverType - The type of server to check (fabric, sims, auto, code)
   */
  async checkServerHealth(serverType) {
    if (!this.serverUrls[serverType]) {
      console.error(`Unknown server type: ${serverType}`);
      return;
    }
    
    try {
      // Use the dedicated health check endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      // Use the health endpoint from the Nginx configuration
      const response = await fetch(`/health/${serverType}`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        // Update server status
        this.serverStatus[serverType] = {
          isHealthy: data.status === 'ok',
          lastChecked: new Date(),
          error: null
        };
      } else {
        throw new Error(`Health check returned status ${response.status}`);
      }
    } catch (error) {
      // If the health endpoint is not responding, try the direct server URL
      try {
        const url = this.serverUrls[serverType];
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${url}`, {
          method: 'GET',
          signal: controller.signal,
          mode: 'no-cors' // Use no-cors mode since we just want to check if the server is responding
        });
        
        clearTimeout(timeoutId);
        
        // Update server status
        this.serverStatus[serverType] = {
          isHealthy: true,
          lastChecked: new Date(),
          error: null
        };
      } catch (innerError) {
        // If both checks fail, the server is not responding
        this.serverStatus[serverType] = {
          isHealthy: false,
          lastChecked: new Date(),
          error: error.message || innerError.message || 'Server not responding'
        };
        
        console.warn(`Health check failed for ${serverType}: ${error.message || innerError.message}`);
      }
    }
  }
  
  /**
   * Get the current status of all servers
   * @returns {Object} The current status of all servers
   */
  getAllServerStatus() {
    return { ...this.serverStatus };
  }
  
  /**
   * Get the current status of a specific server
   * @param {string} serverType - The type of server to check (fabric, sims, auto, code)
   * @returns {Object} The current status of the specified server
   */
  getServerStatus(serverType) {
    return this.serverStatus[serverType] || null;
  }
  
  /**
   * Add a listener for server status changes
   * @param {Function} listener - The listener function to call when server status changes
   */
  addListener(listener) {
    if (typeof listener === 'function' && !this.listeners.includes(listener)) {
      this.listeners.push(listener);
    }
  }
  
  /**
   * Remove a listener for server status changes
   * @param {Function} listener - The listener function to remove
   */
  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }
  
  /**
   * Notify all listeners of server status changes
   */
  notifyListeners() {
    const status = this.getAllServerStatus();
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in health check listener:', error);
      }
    });
  }
}

// Create a singleton instance
const headlessServerHealthService = new HeadlessServerHealthService();

export default headlessServerHealthService;
