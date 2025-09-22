/**
 * User model
 * Represents a user of the system
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;
const config = require('../config');

const userSchema = new Schema({
  // Basic user information
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: true,
    select: false,  // Don't include in query results by default
  },
  
  // User role and permissions
  role: {
    type: String,
    enum: ['admin', 'user', 'viewer'],
    default: 'user',
  },
  permissions: [{
    type: String,
    enum: [
      'manage:devices', 
      'view:devices', 
      'manage:users', 
      'view:users',
      'manage:integrations',
      'view:integrations',
    ],
  }],
  
  // Profile information
  firstName: {
    type: String,
    required: false,
    trim: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: false,
    trim: true,
    maxlength: 50,
  },
  
  // Account status
  active: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    required: false,
  },
  
  // API key for programmatic access
  apiKey: {
    type: String,
    required: false,
    select: false,
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

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  // Update the updatedAt field
  this.updatedAt = Date.now();
  
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(config.security.saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate API key
userSchema.methods.generateApiKey = function() {
  const apiKey = require('crypto').randomBytes(32).toString('hex');
  this.apiKey = apiKey;
  return apiKey;
};

// Method to sanitize user data for API responses
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  
  // Remove sensitive fields
  delete user.password;
  delete user.apiKey;
  
  return user;
};

// Create and export the model
const User = mongoose.model('User', userSchema);
module.exports = User;
