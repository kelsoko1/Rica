# Credit Countdown Integration Between Rica-UI and Rica-Landing

## Overview

This document describes how the credit countdown feature is integrated between Rica-UI and Rica-Landing applications. The integration enables real-time credit tracking per user account, automatic redirection when credits are depleted, and seamless communication between both applications.

## Integration Architecture

The integration uses the PostMessage API for secure cross-origin communication between Rica-UI (running in an iframe or separate window) and Rica-Landing (the parent application).

### Key Components

1. **Integration Service** (`integrationService.js` in Rica-Landing)
   - Manages communication between Rica-UI and Rica-Landing
   - Tracks credit usage per user and feature
   - Handles automatic redirection when credits are depleted
   - Processes credit countdown for time-based features

2. **Credit Countdown Component** (in Rica-UI)
   - Displays current credit balance
   - Shows warnings for low credit levels
   - Manages feature activation/deactivation
   - Handles redirection notifications

## Communication Flow

### 1. Credit Status Check

**Rica-UI to Rica-Landing:**
```javascript
window.parent.postMessage({
  type: 'CHECK_CREDITS',
  data: {}
}, 'https://rica-landing.example.com');
```

**Rica-Landing to Rica-UI:**
```javascript
window.postMessage({
  type: 'CREDIT_STATUS',
  data: {
    credits: 100,
    lowCreditThreshold: 50,
    criticalCreditThreshold: 10
  }
}, 'https://rica-ui.example.com');
```

### 2. Start Credit Countdown

**Rica-UI to Rica-Landing:**
```javascript
window.parent.postMessage({
  type: 'START_CREDIT_COUNTDOWN',
  data: {
    featureId: 'feature_123',
    creditCost: 5 // 5 credits per interval
  }
}, 'https://rica-landing.example.com');
```

### 3. Stop Credit Countdown

**Rica-UI to Rica-Landing:**
```javascript
window.parent.postMessage({
  type: 'STOP_CREDIT_COUNTDOWN',
  data: {
    featureId: 'feature_123'
  }
}, 'https://rica-landing.example.com');
```

### 4. Credit Update Notification

**Rica-Landing to Rica-UI:**
```javascript
window.postMessage({
  type: 'CREDIT_COUNTDOWN_UPDATE',
  data: {
    userId: 'user_123',
    remainingCredits: 95,
    lowCreditThreshold: 50,
    criticalCreditThreshold: 10
  }
}, 'https://rica-ui.example.com');
```

### 5. Zero Credit Redirect

**Rica-Landing to Rica-UI:**
```javascript
// Imminent redirect notification
window.postMessage({
  type: 'ZERO_CREDIT_REDIRECT_IMMINENT',
  data: {
    userId: 'user_123',
    redirectDelay: 3000, // 3 seconds
    redirectUrl: '/credits'
  }
}, 'https://rica-ui.example.com');

// Final redirect notification
window.postMessage({
  type: 'ZERO_CREDIT_REDIRECTING',
  data: {
    userId: 'user_123',
    redirectUrl: '/credits'
  }
}, 'https://rica-ui.example.com');
```

## Implementation Details

### Rica-Landing Side

1. **Credit Tracking**
   - Each user has a credit balance stored in localStorage
   - Credit usage is tracked per feature and user
   - Time-based features deduct credits at regular intervals

2. **Automatic Redirection**
   - When credits reach zero, a redirect process is initiated
   - A warning is sent to Rica-UI with a countdown
   - After the countdown, the user is redirected to the credits page

3. **Security Measures**
   - Origin verification for all postMessage communications
   - User authentication validation
   - Rate limiting for credit deductions

### Rica-UI Side

1. **User Interface**
   - Credit balance display with visual indicators
   - Warning alerts for low credit levels
   - Critical alerts for near-zero credit levels
   - Countdown timer for imminent redirects

2. **Feature Management**
   - Start/stop controls for credit-consuming features
   - Automatic disabling of features when credits are depleted
   - Graceful shutdown of active features before redirect

## Example Implementation

### Rica-UI Component

```jsx
import React, { useState, useEffect } from 'react';

const CreditCountdown = ({ featureId, creditCost }) => {
  const [credits, setCredits] = useState(100);
  const [active, setActive] = useState(false);
  const [redirectImminent, setRedirectImminent] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(0);
  
  // Set up message listener
  useEffect(() => {
    const handleMessage = (event) => {
      // Verify origin in production
      const { type, data } = event.data;
      
      switch (type) {
        case 'CREDIT_STATUS':
          setCredits(data.credits);
          break;
          
        case 'CREDIT_COUNTDOWN_UPDATE':
          setCredits(data.remainingCredits);
          break;
          
        case 'ZERO_CREDIT_REDIRECT_IMMINENT':
          setRedirectImminent(true);
          setRedirectCountdown(Math.floor(data.redirectDelay / 1000));
          // Start countdown timer...
          break;
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  // Start feature
  const startFeature = () => {
    window.parent.postMessage({
      type: 'START_CREDIT_COUNTDOWN',
      data: { featureId, creditCost }
    }, '*');
    setActive(true);
  };
  
  // Stop feature
  const stopFeature = () => {
    window.parent.postMessage({
      type: 'STOP_CREDIT_COUNTDOWN',
      data: { featureId }
    }, '*');
    setActive(false);
  };
  
  return (
    <div>
      <h3>Credits: {credits}</h3>
      {redirectImminent && (
        <div className="alert">
          Redirecting in {redirectCountdown} seconds...
        </div>
      )}
      <button 
        onClick={active ? stopFeature : startFeature}
        disabled={credits < creditCost || redirectImminent}
      >
        {active ? 'Stop Feature' : 'Start Feature'}
      </button>
    </div>
  );
};
```

## Benefits

1. **Real-time Credit Tracking**
   - Users always see their current credit balance
   - Credit deductions are reflected immediately

2. **Seamless User Experience**
   - Automatic redirection when credits are depleted
   - Clear warnings before credits run out
   - Smooth transition between applications

3. **Flexible Credit Usage**
   - Support for one-time credit deductions
   - Support for time-based credit consumption
   - Multiple concurrent features can consume credits

4. **Robust Error Handling**
   - Graceful degradation when communication fails
   - Fallback to local credit tracking
   - Automatic retry mechanisms

## Implementation Considerations

1. **Origin Security**
   - Always verify message origins in production
   - Use specific target origins, not '*'
   - Implement CSRF protection

2. **Performance**
   - Batch credit updates to reduce message frequency
   - Use efficient data structures for credit tracking
   - Optimize localStorage usage

3. **User Experience**
   - Provide clear feedback on credit status
   - Show warnings well before credits are depleted
   - Offer easy ways to purchase more credits

4. **Testing**
   - Test edge cases (e.g., rapid feature start/stop)
   - Test with network interruptions
   - Test with multiple concurrent features

## Conclusion

This integration provides a seamless credit countdown experience between Rica-UI and Rica-Landing, ensuring users are always aware of their credit status and are redirected to purchase more credits when needed. The system is designed to be robust, secure, and user-friendly.
