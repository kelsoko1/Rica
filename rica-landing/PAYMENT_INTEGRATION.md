# Rica Payment Integration Guide

This document provides information about the payment integration with Stripe and ClickPesa in the Rica landing page.

## Overview

The Rica landing page supports two payment providers:

1. **Stripe** - For credit/debit card payments (USD, EUR, GBP, etc.)
2. **ClickPesa** - For mobile money payments in East Africa (TZS, KES, UGX)

## Stripe Integration

### Configuration

Stripe is configured in `src/config/payment.js`. The main configuration parameters are:

- `publicKey`: Your Stripe publishable key
- `apiUrl`: The Stripe API URL
- `supportedCurrencies`: List of supported currencies
- `paymentMethods`: List of supported payment methods
- `testMode`: Whether to use test mode or not

### Components

- `StripeProvider`: Context provider for Stripe
- `StripePayment`: Component for processing Stripe payments

### Usage

```jsx
import { StripeProvider } from '../context/StripeContext';
import StripePayment from '../components/payments/StripePayment';

// Wrap your app with StripeProvider
<StripeProvider>
  <App />
</StripeProvider>

// Use StripePayment component
<StripePayment 
  amount={1000} // in cents
  currency="usd"
  onSuccess={handlePaymentSuccess}
  onError={handlePaymentError}
/>
```

## ClickPesa Integration

### Configuration

ClickPesa is configured in `src/config/payment.js`. The main configuration parameters are:

- `apiKey`: Your ClickPesa API key
- `apiUrl`: The ClickPesa API URL
- `supportedCurrencies`: List of supported currencies
- `supportedCountries`: List of supported countries
- `providers`: List of supported mobile money providers by country
- `testMode`: Whether to use test mode or not

### Components

- `ClickPesaProvider`: Context provider for ClickPesa
- `ClickPesaPayment`: Component for processing ClickPesa payments

### Usage

```jsx
import { ClickPesaProvider } from '../context/ClickPesaContext';
import ClickPesaPayment from '../components/payments/ClickPesaPayment';

// Wrap your app with ClickPesaProvider
<ClickPesaProvider>
  <App />
</ClickPesaProvider>

// Use ClickPesaPayment component
<ClickPesaPayment 
  amount={10000} // in local currency
  currency="TZS"
  onSuccess={handlePaymentSuccess}
  onError={handlePaymentError}
/>
```

## Payment Flow

### Stripe Payment Flow

1. User enters card details
2. Stripe.js creates a payment method
3. Payment method is sent to Stripe API
4. Stripe API returns a payment intent
5. Payment intent is confirmed with the card details
6. Payment is processed
7. User is redirected to confirmation page

### ClickPesa Payment Flow

1. User enters phone number and selects mobile money provider
2. Payment request is sent to ClickPesa API
3. ClickPesa API sends a payment request to the mobile money provider
4. User receives a prompt on their phone to confirm the payment
5. User confirms the payment on their phone
6. ClickPesa API receives a callback from the mobile money provider
7. User is redirected to confirmation page

## Testing

### Stripe Test Cards

- **Visa**: 4242 4242 4242 4242
- **Mastercard**: 5555 5555 5555 4444
- **Amex**: 3782 822463 10005
- **Discover**: 6011 1111 1111 1117

Use any future expiration date, any 3-digit CVC, and any postal code.

### ClickPesa Test Numbers

- **M-Pesa**: +255123456789
- **Tigo Pesa**: +255987654321
- **Airtel Money**: +255123123123

## Production Setup

For production, you need to:

1. Replace the test API keys with production API keys
2. Set the `testMode` to `false` in the configuration
3. Update the API URLs to production URLs
4. Set up proper error handling and logging
5. Implement webhook handling for payment callbacks

## Security Considerations

1. **Never** store API keys in client-side code
2. Use environment variables for API keys
3. Implement proper error handling
4. Validate all user inputs
5. Use HTTPS for all API calls
6. Implement proper authentication and authorization
7. Implement proper logging and monitoring

## Troubleshooting

### Common Stripe Issues

- **Invalid API Key**: Check that your Stripe API key is correct
- **Card Declined**: Try a different test card
- **3D Secure Required**: Use a test card that supports 3D Secure

### Common ClickPesa Issues

- **Invalid Phone Number**: Make sure the phone number is in E.164 format (e.g., +255123456789)
- **Insufficient Funds**: Try a different test number
- **Provider Not Available**: Check that the provider is supported in the selected country

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [ClickPesa Documentation](https://docs.clickpesa.com/home/integration-overview)
- [React Stripe.js](https://github.com/stripe/react-stripe-js)

## Support

For support with payment integration, contact:

- **Stripe Support**: support@stripe.com
- **ClickPesa Support**: support@clickpesa.com
- **Rica Support**: support@rica.io
