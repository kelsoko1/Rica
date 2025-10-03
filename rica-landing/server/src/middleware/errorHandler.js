/**
 * Error handling middleware
 * Provides consistent error responses and logging
 */

const logger = require('../utils/logger');
const config = require('../config');

// Custom error class for API errors
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;
  
  // Don't expose stack traces in production
  const stack = config.server.env === 'production' ? undefined : err.stack;
  
  // Log the error
  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${message}`, {
      error: err.name,
      stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  } else {
    logger.warn(`${statusCode} - ${message}`, {
      error: err.name,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  }
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details && { details }),
      ...(stack && { stack }),
    },
  });
};

module.exports = {
  errorHandler,
  ApiError,
};
