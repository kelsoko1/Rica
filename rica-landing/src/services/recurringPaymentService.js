/**
 * Recurring Payment Service
 * 
 * This service handles recurring payments and subscription billing through ClickPesa.
 * It provides methods for creating, managing, and processing recurring payments.
 * 
 * @module recurringPaymentService
 * @version 1.0.0
 * @author Rica Development Team
 */

import { v4 as uuidv4 } from 'uuid';
import paymentService from './paymentService';
import paymentHistoryService from './paymentHistoryService';
import subscriptionService from './subscriptionService';
import analyticsService from './analyticsService';
import config from '../config/environment';

// Constants
const MAX_RETRY_ATTEMPTS = config.recurringPayments?.maxRetryAttempts || 3;
const RETRY_DELAY_MS = config.recurringPayments?.retryDelayMs || 3600000; // 1 hour by default
const MAX_BATCH_SIZE = config.recurringPayments?.maxBatchSize || 10;

// Storage key for recurring payments
const RECURRING_PAYMENTS_KEY = config.isProd 
  ? 'rica_prod_recurring_payments' 
  : 'rica_dev_recurring_payments';

// Encryption key for sensitive data (in a real app, this would be stored securely)
const ENCRYPTION_KEY = config.encryptionKey || 'default-dev-key-replace-in-production';

/**
 * Encrypt sensitive data
 * 
 * @param {Object} data - Data to encrypt
 * @returns {string} Encrypted data
 */
const encryptData = (data) => {
  if (!data) return null;
  
  try {
    // In a real production app, use a proper encryption library
    // This is a simple placeholder for demo purposes
    const jsonStr = JSON.stringify(data);
    return btoa(jsonStr); // Base64 encoding (NOT secure encryption)
  } catch (error) {
    console.error('Error encrypting data:', error);
    return null;
  }
};

/**
 * Decrypt sensitive data
 * 
 * @param {string} encryptedData - Encrypted data
 * @returns {Object} Decrypted data
 */
const decryptData = (encryptedData) => {
  if (!encryptedData) return null;
  
  try {
    // In a real production app, use a proper decryption library
    // This is a simple placeholder for demo purposes
    const jsonStr = atob(encryptedData); // Base64 decoding (NOT secure decryption)
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error decrypting data:', error);
    return null;
  }
};

/**
 * Get all recurring payments
 * 
 * @returns {Array} List of recurring payments
 */
const getRecurringPayments = () => {
  try {
    // Get encrypted payments from storage
    const paymentsData = localStorage.getItem(RECURRING_PAYMENTS_KEY) || '[]';
    const payments = JSON.parse(paymentsData);
    
    // Decrypt sensitive data for each payment
    return payments.map(payment => {
      if (payment.encryptedPaymentMethodDetails) {
        payment.paymentMethodDetails = decryptData(payment.encryptedPaymentMethodDetails);
        delete payment.encryptedPaymentMethodDetails;
      }
      return payment;
    });
  } catch (error) {
    console.error('Error getting recurring payments:', error);
    analyticsService.trackEvent('recurring_payment_error', {
      action: 'get_payments',
      error: error.message
    });
    return [];
  }
};

/**
 * Save recurring payments
 * 
 * @param {Array} payments - Recurring payments to save
 * @returns {boolean} Success status
 */
const saveRecurringPayments = (payments) => {
  try {
    // Encrypt sensitive data before saving
    const encryptedPayments = payments.map(payment => {
      const paymentCopy = { ...payment };
      
      // Encrypt payment method details if present
      if (paymentCopy.paymentMethodDetails) {
        paymentCopy.encryptedPaymentMethodDetails = encryptData(paymentCopy.paymentMethodDetails);
        delete paymentCopy.paymentMethodDetails;
      }
      
      return paymentCopy;
    });
    
    // Save encrypted payments
    localStorage.setItem(RECURRING_PAYMENTS_KEY, JSON.stringify(encryptedPayments));
    
    // In a production environment, this would be saved to a database
    if (config.isProd && config.apiBaseUrl) {
      // Example API call (commented out as it's just for illustration)
      /*
      fetch(`${config.apiBaseUrl}/recurring-payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify(encryptedPayments)
      });
      */
    }
    
    return true;
  } catch (error) {
    console.error('Error saving recurring payments:', error);
    analyticsService.trackEvent('recurring_payment_error', {
      action: 'save_payments',
      error: error.message
    });
    return false;
  }
};

