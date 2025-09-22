/**
 * Configuration module for Rica API Server
 * Loads environment variables and provides configuration settings
 */

require('dotenv').config();

// Default configuration values
const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 8080,
    env: process.env.NODE_ENV || 'development',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:3001'],
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10) * 60 * 1000, // 15 minutes in ms
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  // Database configuration
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/rica',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'rica-development-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },

  // Device discovery configuration
  deviceDiscovery: {
    interval: parseInt(process.env.DISCOVERY_INTERVAL || '60', 10) * 1000, // 60 seconds in ms
    timeout: parseInt(process.env.DISCOVERY_TIMEOUT || '5', 10) * 1000, // 5 seconds in ms
    retries: parseInt(process.env.DISCOVERY_RETRIES || '3', 10),
    concurrentScans: parseInt(process.env.DISCOVERY_CONCURRENT_SCANS || '10', 10),
    networkRanges: process.env.NETWORK_RANGES ? process.env.NETWORK_RANGES.split(',') : ['192.168.1.0/24'],
    excludedIps: process.env.EXCLUDED_IPS ? process.env.EXCLUDED_IPS.split(',') : [],
  },

  // Data collection configuration
  dataCollection: {
    interval: parseInt(process.env.COLLECTION_INTERVAL || '300', 10) * 1000, // 5 minutes in ms
    timeout: parseInt(process.env.COLLECTION_TIMEOUT || '30', 10) * 1000, // 30 seconds in ms
    retries: parseInt(process.env.COLLECTION_RETRIES || '3', 10),
    batchSize: parseInt(process.env.COLLECTION_BATCH_SIZE || '10', 10),
    maxConcurrent: parseInt(process.env.COLLECTION_MAX_CONCURRENT || '5', 10),
  },

  // OpenCTI configuration
  openCTI: {
    url: process.env.OPENCTI_URL || 'http://localhost:4000',
    graphqlEndpoint: process.env.OPENCTI_GRAPHQL_ENDPOINT || '/graphql',
    apiKey: process.env.OPENCTI_API_KEY || '',
    connectorId: process.env.OPENCTI_CONNECTOR_ID || 'rica-device-connector',
  },

  // OpenBAS configuration
  openBAS: {
    url: process.env.OPENBAS_URL || 'http://localhost:3000',
    apiEndpoint: process.env.OPENBAS_API_ENDPOINT || '/api',
    apiKey: process.env.OPENBAS_API_KEY || '',
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    directory: process.env.LOG_DIRECTORY || 'logs',
  },

  // Security configuration
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY || 'rica-development-encryption-key-change-in-production',
    saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10),
  },

  // Cache configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300', 10), // 5 minutes in seconds
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '60', 10), // 1 minute in seconds
  },

  // ClickPesa configuration (for backward compatibility)
  clickPesa: {
    webhookSecret: process.env.CLICKPESA_WEBHOOK_SECRET || 'your_webhook_secret',
  },
};

// Environment-specific overrides
if (config.server.env === 'production') {
  // Enforce security settings in production
  if (config.jwt.secret === 'rica-development-secret-key-change-in-production') {
    throw new Error('JWT_SECRET must be set in production environment');
  }

  if (config.security.encryptionKey === 'rica-development-encryption-key-change-in-production') {
    throw new Error('ENCRYPTION_KEY must be set in production environment');
  }

  // Adjust rate limiting for production
  config.server.rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || '50', 10);
}

module.exports = config;
