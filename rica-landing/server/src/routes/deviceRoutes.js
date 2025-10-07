/**
 * Device Routes
 * API endpoints for device management
 */

const express = require('express');
const { body, param } = require('express-validator');
const deviceController = require('../controllers/deviceController');
const { requireRole } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

/**
 * @route   GET /api/devices
 * @desc    Get all devices
 * @access  Private
 */
router.get(
  '/',
  deviceController.getAllDevices
);

/**
 * @route   GET /api/devices/:deviceId
 * @desc    Get device by ID
 * @access  Private
 */
router.get(
  '/:deviceId',
  [
    param('deviceId').notEmpty().withMessage('Device ID is required'),
    validateRequest,
  ],
  deviceController.getDeviceById
);

/**
 * @route   POST /api/devices/discovery/start
 * @desc    Start device discovery
 * @access  Private (admin only)
 */
router.post(
  '/discovery/start',
  requireRole(['admin']),
  deviceController.startDiscovery
);

/**
 * @route   POST /api/devices/discovery/stop
 * @desc    Stop device discovery
 * @access  Private (admin only)
 */
router.post(
  '/discovery/stop',
  requireRole(['admin']),
  deviceController.stopDiscovery
);

/**
 * @route   POST /api/devices/:deviceId/connect
 * @desc    Connect to a device
 * @access  Private
 */
router.post(
  '/:deviceId/connect',
  [
    param('deviceId').notEmpty().withMessage('Device ID is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('port').optional().isInt({ min: 1, max: 65535 }).withMessage('Port must be a valid number'),
    validateRequest,
  ],
  deviceController.connectDevice
);

/**
 * @route   POST /api/devices/:deviceId/disconnect
 * @desc    Disconnect from a device
 * @access  Private
 */
router.post(
  '/:deviceId/disconnect',
  [
    param('deviceId').notEmpty().withMessage('Device ID is required'),
    validateRequest,
  ],
  deviceController.disconnectDevice
);

/**
 * @route   POST /api/devices/collection/start
 * @desc    Start data collection
 * @access  Private (admin only)
 */
router.post(
  '/collection/start',
  requireRole(['admin']),
  deviceController.startDataCollection
);

/**
 * @route   POST /api/devices/collection/stop
 * @desc    Stop data collection
 * @access  Private (admin only)
 */
router.post(
  '/collection/stop',
  requireRole(['admin']),
  deviceController.stopDataCollection
);

/**
 * @route   POST /api/devices/:deviceId/collect
 * @desc    Collect data from a specific device
 * @access  Private
 */
router.post(
  '/:deviceId/collect',
  [
    param('deviceId').notEmpty().withMessage('Device ID is required'),
    validateRequest,
  ],
  deviceController.collectDeviceData
);

/**
 * @route   PUT /api/devices/:deviceId
 * @desc    Update device information
 * @access  Private
 */
router.put(
  '/:deviceId',
  [
    param('deviceId').notEmpty().withMessage('Device ID is required'),
    body('deviceName').optional().notEmpty().withMessage('Device name cannot be empty'),
    body('deviceType').optional().isIn(['workstation', 'server', 'mobile', 'network', 'iot', 'other']).withMessage('Invalid device type'),
    validateRequest,
  ],
  deviceController.updateDevice
);

/**
 * @route   DELETE /api/devices/:deviceId
 * @desc    Delete a device
 * @access  Private (admin only)
 */
router.delete(
  '/:deviceId',
  [
    param('deviceId').notEmpty().withMessage('Device ID is required'),
    validateRequest,
  ],
  requireRole(['admin']),
  deviceController.deleteDevice
);

module.exports = router;
