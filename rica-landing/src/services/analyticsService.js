/**
 * Enhanced Analytics Service
 * 
 * This service handles comprehensive analytics tracking for payment-related events,
 * subscription management, and user interactions.
 * 
 * In a real application, this would send data to analytics platforms like Google Analytics,
 * Mixpanel, or a custom analytics backend.
 * 
 * @module analyticsService
 */

/**
 * Track an analytics event
 * 
 * @param {string} eventName - Name of the event
 * @param {Object} eventData - Event data
 * @param {Object} options - Tracking options
 * @returns {boolean} Success status
 */
const trackEvent = (eventName, eventData = {}, options = {}) => {
  try {
    // Add metadata
    const eventWithMetadata = {
      ...eventData,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      userId: getUserId(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      referrer: document.referrer || 'direct',
      path: window.location.pathname
    };
    
    // Log event to console in development
    if (!window.env || window.env.NODE_ENV !== 'production') {
      console.log(`[Analytics] ${eventName}:`, eventWithMetadata);
    }
    
    // In a real application, this would send data to an analytics platform
    // Example: googleAnalytics.trackEvent(eventName, eventWithMetadata);
    // Example: mixpanel.track(eventName, eventWithMetadata);
    
    // For demo purposes, store in localStorage with size limit
    const analyticsEvents = JSON.parse(localStorage.getItem('rica_analytics_events') || '[]');
    
    // Add event to the beginning of the array for more recent events first
    analyticsEvents.unshift({ eventName, ...eventWithMetadata });
    
    // Limit the number of stored events to prevent localStorage from growing too large
    const maxEvents = options.maxEvents || 1000;
    const trimmedEvents = analyticsEvents.slice(0, maxEvents);
    
    localStorage.setItem('rica_analytics_events', JSON.stringify(trimmedEvents));
    
    return true;
  } catch (error) {
    console.error('Error tracking event:', error);
    return false;
  }
};

/**
 * Get or create a unique session ID
 * 
 * @returns {string} Session ID
 */
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('rica_analytics_session_id');
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('rica_analytics_session_id', sessionId);
  }
  
  return sessionId;
};

/**
 * Get user ID from auth context or generate anonymous ID
 * 
 * @returns {string} User ID
 */
const getUserId = () => {
  // Try to get from localStorage (would be set during login)
  let userId = localStorage.getItem('rica_user_id');
  
  if (!userId) {
    // Generate anonymous ID if not logged in
    userId = localStorage.getItem('rica_anonymous_id');
    
    if (!userId) {
      userId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('rica_anonymous_id', userId);
    }
  }
  
  return userId;
};

/**
 * Track a page view
 * 
 * @param {string} pageName - Name of the page
 * @param {Object} pageData - Additional page data
 * @returns {boolean} Success status
 */
const trackPageView = (pageName, pageData = {}) => {
  // Add page-specific data
  const enhancedPageData = {
    pageName,
    title: document.title,
    url: window.location.href,
    pathname: window.location.pathname,
    referrer: document.referrer,
    loadTime: window.performance ? Math.round(performance.now()) : undefined,
    ...pageData
  };
  
  return trackEvent('page_view', enhancedPageData);
};

/**
 * Track payment started event
 * 
 * @param {Object} paymentData - Payment data
 * @returns {boolean} Success status
 */
const trackPaymentStarted = (paymentData) => {
  // Add payment flow data
  const enhancedPaymentData = {
    ...paymentData,
    paymentFlow: 'standard',
    startedAt: new Date().toISOString(),
    deviceType: getDeviceType(),
    paymentAttemptId: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  };
  
  return trackEvent('payment_started', enhancedPaymentData);
};

/**
 * Get device type based on user agent
 * 
 * @returns {string} Device type
 */
const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

/**
 * Track payment completed event
 * 
 * @param {Object} paymentData - Payment data
 * @returns {boolean} Success status
 */
const trackPaymentCompleted = (paymentData) => {
  // Add completion data
  const enhancedPaymentData = {
    ...paymentData,
    completedAt: paymentData.completedAt || new Date().toISOString(),
    processingTime: paymentData.processingTime || undefined,
    success: true
  };
  
  return trackEvent('payment_completed', enhancedPaymentData);
};

