/**
 * Subscription Service
 * 
 * This service handles subscription management for Rica.
 * In a real application, this would interact with a backend API.
 */

import analyticsService from './analyticsService';

// Local storage key for subscriptions
const SUBSCRIPTIONS_KEY = 'rica_subscriptions';

// Subscription plans
export const subscriptionPlans = {
  personal: {
    id: 'personal',
    name: 'Personal',
    description: 'Essential online protection for individuals',
    price: {
      monthly: 9.99,
      annual: 99.99, // ~17% discount for annual
    },
    features: [
      'AI-powered cyberbullying detection',
      'Leak monitoring for 1 email',
      'Basic identity protection',
      '24/7 AI threat monitoring',
      'Email support',
      'Devices protection'
    ]
  },
  team: {
    id: 'team',
    name: 'Team',
    description: 'Collaborative protection for teams',
    price: {
      monthly: 29.99,
      annual: 299.99, // ~17% discount for annual
    },
    features: [
      'All Personal features',
      'Per-user billing (billed to team leader)',
      'Team safety monitoring',
      'Shared threat intelligence',
      'Priority email & chat support',
      'Devices protection per user',
      'Team dashboard',
      'Basic API access',
      'Centralized billing'
    ]
  },
  payAsYouGo: {
    id: 'payAsYouGo',
    name: 'Pay As You Go',
    description: 'Flexible usage with token-based protection',
    price: {
      monthly: 5, // Base fee
      tokens: 100, // Tokens included in base fee
      additionalTokenPrice: 0.05 // Price per additional token
    },
    features: [
      '$5 monthly base fee',
      'Includes 100 tokens',
      'Additional tokens at $0.05 each',
      'Tokens never expire',
      'Top up anytime',
      'No long-term commitment',
      'Ideal for custom needs',
      'Usage analytics dashboard'
    ]
  }
};

// Get all subscriptions
const getSubscriptions = () => {
  try {
    const subscriptions = localStorage.getItem(SUBSCRIPTIONS_KEY);
    return subscriptions ? JSON.parse(subscriptions) : [];
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return [];
  }
};

// Get subscription by ID
const getSubscriptionById = (subscriptionId) => {
  try {
    const subscriptions = getSubscriptions();
    return subscriptions.find(s => s.id === subscriptionId) || null;
  } catch (error) {
    console.error('Error getting subscription by ID:', error);
    return null;
  }
};

// Get user subscriptions
const getUserSubscriptions = (userId) => {
  try {
    const subscriptions = getSubscriptions();
    return subscriptions.filter(s => s.userId === userId);
  } catch (error) {
    console.error('Error getting user subscriptions:', error);
    return [];
  }
};

// Get active user subscription
const getActiveUserSubscription = (userId) => {
  try {
    const subscriptions = getUserSubscriptions(userId);
    return subscriptions.find(s => s.status === 'active') || null;
  } catch (error) {
    console.error('Error getting active user subscription:', error);
    return null;
  }
};

