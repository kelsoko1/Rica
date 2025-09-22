/**
 * Device Controller
 * Handles API requests related to devices
 */

const Device = require('../models/Device');
const deviceDiscoveryService = require('../services/deviceDiscoveryService');
const dataCollectionService = require('../services/dataCollectionService');
const config = require('../config');
const logger = require('../utils/logger');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Get all devices
 */
const getAllDevices = async (req, res, next) => {
  try {
    const devices = await Device.find({});
    res.json({
      success: true,
      count: devices.length,
      data: devices,
    });
  } catch (error) {
    logger.error('Error getting all devices:', error);
    next(new ApiError(500, 'Failed to get devices'));
  }
};

/**
 * Get device by ID
 */
const getDeviceById = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    
    const device = await Device.findOne({ deviceId });
    
    if (!device) {
      return next(new ApiError(404, 'Device not found'));
    }
    
    res.json({
      success: true,
      data: device,
    });
  } catch (error) {
    logger.error(`Error getting device ${req.params.deviceId}:`, error);
    next(new ApiError(500, 'Failed to get device'));
  }
};

/**
 * Start device discovery
 */
const startDiscovery = async (req, res, next) => {
  try {
    const success = await deviceDiscoveryService.startDiscovery();
    
    if (!success) {
      return next(new ApiError(400, 'Device discovery is already running'));
    }
    
    res.json({
      success: true,
      message: 'Device discovery started',
    });
  } catch (error) {
    logger.error('Error starting device discovery:', error);
    next(new ApiError(500, 'Failed to start device discovery'));
  }
};

/**
 * Stop device discovery
 */
const stopDiscovery = async (req, res, next) => {
  try {
    const success = deviceDiscoveryService.stopDiscovery();
    
    if (!success) {
      return next(new ApiError(400, 'Device discovery is not running'));
    }
    
    res.json({
      success: true,
      message: 'Device discovery stopped',
    });
  } catch (error) {
    logger.error('Error stopping device discovery:', error);
    next(new ApiError(500, 'Failed to stop device discovery'));
  }
};

/**
 * Connect to a device
 */
const connectDevice = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const { username, password, port } = req.body;
    
    // Validate input
    if (!username || !password) {
      return next(new ApiError(400, 'Username and password are required'));
    }
    
    // Find device
    const device = await Device.findOne({ deviceId });
    
    if (!device) {
      return next(new ApiError(404, 'Device not found'));
    }
    
    // Check if device is already connected
    if (device.connected) {
      return next(new ApiError(400, 'Device is already connected'));
    }
    
    // Encrypt credentials
    const credentials = device.encryptCredentials(
      { username, password, port: port || 22 },
      config.security.encryptionKey
    );
    
    // Update device with credentials and connection status
    device.credentials = credentials;
    device.status = 'connected';
    device.connected = true;
    device.connectionTime = new Date();
    
    await device.save();
    
    // Add default data feeds if none exist
    if (!device.dataFeeds || device.dataFeeds.length === 0) {
      device.dataFeeds = [
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
      
      await device.save();
    }
    
    res.json({
      success: true,
      message: 'Device connected successfully',
      data: device,
    });
  } catch (error) {
    logger.error(`Error connecting to device ${req.params.deviceId}:`, error);
    next(new ApiError(500, 'Failed to connect to device'));
  }
};

/**
 * Disconnect from a device
 */
const disconnectDevice = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    
    // Find device
    const device = await Device.findOne({ deviceId });
    
    if (!device) {
      return next(new ApiError(404, 'Device not found'));
    }
    
    // Check if device is connected
    if (!device.connected) {
      return next(new ApiError(400, 'Device is not connected'));
    }
    
    // Update device with connection status
    device.status = 'disconnected';
    device.connected = false;
    
    await device.save();
    
    res.json({
      success: true,
      message: 'Device disconnected successfully',
      data: device,
    });
  } catch (error) {
    logger.error(`Error disconnecting from device ${req.params.deviceId}:`, error);
    next(new ApiError(500, 'Failed to disconnect from device'));
  }
};

/**
 * Start data collection
 */
const startDataCollection = async (req, res, next) => {
  try {
    const success = await dataCollectionService.startDataCollection();
    
    if (!success) {
      return next(new ApiError(400, 'Data collection is already running'));
    }
    
    res.json({
      success: true,
      message: 'Data collection started',
    });
  } catch (error) {
    logger.error('Error starting data collection:', error);
    next(new ApiError(500, 'Failed to start data collection'));
  }
};

/**
 * Stop data collection
 */
const stopDataCollection = async (req, res, next) => {
  try {
    const success = dataCollectionService.stopDataCollection();
    
    if (!success) {
      return next(new ApiError(400, 'Data collection is not running'));
    }
    
    res.json({
      success: true,
      message: 'Data collection stopped',
    });
  } catch (error) {
    logger.error('Error stopping data collection:', error);
    next(new ApiError(500, 'Failed to stop data collection'));
  }
};

/**
 * Collect data from a specific device
 */
const collectDeviceData = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    
    // Find device
    const device = await Device.findOne({ deviceId });
    
    if (!device) {
      return next(new ApiError(404, 'Device not found'));
    }
    
    // Check if device is connected
    if (!device.connected) {
      return next(new ApiError(400, 'Device is not connected'));
    }
    
    // Collect data from device
    const data = await dataCollectionService.collectDeviceData(device);
    
    if (!data) {
      return next(new ApiError(500, 'Failed to collect data from device'));
    }
    
    res.json({
      success: true,
      message: 'Data collected successfully',
      data,
    });
  } catch (error) {
    logger.error(`Error collecting data from device ${req.params.deviceId}:`, error);
    next(new ApiError(500, 'Failed to collect data from device'));
  }
};

/**
 * Update device information
 */
const updateDevice = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const { deviceName, deviceType } = req.body;
    
    // Find device
    const device = await Device.findOne({ deviceId });
    
    if (!device) {
      return next(new ApiError(404, 'Device not found'));
    }
    
    // Update device information
    if (deviceName) device.deviceName = deviceName;
    if (deviceType) device.deviceType = deviceType;
    
    await device.save();
    
    res.json({
      success: true,
      message: 'Device updated successfully',
      data: device,
    });
  } catch (error) {
    logger.error(`Error updating device ${req.params.deviceId}:`, error);
    next(new ApiError(500, 'Failed to update device'));
  }
};

/**
 * Delete a device
 */
const deleteDevice = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    
    // Find and delete device
    const device = await Device.findOneAndDelete({ deviceId });
    
    if (!device) {
      return next(new ApiError(404, 'Device not found'));
    }
    
    res.json({
      success: true,
      message: 'Device deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting device ${req.params.deviceId}:`, error);
    next(new ApiError(500, 'Failed to delete device'));
  }
};

module.exports = {
  getAllDevices,
  getDeviceById,
  startDiscovery,
  stopDiscovery,
  connectDevice,
  disconnectDevice,
  startDataCollection,
  stopDataCollection,
  collectDeviceData,
  updateDevice,
  deleteDevice,
};