/**
 * Track payment failed event
 * 
 * @param {Object} paymentData - Payment data
 * @param {string} error - Error message
 * @returns {boolean} Success status
 */
const trackPaymentFailed = (paymentData, error) => {
  // Add failure data
  const enhancedPaymentData = {
    ...paymentData,
    failedAt: paymentData.failedAt || new Date().toISOString(),
    error,
    errorCode: paymentData.errorCode || 'UNKNOWN_ERROR',
    errorType: paymentData.errorType || 'Error',
    success: false
  };
  
  return trackEvent('payment_failed', enhancedPaymentData);
};

// Track subscription created
const trackSubscriptionCreated = (subscriptionData) => {
  return trackEvent('subscription_created', subscriptionData);
};

// Track subscription updated
const trackSubscriptionUpdated = (subscriptionData) => {
  return trackEvent('subscription_updated', subscriptionData);
};

// Track subscription cancelled
const trackSubscriptionCancelled = (subscriptionData) => {
  return trackEvent('subscription_cancelled', subscriptionData);
};

/**
 * Get analytics events with filtering and pagination
 * 
 * @param {Object} filter - Filter criteria
 * @param {Object} options - Options for pagination and sorting
 * @returns {Array} Filtered analytics events
 */
const getAnalyticsEvents = (filter = {}, options = {}) => {
  try {
    const events = JSON.parse(localStorage.getItem('rica_analytics_events') || '[]');
    let filteredEvents = events;
    
    // Apply filters if provided
    if (Object.keys(filter).length > 0) {
      filteredEvents = events.filter(event => {
        return Object.entries(filter).every(([key, value]) => {
          // Handle nested properties with dot notation (e.g., 'user.id')
          if (key.includes('.')) {
            const props = key.split('.');
            let propValue = event;
            for (const prop of props) {
              propValue = propValue?.[prop];
              if (propValue === undefined) return false;
            }
            return propValue === value;
          }
          
          // Handle array values (any match)
          if (Array.isArray(value)) {
            return value.includes(event[key]);
          }
          
          // Handle date range
          if (key === 'dateRange' && value.start && value.end) {
            const eventDate = new Date(event.timestamp);
            return eventDate >= new Date(value.start) && eventDate <= new Date(value.end);
          }
          
          // Regular equality check
          return event[key] === value;
        });
      });
    }
    
    // Apply sorting
    if (options.sortBy) {
      filteredEvents.sort((a, b) => {
        const aValue = a[options.sortBy];
        const bValue = b[options.sortBy];
        
        if (options.sortDir === 'desc') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
        
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      });
    }
    
    // Apply pagination
    if (options.page !== undefined && options.limit !== undefined) {
      const startIndex = options.page * options.limit;
      filteredEvents = filteredEvents.slice(startIndex, startIndex + options.limit);
    }
    
    return filteredEvents;
  } catch (error) {
    console.error('Error getting analytics events:', error);
    return [];
  }
};

/**
 * Clear all analytics events
 * 
 * @returns {boolean} Success status
 */
const clearAnalyticsEvents = () => {
  try {
    localStorage.removeItem('rica_analytics_events');
    return true;
  } catch (error) {
    console.error('Error clearing analytics events:', error);
    return false;
  }
};

/**
 * Get event counts by type
 * 
 * @param {Object} filter - Filter criteria
 * @returns {Object} Event counts by type
 */
