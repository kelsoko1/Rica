import BROWSER_CONFIG from '../config/swarm.config';
import { trackError, trackEvent } from './analyticsService';

// API configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Retry configuration
const MAX_RETRIES = BROWSER_CONFIG.request.retries;
const RETRY_DELAY = BROWSER_CONFIG.request.retryDelay; // milliseconds
const REQUEST_TIMEOUT = BROWSER_CONFIG.request.timeout; // milliseconds

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function for fetch with timeout
const fetchWithTimeout = (url, options = {}) => {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);
  
  return fetch(url, {
    ...options,
    signal
  })
    .finally(() => clearTimeout(timeout));
};

// Helper function to retry failed requests with exponential backoff
const retryRequest = async (fn, retries = MAX_RETRIES, initialDelay = RETRY_DELAY) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      // Exponential backoff with jitter
      const backoffDelay = initialDelay * Math.pow(2, MAX_RETRIES - retries);
      const jitter = Math.random() * 0.1 * backoffDelay;
      await delay(backoffDelay + jitter);
      return retryRequest(fn, retries - 1, initialDelay);
    }
    throw error;
  }
};

class BrowserLauncher {
  constructor() {
    this.runningProfiles = new Set();
    this.isServerAvailable = false;
    this.checkServerAvailability();
  }

