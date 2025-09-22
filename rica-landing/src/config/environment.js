/**
 * Environment Configuration
 * 
 * This file provides environment-specific configuration for the application.
 * In a production environment, these values would be loaded from environment variables.
 */

// Determine environment
const isProd = (window.env && window.env.NODE_ENV === 'production') || false;

// Base configuration
const baseConfig = {
  // Application
  appName: 'Rica',
  appVersion: '1.0.0',
  
  // Environment
  isProd,
  env: isProd ? 'production' : 'development',
  
  // API
  apiBaseUrl: isProd 
    ? (window.env && window.env.REACT_APP_API_URL) || 'https://api.rica.io'
    : 'http://localhost:3001',
  
  // Authentication
  authTokenKey: isProd ? 'rica_prod_auth_token' : 'rica_dev_auth_token',
  
  // Security
  encryptionKey: (window.env && window.env.REACT_APP_ENCRYPTION_KEY) || 'default-dev-key-replace-in-production',
  
  // Logging
  logLevel: isProd ? 'error' : 'debug',
  enableDetailedErrors: !isProd,
  
  // Analytics
  analyticsEnabled: true,
  analyticsProvider: isProd ? 'google-analytics' : 'local',
  analyticsKey: (window.env && window.env.REACT_APP_ANALYTICS_KEY) || null,
  
  // Feature flags
  features: {
    recurringPayments: true,
    subscriptions: true,
    analytics: true,
    receipts: true
  }
};

// Development configuration
const devConfig = {
  ...baseConfig,
  
  // Development-specific settings
  mockPayments: true,
  mockDelay: 800,
  
  // Recurring payments configuration
  recurringPayments: {
    maxRetryAttempts: 3,
    retryDelayMs: 60000, // 1 minute for development
    batchDelayMs: 1000, // 1 second between batches
    maxBatchSize: 5
  }
};

// Production configuration
const prodConfig = {
  ...baseConfig,
  
  // Production-specific settings
  mockPayments: false,
  
  // Recurring payments configuration
  recurringPayments: {
    maxRetryAttempts: 5,
    retryDelayMs: 3600000, // 1 hour for production
    batchDelayMs: 5000, // 5 seconds between batches
    maxBatchSize: 20
  },
  
  // Performance settings
  cacheEnabled: true,
  cacheTTL: 3600, // 1 hour
  
  // Error reporting
  errorReporting: {
    enabled: true,
    service: 'sentry',
    dsn: (window.env && window.env.REACT_APP_SENTRY_DSN) || null
  },
  
  // Rate limiting
  rateLimit: {
    enabled: true,
    maxRequests: 100,
    timeWindow: 60000 // 1 minute
  }
};

// Test configuration
const testConfig = {
  ...baseConfig,
  isProd: false,
  env: 'test',
  mockPayments: true,
  
  // Test-specific settings
  recurringPayments: {
    maxRetryAttempts: 1,
    retryDelayMs: 100,
    batchDelayMs: 100,
    maxBatchSize: 10
  }
};

// Select configuration based on environment
let config;
if (window.env && window.env.NODE_ENV === 'production') {
  config = prodConfig;
} else if (window.env && window.env.NODE_ENV === 'test') {
  config = testConfig;
} else {
  config = devConfig;
}

export default config;
