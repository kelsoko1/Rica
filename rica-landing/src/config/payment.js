/**
 * Payment configuration settings
 * 
 * This file contains configuration settings for ClickPesa payment integration.
 * In a production environment, these values should be loaded from environment variables.
 */

// ClickPesa configuration
export const clickPesaConfig = {
  // ClickPesa API key (replace with your actual key in production)
  apiKey: (window.env && window.env.REACT_APP_CLICKPESA_API_KEY) || 'IDNzCNDMk4Uj1OHqWXNBpgL7sFIebKnI',
  
  // ClickPesa API URL
  apiUrl: 'https://api.clickpesa.com/v1',
  
  // Supported currencies
  supportedCurrencies: ['tzs', 'kes', 'ugx', 'usd', 'eur', 'gbp'],
  
  // Supported countries
  supportedCountries: ['TZ', 'KE', 'UG', 'GLOBAL'],
  
  // Payment providers by country
  providers: {
    'TZ': [
      { id: 'mpesa', name: 'M-Pesa', type: 'mobile_money', icon: 'mpesa-icon.png' },
      { id: 'tigopesa', name: 'Tigo Pesa', type: 'mobile_money', icon: 'tigopesa-icon.png' },
      { id: 'airtelmoney', name: 'Airtel Money', type: 'mobile_money', icon: 'airtel-icon.png' }
    ],
    'KE': [
      { id: 'mpesa', name: 'M-Pesa', type: 'mobile_money', icon: 'mpesa-icon.png' }
    ],
    'UG': [
      { id: 'mtn', name: 'MTN Mobile Money', type: 'mobile_money', icon: 'mtn-icon.png' },
      { id: 'airtel', name: 'Airtel Money', type: 'mobile_money', icon: 'airtel-icon.png' }
    ],
    'GLOBAL': [
      { id: 'visa', name: 'Visa Card', type: 'card', icon: 'visa-icon.png' },
      { id: 'mastercard', name: 'Mastercard', type: 'card', icon: 'mastercard-icon.png' },
      { id: 'amex', name: 'American Express', type: 'card', icon: 'amex-icon.png' },
      { id: 'paypal', name: 'PayPal', type: 'wallet', icon: 'paypal-icon.png' },
      { id: 'applepay', name: 'Apple Pay', type: 'wallet', icon: 'applepay-icon.png' },
      { id: 'googlepay', name: 'Google Pay', type: 'wallet', icon: 'googlepay-icon.png' }
    ]
  },
  
  // Test mode
  testMode: (window.env && window.env.NODE_ENV !== 'production') || true
};

// General payment settings
export const paymentSettings = {
  // Default currency
  defaultCurrency: 'usd',
  
  // Currency display options
  currencyDisplay: {
    'usd': { symbol: '$', code: 'USD', name: 'US Dollar' },
    'eur': { symbol: '€', code: 'EUR', name: 'Euro' },
    'gbp': { symbol: '£', code: 'GBP', name: 'British Pound' },
    'tzs': { symbol: 'TSh', code: 'TZS', name: 'Tanzanian Shilling' },
    'kes': { symbol: 'KSh', code: 'KES', name: 'Kenyan Shilling' },
    'ugx': { symbol: 'USh', code: 'UGX', name: 'Ugandan Shilling' }
  },
  
  // Payment methods
  paymentMethods: [
    { id: 'card', name: 'Credit/Debit Card', provider: 'stripe' },
    { id: 'mobile_money', name: 'Mobile Money', provider: 'clickpesa' }
  ]
};

export default {
  clickPesa: clickPesaConfig,
  settings: paymentSettings
};
