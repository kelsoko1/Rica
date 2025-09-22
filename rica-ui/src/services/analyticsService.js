/**
 * Analytics Service for Rica UI
 * Provides tracking and reporting functionality for user interactions and system events
 */

// Configuration
const ANALYTICS_ENDPOINT = process.env.REACT_APP_ANALYTICS_ENDPOINT || 'https://analytics.rica-app.com/collect';
const ANALYTICS_ENABLED = process.env.REACT_APP_ANALYTICS_ENABLED !== 'false';
const DEBUG_MODE = process.env.NODE_ENV !== 'production';

// Queue for batching events
let eventQueue = [];
const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 30000; // 30 seconds

// Session ID generation
const SESSION_ID = generateSessionId();

/**
 * Generate a unique session ID
 */
function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Track an event
 * @param {string} eventName - Name of the event
 * @param {Object} eventData - Additional data for the event
 */
export const trackEvent = (eventName, eventData = {}) => {
  if (!ANALYTICS_ENABLED) return;
  
  try {
    const event = {
      eventName,
      timestamp: new Date().toISOString(),
      sessionId: SESSION_ID,
      userId: localStorage.getItem('userId') || 'anonymous',
      data: eventData,
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer || '',
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`
    };
    
    // Add to queue
    eventQueue.push(event);
    
    // Log in debug mode
    if (DEBUG_MODE) {
      console.debug('[Analytics]', eventName, eventData);
    }
    
    // Flush if queue is full
    if (eventQueue.length >= BATCH_SIZE) {
      flushEvents();
    }
  } catch (error) {
    if (DEBUG_MODE) {
      console.error('[Analytics Error]', error);
    }
  }
};

/**
 * Track page view
 * @param {string} pageName - Name of the page
 * @param {Object} pageData - Additional data for the page view
 */
export const trackPageView = (pageName, pageData = {}) => {
  trackEvent('page_view', {
    pageName,
    ...pageData
  });
};

/**
 * Track error
 * @param {string} errorType - Type of error
 * @param {string} errorMessage - Error message
 * @param {Object} errorData - Additional data for the error
 */
export const trackError = (errorType, errorMessage, errorData = {}) => {
  trackEvent('error', {
    errorType,
    errorMessage,
    ...errorData
  });
};

/**
 * Flush events to the server
 */
const flushEvents = async () => {
  if (eventQueue.length === 0) return;
  
  const events = [...eventQueue];
  eventQueue = [];
  
  try {
    if (ANALYTICS_ENABLED) {
      await fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          clientTimestamp: new Date().toISOString()
        }),
        // Use keepalive to ensure the request completes even if the page is unloading
        keepalive: true
      });
    }
  } catch (error) {
    if (DEBUG_MODE) {
      console.error('[Analytics Flush Error]', error);
      // Put events back in queue on failure
      eventQueue = [...events, ...eventQueue];
    }
  }
};

// Set up interval to flush events periodically
let flushIntervalId;
if (typeof window !== 'undefined') {
  flushIntervalId = setInterval(flushEvents, FLUSH_INTERVAL);
  
  // Flush events when page is unloaded
  window.addEventListener('beforeunload', () => {
    clearInterval(flushIntervalId);
    flushEvents();
  });
}

// Export a default object for easier imports
export default {
  trackEvent,
  trackPageView,
  trackError
};
