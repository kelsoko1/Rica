/**
 * Data Collection Service
 * Handles collection of data from connected devices
 */

const { NodeSSH } = require('node-ssh');
const axios = require('axios');
const Device = require('../models/Device');
const config = require('../config');
const logger = require('../utils/logger');

class DataCollectionService {
  constructor() {
    this.isCollecting = false;
    this.collectionTimer = null;
    this.io = null;
    this.activeCollections = new Map();
    this.collectionQueue = [];
  }

  /**
   * Initialize the service
   * @param {Object} io - Socket.IO instance
   */
  initialize(io) {
    this.io = io;
    
    // Start data collection if configured
    if (config.server.env === 'production' || process.env.AUTO_COLLECTION === 'true') {
      this.startDataCollection();
    }
    
    logger.info('Data Collection Service initialized');
  }

  /**
   * Start data collection
   */
  async startDataCollection() {
    if (this.isCollecting) {
      logger.warn('Data collection is already running');
      return false;
    }
    
    this.isCollecting = true;
    
    try {
      // Run initial collection
      await this.collectData();
      
      // Set up interval for continuous collection
      this.collectionTimer = setInterval(() => {
        this.collectData().catch(err => {
          logger.error('Error in scheduled data collection:', err);
        });
      }, config.dataCollection.interval);
      
      logger.info('Data collection started');
      return true;
    } catch (error) {
      logger.error('Failed to start data collection:', error);
      this.isCollecting = false;
      return false;
    }
  }

  /**
   * Stop data collection
   */
  stopDataCollection() {
    if (!this.isCollecting) {
      logger.warn('Data collection is not running');
      return false;
    }
    
    // Clear collection timer
    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
      this.collectionTimer = null;
    }
    
