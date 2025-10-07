# Rica Analytics and Subscription Management Guide

## Overview

This guide provides comprehensive documentation for the analytics tracking and subscription management features in the Rica landing page. These features enable tracking payment events, managing subscriptions, and visualizing analytics data.

## Table of Contents

1. [Analytics System](#analytics-system)
2. [Subscription Management](#subscription-management)
3. [Integration with Payment System](#integration-with-payment-system)
4. [User Interface Components](#user-interface-components)
5. [Data Storage](#data-storage)
6. [Implementation Details](#implementation-details)
7. [Best Practices](#best-practices)
8. [Future Enhancements](#future-enhancements)

## Analytics System

The analytics system tracks various events related to payments and subscriptions, providing insights into user behavior and business metrics.

### Analytics Events

The following events are tracked:

- **Payment Started**: When a user initiates a payment
- **Payment Completed**: When a payment is successfully completed
- **Payment Failed**: When a payment fails
- **Subscription Created**: When a user creates a new subscription
- **Subscription Updated**: When a subscription is updated (e.g., plan change)
- **Subscription Cancelled**: When a subscription is cancelled
- **Page Views**: When a user views specific pages

### Analytics Service

The `analyticsService` provides methods for tracking events and retrieving analytics data:

```javascript
// Track an event
analyticsService.trackEvent('event_name', eventData);

// Track page view
analyticsService.trackPageView('page_name', pageData);

// Track payment events
analyticsService.trackPaymentStarted(paymentData);
analyticsService.trackPaymentCompleted(paymentData);
analyticsService.trackPaymentFailed(paymentData, error);

// Track subscription events
analyticsService.trackSubscriptionCreated(subscriptionData);
analyticsService.trackSubscriptionUpdated(subscriptionData);
analyticsService.trackSubscriptionCancelled(subscriptionData);

// Get analytics data
const events = analyticsService.getAnalyticsEvents();
const eventCounts = analyticsService.getEventCountsByType();
const conversionRate = analyticsService.getPaymentConversionRate();
```

### Analytics Dashboard

The `AnalyticsDashboard` component visualizes analytics data, showing:

- Total revenue
- Number of transactions
- Active subscriptions
- Conversion rate
- Subscription distribution
- Payment method distribution
- Recent analytics events

## Subscription Management

The subscription management system allows users to create, update, and cancel subscriptions.

### Subscription Plans

Subscription plans are defined in `subscriptionService`:

```javascript
export const subscriptionPlans = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Basic features for individuals',
    price: {
      monthly: 29,
      annual: 290,
    },
    features: [
      'Basic threat detection',
      'Up to 5 browser profiles',
      'Standard analytics',
      'Email support'
    ]
  },
  // Other plans...
};
```

### Subscription Service

The `subscriptionService` provides methods for managing subscriptions:

```javascript
// Get subscriptions
const subscriptions = subscriptionService.getSubscriptions();
const userSubscriptions = subscriptionService.getUserSubscriptions(userId);
const activeSubscription = subscriptionService.getActiveUserSubscription(userId);

// Create subscription
const subscription = subscriptionService.createSubscription({
  userId,
  planId,
  billingCycle,
  currency,
  paymentMethod,
  paymentMethodDetails
});

// Update subscription
const updatedSubscription = subscriptionService.updateSubscription(
  subscriptionId,
  updateData
);

// Cancel subscription
const cancelledSubscription = subscriptionService.cancelSubscription(
  subscriptionId,
  reason
);

// Renew subscription
const renewedSubscription = subscriptionService.renewSubscription(subscriptionId);

// Change subscription plan
const changedSubscription = subscriptionService.changeSubscriptionPlan(
  subscriptionId,
  newPlanId,
  newBillingCycle
);

// Get subscription metrics
const metrics = subscriptionService.getSubscriptionMetrics();
```

### Subscription Manager

The `SubscriptionManager` component provides a user interface for managing subscriptions, allowing users to:

- View current subscription details
- Choose a subscription plan
- Change billing cycle
- Cancel subscription
- Renew subscription
- View subscription history

## Integration with Payment System

The analytics and subscription systems are integrated with the payment system:

### Payment Service Integration

The `paymentService` tracks analytics events when payments are processed:

```javascript
// Create Stripe payment intent
const paymentIntent = await paymentService.createStripePaymentIntent(amount, currency, metadata);
// Tracks 'payment_started' event

// Process Stripe payment
const paymentResult = await paymentService.processStripePayment(paymentMethodId, amount, currency, metadata);
// Tracks 'payment_completed' event

// Create ClickPesa payment
const paymentResponse = await paymentService.createClickPesaPayment(amount, phoneNumber, description, reference);
// Tracks 'payment_started' event

// Check ClickPesa payment status
const statusResponse = await paymentService.checkClickPesaPaymentStatus(transactionId);
// Tracks 'payment_completed' or 'payment_failed' event
```

### Subscription Creation

When a payment is completed, a subscription can be created:

```javascript
// After payment completion
const subscription = subscriptionService.createSubscription({
  userId: currentUser.id,
  planId: selectedPlan,
  billingCycle,
  currency: 'USD',
  paymentMethod: 'card',
  paymentMethodDetails: {
    last4: '4242',
    brand: 'visa'
  }
});
```

## User Interface Components

### Analytics Dashboard

The `AnalyticsDashboard` component displays analytics data in a user-friendly format:

```jsx
<AnalyticsDashboard />
```

### Subscription Manager

The `SubscriptionManager` component provides a user interface for managing subscriptions:

```jsx
<SubscriptionManager />
```

### Payment History

The `PaymentHistory` component displays a list of past payments:

```jsx
<PaymentHistory />
```

## Data Storage

### Analytics Data

Analytics data is stored in localStorage for demo purposes:

```javascript
// Store analytics events
localStorage.setItem('rica_analytics_events', JSON.stringify(analyticsEvents));

// Retrieve analytics events
const events = JSON.parse(localStorage.getItem('rica_analytics_events') || '[]');
```

### Subscription Data

Subscription data is stored in localStorage for demo purposes:

```javascript
// Store subscriptions
localStorage.setItem('rica_subscriptions', JSON.stringify(subscriptions));

// Retrieve subscriptions
const subscriptions = JSON.parse(localStorage.getItem('rica_subscriptions') || '[]');
```

### Payment History

Payment history is stored in localStorage for demo purposes:

```javascript
// Store payment history
localStorage.setItem('rica_payment_history', JSON.stringify(history));

// Retrieve payment history
const history = JSON.parse(localStorage.getItem('rica_payment_history') || '[]');
```

## Implementation Details

### Analytics Service

The `analyticsService` is implemented in `src/services/analyticsService.js`:

```javascript
// Track event
const trackEvent = (eventName, eventData = {}) => {
  try {
    // Add timestamp
    const eventWithTimestamp = {
      ...eventData,
      timestamp: new Date().toISOString()
    };
    
    // Store in localStorage
    const analyticsEvents = JSON.parse(localStorage.getItem('rica_analytics_events') || '[]');
    analyticsEvents.push({ eventName, ...eventWithTimestamp });
    localStorage.setItem('rica_analytics_events', JSON.stringify(analyticsEvents));
    
    return true;
  } catch (error) {
    console.error('Error tracking event:', error);
    return false;
  }
};
```

### Subscription Service

The `subscriptionService` is implemented in `src/services/subscriptionService.js`:

```javascript
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
```

## Best Practices

1. **Track Important Events**: Track all important user actions and business events.
2. **Use Consistent Event Names**: Use consistent naming conventions for events.
3. **Include Relevant Data**: Include all relevant data in event payloads.
4. **Handle Errors**: Properly handle errors in analytics and subscription code.
5. **Respect User Privacy**: Only track necessary data and comply with privacy regulations.
6. **Optimize Performance**: Minimize the impact of analytics tracking on application performance.
7. **Test Analytics**: Test analytics tracking to ensure events are captured correctly.

## Future Enhancements

1. **Server-Side Analytics**: Implement server-side analytics tracking for more reliable data.
2. **Real-time Analytics**: Implement real-time analytics dashboards.
3. **Advanced Metrics**: Add more advanced metrics such as customer lifetime value and churn rate.
4. **Data Export**: Add the ability to export analytics data for further analysis.
5. **User Segmentation**: Implement user segmentation based on behavior and subscription status.
6. **A/B Testing**: Implement A/B testing for subscription plans and pricing.
7. **Subscription Notifications**: Add notifications for subscription events (e.g., renewal, expiration).
8. **Subscription Reporting**: Add more detailed subscription reporting and forecasting.
