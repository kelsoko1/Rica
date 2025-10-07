# Rica Credit System

## Overview

Rica now uses a pure credit-based model for its Pay As You Go option, allowing users to purchase credits in multiples of $10 for 250 credits. This system provides maximum flexibility for users who prefer usage-based pricing rather than fixed subscriptions.

## Credit Packages

| Package   | Credits | Price | Rate per Credit |
|-----------|---------|-------|----------------|
| Basic     | 250     | $10   | $0.04          |
| Standard  | 500     | $20   | $0.04          |
| Premium   | 1000    | $40   | $0.04          |
| Enterprise| 2500    | $100  | $0.04          |

## Credit Usage

Credits are consumed when using various features within the Rica platform:

| Feature           | Credit Cost |
|-------------------|-------------|
| Threat Scan       | 5           |
| Profile Creation  | 10          |
| Automation Task   | 15          |
| Device Linking    | 20          |
| Advanced Analytics| 25          |
| Custom Report     | 30          |

## Low Credit Warning

The system automatically detects when a user's credit balance falls below certain thresholds:

- **Warning Threshold**: 50 credits - Users receive a warning notification and are prompted to purchase more credits
- **Critical Threshold**: 10 credits - Features requiring more credits than the user's balance will be blocked

## Integration between Rica-UI and Rica-Landing

The credit system provides seamless integration between the Rica-UI (dashboard) and Rica-Landing (marketing/payment) components:

### Communication Flow

1. **Credit Check**:
   - Rica-UI checks credit balance via postMessage API
   - Rica-Landing responds with current balance and threshold information

2. **Credit Usage**:
   - Rica-UI requests to use credits for a feature
   - Rica-Landing deducts credits and returns updated balance
   - If balance is insufficient, a purchase prompt is shown

3. **Credit Purchase**:
   - Users can purchase credits from either Rica-UI or Rica-Landing
   - Credit balance is immediately updated and synchronized

### Technical Implementation

The integration uses:
- PostMessage API for secure cross-origin communication
- Local storage for persistent credit data
- Event-driven architecture for real-time updates

## Usage Example

```javascript
// In Rica-UI
window.parent.postMessage({
  type: 'CHECK_CREDITS',
  data: {}
}, 'https://rica-landing.example.com');

// Listen for response
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://rica-landing.example.com') return;
  
  const { type, data } = event.data;
  if (type === 'CREDIT_STATUS') {
    const { credits, lowCreditThreshold, criticalCreditThreshold } = data;
    // Update UI based on credit status
  }
});

// Use credits for a feature
window.parent.postMessage({
  type: 'USE_CREDITS',
  data: {
    amount: 15,
    feature: 'automationTask'
  }
}, 'https://rica-landing.example.com');
```

## Benefits of the Credit System

1. **Flexibility**: Users only pay for what they use
2. **Transparency**: Clear pricing with consistent rate across all packages
3. **Scalability**: Easy to scale usage up or down based on needs
4. **No Base Fee**: Removed the $5 base fee to make the system purely usage-based
5. **Seamless Experience**: Integration between Rica-UI and Rica-Landing provides a unified experience

## Future Enhancements

1. **Credit Bundles**: Special feature bundles at discounted credit rates
2. **Referral Credits**: Earn credits by referring new users
3. **Subscription + Credit Hybrid**: Allow subscription users to purchase additional credits
4. **Credit Expiry**: Implement optional credit expiry for certain promotional packages
5. **Usage Analytics**: Enhanced analytics for credit usage patterns

---

*This document provides an overview of Rica's credit system. For technical implementation details, please refer to the codebase documentation.*