  async checkServerAvailability() {
    try {
      const response = await fetchWithTimeout(BROWSER_CONFIG.endpoints.health);
      
      if (!response.ok) {
        throw new Error(`Server health check failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      this.isServerAvailable = data.status === 'ok';
      
      if (this.isServerAvailable) {
        this.syncStatus();
      } else {
        console.warn('Server is not healthy:', data.message || 'Unknown issue');
        trackError('server_health_check', 'Server is not healthy', {
          status: data.status,
          message: data.message
        });
      }
    } catch (error) {
      console.warn('Server is not available:', error.message);
      this.isServerAvailable = false;
      
      // Only track actual errors, not aborted requests
      if (error.name !== 'AbortError') {
        trackError('server_connection', 'Server is not available', {
          message: error.message
        });
      }
      
      // Retry after delay
      setTimeout(() => this.checkServerAvailability(), 5000);
    }
  }

  async syncStatus() {
    if (!this.isServerAvailable) {
      console.warn('Server is not available, skipping sync');
      return;
    }

    try {
      const response = await retryRequest(async () => {
        const res = await fetchWithTimeout(BROWSER_CONFIG.endpoints.browserStatus);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res;
      });
      
      const data = await response.json();
      if (data.success) {
        this.runningProfiles = new Set(data.runningProfiles);
        
        // Update local storage with running profiles for persistence
        try {
          const storedProfiles = JSON.parse(localStorage.getItem('browserProfiles') || '[]');
          const updatedProfiles = storedProfiles.map(profile => ({
            ...profile,
            status: this.runningProfiles.has(profile.id) ? 'active' : 'inactive'
          }));
          localStorage.setItem('browserProfiles', JSON.stringify(updatedProfiles));
        } catch (storageError) {
          console.warn('Failed to update local storage:', storageError);
        }
      }
    } catch (error) {
      console.error('Failed to sync browser status:', error);
      this.isServerAvailable = false;
      
      trackError('browser_sync', 'Failed to sync browser status', {
        message: error.message
      });
      
      setTimeout(() => this.checkServerAvailability(), 5000);
    }
  }

  /**
   * Convert Rica profile to CamouFox config
   */
  convertProfileToConfig(profile) {
    if (!profile || !profile.fingerprint) {
      // Use a default profile if none provided or invalid
      const defaultProfile = BROWSER_CONFIG.defaultProfiles[0];
      return this.convertProfileToConfig(defaultProfile);
    }
    
    const {
      fingerprint,
      proxy,
      platform,
      browserType,
    } = profile;

    try {
      // Parse screen resolution safely
      const [screenWidth, screenHeight] = (fingerprint.screenResolution || '1920x1080')
        .split('x')
        .map(dim => parseInt(dim, 10) || 1920);
      
      // Base configuration
      const config = {
        'window.outerHeight': screenHeight,
        'window.outerWidth': screenWidth,
        'window.innerHeight': screenHeight - 48, // Account for browser chrome
        'window.innerWidth': screenWidth,
        'window.history.length': Math.floor(Math.random() * 10) + 1,
        'navigator.userAgent': fingerprint.userAgent || 'Mozilla/5.0',
        'navigator.appCodeName': 'Mozilla',
        'navigator.appName': 'Netscape',
        'navigator.appVersion': '5.0 (Windows)',
        'navigator.oscpu': platform === 'windows' ? 'Windows NT 10.0; Win64; x64' : 
                          platform === 'macos' ? 'Intel Mac OS X 10.15' : 'Linux x86_64',
        'navigator.language': fingerprint.language || 'en-US',
        'navigator.languages': [fingerprint.language || 'en-US'],
        'navigator.platform': platform === 'windows' ? 'Win32' : 
                            platform === 'macos' ? 'MacIntel' : 'Linux x86_64',
        'navigator.hardwareConcurrency': Math.floor(Math.random() * 8) + 4,
        'navigator.product': 'Gecko',
        'navigator.productSub': '20030107',
        'navigator.maxTouchPoints': Math.floor(Math.random() * 5),
        'webgl.vendor': fingerprint.webGLVendor || 'Google Inc.',
        'webgl.renderer': fingerprint.webGLRenderer || 'ANGLE (Intel)',
        'timezone': fingerprint.timezone || 'UTC'
      };

      // Add proxy if specified
      if (proxy) {
        config.proxy = proxy;
      }
      
      // Add security settings
      config.security = {
        allowedDomains: BROWSER_CONFIG.security.allowedDomains,
        blockedDomains: BROWSER_CONFIG.security.blockedDomains
      };

      return config;
    } catch (error) {
      console.error('Error converting profile to config:', error);
      trackError('profile_conversion', 'Error converting profile to config', {
        profileId: profile.id,
        error: error.message
      });
      
      // Return a safe default config
      return this.convertProfileToConfig(BROWSER_CONFIG.defaultProfiles[0]);
    }
  }

  /**
   * Launch a browser profile
   */
  async launchProfile(profile) {
    if (!this.isServerAvailable) {
      console.warn('Server is not available');
      return false;
    }
    
    // Check if we've reached the maximum number of tabs
    if (this.runningProfiles.size >= BROWSER_CONFIG.performance.maxTabs) {
      console.warn('Maximum number of browser profiles reached');
      return { success: false, error: BROWSER_CONFIG.errorMessages.tabLimitReached };
    }

    try {
      const config = this.convertProfileToConfig(profile);
      
      // Track browser launch attempt
      trackEvent('browser_launch_attempt', {
        profileId: profile.id,
        profileName: profile.name,
        browserType: profile.browserType
      });
      
      const response = await retryRequest(async () => {
        const res = await fetchWithTimeout(BROWSER_CONFIG.endpoints.browserLaunch, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profile: {
              ...profile,
              config
            }
          })
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res;
      });

      const data = await response.json();
      if (data.success) {
        this.runningProfiles.add(profile.id);
        
        // Track successful browser launch
        trackEvent('browser_launch_success', {
          profileId: profile.id,
          profileName: profile.name,
          browserType: profile.browserType
        });
        
        // Update profile's last used timestamp
        try {
          const storedProfiles = JSON.parse(localStorage.getItem('browserProfiles') || '[]');
          const updatedProfiles = storedProfiles.map(p => 
            p.id === profile.id 
              ? { ...p, lastUsed: new Date().toISOString(), status: 'active' } 
              : p
          );
          localStorage.setItem('browserProfiles', JSON.stringify(updatedProfiles));
        } catch (storageError) {
          console.warn('Failed to update profile last used time:', storageError);
        }
      } else {
        // Track failed browser launch
        trackError('browser_launch_failed', 'Failed to launch browser', {
          profileId: profile.id,
          reason: data.error || 'Unknown error'
        });
      }
      return data.success;
    } catch (error) {
      console.error('Failed to launch browser:', error);
      this.isServerAvailable = false;
      
      trackError('browser_launch_error', 'Error launching browser', {
        profileId: profile.id,
        error: error.message
      });
      
      setTimeout(() => this.checkServerAvailability(), 5000);
      return false;
    }
  }

  /**
   * Stop a browser profile
   */
  async stopProfile(profileId) {
    if (!this.isServerAvailable) {
      console.warn('Server is not available');
      return false;
    }

    try {
      // Track browser stop attempt
      trackEvent('browser_stop_attempt', {
        profileId
      });
      
      const response = await retryRequest(async () => {
        const res = await fetchWithTimeout(BROWSER_CONFIG.endpoints.browserStop, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ profileId })
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res;
      });

      const data = await response.json();
      if (data.success) {
        this.runningProfiles.delete(profileId);
        
        // Track successful browser stop
        trackEvent('browser_stop_success', {
          profileId
        });
        
        // Update profile status in localStorage
        try {
          const storedProfiles = JSON.parse(localStorage.getItem('browserProfiles') || '[]');
          const updatedProfiles = storedProfiles.map(p => 
            p.id === profileId 
              ? { ...p, status: 'inactive' } 
              : p
          );
          localStorage.setItem('browserProfiles', JSON.stringify(updatedProfiles));
        } catch (storageError) {
          console.warn('Failed to update profile status:', storageError);
        }
      } else {
        // Track failed browser stop
        trackError('browser_stop_failed', 'Failed to stop browser', {
          profileId,
          reason: data.error || 'Unknown error'
        });
      }
      return data.success;
    } catch (error) {
      console.error('Failed to stop browser:', error);
      this.isServerAvailable = false;
      
      trackError('browser_stop_error', 'Error stopping browser', {
        profileId,
        error: error.message
      });
      
      setTimeout(() => this.checkServerAvailability(), 5000);
      return false;
    }
  }

  /**
   * Check if a profile is running
   */
  isProfileRunning(profileId) {
    return this.runningProfiles.has(profileId);
  }

  /**
   * Get all running profiles
   */
  getRunningProfiles() {
    return Array.from(this.runningProfiles);
  }
}

export default new BrowserLauncher();
