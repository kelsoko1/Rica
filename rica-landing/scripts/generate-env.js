/**
 * Script to generate env.js for production deployment
 * This script takes environment variables and creates a browser-compatible env.js file
 */

const fs = require('fs');
const path = require('path');

// Define the output path
const outputPath = path.join(process.cwd(), 'public', 'env.js');

// Ensure the directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get environment variables with fallbacks
const env = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  REACT_APP_API_URL: process.env.REACT_APP_API_URL || '/api',
  REACT_APP_CLICKPESA_API_KEY: process.env.REACT_APP_CLICKPESA_API_KEY || '',
  REACT_APP_ENCRYPTION_KEY: process.env.REACT_APP_ENCRYPTION_KEY || '',
  REACT_APP_ANALYTICS_KEY: process.env.REACT_APP_ANALYTICS_KEY || '',
  REACT_APP_SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN || '',
};

// Create the env.js content
const content = `/**
 * Environment variables for browser
 * Generated on: ${new Date().toISOString()}
 * This file is auto-generated and should not be modified directly
 */

window.env = ${JSON.stringify(env, null, 2)};
`;

// Write the file
fs.writeFileSync(outputPath, content);

console.log(`Environment file generated at: ${outputPath}`);
console.log('Environment variables included:');
console.log(JSON.stringify(env, null, 2));
