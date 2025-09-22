/**
 * Device Discovery Service
 * Handles discovery of devices on the network
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const os = require('os');
const { Netmask } = require('netmask');
const NodeCache = require('node-cache');
const DeviceDetector = require('node-device-detector');
const Device = require('../models/Device');
const config = require('../config');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Promisify exec
const execAsync = promisify(exec);

// Initialize device detector
const deviceDetector = new DeviceDetector();

// Initialize cache for discovered devices
const deviceCache = new NodeCache({
  stdTTL: config.cache.ttl,
  checkperiod: config.cache.checkPeriod,
});

class DeviceDiscoveryService {
  constructor() {
    this.isDiscovering = false;
    this.discoveryTimer = null;
    this.io = null;
    this.discoveredDevices = new Map();
  }

  /**
   * Initialize the service
   * @param {Object} io - Socket.IO instance
   */
  initialize(io) {
    this.io = io;
    
    // Start discovery if configured
    if (config.server.env === 'production' || process.env.AUTO_DISCOVERY === 'true') {
      this.startDiscovery();
    }
    
    logger.info('Device Discovery Service initialized');
  }

  /**
   * Start device discovery
   */
  async startDiscovery() {
    if (this.isDiscovering) {
      logger.warn('Device discovery is already running');
      return false;
    }
    
    this.isDiscovering = true;
    
    try {
      // Run initial discovery
      await this.discoverDevices();
      
      // Set up interval for continuous discovery
      this.discoveryTimer = setInterval(() => {
        this.discoverDevices().catch(err => {
          logger.error('Error in scheduled device discovery:', err);
        });
      }, config.deviceDiscovery.interval);
      
      logger.info('Device discovery started');
      return true;
    } catch (error) {
      logger.error('Failed to start device discovery:', error);
      this.isDiscovering = false;
      return false;
    }
  }

  /**
   * Stop device discovery
   */
  stopDiscovery() {
    if (!this.isDiscovering) {
      logger.warn('Device discovery is not running');
      return false;
    }
    
    // Clear discovery timer
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer);
      this.discoveryTimer = null;
    }
    
    this.isDiscovering = false;
    logger.info('Device discovery stopped');
    return true;
  }

  /**
   * Discover devices on the network
   */
  async discoverDevices() {
    logger.info('Starting device discovery');
    
    // Get network ranges to scan
    const networkRanges = config.deviceDiscovery.networkRanges;
    
    // Discover devices in each network range
    const discoveryPromises = networkRanges.map(range => this.scanNetworkRange(range));
    
    try {
      // Wait for all scans to complete
      const results = await Promise.allSettled(discoveryPromises);
      
      // Process results
      const discoveredDevices = [];
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          discoveredDevices.push(...result.value);
        } else {
          logger.error('Error in network scan:', result.reason);
        }
      });
      
      // Process discovered devices
      await this.processDiscoveredDevices(discoveredDevices);
      
      logger.info(`Device discovery completed, found ${discoveredDevices.length} devices`);
      
      // Emit event if Socket.IO is available
      if (this.io) {
        this.io.to('devices').emit('devices:discovered', {
          count: discoveredDevices.length,
          timestamp: new Date().toISOString(),
        });
      }
      
      return discoveredDevices;
    } catch (error) {
      logger.error('Error in device discovery:', error);
      throw error;
    }
  }

  /**
   * Scan a specific network range for devices
   * @param {string} range - Network range in CIDR notation (e.g., 192.168.1.0/24)
   */
  async scanNetworkRange(range) {
    logger.debug(`Scanning network range: ${range}`);
    
    try {
      // Parse network range
      const netmask = new Netmask(range);
      const discoveredDevices = [];
      
      // Get excluded IPs
      const excludedIps = config.deviceDiscovery.excludedIps;
      
      // Scan each IP in the range
      for (let ip = netmask.first; ip <= netmask.last; ip = netmask.next(ip)) {
        // Skip excluded IPs
        if (excludedIps.includes(ip)) {
          continue;
        }
        
        // Check if device is reachable
        const isReachable = await this.isDeviceReachable(ip);
        
        if (isReachable) {
          // Get device info
          const deviceInfo = await this.getDeviceInfo(ip);
          
          // Add to discovered devices
          discoveredDevices.push({
            ipAddress: ip,
            ...deviceInfo,
          });
        }
      }
      
      logger.debug(`Found ${discoveredDevices.length} devices in range ${range}`);
      return discoveredDevices;
    } catch (error) {
      logger.error(`Error scanning network range ${range}:`, error);
      throw error;
    }
  }

  /**
   * Check if a device is reachable
   * @param {string} ip - IP address to check
   */
  async isDeviceReachable(ip) {
    try {
      // Use ping to check if device is reachable
      const platform = os.platform();
      const pingCmd = platform === 'win32' 
        ? `ping -n 1 -w ${config.deviceDiscovery.timeout} ${ip}`
        : `ping -c 1 -W ${config.deviceDiscovery.timeout / 1000} ${ip}`;
      
      const { stdout } = await execAsync(pingCmd);
      
      // Check if ping was successful
      return platform === 'win32'
        ? stdout.includes('Reply from')
        : stdout.includes(' 0% packet loss');
    } catch (error) {
      // Ping failed, device is not reachable
      return false;
    }
  }

  /**
   * Get device information
   * @param {string} ip - IP address of the device
   */
  async getDeviceInfo(ip) {
    try {
      // Check cache first
      const cachedInfo = deviceCache.get(ip);
      if (cachedInfo) {
        return cachedInfo;
      }
      
      // Try to get device information
      const deviceInfo = {
        deviceId: uuidv4(),
        deviceName: `Device-${ip.replace(/\./g, '-')}`,
        deviceType: 'other',
        macAddress: await this.getMacAddress(ip),
        operatingSystem: 'Unknown',
        osVersion: 'Unknown',
      };
      
      // Try to determine device type
      const deviceType = await this.determineDeviceType(ip);
      if (deviceType) {
        deviceInfo.deviceType = deviceType;
      }
      
      // Try to get OS information
      const osInfo = await this.getOsInfo(ip);
      if (osInfo) {
        deviceInfo.operatingSystem = osInfo.os || 'Unknown';
        deviceInfo.osVersion = osInfo.version || 'Unknown';
      }
      
      // Cache device info
      deviceCache.set(ip, deviceInfo);
      
      return deviceInfo;
    } catch (error) {
      logger.error(`Error getting device info for ${ip}:`, error);
      
      // Return minimal device info
      return {
        deviceId: uuidv4(),
        deviceName: `Device-${ip.replace(/\./g, '-')}`,
        deviceType: 'other',
      };
    }
  }

  /**
   * Get MAC address of a device
   * @param {string} ip - IP address of the device
   */
  async getMacAddress(ip) {
    try {
      // Use ARP to get MAC address
      const platform = os.platform();
      const arpCmd = platform === 'win32'
        ? `arp -a ${ip}`
        : `arp -n ${ip}`;
      
      const { stdout } = await execAsync(arpCmd);
      
      // Extract MAC address from output
      const macRegex = /([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/;
      const match = stdout.match(macRegex);
      
      return match ? match[0] : null;
    } catch (error) {
      logger.debug(`Could not get MAC address for ${ip}:`, error);
      return null;
    }
  }

  /**
   * Determine device type based on ports and services
   * @param {string} ip - IP address of the device
   */
  async determineDeviceType(ip) {
    try {
      // Use nmap to scan common ports
      const { stdout } = await execAsync(`nmap -F ${ip}`);
      
      // Check for common services
      if (stdout.includes('80/tcp') || stdout.includes('443/tcp')) {
        if (stdout.includes('22/tcp')) {
          return 'server';
        }
        return 'network';
      }
      
      if (stdout.includes('22/tcp')) {
        return 'server';
      }
      
      if (stdout.includes('445/tcp') || stdout.includes('139/tcp')) {
        return 'workstation';
      }
      
      return 'other';
    } catch (error) {
      logger.debug(`Could not determine device type for ${ip}:`, error);
      return 'other';
    }
  }

  /**
   * Get OS information of a device
   * @param {string} ip - IP address of the device
   */
  async getOsInfo(ip) {
    try {
      // Use nmap to get OS info
      const { stdout } = await execAsync(`nmap -O ${ip}`);
      
      // Extract OS info from output
      const osMatch = stdout.match(/OS details: (.+)/);
      const os = osMatch ? osMatch[1].trim() : 'Unknown';
      
      // Extract version info
      const versionMatch = os.match(/(\d+(\.\d+)+)/);
      const version = versionMatch ? versionMatch[0] : 'Unknown';
      
      return { os, version };
    } catch (error) {
      logger.debug(`Could not get OS info for ${ip}:`, error);
      return null;
    }
  }

  /**
   * Process discovered devices
   * @param {Array} devices - Array of discovered devices
   */
  async processDiscoveredDevices(devices) {
    let newDevices = 0;
    
    // Process each device
    for (const device of devices) {
      try {
        // Check if device already exists in database
        let existingDevice = await Device.findOne({ ipAddress: device.ipAddress });
        
        if (!existingDevice) {
          // Create new device
          existingDevice = new Device({
            deviceId: device.deviceId,
            deviceName: device.deviceName,
            deviceType: device.deviceType,
            ipAddress: device.ipAddress,
            macAddress: device.macAddress,
            operatingSystem: device.operatingSystem,
            osVersion: device.osVersion,
            status: 'discovered',
            lastSeen: new Date(),
            connected: false,
          });
          
          await existingDevice.save();
          newDevices++;
        } else {
          // Update existing device
          existingDevice.lastSeen = new Date();
          existingDevice.macAddress = device.macAddress || existingDevice.macAddress;
          existingDevice.operatingSystem = device.operatingSystem || existingDevice.operatingSystem;
          existingDevice.osVersion = device.osVersion || existingDevice.osVersion;
          
          await existingDevice.save();
        }
        
        // Add to discovered devices map
        this.discoveredDevices.set(device.ipAddress, {
          ...device,
          lastSeen: new Date(),
        });
      } catch (error) {
        logger.error(`Error processing device ${device.ipAddress}:`, error);
      }
    }
    
    logger.info(`Processed ${devices.length} devices, ${newDevices} new`);
    return newDevices;
  }

  /**
   * Get all discovered devices
   */
  async getAllDevices() {
    try {
      return await Device.find({});
    } catch (error) {
      logger.error('Error getting all devices:', error);
      throw error;
    }
  }

  /**
   * Get device by ID
   * @param {string} deviceId - Device ID
   */
  async getDeviceById(deviceId) {
    try {
      return await Device.findOne({ deviceId });
    } catch (error) {
      logger.error(`Error getting device ${deviceId}:`, error);
      throw error;
    }
  }
}

module.exports = new DeviceDiscoveryService();