// Create subscription
const createSubscription = (subscriptionData) => {
  try {
    const subscriptions = getSubscriptions();
    
    // Generate subscription ID
    const subscriptionId = `sub_${Date.now()}`;
    
    // Calculate expiration date
    const now = new Date();
    const expirationDate = new Date(now);
    
    if (subscriptionData.billingCycle === 'annual') {
      expirationDate.setFullYear(now.getFullYear() + 1);
    } else {
      expirationDate.setMonth(now.getMonth() + 1);
    }
    
    // Create subscription object
    const subscription = {
      id: subscriptionId,
      userId: subscriptionData.userId,
      planId: subscriptionData.planId,
      billingCycle: subscriptionData.billingCycle,
      price: subscriptionPlans[subscriptionData.planId].price[subscriptionData.billingCycle],
      currency: subscriptionData.currency || 'USD',
      status: 'active',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: expirationDate.toISOString(),
      paymentMethod: subscriptionData.paymentMethod,
      paymentMethodDetails: subscriptionData.paymentMethodDetails || {},
      metadata: subscriptionData.metadata || {}
    };
    
    // Add to subscriptions
    subscriptions.push(subscription);
    
    // Save to localStorage
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
    
    // Track subscription created
    analyticsService.trackSubscriptionCreated({
      subscriptionId,
      planId: subscriptionData.planId,
      billingCycle: subscriptionData.billingCycle,
      price: subscription.price,
      currency: subscription.currency
    });
    
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Update subscription
const updateSubscription = (subscriptionId, updateData) => {
  try {
    const subscriptions = getSubscriptions();
    const index = subscriptions.findIndex(s => s.id === subscriptionId);
    
    if (index === -1) {
      throw new Error('Subscription not found');
    }
    
    // Update subscription
    const updatedSubscription = {
      ...subscriptions[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    // Replace in array
    subscriptions[index] = updatedSubscription;
    
    // Save to localStorage
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
    
    // Track subscription updated
    analyticsService.trackSubscriptionUpdated({
      subscriptionId,
      ...updateData
    });
    
    return updatedSubscription;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

// Cancel subscription
const cancelSubscription = (subscriptionId, reason = '') => {
  try {
    const subscriptions = getSubscriptions();
    const index = subscriptions.findIndex(s => s.id === subscriptionId);
    
    if (index === -1) {
      throw new Error('Subscription not found');
    }
    
    // Update subscription
    const updatedSubscription = {
      ...subscriptions[index],
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason,
      updatedAt: new Date().toISOString()
    };
    
    // Replace in array
    subscriptions[index] = updatedSubscription;
    
    // Save to localStorage
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
    
    // Track subscription cancelled
    analyticsService.trackSubscriptionCancelled({
      subscriptionId,
      reason
    });
    
    return updatedSubscription;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

// Renew subscription
const renewSubscription = (subscriptionId) => {
  try {
    const subscriptions = getSubscriptions();
    const index = subscriptions.findIndex(s => s.id === subscriptionId);
    
    if (index === -1) {
      throw new Error('Subscription not found');
    }
    
    const subscription = subscriptions[index];
    
    // Calculate new expiration date
    const currentPeriodEnd = new Date(subscription.currentPeriodEnd);
    const newPeriodStart = new Date(currentPeriodEnd);
    const newPeriodEnd = new Date(newPeriodStart);
    
    if (subscription.billingCycle === 'annual') {
      newPeriodEnd.setFullYear(newPeriodStart.getFullYear() + 1);
    } else {
      newPeriodEnd.setMonth(newPeriodStart.getMonth() + 1);
    }
    
    // Update subscription
    const updatedSubscription = {
      ...subscription,
      status: 'active',
      currentPeriodStart: newPeriodStart.toISOString(),
      currentPeriodEnd: newPeriodEnd.toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Replace in array
    subscriptions[index] = updatedSubscription;
    
    // Save to localStorage
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
    
    // Track subscription renewed
    analyticsService.trackEvent('subscription_renewed', {
      subscriptionId,
      newPeriodStart: newPeriodStart.toISOString(),
      newPeriodEnd: newPeriodEnd.toISOString()
    });
    
    return updatedSubscription;
  } catch (error) {
    console.error('Error renewing subscription:', error);
    throw error;
  }
};

// Change subscription plan
const changeSubscriptionPlan = (subscriptionId, newPlanId, newBillingCycle) => {
  try {
    const subscriptions = getSubscriptions();
    const index = subscriptions.findIndex(s => s.id === subscriptionId);
    
    if (index === -1) {
      throw new Error('Subscription not found');
    }
    
    const subscription = subscriptions[index];
    const newPlan = subscriptionPlans[newPlanId];
    
    if (!newPlan) {
      throw new Error('Invalid plan ID');
    }
    
    // Calculate price difference for proration
    const oldPrice = subscription.price;
    const newPrice = newPlan.price[newBillingCycle || subscription.billingCycle];
    const priceDifference = newPrice - oldPrice;
    
    // Update subscription
    const updatedSubscription = {
      ...subscription,
      planId: newPlanId,
      billingCycle: newBillingCycle || subscription.billingCycle,
      price: newPrice,
      updatedAt: new Date().toISOString(),
      proration: {
        priceDifference,
        oldPlanId: subscription.planId,
        oldBillingCycle: subscription.billingCycle,
        oldPrice
      }
    };
    
    // Replace in array
    subscriptions[index] = updatedSubscription;
    
    // Save to localStorage
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
    
    // Track subscription plan changed
    analyticsService.trackEvent('subscription_plan_changed', {
      subscriptionId,
      oldPlanId: subscription.planId,
      newPlanId,
      oldBillingCycle: subscription.billingCycle,
      newBillingCycle: newBillingCycle || subscription.billingCycle,
      priceDifference
    });
    
    return updatedSubscription;
  } catch (error) {
    console.error('Error changing subscription plan:', error);
    throw error;
  }
};

// Get subscription metrics
const getSubscriptionMetrics = () => {
  try {
    const subscriptions = getSubscriptions();
    
    // Count by status
    const countByStatus = subscriptions.reduce((counts, sub) => {
      counts[sub.status] = (counts[sub.status] || 0) + 1;
      return counts;
    }, {});
    
    // Count by plan
    const countByPlan = subscriptions.reduce((counts, sub) => {
      counts[sub.planId] = (counts[sub.planId] || 0) + 1;
      return counts;
    }, {});
    
    // Count by billing cycle
    const countByBillingCycle = subscriptions.reduce((counts, sub) => {
      counts[sub.billingCycle] = (counts[sub.billingCycle] || 0) + 1;
      return counts;
    }, {});
    
    // Calculate monthly recurring revenue (MRR)
    const mrr = subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((total, sub) => {
        // For annual subscriptions, divide by 12 to get monthly equivalent
        const monthlyPrice = sub.billingCycle === 'annual' 
          ? sub.price / 12 
          : sub.price;
        
        return total + monthlyPrice;
      }, 0);
    
    return {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter(sub => sub.status === 'active').length,
      cancelledSubscriptions: subscriptions.filter(sub => sub.status === 'cancelled').length,
      countByStatus,
      countByPlan,
      countByBillingCycle,
      mrr
    };
  } catch (error) {
    console.error('Error getting subscription metrics:', error);
    return {
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      cancelledSubscriptions: 0,
      countByStatus: {},
      countByPlan: {},
      countByBillingCycle: {},
      mrr: 0
    };
  }
};

export default {
  subscriptionPlans,
  getSubscriptions,
  getSubscriptionById,
  getUserSubscriptions,
  getActiveUserSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  renewSubscription,
  changeSubscriptionPlan,
  getSubscriptionMetrics
};
