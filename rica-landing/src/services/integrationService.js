/**
 * Integration Service
 * 
 * This service handles integration between rica-ui and rica-landing
 * for credit management and other shared functionality.
 * 
 * It provides credit tracking per user account, automatic redirection
 * when credits are depleted, and seamless communication between
 * Rica-UI and Rica-Landing applications.
 */

import creditService from './creditService';
import analyticsService from './analyticsService';
import { auth } from '../config/firebase';

// Constants
const CREDIT_CHECK_INTERVAL = 5000; // Check credits every 5 seconds
const LOW_CREDIT_THRESHOLD = 50; // Show warning when credits are below this threshold
const CRITICAL_CREDIT_THRESHOLD = 10; // Block features when credits are below this threshold
const ZERO_CREDIT_REDIRECT_DELAY = 3000; // Delay before redirecting when credits reach zero (3 seconds)

// Local storage keys for integration
const INTEGRATION_KEY = 'rica_integration';
const CREDIT_WARNING_SHOWN_KEY = 'rica_credit_warning_shown';
const USER_CREDIT_COUNTDOWN_KEY = 'rica_user_credit_countdown';
const REDIRECT_PENDING_KEY = 'rica_redirect_pending';

/**
 * Integration Service
 */
const integrationService = {
  /**
   * Initialize integration with rica-ui
   * 
   * @returns {Object} Integration status
   */
  initializeIntegration: () => {
    try {
      
      // Set up message listener for rica-ui
      window.addEventListener('message', (event) => {
        // Verify origin for security
        if (event.origin !== 'http://localhost:3000') return;
        
        const { type, data } = event.data;
        
        switch (type) {
          case 'CHECK_CREDITS':
            // Get current user from Firebase
            const currentUser = auth.currentUser;
            if (!currentUser) {
              console.error('No user is logged in');
              return;
            }
            
            const userId = currentUser.uid;
            const credits = creditService.getUserCredits(userId);
            
            // Send credit info back to rica-ui
            window.parent.postMessage({
              type: 'CREDIT_STATUS',
              data: {
                credits,
                lowCreditThreshold: LOW_CREDIT_THRESHOLD,
                criticalCreditThreshold: CRITICAL_CREDIT_THRESHOLD
              }
            }, 'http://localhost:3000');
            
            // If credits are zero, initiate redirect process
            if (credits <= 0) {
              integrationService.initiateZeroCreditRedirect(userId);
            }
            break;
            
          case 'USE_CREDITS':
            const { amount, feature } = data;
            try {
              // Get current user from Firebase
              const currentUser = auth.currentUser;
              if (!currentUser) {
                console.error('No user is logged in');
                throw new Error('User not authenticated');
              }
              
              const userId = currentUser.uid;
              creditService.useCredits(userId, amount, feature);
              const remainingCredits = creditService.getUserCredits(userId);
              
              // Update credit countdown for this user
              integrationService.updateUserCreditCountdown(userId, remainingCredits);
              
              window.parent.postMessage({
                type: 'CREDITS_USED',
                data: {
                  success: true,
                  remainingCredits
                }
              }, 'http://localhost:3000');
              
              // If credits are now zero, initiate redirect process
              if (remainingCredits <= 0) {
                integrationService.initiateZeroCreditRedirect(userId);
              }
              
              // Track credit usage in analytics
              analyticsService.trackEvent('credits_used', {
                userId,
                amount,
                feature,
                remainingCredits
              });
            } catch (error) {
              window.parent.postMessage({
                type: 'CREDITS_USED',
                data: {
                  success: false,
                  error: error.message
                }
              }, 'http://localhost:3000');
            }
            break;
            
          case 'START_CREDIT_COUNTDOWN':
            const { featureId, creditCost } = data;
            // Get current user from Firebase
            const currentUserForStart = auth.currentUser;
            if (!currentUserForStart) {
              console.error('No user is logged in');
              return;
            }
            
            integrationService.startCreditCountdown(currentUserForStart.uid, featureId, creditCost);
            break;
            
          case 'STOP_CREDIT_COUNTDOWN':
            const { featureId: stopFeatureId } = data;
            // Get current user from Firebase
            const currentUserForStop = auth.currentUser;
            if (!currentUserForStop) {
              console.error('No user is logged in');
              return;
            }
            
            integrationService.stopCreditCountdown(currentUserForStop.uid, stopFeatureId);
            break;
            
          default:
            break;
        }
      });
      
      // Store integration status
      const currentUserForStorage = auth.currentUser;
      localStorage.setItem(INTEGRATION_KEY, JSON.stringify({
        integrated: true,
        userId: currentUserForStorage ? currentUserForStorage.uid : null,
        timestamp: Date.now()
      }));
      
      // Initialize credit countdown tracking
      if (currentUserForStorage) {
        const userId = currentUserForStorage.uid;
        localStorage.setItem(USER_CREDIT_COUNTDOWN_KEY, JSON.stringify({
          [userId]: {
            activeFeatures: {},
            lastUpdated: new Date().toISOString()
          }
        }));
        
        // Track integration
        analyticsService.trackEvent('integration_initialized', {
          userId,
          timestamp: new Date().toISOString()
        });
      }
      
      return {
        success: true,
        message: 'Integration initialized successfully'
      };
    } catch (error) {
      console.error('Error initializing integration:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Start credit countdown for a feature
   * 
   * @param {string} userId - User ID
   * @param {string} featureId - Feature ID
   * @param {number} creditCost - Credit cost per interval
   * @returns {boolean} Success status
   */
  startCreditCountdown: (userId, featureId, creditCost) => {
    try {
      if (!userId) throw new Error('User ID is required');
      if (!featureId) throw new Error('Feature ID is required');
      if (!creditCost || isNaN(creditCost) || creditCost <= 0) {
        throw new Error('Valid credit cost is required');
      }
      
      // Get user credit countdown data
      const countdownDataStr = localStorage.getItem(USER_CREDIT_COUNTDOWN_KEY);
      const countdownData = countdownDataStr ? JSON.parse(countdownDataStr) : {};
      
      // Initialize user data if not exists
      if (!countdownData[userId]) {
        countdownData[userId] = {
          activeFeatures: {},
          lastUpdated: new Date().toISOString()
        };
      }
      
      // Add feature to active features
      countdownData[userId].activeFeatures[featureId] = {
        creditCost,
        startTime: new Date().toISOString(),
        lastDeducted: new Date().toISOString()
      };
      
      // Update last updated timestamp
      countdownData[userId].lastUpdated = new Date().toISOString();
      
      // Save updated data
      localStorage.setItem(USER_CREDIT_COUNTDOWN_KEY, JSON.stringify(countdownData));
      
      // Start interval to deduct credits if not already running
      if (!window.creditCountdownInterval) {
        window.creditCountdownInterval = setInterval(() => {
          integrationService.processAllCreditCountdowns();
        }, CREDIT_CHECK_INTERVAL);
      }
      
      return true;
    } catch (error) {
      console.error('Error starting credit countdown:', error);
      return false;
    }
  },
  
  /**
   * Stop credit countdown for a feature
   * 
   * @param {string} userId - User ID
   * @param {string} featureId - Feature ID
   * @returns {boolean} Success status
   */
  stopCreditCountdown: (userId, featureId) => {
    try {
      if (!userId) throw new Error('User ID is required');
      if (!featureId) throw new Error('Feature ID is required');
      
      // Get user credit countdown data
      const countdownDataStr = localStorage.getItem(USER_CREDIT_COUNTDOWN_KEY);
      const countdownData = countdownDataStr ? JSON.parse(countdownDataStr) : {};
      
      // Check if user and feature exist
      if (!countdownData[userId] || !countdownData[userId].activeFeatures[featureId]) {
        return false;
      }
      
      // Remove feature from active features
      delete countdownData[userId].activeFeatures[featureId];
      
      // Update last updated timestamp
      countdownData[userId].lastUpdated = new Date().toISOString();
      
      // Save updated data
      localStorage.setItem(USER_CREDIT_COUNTDOWN_KEY, JSON.stringify(countdownData));
      
      // If no active features for any user, clear interval
      let hasActiveFeatures = false;
      Object.keys(countdownData).forEach(uid => {
        if (Object.keys(countdownData[uid].activeFeatures).length > 0) {
          hasActiveFeatures = true;
        }
      });
      
      if (!hasActiveFeatures && window.creditCountdownInterval) {
        clearInterval(window.creditCountdownInterval);
        window.creditCountdownInterval = null;
      }
      
      return true;
    } catch (error) {
      console.error('Error stopping credit countdown:', error);
      return false;
    }
  },
  
  /**
   * Process all credit countdowns for all users
   */
  processAllCreditCountdowns: () => {
    try {
      // Get user credit countdown data
      const countdownDataStr = localStorage.getItem(USER_CREDIT_COUNTDOWN_KEY);
      if (!countdownDataStr) return;
      
      const countdownData = JSON.parse(countdownDataStr);
      const now = new Date();
      let dataUpdated = false;
      
      // Process each user
      Object.keys(countdownData).forEach(userId => {
        const userData = countdownData[userId];
        const { activeFeatures } = userData;
        
        // Process each active feature
        Object.keys(activeFeatures).forEach(featureId => {
          const feature = activeFeatures[featureId];
          const lastDeducted = new Date(feature.lastDeducted);
          
          // Check if it's time to deduct credits (every CREDIT_CHECK_INTERVAL)
          if (now - lastDeducted >= CREDIT_CHECK_INTERVAL) {
            // Deduct credits
            try {
              creditService.useCredits(userId, feature.creditCost, `countdown_${featureId}`);
              
              // Update last deducted time
              feature.lastDeducted = now.toISOString();
              dataUpdated = true;
              
              // Get remaining credits
              const remainingCredits = creditService.getUserCredits(userId);
              
              // Update credit countdown for this user
              integrationService.updateUserCreditCountdown(userId, remainingCredits);
              
              // If credits are now zero, initiate redirect process
              if (remainingCredits <= 0) {
                integrationService.initiateZeroCreditRedirect(userId);
              }
            } catch (error) {
              console.error(`Error deducting credits for feature ${featureId}:`, error);
              
              // If error is due to insufficient credits, stop the countdown
              if (error.message.includes('insufficient') || error.message.includes('not enough')) {
                delete activeFeatures[featureId];
                dataUpdated = true;
                
                // Initiate redirect process
                integrationService.initiateZeroCreditRedirect(userId);
              }
            }
          }
        });
      });
      
      // Save updated data if changed
      if (dataUpdated) {
        localStorage.setItem(USER_CREDIT_COUNTDOWN_KEY, JSON.stringify(countdownData));
      }
    } catch (error) {
      console.error('Error processing credit countdowns:', error);
    }
  },
  
  /**
   * Update user credit countdown in Rica-UI
   * 
   * @param {string} userId - User ID
   * @param {number} remainingCredits - Remaining credits
   */
  updateUserCreditCountdown: (userId, remainingCredits) => {
    try {
      // Send updated credit info to Rica-UI
      window.parent.postMessage({
        type: 'CREDIT_COUNTDOWN_UPDATE',
        data: {
          userId,
          remainingCredits,
          lowCreditThreshold: LOW_CREDIT_THRESHOLD,
          criticalCreditThreshold: CRITICAL_CREDIT_THRESHOLD
        }
      }, 'http://localhost:3000');
    } catch (error) {
      console.error('Error updating user credit countdown:', error);
    }
  },
  
  /**
   * Initiate redirect to Rica-landing when credits reach zero
   * 
   * @param {string} userId - User ID
   */
  initiateZeroCreditRedirect: (userId) => {
    try {
      // Check if redirect is already pending
      const redirectPendingStr = localStorage.getItem(REDIRECT_PENDING_KEY);
      if (redirectPendingStr) {
        const redirectPending = JSON.parse(redirectPendingStr);
        if (redirectPending[userId]) return; // Already pending redirect for this user
      }
      
      // Set redirect pending flag
      const redirectPending = redirectPendingStr ? JSON.parse(redirectPendingStr) : {};
      redirectPending[userId] = {
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(REDIRECT_PENDING_KEY, JSON.stringify(redirectPending));
      
      // Notify Rica-UI about imminent redirect
      window.parent.postMessage({
        type: 'ZERO_CREDIT_REDIRECT_IMMINENT',
        data: {
          userId,
          redirectDelay: ZERO_CREDIT_REDIRECT_DELAY,
          redirectUrl: '/credits'
        }
      }, 'http://localhost:3000');
      
      // Set timeout for redirect
      setTimeout(() => {
        // Final notification before redirect
        window.parent.postMessage({
          type: 'ZERO_CREDIT_REDIRECTING',
          data: {
            userId,
            redirectUrl: '/credits'
          }
        }, 'http://localhost:3000');
        
        // Redirect to credits page
        window.location.href = '/credits';
        
        // Clear redirect pending flag
        const currentRedirectPendingStr = localStorage.getItem(REDIRECT_PENDING_KEY);
        if (currentRedirectPendingStr) {
          const currentRedirectPending = JSON.parse(currentRedirectPendingStr);
          delete currentRedirectPending[userId];
          localStorage.setItem(REDIRECT_PENDING_KEY, JSON.stringify(currentRedirectPending));
        }
      }, ZERO_CREDIT_REDIRECT_DELAY);
    } catch (error) {
      console.error('Error initiating zero credit redirect:', error);
    }
  },
  
  /**
   * Check if user has enough credits for a feature
   * 
   * @param {string} userId - User ID
   * @param {string} feature - Feature name
   * @returns {boolean} Whether user has enough credits
   */
  hasEnoughCreditsForFeature: (userId, feature) => {
    try {
      if (!userId) throw new Error('User ID is required');
      if (!feature) throw new Error('Feature is required');
      
      const credits = creditService.getUserCredits(userId);
      const featureCost = creditService.creditCosts[feature];
      
      if (!featureCost) {
        throw new Error(`Unknown feature: ${feature}`);
      }
      
      return credits >= featureCost;
    } catch (error) {
      console.error('Error checking credits for feature:', error);
      return false;
    }
  },
  
  /**
   * Show credit purchase prompt
   * 
   * @param {string} userId - User ID
   * @param {string} feature - Feature that requires credits
   * @returns {Promise<boolean>} Whether user purchased credits
   */
  showCreditPurchasePrompt: async (userId, feature) => {
    try {
      if (!userId) throw new Error('User ID is required');
      
      const credits = creditService.getUserCredits(userId);
      const featureCost = feature ? creditService.creditCosts[feature] : 0;
      
      // Check if warning was recently shown
      const warningShown = localStorage.getItem(CREDIT_WARNING_SHOWN_KEY);
      const warningTimestamp = warningShown ? JSON.parse(warningShown).timestamp : 0;
      const now = new Date().getTime();
      
      // Only show warning once per hour
      if (now - warningTimestamp < 3600000) {
        return false;
      }
      
      // Create modal dialog
      return new Promise((resolve) => {
        // Create modal elements
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '9999';
        
        const modalContent = document.createElement('div');
        modalContent.style.backgroundColor = '#fff';
        modalContent.style.borderRadius = '8px';
        modalContent.style.padding = '24px';
        modalContent.style.width = '400px';
        modalContent.style.maxWidth = '90%';
        modalContent.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        
        const title = document.createElement('h3');
        title.textContent = 'Low Credit Balance';
        title.style.margin = '0 0 16px 0';
        title.style.color = '#1976d2';
        
        const message = document.createElement('p');
        message.textContent = feature 
          ? `You don't have enough credits to use this feature. You need ${featureCost} credits, but you only have ${credits} credits.`
          : `Your credit balance is running low. You currently have ${credits} credits.`;
        message.style.marginBottom = '16px';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.gap = '8px';
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.padding = '8px 16px';
        cancelButton.style.border = '1px solid #ccc';
        cancelButton.style.borderRadius = '4px';
        cancelButton.style.backgroundColor = '#f5f5f5';
        cancelButton.style.cursor = 'pointer';
        
        const buyButton = document.createElement('button');
        buyButton.textContent = 'Buy Credits';
        buyButton.style.padding = '8px 16px';
        buyButton.style.border = 'none';
        buyButton.style.borderRadius = '4px';
        buyButton.style.backgroundColor = '#1976d2';
        buyButton.style.color = '#fff';
        buyButton.style.cursor = 'pointer';
        
        // Add event listeners
        cancelButton.addEventListener('click', () => {
          document.body.removeChild(modal);
          resolve(false);
        });
        
        buyButton.addEventListener('click', () => {
          document.body.removeChild(modal);
          
          // Store warning shown timestamp
          localStorage.setItem(CREDIT_WARNING_SHOWN_KEY, JSON.stringify({
            timestamp: new Date().getTime()
          }));
          
          // Navigate to credits page
          window.location.href = '/credits';
          resolve(true);
        });
        
        // Assemble modal
        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(buyButton);
        
        modalContent.appendChild(title);
        modalContent.appendChild(message);
        modalContent.appendChild(buttonContainer);
        
        modal.appendChild(modalContent);
        
        // Add to DOM
        document.body.appendChild(modal);
      });
    } catch (error) {
      console.error('Error showing credit purchase prompt:', error);
      return false;
    }
  },
  
  /**
   * Use credits for a feature and handle low credit scenarios
   * 
   * @param {string} userId - User ID
   * @param {string} feature - Feature name
   * @returns {Promise<boolean>} Whether credits were used successfully
   */
  useCreditsForFeature: async (userId, feature) => {
    try {
      if (!userId) throw new Error('User ID is required');
      if (!feature) throw new Error('Feature is required');
      
      const credits = creditService.getUserCredits(userId);
      const featureCost = creditService.creditCosts[feature];
      
      if (!featureCost) {
        throw new Error(`Unknown feature: ${feature}`);
      }
      
      // Check if user has enough credits
      if (credits < featureCost) {
        // Show purchase prompt
        const purchased = await integrationService.showCreditPurchasePrompt(userId, feature);
        
        // If user didn't purchase, return false
        if (!purchased) {
          return false;
        }
        
        // Check credits again after potential purchase
        const updatedCredits = creditService.getUserCredits(userId);
        if (updatedCredits < featureCost) {
          return false;
        }
      }
      
      // Use credits
      creditService.useCredits(userId, featureCost, feature);
      
      return true;
    } catch (error) {
      console.error('Error using credits for feature:', error);
      return false;
    }
  }
};

export default integrationService;