/**
 * Get recurring payment by ID
 * 
 * @param {string} paymentId - Recurring payment ID
 * @returns {Object|null} Recurring payment or null if not found
 */
const getRecurringPaymentById = (paymentId) => {
  try {
    const payments = getRecurringPayments();
    return payments.find(payment => payment.id === paymentId) || null;
  } catch (error) {
    console.error('Error getting recurring payment by ID:', error);
    return null;
  }
};

/**
 * Create a new recurring payment
 * 
 * @param {Object} paymentData - Recurring payment data
 * @returns {Object} Created recurring payment
 */
const createRecurringPayment = (paymentData) => {
  try {
    // Validate required fields
    if (!paymentData.userId) {
      throw new Error('User ID is required');
    }
    
    if (!paymentData.amount || isNaN(paymentData.amount) || paymentData.amount <= 0) {
      throw new Error('Valid amount is required');
    }
    
    if (!paymentData.currency) {
      throw new Error('Currency is required');
    }
    
    if (!paymentData.frequency) {
      throw new Error('Payment frequency is required');
    }
    
    if (!paymentData.paymentMethod) {
      throw new Error('Payment method is required');
    }
    
    // Generate payment ID
    const paymentId = `rp_${uuidv4()}`;
    
    // Calculate next payment date
    const now = new Date();
    let nextPaymentDate;
    
    switch (paymentData.frequency) {
      case 'weekly':
        nextPaymentDate = new Date(now.setDate(now.getDate() + 7));
        break;
      case 'monthly':
        nextPaymentDate = new Date(now.setMonth(now.getMonth() + 1));
        break;
      case 'quarterly':
        nextPaymentDate = new Date(now.setMonth(now.getMonth() + 3));
        break;
      case 'annual':
        nextPaymentDate = new Date(now.setFullYear(now.getFullYear() + 1));
        break;
      default:
        nextPaymentDate = new Date(now.setMonth(now.getMonth() + 1)); // Default to monthly
    }
    
    // Create recurring payment object
    const recurringPayment = {
      id: paymentId,
      userId: paymentData.userId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      description: paymentData.description || 'Recurring payment',
      frequency: paymentData.frequency,
      paymentMethod: paymentData.paymentMethod,
      paymentMethodDetails: paymentData.paymentMethodDetails || {},
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nextPaymentDate: nextPaymentDate.toISOString(),
      lastPaymentDate: null,
      lastPaymentId: null,
      failedAttempts: 0,
      metadata: paymentData.metadata || {}
    };
    
    // Add mobile money details if applicable
    if (paymentData.paymentMethod === 'mobile_money' && paymentData.phoneNumber) {
      recurringPayment.phoneNumber = paymentData.phoneNumber;
    }
    
    // Save recurring payment
    const payments = getRecurringPayments();
    payments.push(recurringPayment);
    saveRecurringPayments(payments);
    
    // Track analytics event
    analyticsService.trackEvent('recurring_payment_created', {
      paymentId,
      userId: paymentData.userId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      frequency: paymentData.frequency,
      paymentMethod: paymentData.paymentMethod
    });
    
    return recurringPayment;
  } catch (error) {
    console.error('Error creating recurring payment:', error);
    throw error;
  }
};

/**
 * Update a recurring payment
 * 
 * @param {string} paymentId - Recurring payment ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated recurring payment
 */