const getEventCountsByType = (filter = {}) => {
  try {
    // Get events with optional filtering
    const events = getAnalyticsEvents(filter);
    
    // Count events by type
    return events.reduce((acc, event) => {
      acc[event.eventName] = (acc[event.eventName] || 0) + 1;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error getting event counts:', error);
    return {};
  }
};

/**
 * Get payment conversion rate with optional filters
 * 
 * @param {Object} filter - Filter criteria
 * @returns {Object} Conversion rate data
 */
const getPaymentConversionRate = (filter = {}) => {
  try {
    const events = JSON.parse(localStorage.getItem('rica_analytics_events') || '[]');
    let filteredEvents = events;
    
    // Apply filters if provided
    if (Object.keys(filter).length > 0) {
      filteredEvents = events.filter(event => {
        return Object.entries(filter).every(([key, value]) => event[key] === value);
      });
    }
    
    // Count payment started and completed events
    const startedEvents = filteredEvents.filter(event => event.eventName === 'payment_started');
    const completedEvents = filteredEvents.filter(event => event.eventName === 'payment_completed');
    const failedEvents = filteredEvents.filter(event => event.eventName === 'payment_failed');
    
    const startedCount = startedEvents.length;
    const completedCount = completedEvents.length;
    const failedCount = failedEvents.length;
    
    // Calculate conversion rate
    const conversionRate = startedCount === 0 ? 0 : (completedCount / startedCount) * 100;
    const failureRate = startedCount === 0 ? 0 : (failedCount / startedCount) * 100;
    
    // Calculate average processing time
    let avgProcessingTime = 0;
    if (completedEvents.length > 0) {
      const totalProcessingTime = completedEvents.reduce((sum, event) => {
        return sum + (event.processingTime || 0);
      }, 0);
      avgProcessingTime = totalProcessingTime / completedEvents.length;
    }
    
    return {
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      failureRate: parseFloat(failureRate.toFixed(2)),
      startedCount,
      completedCount,
      failedCount,
      abandonedCount: startedCount - completedCount - failedCount,
      avgProcessingTime
    };
  } catch (error) {
    console.error('Error calculating payment conversion rate:', error);
    return {
      conversionRate: 0,
      failureRate: 0,
      startedCount: 0,
      completedCount: 0,
      failedCount: 0,
      abandonedCount: 0,
      avgProcessingTime: 0
    };
  }
};

/**
 * Get payment method distribution
 * 
 * @param {Object} filter - Filter criteria
 * @returns {Object} Distribution data
 */
const getPaymentMethodDistribution = (filter = {}) => {
  try {
    // Get completed payments
    const completedPayments = getAnalyticsEvents({
      eventName: 'payment_completed',
      ...filter
    });
    
    // Count by payment method
    const distribution = completedPayments.reduce((acc, event) => {
      const method = event.paymentMethod || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate percentages
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    const percentages = {};
    
    for (const [method, count] of Object.entries(distribution)) {
      percentages[method] = total === 0 ? 0 : parseFloat(((count / total) * 100).toFixed(2));
    }
    
    return {
      distribution,
      percentages,
      total
    };
  } catch (error) {
    console.error('Error calculating payment method distribution:', error);
    return {
      distribution: {},
      percentages: {},
      total: 0
    };
  }
};

/**
 * Get revenue metrics
 * 
 * @param {Object} filter - Filter criteria
 * @returns {Object} Revenue metrics
 */
const getRevenueMetrics = (filter = {}) => {
  try {
    // Get completed payments
    const completedPayments = getAnalyticsEvents({
      eventName: 'payment_completed',
      ...filter
    });
    
    // Calculate total revenue by currency
    const revenueByCurrency = completedPayments.reduce((acc, event) => {
      const currency = event.currency || 'USD';
      const amount = parseFloat(event.amount) || 0;
      
      acc[currency] = (acc[currency] || 0) + amount;
      return acc;
    }, {});
    
    // Calculate average transaction value
    const avgTransactionValues = {};
    for (const [currency, total] of Object.entries(revenueByCurrency)) {
      const paymentsInCurrency = completedPayments.filter(p => p.currency === currency).length;
      avgTransactionValues[currency] = paymentsInCurrency === 0 ? 
        0 : parseFloat((total / paymentsInCurrency).toFixed(2));
    }
    
    return {
      revenueByCurrency,
      avgTransactionValues,
      totalTransactions: completedPayments.length
    };
  } catch (error) {
    console.error('Error calculating revenue metrics:', error);
    return {
      revenueByCurrency: {},
      avgTransactionValues: {},
      totalTransactions: 0
    };
  }
};

export default {
  // Tracking methods
  trackEvent,
  trackPageView,
  trackPaymentStarted,
  trackPaymentCompleted,
  trackPaymentFailed,
  trackSubscriptionCreated,
  trackSubscriptionUpdated,
  trackSubscriptionCancelled,
  
  // Data retrieval methods
  getAnalyticsEvents,
  clearAnalyticsEvents,
  getEventCountsByType,
  getPaymentConversionRate,
  getPaymentMethodDistribution,
  getRevenueMetrics,
  
  // Utility methods
  getSessionId,
  getUserId,
  getDeviceType
};
