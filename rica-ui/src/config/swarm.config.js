/**
 * Swarm Browser Configuration
 * Production-ready configuration for the Swarm browser component
 */

// Environment-specific settings
const env = typeof import.meta !== 'undefined' ? import.meta.env : {};
const ENV = env.MODE || 'development';
const isProd = ENV === 'production';

// API endpoints
const API_BASE =
  env.VITE_API_URL ||
  env.REACT_APP_API_URL ||
  (isProd ? 'https://api.rica-app.com' : 'http://localhost:3001');

// Browser configuration
const BROWSER_CONFIG = {
  // API endpoints
  endpoints: {
    health: `${API_BASE}/api/health`,
    browserStatus: `${API_BASE}/api/browser/status`,
    browserLaunch: `${API_BASE}/api/browser/launch`,
    browserStop: `${API_BASE}/api/browser/stop`,
    browserScreenshot: `${API_BASE}/api/browser/screenshot`,
    browserCookies: `${API_BASE}/api/browser/cookies`,
  },
  
  // Request configuration
  request: {
    timeout: isProd ? 10000 : 30000, // 10 seconds in production, 30 in dev
    retries: isProd ? 3 : 2,
    retryDelay: 1000,
  },
  
  // Security settings
  security: {
    sandboxAttributes: 'allow-same-origin allow-scripts allow-popups allow-forms',
    allowedDomains: [
      'rica-app.com',
      'localhost',
      '127.0.0.1',
    ],
    blockedDomains: [
      'malicious-site.com',
      'phishing-example.com',
    ],
  },
  
  // Performance settings
  performance: {
    maxTabs: isProd ? 10 : 20,
    tabCacheSize: isProd ? 5 : 10,
    preloadDomains: [
      'google.com',
      'facebook.com',
      'twitter.com',
      'linkedin.com',
    ],
    lazyLoadThreshold: 2000, // ms
  },
  
  // Analytics settings
  analytics: {
    enabled: isProd,
    trackEvents: [
      'tab_open',
      'tab_close',
      'url_navigation',
      'browser_launch',
      'browser_close',
      'error',
    ],
    sampleRate: isProd ? 1.0 : 0.1, // 100% in prod, 10% in dev
  },
  
  // Default browser profiles
  defaultProfiles: [
    {
      name: 'Windows / Chrome',
      platform: 'windows',
      browserType: 'chrome',
      fingerprint: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        language: 'en-US',
        screenResolution: '1920x1080',
        timezone: 'UTC',
        webGLVendor: 'Google Inc.',
        webGLRenderer: 'ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)'
      }
    },
    {
      name: 'MacOS / Safari',
      platform: 'macos',
      browserType: 'safari',
      fingerprint: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        language: 'en-US',
        screenResolution: '2560x1600',
        timezone: 'UTC-7',
        webGLVendor: 'Apple Inc.',
        webGLRenderer: 'Apple GPU'
      }
    },
    {
      name: 'Linux / Firefox',
      platform: 'linux',
      browserType: 'firefox',
      fingerprint: {
        userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0',
        language: 'en-US',
        screenResolution: '1920x1080',
        timezone: 'UTC',
        webGLVendor: 'Mozilla',
        webGLRenderer: 'Mozilla'
      }
    }
  ],
  
  // Error messages
  errorMessages: {
    connectionFailed: 'Failed to connect to the browser service. Please try again later.',
    tabLimitReached: 'Maximum number of tabs reached. Please close some tabs before opening new ones.',
    loadingFailed: 'Failed to load the requested page. Please check your connection and try again.',
    browserCrashed: 'The browser has crashed. Please restart the application.',
    securityError: 'Security error: The requested action was blocked for your protection.',
  }
};

export default BROWSER_CONFIG;
