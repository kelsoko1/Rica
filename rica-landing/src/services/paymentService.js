import { clickPesaConfig } from '../config/payment';
import paymentHistoryService from './paymentHistoryService';
import analyticsService from './analyticsService';
import { v4 as uuidv4 } from 'uuid';

// Get configuration from config files
const CLICKPESA_API_KEY = clickPesaConfig.apiKey;
const CLICKPESA_API_URL = clickPesaConfig.apiUrl;

/**
 * Global Payment Service
 * 
 * This service handles payment processing for all payment methods (mobile money, cards, digital wallets)
 * using ClickPesa as the unified payment provider.
 * 
 * @module paymentService
 */
const paymentService = {

  /**
   * Create a payment using the global payment system
   * 
   * @param {number} amount - Payment amount
   * @param {string} phoneNumber - Phone number for mobile money payments
   * @param {string} description - Payment description
   * @param {string} reference - Payment reference
   * @param {string} paymentMethod - Payment method (mobile_money, card, wallet)
   * @returns {Promise<Object>} Payment response
   */
  createClickPesaPayment: async (amount, phoneNumber, description, reference, paymentMethod = 'mobile_money') => {
    try {
      // Validate input parameters
      if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount. Amount must be a positive number.');
      }
      
      if (!description) {
        description = 'Rica Payment';
      }
      
      if (!reference) {
        reference = `RICA-${Date.now()}-${uuidv4().substring(0, 8)}`;
      }
      
      // Validate phone number format for mobile money payments
      if (paymentMethod === 'mobile_money') {
        if (!phoneNumber || !phoneNumber.match(/^\+\d{1,15}$/)) {
          throw new Error('Invalid phone number format. Use E.164 format (e.g., +255123456789)');
        }
      }
      
      // In a real application, this would be a server-side call to ClickPesa API
      // For demo purposes, we'll simulate a successful response, but include real API structure
      
      // Determine currency and provider based on phone number prefix or payment method
      let currency, provider;
      
      if (paymentMethod === 'mobile_money') {
        // For mobile money, determine currency and provider based on phone number
        currency = phoneNumber.startsWith('+255') ? 'TZS' : 
                  phoneNumber.startsWith('+254') ? 'KES' : 
                  phoneNumber.startsWith('+256') ? 'UGX' : 'TZS';
        
        provider = phoneNumber.startsWith('+255') ? 'MPESA' : 
                  phoneNumber.startsWith('+254') ? 'MPESA_KE' : 
                  phoneNumber.startsWith('+256') ? 'MTN_UG' : 'UNKNOWN';
      } else {
        // For card or wallet payments, use USD as default currency
        currency = 'USD';
        provider = paymentMethod.toUpperCase();
      }
      
      // Prepare request payload according to ClickPesa API docs
      const payload = {
        amount: amount.toString(),
        currency,
        reference: reference,
        description: description,
        callback_url: window.location.origin + '/payment/callback',
        webhook_url: 'https://api.rica.io/webhooks/clickpesa', // Would be your server endpoint
        client_id: CLICKPESA_API_KEY,
        payment_method: paymentMethod
      };
      
      // Add phone number for mobile money payments
      if (paymentMethod === 'mobile_money') {
        payload.phone = phoneNumber;
      }
      
      console.log('ClickPesa payment request:', payload);
      
      // For demo, simulate API call
      // In production, this would be:
      // const response = await axios.post(`${CLICKPESA_API_URL}/payments/mobile-money/charge`, payload, {
      //   headers: {
      //     'Authorization': `Bearer ${CLICKPESA_API_KEY}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Create transaction ID
      const transactionId = `CP${Date.now()}`;
      
      // Create payment response
      const paymentResponse = {
        success: true,
        transactionId,
        amount,
        phoneNumber,
        currency,
        status: 'PENDING',
        message: 'Payment request sent successfully. Please check your phone to complete the payment.',
        reference,
        created: new Date().toISOString(),
        provider
      };
      
      // Add to payment history
      paymentHistoryService.addPaymentToHistory({
        transactionId,
        amount,
        currency,
        status: 'PENDING',
        phoneNumber: paymentMethod === 'mobile_money' ? phoneNumber : undefined,
        provider,
        paymentMethod,
        description,
        reference
      });
      
      // Track analytics event with detailed information
      analyticsService.trackPaymentStarted({
        transactionId,
        amount,
        currency,
        paymentMethod,
        provider,
        phoneNumber: paymentMethod === 'mobile_money' ? phoneNumber : undefined,
        description,
        reference,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        paymentDetails: {
          method: paymentMethod,
          provider: provider,
          currency: currency
        }
      });
      
      return paymentResponse;
    } catch (error) {
      console.error('Error creating ClickPesa payment:', error);
      
      // Track error with detailed information
      analyticsService.trackPaymentFailed({
        amount,
        currency: currency || 'USD',
        phoneNumber: paymentMethod === 'mobile_money' ? phoneNumber : undefined,
        paymentMethod,
        description,
        reference,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        errorCode: error.code || 'UNKNOWN_ERROR',
        errorType: error.name || 'Error'
      }, error.message);
      
      throw error;
    }
  },

  /**
   * Check the status of a payment
   * 
   * @param {string} transactionId - Transaction ID to check
   * @returns {Promise<Object>} Payment status response
   */
  checkClickPesaPaymentStatus: async (transactionId) => {
    try {
      // In a real application, this would be a server-side call to ClickPesa API
      // For demo purposes, we'll simulate a successful response but include real API structure
      
      // Get existing payment from history
      const existingPayment = paymentHistoryService.getPaymentById(transactionId);
      
      if (!existingPayment) {
        throw new Error('Payment not found');
      }
      
      // Prepare request payload according to ClickPesa API docs
      const payload = {
        transaction_id: transactionId,
        client_id: CLICKPESA_API_KEY
      };
      
      console.log('ClickPesa status check request:', payload);
      
      // For demo, simulate API call
      // In production, this would be:
      // const response = await axios.post(`${CLICKPESA_API_URL}/payments/status`, payload, {
      //   headers: {
      //     'Authorization': `Bearer ${CLICKPESA_API_KEY}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo purposes, we'll use a more predictable status progression
      // In a real implementation, this would come from the API response
      const now = new Date().getTime();
      const transactionTime = parseInt(transactionId.replace('CP', ''));
      const elapsedSeconds = (now - transactionTime) / 1000;
      
      // Determine status based on elapsed time (for demo purposes)
      let status;
      if (elapsedSeconds < 30) {
        status = 'PENDING';
      } else if (elapsedSeconds < 60) {
        // 80% chance of success, 20% chance of failure after 30 seconds
        status = Math.random() < 0.8 ? 'COMPLETED' : 'FAILED';
      } else {
        status = 'COMPLETED';
      }
      
      // Create provider reference
      const providerReference = `M${Math.floor(Math.random() * 1000000000)}`;
      
      // Create status response
      const statusResponse = {
        transactionId,
        status,
        message: status === 'COMPLETED' 
          ? 'Payment completed successfully' 
          : status === 'PENDING' 
            ? 'Payment is still being processed' 
            : 'Payment failed',
        updated: new Date().toISOString(),
        details: {
          amount: existingPayment.amount.toString(),
          currency: existingPayment.currency || 'TZS',
          provider: existingPayment.provider || 'MPESA',
          provider_reference: providerReference,
          client_reference: transactionId
        }
      };
      
      // Update payment history
      paymentHistoryService.updatePaymentStatus(transactionId, status, {
        provider_reference: providerReference,
        message: statusResponse.message
      });
      
      // Track analytics event based on status with detailed information
      if (status === 'COMPLETED') {
        analyticsService.trackPaymentCompleted({
          transactionId,
          amount: existingPayment.amount,
          currency: existingPayment.currency,
          paymentMethod: existingPayment.paymentMethod || 'mobile_money',
          provider: existingPayment.provider,
          phoneNumber: existingPayment.phoneNumber,
          status,
          completedAt: new Date().toISOString(),
          processingTime: new Date().getTime() - new Date(existingPayment.createdAt || Date.now()).getTime(),
          reference: existingPayment.reference,
          description: existingPayment.description,
          providerReference: providerReference
        });
      } else if (status === 'FAILED') {
        analyticsService.trackPaymentFailed({
          transactionId,
          amount: existingPayment.amount,
          currency: existingPayment.currency,
          paymentMethod: existingPayment.paymentMethod || 'mobile_money',
          provider: existingPayment.provider,
          phoneNumber: existingPayment.phoneNumber,
          failedAt: new Date().toISOString(),
          processingTime: new Date().getTime() - new Date(existingPayment.createdAt || Date.now()).getTime(),
          reference: existingPayment.reference,
          description: existingPayment.description,
          failureReason: statusResponse.message
        }, statusResponse.message);
      }
      
      return statusResponse;
    } catch (error) {
      console.error('Error checking ClickPesa payment status:', error);
      
      // Track detailed error information
      analyticsService.trackEvent('payment_status_check_error', {
        transactionId,
        error: error.message,
        errorCode: error.code || 'UNKNOWN_ERROR',
        errorType: error.name || 'Error',
        timestamp: new Date().toISOString(),
        paymentDetails: existingPayment ? {
          amount: existingPayment.amount,
          currency: existingPayment.currency,
          paymentMethod: existingPayment.paymentMethod || 'mobile_money',
          provider: existingPayment.provider,
          status: existingPayment.status
        } : undefined
      });
      
      throw error;
    }
  },

  // Get supported payment methods
  getSupportedPaymentMethods: async (countryCode = 'TZ') => {
    try {
      // In a real application, this would be a server-side call
      // For demo purposes, we'll return mock data based on country code
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Define payment methods by country
      const paymentMethodsByCountry = {
        'TZ': [
          { id: 'mpesa', name: 'M-Pesa', type: 'mobile_money', icon: 'mpesa-icon.png' },
          { id: 'tigopesa', name: 'Tigo Pesa', type: 'mobile_money', icon: 'tigopesa-icon.png' },
          { id: 'airtelmoney', name: 'Airtel Money', type: 'mobile_money', icon: 'airtel-icon.png' },
          { id: 'card', name: 'Credit/Debit Card', type: 'card', icon: 'card-icon.png' }
        ],
        'KE': [
          { id: 'mpesa', name: 'M-Pesa', type: 'mobile_money', icon: 'mpesa-icon.png' },
          { id: 'card', name: 'Credit/Debit Card', type: 'card', icon: 'card-icon.png' }
        ],
        'UG': [
          { id: 'mtn', name: 'MTN Mobile Money', type: 'mobile_money', icon: 'mtn-icon.png' },
          { id: 'airtel', name: 'Airtel Money', type: 'mobile_money', icon: 'airtel-icon.png' },
          { id: 'card', name: 'Credit/Debit Card', type: 'card', icon: 'card-icon.png' }
        ],
        'US': [
          { id: 'card', name: 'Credit/Debit Card', type: 'card', icon: 'card-icon.png' },
          { id: 'paypal', name: 'PayPal', type: 'digital_wallet', icon: 'paypal-icon.png' }
        ],
        'default': [
          { id: 'card', name: 'Credit/Debit Card', type: 'card', icon: 'card-icon.png' }
        ]
      };
      
      // Return payment methods for the specified country or default
      return paymentMethodsByCountry[countryCode] || paymentMethodsByCountry.default;
    } catch (error) {
      console.error('Error getting supported payment methods:', error);
      throw error;
    }
  }
};

export default paymentService;
