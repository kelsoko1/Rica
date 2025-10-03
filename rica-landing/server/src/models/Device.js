/**
 * Device model
 * Represents a device that can be discovered and connected to
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const { Schema } = mongoose;

const deviceSchema = new Schema({
  // Basic device information
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  deviceName: {
    type: String,
    required: true,
  },
  deviceType: {
    type: String,
    enum: ['workstation', 'server', 'mobile', 'network', 'iot', 'other'],
    required: true,
  },
  
  // Network information
  ipAddress: {
    type: String,
    required: true,
  },
  macAddress: {
    type: String,
    required: false,
  },
  
  // System information
  operatingSystem: {
    type: String,
    required: false,
  },
  osVersion: {
    type: String,
    required: false,
  },
  
  // Status information
  status: {
    type: String,
    enum: ['discovered', 'connected', 'disconnected', 'error'],
    default: 'discovered',
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  connected: {
    type: Boolean,
    default: false,
  },
  connectionTime: {
    type: Date,
    required: false,
  },
  
  // Authentication information (encrypted)
  credentials: {
    type: Object,
    required: false,
    select: false,  // Don't include in query results by default
  },
  
  // Data collection configuration
  dataFeeds: [{
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['system', 'security', 'network', 'logs', 'custom'],
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    interval: {
      type: Number,  // In milliseconds
      default: 300000,  // 5 minutes
    },
    lastCollection: {
      type: Date,
      required: false,
    },
  }],
  
  // Last collected data
  lastData: {
    type: Object,
    required: false,
  },
  
  // Metadata
  metadata: {
    type: Object,
    required: false,
  },
  
  // User/organization ownership
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to update the updatedAt field
deviceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to encrypt sensitive data
deviceSchema.methods.encryptCredentials = function(credentials, encryptionKey) {
  if (!credentials) return null;
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
  
  let encrypted = cipher.update(JSON.stringify(credentials));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return {
    iv: iv.toString('hex'),
    data: encrypted.toString('hex'),
  };
};

// Method to decrypt sensitive data
deviceSchema.methods.decryptCredentials = function(encryptedData, encryptionKey) {
  if (!encryptedData) return null;
  
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const encryptedText = Buffer.from(encryptedData.data, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
  
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return JSON.parse(decrypted.toString());
};

// Method to sanitize device data for API responses
deviceSchema.methods.toJSON = function() {
  const device = this.toObject();
  
  // Remove sensitive fields
  delete device.credentials;
  
  return device;
};

// Create and export the model
const Device = mongoose.model('Device', deviceSchema);
module.exports = Device;