const updateRecurringPayment = (paymentId, updateData) => {
  try {
    const payments = getRecurringPayments();
    const paymentIndex = payments.findIndex(payment => payment.id === paymentId);
    
    if (paymentIndex === -1) {
      throw new Error('Recurring payment not found');
    }
    
    // Get current payment
    const currentPayment = payments[paymentIndex];
    
    // Create updated payment
    const updatedPayment = {
      ...currentPayment,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    // Update payment
    payments[paymentIndex] = updatedPayment;
    saveRecurringPayments(payments);
    
    // Track analytics event
    analyticsService.trackEvent('recurring_payment_updated', {
      paymentId,
      userId: updatedPayment.userId,
      updates: Object.keys(updateData)
    });
    
    return updatedPayment;
  } catch (error) {
    console.error('Error updating recurring payment:', error);
    throw error;
  }
};

/**
 * Cancel a recurring payment
 * 
 * @param {string} paymentId - Recurring payment ID
 * @param {string} reason - Cancellation reason
 * @returns {Object} Cancelled recurring payment
 */
const cancelRecurringPayment = (paymentId, reason = '') => {
  try {
    const payments = getRecurringPayments();
    const paymentIndex = payments.findIndex(payment => payment.id === paymentId);
    
    if (paymentIndex === -1) {
      throw new Error('Recurring payment not found');
    }
    
    // Get current payment
    const currentPayment = payments[paymentIndex];
    
    // Update payment status
    const cancelledPayment = {
      ...currentPayment,
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
      cancellationReason: reason,
      cancellationDate: new Date().toISOString()
    };
    
    // Update payment
    payments[paymentIndex] = cancelledPayment;
    saveRecurringPayments(payments);
    
    // Track analytics event
    analyticsService.trackEvent('recurring_payment_cancelled', {
      paymentId,
      userId: cancelledPayment.userId,
      reason
    });
    
    return cancelledPayment;
  } catch (error) {
    console.error('Error cancelling recurring payment:', error);
    throw error;
  }
};

/**
 * Process a recurring payment with retry logic
 * 
 * @param {string} paymentId - Recurring payment ID
 * @returns {Object} Payment result
 */
const processRecurringPayment = async (paymentId) => {
  try {
    const recurringPayment = getRecurringPaymentById(paymentId);
    
    if (!recurringPayment) {
      throw new Error('Recurring payment not found');
    }
    
    if (recurringPayment.status !== 'active') {
      throw new Error(`Cannot process payment with status: ${recurringPayment.status}`);
    }
    
    // Generate reference with UUID for uniqueness
    const reference = `RICA-RP-${Date.now()}-${uuidv4().substring(0, 8)}`;
    
    // Create payment metadata
    const metadata = {
      recurringPaymentId: paymentId,
      userId: recurringPayment.userId,
      frequency: recurringPayment.frequency,
      isRecurring: true,
      environment: config.isProd ? 'production' : 'development'
    };
    
    // Process payment based on payment method
    let paymentResult;
    
    try {
      // Add transaction logging for production
      if (config.isProd) {
        console.info(`[${new Date().toISOString()}] Processing recurring payment ${paymentId} for user ${recurringPayment.userId}`);
      }
      
      if (recurringPayment.paymentMethod === 'mobile_money') {
        // Process mobile money payment
        paymentResult = await paymentService.createClickPesaPayment(
          recurringPayment.amount,
          recurringPayment.phoneNumber,
          `Rica Subscription - ${reference}`,
          reference,
          'mobile_money'
        );
      } else if (recurringPayment.paymentMethod === 'card') {
        // Process card payment
        paymentResult = await paymentService.createClickPesaPayment(
          recurringPayment.amount,
          '+00000000000', // Placeholder for card payments
          `Rica Subscription - ${reference}`,
          reference,
          'card'
        );
      } else if (recurringPayment.paymentMethod === 'wallet') {
        // Process wallet payment
        paymentResult = await paymentService.createClickPesaPayment(
          recurringPayment.amount,
          '+00000000000', // Placeholder for wallet payments
          `Rica Subscription - ${reference}`,
          reference,
          'wallet'
        );
      } else {
        throw new Error(`Unsupported payment method: ${recurringPayment.paymentMethod}`);
      }
    } catch (paymentError) {
      // Implement exponential backoff retry
      const failedAttempts = (recurringPayment.failedAttempts || 0) + 1;
      
      // Update recurring payment with failed attempt
      updateRecurringPayment(paymentId, {
        failedAttempts,
        lastFailedDate: new Date().toISOString(),
        lastFailedReason: paymentError.message,
        nextRetryDate: new Date(Date.now() + (RETRY_DELAY_MS * Math.pow(2, failedAttempts - 1))).toISOString()
      });
      
      // Track analytics event
      analyticsService.trackEvent('recurring_payment_retry_scheduled', {
        paymentId,
        userId: recurringPayment.userId,
        failedAttempts,
        error: paymentError.message,
        nextRetryDate: new Date(Date.now() + (RETRY_DELAY_MS * Math.pow(2, failedAttempts - 1))).toISOString()
      });
      
      // If too many failed attempts, pause the recurring payment
      if (failedAttempts >= MAX_RETRY_ATTEMPTS) {
        updateRecurringPayment(paymentId, {
          status: 'paused',
          pauseReason: `Payment failed after ${MAX_RETRY_ATTEMPTS} attempts`
        });
        
        // Track analytics event
        analyticsService.trackEvent('recurring_payment_paused', {
          paymentId,
          userId: recurringPayment.userId,
          reason: `Payment failed after ${MAX_RETRY_ATTEMPTS} attempts`,
          failedAttempts
        });
        
        // Send notification (in a real app)
        if (config.isProd && config.notificationService) {
          // Example notification (commented out as it's just for illustration)
          /*
          notificationService.sendNotification({
            userId: recurringPayment.userId,
            type: 'recurring_payment_paused',
            title: 'Recurring Payment Paused',
            message: `Your recurring payment has been paused after ${MAX_RETRY_ATTEMPTS} failed attempts.`,
            data: {
              paymentId,
              amount: recurringPayment.amount,
              currency: recurringPayment.currency
            }
          });
          */
        }
      }
      
      throw paymentError;
    }
    
    // Payment successful - update recurring payment with last payment info
    updateRecurringPayment(paymentId, {
      lastPaymentDate: new Date().toISOString(),
      lastPaymentId: paymentResult.transactionId,
      failedAttempts: 0,
      nextRetryDate: null,
      paymentCount: (recurringPayment.paymentCount || 0) + 1,
      totalPaid: (recurringPayment.totalPaid || 0) + parseFloat(recurringPayment.amount)
    });
    
    // Calculate next payment date
    const nextPaymentDate = calculateNextPaymentDate(recurringPayment);
    
    // Update next payment date
    updateRecurringPayment(paymentId, {
      nextPaymentDate: nextPaymentDate.toISOString()
    });
    
    // Track analytics event with detailed information
    analyticsService.trackEvent('recurring_payment_processed', {
      paymentId,
      userId: recurringPayment.userId,
      transactionId: paymentResult.transactionId,
      amount: recurringPayment.amount,
      currency: recurringPayment.currency,
      paymentMethod: recurringPayment.paymentMethod,
      frequency: recurringPayment.frequency,
      paymentCount: (recurringPayment.paymentCount || 0) + 1,
      nextPaymentDate: nextPaymentDate.toISOString(),
      processingTime: Date.now() - new Date(recurringPayment.nextPaymentDate).getTime()
    });
    
    // Send success notification (in a real app)
    if (config.isProd && config.notificationService) {
      // Example notification (commented out as it's just for illustration)
      /*
      notificationService.sendNotification({
        userId: recurringPayment.userId,
        type: 'recurring_payment_success',
        title: 'Recurring Payment Processed',
        message: `Your recurring payment of ${recurringPayment.amount} ${recurringPayment.currency} has been processed successfully.`,
        data: {
          paymentId,
          amount: recurringPayment.amount,
          currency: recurringPayment.currency,
          transactionId: paymentResult.transactionId
        }
      });
      */
    }
    
    return paymentResult;
  } catch (error) {
    console.error('Error processing recurring payment:', error);
    
    // Track analytics event
    analyticsService.trackEvent('recurring_payment_error', {
      paymentId,
      error: error.message,
      errorStack: config.isProd ? undefined : error.stack
    });
    
    throw error;
  }
};

/**
 * Calculate next payment date based on frequency
 * 
 * @param {Object} recurringPayment - Recurring payment
 * @returns {Date} Next payment date
 */
const calculateNextPaymentDate = (recurringPayment) => {
  const now = new Date();
  let nextPaymentDate;
  
  switch (recurringPayment.frequency) {
    case 'weekly':
      nextPaymentDate = new Date(now.setDate(now.getDate() + 7));
      break;
    case 'monthly':
      nextPaymentDate = new Date(now.setMonth(now.getMonth() + 1));
      break;
    case 'quarterly':
      nextPaymentDate = new Date(now.setMonth(now.getMonth() + 3));
      break;
    case 'annual':
      nextPaymentDate = new Date(now.setFullYear(now.getFullYear() + 1));
      break;
    default:
      nextPaymentDate = new Date(now.setMonth(now.getMonth() + 1)); // Default to monthly
  }
  
  return nextPaymentDate;
};

/**
 * Check for due recurring payments and process them with batching and rate limiting
 * 
 * @returns {Promise<Array>} Results of processed payments
 */
const processAllDuePayments = async () => {
  try {
    // Start time for performance tracking
    const startTime = Date.now();
    
    // Get all payments
    const payments = getRecurringPayments();
    const now = new Date();
    
    // Find payments that are due or need retry
    const duePayments = payments.filter(payment => {
      return (
        payment.status === 'active' && (
          // Regular scheduled payments
          new Date(payment.nextPaymentDate) <= now ||
          // Retry payments
          (payment.nextRetryDate && new Date(payment.nextRetryDate) <= now)
        )
      );
    });
    
    // Log batch processing start in production
    if (config.isProd) {
      console.info(`[${new Date().toISOString()}] Starting batch processing of ${duePayments.length} recurring payments`);
    }
    
    // Process payments in batches to avoid overloading the system
    const results = [];
    const batches = [];
    
    // Split into batches
    for (let i = 0; i < duePayments.length; i += MAX_BATCH_SIZE) {
      batches.push(duePayments.slice(i, i + MAX_BATCH_SIZE));
    }
    
    // Process each batch with rate limiting
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      
      // Process payments in parallel with concurrency limit
      const batchResults = await Promise.allSettled(
        batch.map(payment => processRecurringPayment(payment.id))
      );
      
      // Map results
      batchResults.forEach((result, index) => {
        const payment = batch[index];
        
        results.push({
          paymentId: payment.id,
          userId: payment.userId,
          success: result.status === 'fulfilled',
          result: result.status === 'fulfilled' ? result.value : null,
          error: result.status === 'rejected' ? result.reason?.message : null
        });
      });
      
      // Add rate limiting between batches if not the last batch
      if (batchIndex < batches.length - 1 && config.recurringPayments?.batchDelayMs) {
        await new Promise(resolve => setTimeout(resolve, config.recurringPayments.batchDelayMs));
      }
    }
    
    // Calculate performance metrics
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    // Track analytics event with detailed metrics
    analyticsService.trackEvent('recurring_payments_batch_processed', {
      totalProcessed: duePayments.length,
      successCount,
      failureCount,
      processingTime,
      averageProcessingTime: duePayments.length > 0 ? processingTime / duePayments.length : 0,
      batchCount: batches.length,
      timestamp: new Date().toISOString(),
      environment: config.isProd ? 'production' : 'development'
    });
    
    // Log completion in production
    if (config.isProd) {
      console.info(`[${new Date().toISOString()}] Completed batch processing: ${successCount} successful, ${failureCount} failed, took ${processingTime}ms`);
    }
    
    return results;
  } catch (error) {
    console.error('Error processing due payments:', error);
    
    // Track error
    analyticsService.trackEvent('recurring_payments_batch_error', {
      error: error.message,
      errorStack: config.isProd ? undefined : error.stack,
      timestamp: new Date().toISOString()
    });
    
    throw error;
  }
};

