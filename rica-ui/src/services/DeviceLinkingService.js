/**
 * DeviceLinkingService.js
 * Service for managing device discovery, connection, and data collection
 */

class DeviceLinkingService {
  constructor() {
    // Singleton instance
    if (DeviceLinkingService.instance) {
      return DeviceLinkingService.instance;
    }
    
    // Initialize properties
    this.devices = [];
    this.isDiscovering = false;
    this.isCollecting = false;
    this.discoveryTimer = null;
    this.collectionTimer = null;
    this.eventListeners = {};
    this.settings = {
      discoveryInterval: 60000, // 60 seconds
      dataCollectionInterval: 300000, // 5 minutes
      apiUrl: 'http://localhost:3001/api',
    };
    
    // Load stored devices
    this.loadDevices();
    
    // Set as singleton instance
    DeviceLinkingService.instance = this;
  }

  /**
   * Load devices from localStorage
   */
  loadDevices() {
    try {
      const storedDevices = localStorage.getItem('rica-devices');
      if (storedDevices) {
        this.devices = JSON.parse(storedDevices);
      }
    } catch (error) {
      console.error('Error loading devices from localStorage:', error);
    }
  }

  /**
   * Save devices to localStorage
   */
  saveDevices() {
    try {
      localStorage.setItem('rica-devices', JSON.stringify(this.devices));
    } catch (error) {
      console.error('Error saving devices to localStorage:', error);
    }
  }

  /**
   * Update settings
   * @param {Object} newSettings - New settings to apply
   */
  updateSettings(newSettings) {
    this.settings = {
      ...this.settings,
      ...newSettings,
    };
    
    // Save settings to localStorage
    try {
      localStorage.setItem('rica-device-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
    
    // Dispatch settings updated event
    this.dispatchEvent('settingsUpdated', this.settings);
  }

  /**
   * Start device discovery
   */
  async startDiscovery() {
    if (this.isDiscovering) {
      return;
    }
    
    this.isDiscovering = true;
    
    try {
      // Check server health
      const isHealthy = await this.checkServerHealth();
      
      if (!isHealthy) {
        throw new Error('API server is not available');
      }
      
      // Initial discovery
      await this.discoverDevices();
      
      // Set up interval for continuous discovery
      this.discoveryTimer = setInterval(() => {
        this.discoverDevices().catch(error => {
          console.error('Error during scheduled device discovery:', error);
          this.dispatchEvent('error', { message: `Discovery error: ${error.message}` });
        });
      }, this.settings.discoveryInterval);
      
      // Dispatch discovery started event
      this.dispatchEvent('discoveryStarted');
      
      return true;
    } catch (error) {
      this.isDiscovering = false;
      this.dispatchEvent('error', { message: `Failed to start discovery: ${error.message}` });
      throw error;
    }
  }

  /**
   * Stop device discovery
   */
  stopDiscovery() {
    if (!this.isDiscovering) {
      return;
    }
    
    // Clear discovery timer
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer);
      this.discoveryTimer = null;
    }
    
    this.isDiscovering = false;
    
    // Dispatch discovery stopped event
    this.dispatchEvent('discoveryStopped');
    
    return true;
  }

  /**
   * Discover devices on the network
   */
  async discoverDevices() {
    try {
      // Call API to discover devices
      const response = await fetch(`${this.settings.apiUrl}/devices/discover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to discover devices');
      }
      
      // Process discovered devices
      const discoveredDevices = data.devices || [];
      
      // Update existing devices and add new ones
      discoveredDevices.forEach(discoveredDevice => {
        const existingDeviceIndex = this.devices.findIndex(device => device.deviceId === discoveredDevice.deviceId);
        
        if (existingDeviceIndex !== -1) {
          // Update existing device
          this.devices[existingDeviceIndex] = {
            ...this.devices[existingDeviceIndex],
            ...discoveredDevice,
            lastSeen: new Date().toISOString(),
          };
        } else {
          // Add new device
          this.devices.push({
            ...discoveredDevice,
            status: 'discovered',
            connected: false,
            lastSeen: new Date().toISOString(),
          });
        }
      });
      
      // Save devices to localStorage
      this.saveDevices();
      
      // Dispatch devices discovered event
      this.dispatchEvent('devicesDiscovered', this.devices);
      
      return this.devices;
    } catch (error) {
      console.error('Error discovering devices:', error);
      this.dispatchEvent('error', { message: `Discovery error: ${error.message}` });
      throw error;
    }
  }

  /**
   * Connect to a device
   * @param {string} deviceId - ID of the device to connect to
   */
  async connectDevice(deviceId) {
    try {
      // Find device
      const deviceIndex = this.devices.findIndex(device => device.deviceId === deviceId);
      
      if (deviceIndex === -1) {
        throw new Error(`Device with ID ${deviceId} not found`);
      }
      
      // Check if device is already connected
      if (this.devices[deviceIndex].connected) {
        return this.devices[deviceIndex];
      }
      
      // Call API to connect to device
      const response = await fetch(`${this.settings.apiUrl}/devices/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to connect to device');
      }
      
      // Update device status
      this.devices[deviceIndex].status = 'connected';
      this.devices[deviceIndex].connected = true;
      this.devices[deviceIndex].connectionTime = new Date().toISOString();
      
      // Initialize data feeds if not present
      if (!this.devices[deviceIndex].dataFeeds || this.devices[deviceIndex].dataFeeds.length === 0) {
        this.devices[deviceIndex].dataFeeds = [
          {
            name: 'System Information',
            type: 'system',
            active: true,
            interval: 300000, // 5 minutes
          },
          {
            name: 'Security Events',
            type: 'security',
            active: true,
            interval: 300000, // 5 minutes
          },
        ];
      }
      
      // Save devices to localStorage
      this.saveDevices();
      
      // Dispatch device connected event
      this.dispatchEvent('deviceConnected', this.devices[deviceIndex]);
      
      return this.devices[deviceIndex];
    } catch (error) {
      console.error(`Error connecting to device ${deviceId}:`, error);
      this.dispatchEvent('error', { message: `Connection error: ${error.message}` });
      throw error;
    }
  }

