/**
 * Logger utility for Rica API Server
 * Provides structured logging with different levels and formats
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), config.logging.directory);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log formats
const formats = {
  console: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}${info.splat !== undefined ? `${info.splat}` : ''}`
    )
  ),
  json: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
};

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: formats[config.logging.format] || formats.json,
  defaultMeta: { service: 'rica-api-server' },
  transports: [
    // Console transport for all environments
    new winston.transports.Console(),
    
    // File transports for non-development environments
    ...(config.server.env !== 'development' ? [
      // Error log
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
      }),
      // Combined log
      new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
      }),
    ] : []),
  ],
  // Don't exit on uncaught exceptions
  exitOnError: false,
});

// Add request logging format
logger.requestFormat = (req, res, responseTime) => {
  const { method, originalUrl, ip } = req;
  const { statusCode } = res;
  
  return {
    method,
    url: originalUrl,
    status: statusCode,
    responseTime: `${responseTime.toFixed(2)}ms`,
    ip,
    userAgent: req.headers['user-agent'] || '-',
  };
};

module.exports = logger;
