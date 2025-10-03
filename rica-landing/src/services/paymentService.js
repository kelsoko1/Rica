import { clickPesaConfig } from '../config/payment';
import paymentHistoryService from './paymentHistoryService';
import analyticsService from './analyticsService';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Get configuration from config files
const CLICKPESA_API_KEY = clickPesaConfig.apiKey;
const CLICKPESA_CLIENT_ID = clickPesaConfig.clientId;
const CLICKPESA_API_URL = clickPesaConfig.apiUrl;
const CLICKPESA_ENDPOINTS = clickPesaConfig.endpoints;
const COLLECTION_ACCOUNT = clickPesaConfig.collectionAccount;

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
   * Generate an authentication token for ClickPesa API
   * 
   * @returns {Promise<string>} Authentication token
   */
  generateAuthToken: async () => {
    try {
      const response = await axios.post(`${CLICKPESA_API_URL}${CLICKPESA_ENDPOINTS.generateToken}`, {
        clientId: CLICKPESA_CLIENT_ID,
        apiKey: CLICKPESA_API_KEY
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.token) {
        // Store token in localStorage with expiration
        const expiresAt = new Date().getTime() + (response.data.expiresIn * 1000);
        localStorage.setItem('clickpesa_token', response.data.token);
        localStorage.setItem('clickpesa_token_expires', expiresAt.toString());
        return response.data.token;
      } else {
        throw new Error('Failed to generate authentication token');
      }
    } catch (error) {
      console.error('Error generating ClickPesa auth token:', error);
      throw error;
    }
  },
  
  /**
   * Get a valid authentication token (generates a new one if expired)
   * 
   * @returns {Promise<string>} Valid authentication token
   */
  getAuthToken: async () => {
    const token = localStorage.getItem('clickpesa_token');
    const expiresAt = localStorage.getItem('clickpesa_token_expires');
    
    if (!token || !expiresAt || new Date().getTime() > parseInt(expiresAt)) {
      // Token is missing or expired, generate a new one
      return await paymentService.generateAuthToken();
    }
    
    return token;
  },

  /**
   * Preview a USSD push request before initiating payment
   * 
   * @param {number} amount - Payment amount
   * @param {string} phoneNumber - Phone number for mobile money payments
   * @param {string} reference - Payment reference
   * @param {string} currency - Currency code (default: TZS)
   * @returns {Promise<Object>} Preview response
   */
  previewUssdPushRequest: async (amount, phoneNumber, reference, currency = 'TZS') => {
    try {
      // Validate input parameters
      if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount. Amount must be a positive number.');
      }
      
      if (!reference) {
        reference = `RICA-${Date.now()}-${uuidv4().substring(0, 8)}`;
      }
      
      // Validate phone number format
      if (!phoneNumber || !phoneNumber.match(/^\+?\d{1,15}$/)) {
        throw new Error('Invalid phone number format. Use E.164 format (e.g., +255712345678 or 255712345678)');
      }
      
      // Remove + sign if present
      if (phoneNumber.startsWith('+')) {
        phoneNumber = phoneNumber.substring(1);
      }
      
      // Get auth token
      const token = await paymentService.getAuthToken();
      
      // Prepare request payload
      const payload = {
        amount: amount.toString(),
        currency: currency,
        orderReference: reference,
        phoneNumber: phoneNumber
      };
      
      // Call ClickPesa API
      const response = await axios.post(
        `${CLICKPESA_API_URL}${CLICKPESA_ENDPOINTS.previewUssdPush}`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error previewing USSD push request:', error);
      throw error;
    }
  },

  /**
   * Create a payment using the ClickPesa collection account
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
      
      // Determine currency based on phone number prefix
      let currency = 'TZS';
      
      if (phoneNumber) {
        // Remove + sign if present
        if (phoneNumber.startsWith('+')) {
          phoneNumber = phoneNumber.substring(1);
        }
        
        // Set currency based on country code
        if (phoneNumber.startsWith('255')) {
          currency = 'TZS'; // Tanzania
        } else if (phoneNumber.startsWith('254')) {
          currency = 'KES'; // Kenya
        } else if (phoneNumber.startsWith('256')) {
          currency = 'UGX'; // Uganda
        }
      }
      
      // For mobile money payments, use USSD push
      if (paymentMethod === 'mobile_money') {
        try {
          // First preview the request
          const previewResponse = await paymentService.previewUssdPushRequest(
            amount,
            phoneNumber,
            reference,
            currency
          );
          
          console.log('USSD push preview response:', previewResponse);
          
          // Get auth token
          const token = await paymentService.getAuthToken();
          
          // Prepare request payload for initiating payment
          const payload = {
            amount: amount.toString(),
            currency: currency,
            orderReference: reference,
            phoneNumber: phoneNumber
          };
          
          // Call ClickPesa API to initiate payment
          const response = await axios.post(
            `${CLICKPESA_API_URL}${CLICKPESA_ENDPOINTS.initiateUssdPush}`,
            payload,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          // Create payment response
          const paymentResponse = {
            success: true,
            transactionId: response.data.id,
            amount,
            phoneNumber,
            currency,
            status: response.data.status,
            message: 'Payment request sent successfully. Please check your phone to complete the payment.',
            reference: response.data.orderReference,
            created: response.data.createdAt,
            provider: response.data.channel
          };
          
          // Add to payment history
          paymentHistoryService.addPaymentToHistory({
            transactionId: response.data.id,
            amount,
            currency,
            status: response.data.status,
            phoneNumber,
            provider: response.data.channel,
            paymentMethod,
            description,
            reference: response.data.orderReference
          });
          
          // Track analytics event
          analyticsService.trackPaymentStarted({
            transactionId: response.data.id,
            amount,
            currency,
            paymentMethod,
            provider: response.data.channel,
            phoneNumber,
            description,
            reference: response.data.orderReference,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          });
          
          return paymentResponse;
        } catch (error) {
          console.error('Error creating USSD push payment:', error);
          throw error;
        }
      } else if (paymentMethod === 'card') {
        // For card payments, implement card payment flow
        // This would be similar to the USSD push flow but using the card payment endpoints
        throw new Error('Card payment method not implemented yet');
      } else {
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }
    } catch (error) {
      console.error('Error creating ClickPesa payment:', error);
      
      // Track error with detailed information
      analyticsService.trackPaymentFailed({
        amount,
        currency: currency || 'TZS',
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
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }
      
      // Get auth token
      const token = await paymentService.getAuthToken();
      
      // Call ClickPesa API to check payment status
      const response = await axios.get(
        `${CLICKPESA_API_URL}${CLICKPESA_ENDPOINTS.checkPaymentStatus}/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // If API call fails, fall back to local payment history
      if (!response.data) {
        const existingPayment = paymentHistoryService.getPaymentById(transactionId);
        
        if (!existingPayment) {
          throw new Error('Payment not found');
        }
        
        return {
          success: true,
          transactionId: existingPayment.transactionId,
          status: existingPayment.status,
          amount: existingPayment.amount,
          currency: existingPayment.currency,
        };
        
        // Add to payment history
        paymentHistoryService.addPaymentToHistory({
          transactionId: response.data.id,
          amount,
          currency,
          status: response.data.status,
          phoneNumber,
          provider: response.data.channel,
          paymentMethod,
          description,
          reference: response.data.orderReference
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
