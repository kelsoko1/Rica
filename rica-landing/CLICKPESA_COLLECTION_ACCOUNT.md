# ClickPesa Collection Account Integration

## Overview

Rica uses ClickPesa as its primary payment processor, implementing a collection account to handle all payment transactions. This integration enables Rica to accept payments through various methods including mobile money (M-Pesa, Tigo Pesa, Airtel Money), cards (Visa, Mastercard, American Express), and digital wallets.

## Integration Architecture

The integration follows ClickPesa's recommended API-based approach, which provides full control over the payment flow while maintaining a seamless user experience.

### Key Components

1. **Authentication System**
   - Secure token-based authentication
   - Automatic token refresh mechanism
   - Environment-specific API keys

2. **Payment Processing**
   - USSD-PUSH requests for mobile money
   - Card payment processing
   - Payment status tracking

3. **Collection Account**
   - Centralized account for all payment collections
   - Automatic settlement to Rica's bank account
   - Comprehensive transaction reporting

## Implementation Details

### Configuration

The ClickPesa integration is configured in `src/config/payment.js`:

```javascript
export const clickPesaConfig = {
  // ClickPesa API key
  apiKey: (window.env && window.env.REACT_APP_CLICKPESA_API_KEY) || 'YOUR_API_KEY',
  
  // ClickPesa Client ID
  clientId: (window.env && window.env.REACT_APP_CLICKPESA_CLIENT_ID) || 'YOUR_CLIENT_ID',
  
  // ClickPesa API URL
  apiUrl: 'https://api.clickpesa.com',
  
  // ClickPesa API endpoints
  endpoints: {
    generateToken: '/third-parties/auth/token',
    previewUssdPush: '/third-parties/payments/preview-ussd-push-request',
    initiateUssdPush: '/third-parties/payments/initiate-ussd-push-request',
    checkPaymentStatus: '/third-parties/payments',
    previewCardPayment: '/third-parties/payments/preview-card-payment',
    initiateCardPayment: '/third-parties/payments/initiate-card-payment'
  },
  
  // Collection account settings
  collectionAccount: {
    enabled: true,
    accountName: 'Rica Payments',
    accountDescription: 'Rica payment collection account',
    webhookUrl: 'https://api.rica.io/webhooks/clickpesa',
    callbackUrl: 'https://rica.io/payment/callback'
  }
}
```

### Authentication Flow

1. **Token Generation**
   - The application requests an authentication token using the Client ID and API Key
   - The token is stored in localStorage with an expiration time
   - A refresh mechanism automatically generates a new token when needed

2. **API Requests**
   - All API requests include the authentication token in the Authorization header
   - The application handles token expiration and regeneration automatically

### Payment Processing Flow

#### Mobile Money Payments (USSD-PUSH)

1. **Preview Request**
   - Validate payment details (amount, phone number, etc.)
   - Send a preview request to ClickPesa API
   - Receive validation response and available payment methods

2. **Initiate Payment**
   - Send payment request to ClickPesa API
   - ClickPesa sends a USSD push notification to the customer's phone
   - Customer enters PIN to authorize payment

3. **Payment Status Tracking**
   - Poll payment status using the transaction ID
   - Update UI based on payment status (pending, completed, failed)
   - Record transaction in payment history

#### Card Payments

1. **Preview Card Payment**
   - Validate payment details
   - Send preview request to ClickPesa API
   - Receive validation response

2. **Initiate Card Payment**
   - Send payment request to ClickPesa API
   - Process card details securely
   - Complete payment transaction

3. **Payment Status Tracking**
   - Similar to mobile money payment tracking

### Webhook Integration

Rica has implemented a webhook endpoint to receive real-time payment notifications from ClickPesa:

```
https://api.rica.io/webhooks/clickpesa
```

The webhook handles the following events:
- Payment completion
- Payment failure
- Payment refund
- Settlement notifications

## Security Considerations

1. **API Key Protection**
   - API keys are stored in environment variables
   - Keys are never exposed in client-side code
   - Different keys for development and production environments

2. **Data Encryption**
   - All API requests use HTTPS
   - Sensitive payment data is never stored
   - Token-based authentication for all API calls

3. **Error Handling**
   - Comprehensive error handling for all API calls
   - Detailed error logging for debugging
   - User-friendly error messages

## Integration with Rica's Hybrid Revenue Model

The ClickPesa collection account is integrated with Rica's hybrid revenue model:

1. **Subscription Payments**
   - Recurring payments for subscription plans
   - Automatic renewal processing
   - Subscription management

2. **Credit Purchases**
   - One-time payments for credit packages
   - Credit balance management
   - Usage tracking

## Testing

### Test Accounts

For testing purposes, ClickPesa provides test accounts for different payment methods:

#### Mobile Money Test Accounts
- M-Pesa: 255712345678
- Tigo Pesa: 255654321987
- Airtel Money: 255678912345

#### Card Test Accounts
- Visa: 4242 4242 4242 4242
- Mastercard: 5555 5555 5555 4444
- American Express: 3782 822463 10005

### Test Environment

The test environment is available at:
```
https://api-sandbox.clickpesa.com
```

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Check API key and Client ID
   - Verify token generation process
   - Check token expiration

2. **Payment Failures**
   - Validate phone number format
   - Check sufficient balance in test accounts
   - Verify payment amount is within limits

3. **Webhook Issues**
   - Ensure webhook URL is accessible
   - Check webhook signature validation
   - Verify proper response handling

## Production Deployment

When deploying to production:

1. Replace test API keys with production keys
2. Update API URL to production endpoint
3. Configure proper webhook URL
4. Set up monitoring and alerts
5. Implement comprehensive logging

## Resources

- [ClickPesa API Documentation](https://docs.clickpesa.com/)
- [ClickPesa Developer Portal](https://merchant.clickpesa.com/)
- [ClickPesa Support](mailto:support@clickpesa.com)

---

*This document provides an overview of Rica's ClickPesa collection account integration. For technical implementation details, please refer to the codebase documentation.*
