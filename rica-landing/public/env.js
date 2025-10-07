/**
 * Environment variables for browser
 * This file provides environment variables for the browser environment
 * In production, this file should be generated during the build process
 */

window.env = {
  // Environment mode (development, production, test)
  NODE_ENV: 'development',
  
  // API Configuration
  REACT_APP_API_URL: 'http://localhost:3001',
  
  // Payment Integration
  REACT_APP_CLICKPESA_API_KEY: 'IDNzCNDMk4Uj1OHqWXNBpgL7sFIebKnI',
  
  // Security
  REACT_APP_ENCRYPTION_KEY: 'dev-key-for-local-testing-only',
  
  // Analytics
  REACT_APP_ANALYTICS_KEY: 'UA-XXXXXXXXX-X',
  
  // Error Reporting
  REACT_APP_SENTRY_DSN: null
};
