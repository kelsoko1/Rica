/**
 * Request Validation Middleware
 * Validates request data using express-validator
 */

const { validationResult } = require('express-validator');
const { ApiError } = require('./errorHandler');

/**
 * Middleware to validate request data
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Get first error message
    const firstError = errors.array()[0];
    
    // Format error message
    const message = `${firstError.msg}${firstError.param ? ` (${firstError.param})` : ''}`;
    
    // Return error response
    return next(new ApiError(400, message, errors.array()));
  }
  
  next();
};

module.exports = validateRequest;