/**
 * Get recurring payments for a user
 * 
 * @param {string} userId - User ID
 * @returns {Array} User's recurring payments
 */
const getUserRecurringPayments = (userId) => {
  try {
    const payments = getRecurringPayments();
    return payments.filter(payment => payment.userId === userId);
  } catch (error) {
    console.error('Error getting user recurring payments:', error);
    return [];
  }
};

/**
 * Get recurring payment statistics
 * 
 * @returns {Object} Recurring payment statistics
 */
const getRecurringPaymentStats = () => {
  try {
    const payments = getRecurringPayments();
    
    // Count by status
    const statusCounts = payments.reduce((acc, payment) => {
      const status = payment.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    // Count by frequency
    const frequencyCounts = payments.reduce((acc, payment) => {
      const frequency = payment.frequency || 'unknown';
      acc[frequency] = (acc[frequency] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate total recurring revenue
    const recurringRevenue = payments
      .filter(payment => payment.status === 'active')
      .reduce((acc, payment) => {
        const currency = payment.currency || 'USD';
        const amount = payment.amount || 0;
        
        acc[currency] = (acc[currency] || 0) + amount;
        return acc;
      }, {});
    
    return {
      totalCount: payments.length,
      statusCounts,
      frequencyCounts,
      recurringRevenue
    };
  } catch (error) {
    console.error('Error getting recurring payment stats:', error);
    return {
      totalCount: 0,
      statusCounts: {},
      frequencyCounts: {},
      recurringRevenue: {}
    };
  }
};

// Export service
export default {
  getRecurringPayments,
  getRecurringPaymentById,
  createRecurringPayment,
  updateRecurringPayment,
  cancelRecurringPayment,
  processRecurringPayment,
  processAllDuePayments,
  getUserRecurringPayments,
  getRecurringPaymentStats
};
