/**
 * Request logging middleware
 * Logs incoming requests and their response times
 */

const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  // Record start time
  const start = Date.now();
  
  // Log request
  logger.http(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent'] || '-',
  });
  
  // Process request
  res.on('finish', () => {
    // Calculate response time
    const responseTime = Date.now() - start;
    
    // Get request details
    const logData = logger.requestFormat(req, res, responseTime);
    
    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error('Request completed', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request completed', logData);
    } else {
      logger.http('Request completed', logData);
    }
  });
  
  next();
};

module.exports = requestLogger;