  /**
   * Disconnect from a device
   * @param {string} deviceId - ID of the device to disconnect from
   */
  async disconnectDevice(deviceId) {
    try {
      // Find device
      const deviceIndex = this.devices.findIndex(device => device.deviceId === deviceId);
      
      if (deviceIndex === -1) {
        throw new Error(`Device with ID ${deviceId} not found`);
      }
      
      // Check if device is already disconnected
      if (!this.devices[deviceIndex].connected) {
        return this.devices[deviceIndex];
      }
      
      // Call API to disconnect from device
      const response = await fetch(`${this.settings.apiUrl}/devices/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to disconnect from device');
      }
      
      // Update device status
      this.devices[deviceIndex].status = 'disconnected';
      this.devices[deviceIndex].connected = false;
      
      // Save devices to localStorage
      this.saveDevices();
      
      // Dispatch device disconnected event
      this.dispatchEvent('deviceDisconnected', this.devices[deviceIndex]);
      
      return this.devices[deviceIndex];
    } catch (error) {
      console.error(`Error disconnecting from device ${deviceId}:`, error);
      this.dispatchEvent('error', { message: `Disconnection error: ${error.message}` });
      throw error;
    }
  }

  /**
   * Start data collection
   */
  async startDataCollection() {
    if (this.isCollecting) {
      return;
    }
    
    this.isCollecting = true;
    
    try {
      // Check server health
      const isHealthy = await this.checkServerHealth();
      
      if (!isHealthy) {
        throw new Error('API server is not available');
      }
      
      // Initial data collection
      await this.collectData();
      
      // Set up interval for continuous data collection
      this.collectionTimer = setInterval(() => {
        this.collectData().catch(error => {
          console.error('Error during scheduled data collection:', error);
          this.dispatchEvent('error', { message: `Data collection error: ${error.message}` });
        });
      }, this.settings.dataCollectionInterval);
      
      // Dispatch data collection started event
      this.dispatchEvent('dataCollectionStarted');
      
      return true;
    } catch (error) {
      this.isCollecting = false;
      this.dispatchEvent('error', { message: `Failed to start data collection: ${error.message}` });
      throw error;
    }
  }

  /**
   * Stop data collection
   */
  stopDataCollection() {
    if (!this.isCollecting) {
      return;
    }
    
    // Clear collection timer
    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
      this.collectionTimer = null;
    }
    
    this.isCollecting = false;
    
    // Dispatch data collection stopped event
    this.dispatchEvent('dataCollectionStopped');
    
    return true;
  }

  /**
   * Collect data from connected devices
   */
  async collectData() {
    try {
      // Get connected devices
      const connectedDevices = this.devices.filter(device => device.connected);
      
      if (connectedDevices.length === 0) {
        return [];
      }
      
      // Get device IDs
      const deviceIds = connectedDevices.map(device => device.deviceId);
      
      // Call API to collect data
      const response = await fetch(`${this.settings.apiUrl}/devices/collect-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceIds }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to collect data');
      }
      
      // Process collected data
      const collectedData = data.data || [];
      
      // Update device data
      collectedData.forEach(deviceData => {
        const deviceIndex = this.devices.findIndex(device => device.deviceId === deviceData.deviceId);
        
        if (deviceIndex !== -1) {
          // Update device with collected data
          this.devices[deviceIndex].lastData = deviceData;
          this.devices[deviceIndex].lastDataCollection = new Date().toISOString();
          
          // Update data feeds
          if (this.devices[deviceIndex].dataFeeds) {
            this.devices[deviceIndex].dataFeeds.forEach(feed => {
              feed.lastCollection = new Date().toISOString();
            });
          }
        }
      });
      
      // Save devices to localStorage
      this.saveDevices();
      
      // Data collected successfully
      
      // Dispatch data collected event
      this.dispatchEvent('dataCollected', collectedData);
      
      return collectedData;
    } catch (error) {
      console.error('Error collecting data:', error);
      this.dispatchEvent('error', { message: `Data collection error: ${error.message}` });
      throw error;
    }
  }

  /**
   * Check server health
   */
  async checkServerHealth() {
    try {
      const response = await fetch(`${this.settings.apiUrl}/health`);
      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Get all devices
   */
  getAllDevices() {
    return this.devices;
  }

  /**
   * Get device by ID
   * @param {string} deviceId - ID of the device to get
   */
  getDeviceById(deviceId) {
    return this.devices.find(device => device.deviceId === deviceId);
  }

  /**
   * Get connected devices
   */
  getConnectedDevices() {
    return this.devices.filter(device => device.connected);
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    
    this.eventListeners[event].push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeEventListener(event, callback) {
    if (!this.eventListeners[event]) {
      return;
    }
    
    this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
  }

  /**
   * Dispatch event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  dispatchEvent(event, data) {
    if (!this.eventListeners[event]) {
      return;
    }
    
    this.eventListeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Generate UUID
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// Create and export singleton instance
export default new DeviceLinkingService();
