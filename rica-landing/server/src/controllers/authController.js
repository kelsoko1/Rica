/**
 * Authentication Controller
 * Handles user authentication and authorization
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const logger = require('../utils/logger');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return next(new ApiError(400, 'Username, email, and password are required'));
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    
    if (existingUser) {
      return next(new ApiError(400, 'Username or email already exists'));
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role: 'user', // Default role
      permissions: ['view:devices'], // Default permissions
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        },
        token,
      },
    });
  } catch (error) {
    logger.error('Error registering user:', error);
    next(new ApiError(500, 'Failed to register user'));
  }
};

/**
 * Login a user
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return next(new ApiError(400, 'Username and password are required'));
    }
    
    // Find user by username
    const user = await User.findOne({ username }).select('+password');
    
    if (!user) {
      return next(new ApiError(401, 'Invalid credentials'));
    }
    
    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid credentials'));
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        },
        token,
      },
    });
  } catch (error) {
    logger.error('Error logging in user:', error);
    next(new ApiError(500, 'Failed to login'));
  }
};

/**
 * Get current user
 */
const getCurrentUser = async (req, res, next) => {
  try {
    // Get user from request (set by auth middleware)
    const { id } = req.user;
    
    // Find user by ID
    const user = await User.findById(id);
    
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: user.permissions,
        },
      },
    });
  } catch (error) {
    logger.error('Error getting current user:', error);
    next(new ApiError(500, 'Failed to get user'));
  }
};

/**
 * Generate API key for a user
 */
const generateApiKey = async (req, res, next) => {
  try {
    // Get user from request (set by auth middleware)
    const { id } = req.user;
    
    // Find user by ID
    const user = await User.findById(id).select('+apiKey');
    
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }
    
    // Generate API key
    const apiKey = user.generateApiKey();
    
    await user.save();
    
    res.json({
      success: true,
      message: 'API key generated successfully',
      data: {
        apiKey,
      },
    });
  } catch (error) {
    logger.error('Error generating API key:', error);
    next(new ApiError(500, 'Failed to generate API key'));
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  generateApiKey,
};
