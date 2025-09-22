# Rica Payment Integration Guide

## Overview

This guide provides comprehensive documentation for the payment integration in the Rica landing page. The payment system supports both Stripe for credit/debit card payments and ClickPesa for mobile money payments in East Africa.

## Table of Contents

1. [Architecture](#architecture)
2. [Components](#components)
3. [Services](#services)
4. [Configuration](#configuration)
5. [Payment Flow](#payment-flow)
6. [Webhooks](#webhooks)
7. [Payment History](#payment-history)
8. [Testing](#testing)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

## Architecture

The payment integration follows a modular architecture with the following key components:

- **Payment Providers**: Stripe and ClickPesa
- **Payment Context**: React context for managing payment state
- **Payment Components**: UI components for payment forms
- **Payment Services**: Services for interacting with payment APIs
- **Payment History**: Service for tracking payment history
- **Webhooks**: Server-side handlers for payment notifications

## Components

### Payment Method Selector

The `PaymentMethodSelector` component allows users to choose between payment methods based on the selected currency.

```jsx
<PaymentMethodSelector 
  amount={10000} 
  currency="USD"
  onSuccess={handlePaymentSuccess}
  onError={handlePaymentError}
/>
```

### Stripe Payment

The `StripePayment` component handles credit/debit card payments using Stripe.

```jsx
<StripePayment 
  amount={10000} // in cents
  currency="usd"
  onSuccess={handlePaymentSuccess}
  onError={handlePaymentError}
/>
```

### ClickPesa Payment

The `ClickPesaPayment` component handles mobile money payments using ClickPesa.

```jsx
<ClickPesaPayment 
  amount={10000} // in local currency
  currency="TZS"
  onSuccess={handlePaymentSuccess}
  onError={handlePaymentError}
/>
```

### Payment History

The `PaymentHistory` component displays a list of past payments with filtering and sorting options.

```jsx
<PaymentHistory />
```

### Webhook Handler

The `WebhookHandler` component demonstrates how webhooks from payment providers are processed.

```jsx
<WebhookHandler />
```

## Services

### Payment Service

The `paymentService` provides methods for interacting with payment APIs:

```javascript
// Stripe methods
const paymentIntent = await paymentService.createStripePaymentIntent(amount, currency, metadata);
const paymentResult = await paymentService.processStripePayment(paymentMethodId, amount, currency, metadata);

// ClickPesa methods
const paymentResponse = await paymentService.createClickPesaPayment(amount, phoneNumber, description, reference);
const statusResponse = await paymentService.checkClickPesaPaymentStatus(transactionId);
```

### Payment History Service

The `paymentHistoryService` provides methods for tracking payment history:

```javascript
// Get payment history
const history = paymentHistoryService.getPaymentHistory();

// Add payment to history
paymentHistoryService.addPaymentToHistory(payment);

// Update payment status
paymentHistoryService.updatePaymentStatus(transactionId, status, details);

// Get payment by ID
const payment = paymentHistoryService.getPaymentById(transactionId);

// Filter payments
const filteredPayments = paymentHistoryService.filterPaymentsByStatus('COMPLETED');
const dateFilteredPayments = paymentHistoryService.filterPaymentsByDateRange(startDate, endDate);
```

## Configuration

Payment configuration is stored in `src/config/payment.js`:

### Stripe Configuration

```javascript
export const stripeConfig = {
  publicKey: process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_51NxSampleStripeKeyForDemoPurposes',
  apiUrl: 'https://api.stripe.com/v1',
  supportedCurrencies: ['usd', 'eur', 'gbp', 'cad', 'aud'],
  paymentMethods: ['card', 'apple_pay', 'google_pay'],
  testMode: process.env.NODE_ENV !== 'production'
};
```

### ClickPesa Configuration

```javascript
export const clickPesaConfig = {
  apiKey: process.env.REACT_APP_CLICKPESA_API_KEY || 'IDNzCNDMk4Uj1OHqWXNBpgL7sFIebKnI',
  apiUrl: 'https://api.clickpesa.com/v1',
  supportedCurrencies: ['tzs', 'kes', 'ugx'],
  supportedCountries: ['TZ', 'KE', 'UG'],
  providers: {
    'TZ': [
      { id: 'mpesa', name: 'M-Pesa', type: 'mobile_money', icon: 'mpesa-icon.png' },
      // ...
    ],
    // ...
  },
  testMode: process.env.NODE_ENV !== 'production'
};
```

## Payment Flow

### Stripe Payment Flow

1. User selects credit/debit card payment method
2. User enters card details
3. `createStripePaymentIntent` is called to create a payment intent
4. Card details are submitted to Stripe
5. Stripe returns a payment result
6. Payment is recorded in payment history
7. User is redirected to confirmation page

### ClickPesa Payment Flow

1. User selects mobile money payment method
2. User enters phone number and selects provider
3. `createClickPesaPayment` is called to create a payment request
4. ClickPesa sends a payment request to the mobile money provider
5. User receives a prompt on their phone to confirm the payment
6. `checkClickPesaPaymentStatus` is called periodically to check payment status
7. Payment status is updated in payment history
8. User is redirected to confirmation page

## Webhooks

Webhooks are used to receive payment status updates from payment providers. The webhook handler is implemented in `server/webhooks.js`.

### Webhook Endpoints

- **Stripe**: `/webhooks/stripe`
- **ClickPesa**: `/webhooks/clickpesa`

### Webhook Payload

#### Stripe Webhook Payload

```json
{
  "id": "evt_1NxSampleStripeEvent",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1NxSampleStripePaymentIntent",
      "amount": 10000,
      "currency": "usd",
      "status": "succeeded"
    }
  }
}
```

#### ClickPesa Webhook Payload

```json
{
  "transaction_id": "CP1632145678901",
  "status": "COMPLETED",
  "reference": "RICA-123456",
  "amount": 10000,
  "currency": "TZS",
  "provider": "MPESA"
}
```

### Webhook Processing

1. Webhook is received by the server
2. Webhook signature is verified
3. Payment status is updated in the database
4. Any necessary actions are triggered (e.g., updating subscription status)

## Payment History

Payment history is stored in localStorage for demo purposes. In a production environment, this would be stored in a database.

### Payment Object Structure

```javascript
{
  transactionId: 'CP1632145678901',
  amount: 10000,
  currency: 'TZS',
  status: 'COMPLETED', // COMPLETED, PENDING, FAILED
  phoneNumber: '+255123456789', // for mobile money payments
  provider: 'MPESA', // for mobile money payments
  paymentMethod: 'mobile_money', // or 'card'
  description: 'Rica Subscription',
  reference: 'RICA-123456',
  createdAt: '2023-09-20T14:21:18.901Z',
  updatedAt: '2023-09-20T14:25:18.901Z',
  details: {
    // Additional details specific to the payment method
  }
}
```

## Testing

### Stripe Test Cards

- **Visa**: 4242 4242 4242 4242
- **Mastercard**: 5555 5555 5555 4444
- **Amex**: 3782 822463 10005
- **Discover**: 6011 1111 1111 1117

Use any future expiration date, any 3-digit CVC, and any postal code.

### ClickPesa Test Numbers

- **M-Pesa Tanzania**: +255123456789
- **Tigo Pesa**: +255987654321
- **Airtel Money**: +255123123123

## Production Deployment

For production deployment, you need to:

1. Set up environment variables for API keys
2. Configure webhook endpoints
3. Set up proper error handling and logging
4. Implement proper security measures
5. Set up monitoring and alerting

### Environment Variables

```
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
REACT_APP_CLICKPESA_API_KEY=your_clickpesa_api_key
```

### Webhook Configuration

1. Set up webhook endpoints in your server
2. Configure webhook URLs in Stripe and ClickPesa dashboards
3. Set up webhook signature verification

## Troubleshooting

### Common Issues

1. **Payment Intent Creation Failed**: Check API keys and network connectivity
2. **Card Declined**: Check card details and try a different card
3. **Mobile Money Payment Failed**: Check phone number format and provider availability
4. **Webhook Not Received**: Check webhook URL and server configuration

### Debugging

1. Check browser console for errors
2. Check network tab for API responses
3. Check server logs for webhook errors
4. Check payment provider dashboard for payment status
