/**
 * Credit Service
 * 
 * This service handles credit management for Rica.
 * Credits can be purchased and used for various features.
 */

import analyticsService from './analyticsService';
import paymentService from './paymentService.jsx';
import paymentHistoryService from './paymentHistoryService';

// Local storage key for credits
const CREDITS_KEY = 'rica_credits';
const CREDIT_TRANSACTIONS_KEY = 'rica_credit_transactions';

// Credit packages
export const creditPackages = {
  small: {
    id: 'small',
    name: 'Basic',
    amount: 250,
    price: 10,
    currency: 'USD',
    description: '250 credits for $10',
    popular: false
  },
  medium: {
    id: 'medium',
    name: 'Standard',
    amount: 500,
    price: 20,
    currency: 'USD',
    description: '500 credits for $20',
    popular: true
  },
  large: {
    id: 'large',
    name: 'Premium',
    amount: 1000,
    price: 40,
    currency: 'USD',
    description: '1000 credits for $40',
    popular: false
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    amount: 2500,
    price: 100,
    currency: 'USD',
    description: '2500 credits for $100',
    popular: false
  }
};

// Credit usage costs for different features
export const creditCosts = {
  threatScan: 5,
  profileCreation: 10,
  automationTask: 15,
  deviceLinking: 20,
  advancedAnalytics: 25,
  customReport: 30
};

// Get user credits
const getUserCredits = (userId) => {
  try {
    const creditsData = localStorage.getItem(CREDITS_KEY);
    const creditsMap = creditsData ? JSON.parse(creditsData) : {};
    return creditsMap[userId] || 0;
  } catch (error) {
    console.error('Error getting user credits:', error);
    return 0;
  }
};

// Set user credits
const setUserCredits = (userId, amount) => {
  try {
    const creditsData = localStorage.getItem(CREDITS_KEY);
    const creditsMap = creditsData ? JSON.parse(creditsData) : {};
    creditsMap[userId] = amount;
    localStorage.setItem(CREDITS_KEY, JSON.stringify(creditsMap));
  } catch (error) {
    console.error('Error setting user credits:', error);
    throw error;
  }
};

// Add credits to user
const addCredits = (userId, amount, source, metadata = {}) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('Invalid credit amount');
    }

    const currentCredits = getUserCredits(userId);
    const newTotal = currentCredits + amount;
    setUserCredits(userId, newTotal);

    // Record transaction
    recordCreditTransaction(userId, {
      type: 'credit',
      amount,
      balance: newTotal,
      source,
      timestamp: new Date().toISOString(),
      metadata
    });

    // Track analytics
    analyticsService.trackCreditsAdded({
      userId,
      amount,
      newTotal,
      source,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      previousBalance: currentCredits,
      addedCredits: amount,
      newBalance: newTotal
    };
  } catch (error) {
    console.error('Error adding credits:', error);
    throw error;
  }
};

// Use credits
const useCredits = (userId, amount, feature, metadata = {}) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('Invalid credit amount');
    }

    const currentCredits = getUserCredits(userId);
    
    // Check if user has enough credits
    if (currentCredits < amount) {
      throw new Error('Insufficient credits');
    }

    const newTotal = currentCredits - amount;
    setUserCredits(userId, newTotal);

    // Record transaction
    recordCreditTransaction(userId, {
      type: 'debit',
      amount: -amount,
      balance: newTotal,
      feature,
      timestamp: new Date().toISOString(),
      metadata
    });

    // Track analytics
    analyticsService.trackCreditsUsed({
      userId,
      amount,
      newTotal,
      feature,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      previousBalance: currentCredits,
      usedCredits: amount,
      newBalance: newTotal
    };
  } catch (error) {
    console.error('Error using credits:', error);
    throw error;
  }
};

// Purchase credits
const purchaseCredits = async (userId, packageId, paymentMethod, paymentDetails) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!packageId || !creditPackages[packageId]) {
      throw new Error('Invalid credit package');
    }

    const creditPackage = creditPackages[packageId];
    const { price, amount, currency } = creditPackage;

    // Process payment
    const paymentResponse = await paymentService.createClickPesaPayment(
      price,
      paymentDetails.phoneNumber,
      `Purchase of ${amount} Rica credits`,
      `CREDITS-${userId}-${Date.now()}`,
      paymentMethod
    );

    // If payment is successful or pending, add credits
    if (paymentResponse.success) {
      // For demo purposes, we'll add credits immediately
      // In production, you would add credits only after payment confirmation
      addCredits(userId, amount, 'purchase', {
        packageId,
        transactionId: paymentResponse.transactionId,
        paymentMethod
      });

      return {
        success: true,
        transactionId: paymentResponse.transactionId,
        amount,
        price,
        currency,
        status: paymentResponse.status,
        message: `Successfully purchased ${amount} credits`
      };
    } else {
      throw new Error('Payment failed');
    }
  } catch (error) {
    console.error('Error purchasing credits:', error);
    throw error;
  }
};

// Get credit transactions
const getCreditTransactions = (userId) => {
  try {
    const transactionsData = localStorage.getItem(CREDIT_TRANSACTIONS_KEY);
    const transactionsMap = transactionsData ? JSON.parse(transactionsData) : {};
    return transactionsMap[userId] || [];
  } catch (error) {
    console.error('Error getting credit transactions:', error);
    return [];
  }
};

// Record credit transaction
const recordCreditTransaction = (userId, transaction) => {
  try {
    const transactionsData = localStorage.getItem(CREDIT_TRANSACTIONS_KEY);
    const transactionsMap = transactionsData ? JSON.parse(transactionsData) : {};
    
    if (!transactionsMap[userId]) {
      transactionsMap[userId] = [];
    }
    
    // Add transaction ID
    transaction.id = `trans_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Add to transactions
    transactionsMap[userId].unshift(transaction);
    
    // Limit to 100 transactions per user
    if (transactionsMap[userId].length > 100) {
      transactionsMap[userId] = transactionsMap[userId].slice(0, 100);
    }
    
    localStorage.setItem(CREDIT_TRANSACTIONS_KEY, JSON.stringify(transactionsMap));
    
    return transaction;
  } catch (error) {
    console.error('Error recording credit transaction:', error);
    throw error;
  }
};

// Get credit metrics
const getCreditMetrics = (userId) => {
  try {
    const transactions = getCreditTransactions(userId);
    const currentBalance = getUserCredits(userId);
    
    // Calculate metrics
    const totalPurchased = transactions
      .filter(t => t.type === 'credit' && t.source === 'purchase')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalUsed = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const usageByFeature = transactions
      .filter(t => t.type === 'debit' && t.feature)
      .reduce((acc, t) => {
        const feature = t.feature;
        if (!acc[feature]) acc[feature] = 0;
        acc[feature] += Math.abs(t.amount);
        return acc;
      }, {});
    
    return {
      currentBalance,
      totalPurchased,
      totalUsed,
      usageByFeature
    };
  } catch (error) {
    console.error('Error getting credit metrics:', error);
    return {
      currentBalance: 0,
      totalPurchased: 0,
      totalUsed: 0,
      usageByFeature: {}
    };
  }
};

export default {
  creditPackages,
  creditCosts,
  getUserCredits,
  addCredits,
  useCredits,
  purchaseCredits,
  getCreditTransactions,
  getCreditMetrics
};