    this.isCollecting = false;
    logger.info('Data collection stopped');
    return true;
  }

  /**
   * Collect data from all connected devices
   */
  async collectData() {
    logger.info('Starting data collection');
    
    try {
      // Get all connected devices
      const connectedDevices = await Device.find({ connected: true });
      
      if (connectedDevices.length === 0) {
        logger.info('No connected devices found');
        return [];
      }
      
      logger.info(`Found ${connectedDevices.length} connected devices`);
      
      // Process devices in batches
      const batchSize = config.dataCollection.batchSize;
      const batches = [];
      
      for (let i = 0; i < connectedDevices.length; i += batchSize) {
        batches.push(connectedDevices.slice(i, i + batchSize));
      }
      
      // Process each batch
      const collectedData = [];
      
      for (const batch of batches) {
        // Process batch in parallel
        const batchPromises = batch.map(device => this.collectDeviceData(device));
        
        // Wait for batch to complete
        const batchResults = await Promise.allSettled(batchPromises);
        
        // Process results
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            collectedData.push(result.value);
          } else {
            logger.error(`Error collecting data from device ${batch[index].deviceId}:`, result.reason);
          }
        });
        
        // Rate limit between batches
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Process collected data
      await this.processCollectedData(collectedData.filter(Boolean));
      
      logger.info(`Data collection completed for ${collectedData.length} devices`);
      
      // Emit event if Socket.IO is available
      if (this.io) {
        this.io.to('devices').emit('data:collected', {
          count: collectedData.length,
          timestamp: new Date().toISOString(),
        });
      }
      
      return collectedData;
    } catch (error) {
      logger.error('Error in data collection:', error);
      throw error;
    }
  }

  /**
   * Collect data from a specific device
   * @param {Object} device - Device object
   */
  async collectDeviceData(device) {
    // Check if collection is already in progress for this device
    if (this.activeCollections.has(device.deviceId)) {
      logger.debug(`Data collection already in progress for device ${device.deviceId}`);
      return null;
    }
    
    logger.debug(`Collecting data from device ${device.deviceId} (${device.ipAddress})`);
    
    // Mark collection as in progress
    this.activeCollections.set(device.deviceId, {
      startTime: Date.now(),
      device,
    });
    
    try {
      // Determine collection method based on device type
      let deviceData;
      
      switch (device.deviceType) {
        case 'workstation':
        case 'server':
          deviceData = await this.collectDataFromServer(device);
          break;
        case 'network':
          deviceData = await this.collectDataFromNetworkDevice(device);
          break;
        case 'mobile':
          deviceData = await this.collectDataFromMobileDevice(device);
          break;
        case 'iot':
          deviceData = await this.collectDataFromIoTDevice(device);
          break;
        default:
          deviceData = await this.collectDataFromGenericDevice(device);
      }
      
      // Update device with collection time
      await Device.findOneAndUpdate(
        { deviceId: device.deviceId },
        { 
          $set: { 
            lastDataCollection: new Date(),
            lastData: deviceData,
            'dataFeeds.$[].lastCollection': new Date(),
          }
        }
      );
      
      // Remove from active collections
      this.activeCollections.delete(device.deviceId);
      
      return {
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        ipAddress: device.ipAddress,
        timestamp: new Date().toISOString(),
        ...deviceData,
      };
    } catch (error) {
      logger.error(`Error collecting data from device ${device.deviceId}:`, error);
      
      // Remove from active collections
      this.activeCollections.delete(device.deviceId);
      
      // Return error data
      return {
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        ipAddress: device.ipAddress,
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * Collect data from a server or workstation
   * @param {Object} device - Device object
   */
  async collectDataFromServer(device) {
    const ssh = new NodeSSH();
    
    try {
      // Get credentials
      const credentials = device.credentials ? 
        device.decryptCredentials(device.credentials, config.security.encryptionKey) : 
        null;
      
      if (!credentials) {
        throw new Error('No credentials available for device');
      }
      
      // Connect to device
      await ssh.connect({
        host: device.ipAddress,
        username: credentials.username,
        password: credentials.password,
        port: credentials.port || 22,
        readyTimeout: config.dataCollection.timeout,
      });
      
      // Collect system information
      const systemInfo = await this.collectSystemInfo(ssh);
      
      // Collect security events
      const securityEvents = await this.collectSecurityEvents(ssh);
      
      // Collect vulnerability information
      const vulnerabilities = await this.collectVulnerabilities(ssh);
      
      // Disconnect from device
      ssh.dispose();
      
      return {
        systemInfo,
        securityEvents,
        vulnerabilities,
      };
    } catch (error) {
      // Ensure SSH connection is closed
      ssh.dispose();
      throw error;
    }
  }

  /**
   * Collect data from a network device
   * @param {Object} device - Device object
   */
  async collectDataFromNetworkDevice(device) {
    // Implementation would depend on the specific network device
    // This is a simplified example
    return {
      systemInfo: {
        uptime: '10 days',
        cpu: '5%',
        memory: '30%',
      },
      securityEvents: [
        {
          type: 'access',
          severity: 'info',
          description: 'User login',
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  /**
   * Collect data from a mobile device
   * @param {Object} device - Device object
   */
  async collectDataFromMobileDevice(device) {
    // Implementation would depend on the specific mobile device
    // This is a simplified example
    return {
      systemInfo: {
        batteryLevel: '80%',
        storage: '45% used',
      },
      securityEvents: [],
    };
  }

  /**
   * Collect data from an IoT device
   * @param {Object} device - Device object
   */
  async collectDataFromIoTDevice(device) {
    // Implementation would depend on the specific IoT device
    // This is a simplified example
    return {
      systemInfo: {
        status: 'online',
        firmware: '1.2.3',
      },
      sensorData: {
        temperature: 22.5,
        humidity: 45,
      },
    };
  }

  /**
   * Collect data from a generic device
   * @param {Object} device - Device object
   */
  async collectDataFromGenericDevice(device) {
    // Basic data collection for unknown device types
    return {
      systemInfo: {
        status: 'online',
        lastSeen: new Date().toISOString(),
      },
    };
  }

  /**
   * Collect system information from a server
   * @param {NodeSSH} ssh - SSH connection
   */
  async collectSystemInfo(ssh) {
    try {
      // Get OS information
      const { stdout: osInfo } = await ssh.execCommand('cat /etc/os-release');
      
      // Get CPU information
      const { stdout: cpuInfo } = await ssh.execCommand('cat /proc/cpuinfo | grep "model name" | head -n 1');
      
      // Get memory information
      const { stdout: memInfo } = await ssh.execCommand('free -m');
      
      // Get disk usage
      const { stdout: diskInfo } = await ssh.execCommand('df -h');
      
      // Get uptime
      const { stdout: uptime } = await ssh.execCommand('uptime');
      
      // Get network interfaces
      const { stdout: netInfo } = await ssh.execCommand('ip addr');
      
      return {
        os: osInfo,
        cpu: cpuInfo,
        memory: memInfo,
        disk: diskInfo,
        uptime,
        network: netInfo,
      };
    } catch (error) {
      logger.error('Error collecting system information:', error);
      return {
        error: error.message,
      };
    }
  }

  /**
   * Collect security events from a server
   * @param {NodeSSH} ssh - SSH connection
   */
  async collectSecurityEvents(ssh) {
    try {
      // Get authentication logs
      const { stdout: authLog } = await ssh.execCommand('grep "authentication failure" /var/log/auth.log | tail -n 10');
      
      // Get failed login attempts
      const { stdout: failedLogins } = await ssh.execCommand('grep "Failed password" /var/log/auth.log | tail -n 10');
      
      // Parse logs into events
      const events = [];
      
      // Parse authentication failures
      authLog.split('\n').filter(Boolean).forEach(line => {
        events.push({
          type: 'authentication_failure',
          severity: 'warning',
          description: line,
          timestamp: new Date().toISOString(),
        });
      });
      
      // Parse failed logins
      failedLogins.split('\n').filter(Boolean).forEach(line => {
        events.push({
          type: 'failed_login',
          severity: 'warning',
          description: line,
          timestamp: new Date().toISOString(),
        });
      });
      
      return events;
    } catch (error) {
      logger.error('Error collecting security events:', error);
      return [];
    }
  }

  /**
   * Collect vulnerability information from a server
   * @param {NodeSSH} ssh - SSH connection
   */
  async collectVulnerabilities(ssh) {
    try {
      // Check if system has vulnerability scanner
      const { stdout: hasScanner } = await ssh.execCommand('command -v apt-get && apt list --installed | grep "lynis\\|rkhunter"');
      
      if (!hasScanner) {
        return [];
      }
      
      // Run vulnerability scan
      const { stdout: scanResults } = await ssh.execCommand('lynis audit system --quick');
      
      // Parse scan results
      const vulnerabilities = [];
      
      // Extract vulnerabilities from scan results
      const vulnRegex = /Warning: (.+) \[([A-Z0-9-]+)\]/g;
      let match;
      
      while ((match = vulnRegex.exec(scanResults)) !== null) {
        vulnerabilities.push({
          name: match[2],
          description: match[1],
          severity: 'medium',
        });
      }
      
      return vulnerabilities;
    } catch (error) {
      logger.error('Error collecting vulnerabilities:', error);
      return [];
    }
  }

  /**
   * Process collected data
   * @param {Array} collectedData - Array of collected data
   */
  async processCollectedData(collectedData) {
    if (collectedData.length === 0) {
      return;
    }
    
    try {
      // Send data to 
      await this.sendDataTo(collectedData);
      
      // Send data to 
      await this.sendDataTo(collectedData);
      
      logger.info(`Processed data from ${collectedData.length} devices`);
    } catch (error) {
      logger.error('Error processing collected data:', error);
    }
  }

  /**
   * Send data to 
   * @param {Array} data - Array of collected data
   */
  async sendDataTo(data) {
    try {
      // Format data for 
      const formattedData = this.formatDataFor(data);
      
      // Send data to 
      const response = await axios.post(
        `${config..url}${config..graphqlEndpoint}`,
        {
          query: `
            mutation ImportData($input: StixBundleImportInput!) {
              stixBundleImport(input: $input) {
                id
                status
              }
            }
          `,
          variables: {
            input: {
              data: JSON.stringify(formattedData),
              connectorId: config..connectorId,
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config..apiKey}`,
          },
        }
      );
      
      logger.info('Data sent to  successfully');
      return response.data;
    } catch (error) {
      logger.error('Error sending data to :', error);
      throw error;
    }
  }

  /**
   * Format data for 
   * @param {Array} data - Array of collected data
   */
  formatDataFor(data) {
    // Generate a UUID for the bundle
    const bundleId = require('uuid').v4();
    
    // Convert device data to STIX format for 
    return {
      type: 'bundle',
      id: `bundle--${bundleId}`,
      objects: data.flatMap(item => {
        const objects = [];
        
        // Create identity for the device
        objects.push({
          type: 'identity',
          id: `identity--${item.deviceId}`,
          name: item.deviceName || `Device ${item.deviceId}`,
          identity_class: 'system',
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          description: `Device of type ${item.deviceType}`,
        });
        
        // Add observed-data if available
        if (item.securityEvents && item.securityEvents.length > 0) {
          item.securityEvents.forEach(event => {
            objects.push({
              type: 'observed-data',
              id: `observed-data--${require('uuid').v4()}`,
              created_by_ref: `identity--${item.deviceId}`,
              created: new Date().toISOString(),
              modified: new Date().toISOString(),
              first_observed: event.timestamp,
              last_observed: event.timestamp,
              number_observed: 1,
              objects: {
                '0': {
                  type: 'x-rica-security-event',
                  event_type: event.type,
                  severity: event.severity,
                  description: event.description,
                },
              },
            });
          });
        }
        
        // Add indicators if available
        if (item.vulnerabilities && item.vulnerabilities.length > 0) {
          item.vulnerabilities.forEach(vuln => {
            objects.push({
              type: 'indicator',
              id: `indicator--${require('uuid').v4()}`,
              created_by_ref: `identity--${item.deviceId}`,
              created: new Date().toISOString(),
              modified: new Date().toISOString(),
              name: vuln.name,
              description: vuln.description,
              pattern: `[x-rica-vulnerability:name = '${vuln.name}']`,
              valid_from: new Date().toISOString(),
              indicator_types: ['vulnerability'],
              pattern_type: 'stix',
              kill_chain_phases: [
                {
                  kill_chain_name: 'lockheed-martin-cyber-kill-chain',
                  phase_name: 'exploitation',
                },
              ],
            });
          });
        }
        
        return objects;
      }),
    };
  }

  /**
   * Send data to 
   * @param {Array} data - Array of collected data
   */
  async sendDataTo(data) {
    try {
      // Format data for 
      const formattedData = this.formatDataFor(data);
      
      // Send data to 
      const response = await axios.post(
        `${config..url}${config..apiEndpoint}/injects`,
        formattedData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config..apiKey}`,
          },
        }
      );
      
      logger.info('Data sent to  successfully');
      return response.data;
    } catch (error) {
      logger.error('Error sending data to :', error);
      throw error;
    }
  }

  /**
   * Format data for 
   * @param {Array} data - Array of collected data
   */
  formatDataFor(data) {
    // Convert device data to  format
    return {
      injects: data.flatMap(item => {
        const injects = [];
        
        // Add device information as an inject
        injects.push({
          type: 'device_information',
          content: {
            deviceId: item.deviceId,
            deviceName: item.deviceName,
            deviceType: item.deviceType,
            ipAddress: item.ipAddress,
            timestamp: item.timestamp,
          },
          date: new Date().toISOString(),
        });
        
        // Add security events as injects
        if (item.securityEvents && item.securityEvents.length > 0) {
          item.securityEvents.forEach(event => {
            injects.push({
              type: 'security_event',
              content: {
                deviceId: item.deviceId,
                eventType: event.type,
                severity: event.severity,
                description: event.description,
              },
              date: event.timestamp,
            });
          });
        }
        
        return injects;
      }),
    };
  }
}

module.exports = new DataCollectionService();
