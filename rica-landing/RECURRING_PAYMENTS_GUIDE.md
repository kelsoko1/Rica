# Rica Recurring Payments Guide

## Overview

This guide provides comprehensive documentation for the recurring payments feature in the Rica landing page. This feature enables users to set up automatic recurring payments for subscriptions and other regular expenses.

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Implementation Details](#implementation-details)
4. [User Interface](#user-interface)
5. [Service Architecture](#service-architecture)
6. [Integration with Payment System](#integration-with-payment-system)
7. [Best Practices](#best-practices)
8. [Future Enhancements](#future-enhancements)

## Introduction

The recurring payments feature allows users to automate regular payments without having to manually process each transaction. This is particularly useful for subscription-based services, membership fees, and other recurring expenses.

Key benefits include:

- **Convenience**: Users don't need to remember to make payments
- **Consistency**: Payments are processed on schedule
- **Flexibility**: Users can pause, modify, or cancel recurring payments at any time
- **Transparency**: Clear history and schedule of all recurring payments

## Features

### Recurring Payment Management

- **Create** new recurring payments with customizable amount, frequency, and payment method
- **Edit** existing recurring payments to update amount, description, or frequency
- **Pause/Resume** recurring payments temporarily
- **Cancel** recurring payments permanently
- **View** detailed information about each recurring payment

### Payment Frequencies

- Weekly
- Monthly
- Quarterly
- Annual

### Payment Methods

- Mobile Money (for East Africa)
- Credit/Debit Cards (global)
- Digital Wallets (PayPal, Apple Pay, Google Pay)

### Reporting and Analytics

- View payment history
- See upcoming scheduled payments
- Access statistics on recurring revenue

## Implementation Details

### Recurring Payment Service

The `recurringPaymentService.js` provides the core functionality:

```javascript
// Create a new recurring payment
const recurringPayment = recurringPaymentService.createRecurringPayment({
  userId: 'user-123',
  amount: 29.99,
  currency: 'USD',
  description: 'Monthly subscription',
  frequency: 'monthly',
  paymentMethod: 'card',
  paymentMethodDetails: {
    cardNumber: '4242424242424242',
    cardExpiry: '12/25',
    cardCvc: '123',
    cardName: 'John Doe'
  }
});

// Process a recurring payment
const paymentResult = await recurringPaymentService.processRecurringPayment(recurringPayment.id);

// Update a recurring payment
const updatedPayment = recurringPaymentService.updateRecurringPayment(recurringPayment.id, {
  amount: 39.99,
  description: 'Premium subscription'
});

// Cancel a recurring payment
const cancelledPayment = recurringPaymentService.cancelRecurringPayment(
  recurringPayment.id,
  'Upgraded to annual plan'
);

// Process all due payments
const results = await recurringPaymentService.processAllDuePayments();
```

### Data Storage

Recurring payment data is stored in localStorage for demo purposes:

```javascript
// Storage key for recurring payments
const RECURRING_PAYMENTS_KEY = 'rica_recurring_payments';

// Get recurring payments
const payments = JSON.parse(localStorage.getItem(RECURRING_PAYMENTS_KEY) || '[]');

// Save recurring payments
localStorage.setItem(RECURRING_PAYMENTS_KEY, JSON.stringify(payments));
```

In a production environment, this would be replaced with a database solution.

## User Interface

### Recurring Payment Manager Component

The `RecurringPaymentManager` component provides a user interface for managing recurring payments:

- **Active Payments Tab**: Shows all active recurring payments
- **Payment History Tab**: Shows past recurring payment transactions
- **Schedule Tab**: Shows upcoming scheduled payments

### Dialog Forms

The component includes dialogs for:

- Creating new recurring payments
- Editing existing recurring payments
- Pausing/resuming recurring payments
- Cancelling recurring payments

### Navigation

The recurring payments feature is accessible from:

- Profile page
- Subscription page
- Direct URL: `/recurring-payments`

## Service Architecture

The recurring payments feature is built with a modular architecture:

1. **RecurringPaymentService**: Core service for managing recurring payments
2. **RecurringPaymentManager**: UI component for user interaction
3. **RecurringPaymentsPage**: Page component for routing and layout
4. **Integration with PaymentService**: For processing actual payments
5. **Integration with AnalyticsService**: For tracking events and metrics

## Integration with Payment System

The recurring payments feature integrates with the ClickPesa payment system:

```javascript
// Process payment based on payment method
let paymentResult;

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
}
```

## Best Practices

1. **Validation**: Always validate input data before creating or updating recurring payments
2. **Error Handling**: Implement robust error handling for payment processing
3. **User Notifications**: Notify users before processing recurring payments
4. **Retry Logic**: Implement retry logic for failed payments
5. **Audit Trail**: Maintain a comprehensive audit trail of all recurring payment activities
6. **Security**: Securely store payment method details
7. **Testing**: Thoroughly test recurring payment processing with different scenarios

## Future Enhancements

1. **Smart Retry Logic**: Implement intelligent retry logic for failed payments
2. **Variable Amounts**: Support for recurring payments with variable amounts
3. **Multi-currency Support**: Allow recurring payments in multiple currencies
4. **Payment Method Updates**: Allow users to update payment methods without recreating recurring payments
5. **Notifications**: Email or SMS notifications for upcoming and processed payments
6. **Reporting**: Enhanced reporting and analytics for recurring payments
7. **Bulk Management**: Tools for managing multiple recurring payments at once
8. **Installment Plans**: Support for fixed-term installment plans
