import React, { createContext, useState, useContext, useEffect } from 'react';
import paymentService from "../services/paymentService.jsx";
import { clickPesaConfig } from '../config/payment';

// Create a context for ClickPesa
export const ClickPesaContext = createContext();

export const useClickPesa = () => useContext(ClickPesaContext);

// ClickPesa provider component
export const ClickPesaProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);
  const [availableProviders, setAvailableProviders] = useState([]);
  
  // Load available providers on mount
  useEffect(() => {
    const loadProviders = async () => {
      try {
        // In a real app, this would fetch from the API
        // For now, we'll use the static config
        // Combine providers from all countries
        const allProviders = [];
        
        // Add providers from Tanzania
        if (clickPesaConfig.providers.TZ) {
          allProviders.push(...clickPesaConfig.providers.TZ);
        }
        
        // Add providers from Kenya
        if (clickPesaConfig.providers.KE) {
          allProviders.push(...clickPesaConfig.providers.KE);
        }
        
        // Add providers from Uganda
        if (clickPesaConfig.providers.UG) {
          allProviders.push(...clickPesaConfig.providers.UG);
        }
        
        // Add global providers
        if (clickPesaConfig.providers.GLOBAL) {
          allProviders.push(...clickPesaConfig.providers.GLOBAL);
        }
        
        setAvailableProviders(allProviders);
      } catch (err) {
        console.error('Failed to load payment providers:', err);
        setError('Failed to load payment providers');
      }
    };
    
    loadProviders();
  }, []);
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  // Create a ClickPesa payment
  const createPayment = async (amount, phoneNumber, description, reference) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await paymentService.createClickPesaPayment(
        amount, 
        phoneNumber, 
        description, 
        reference
      );
      
      setTransaction(result);
      
      // Set up automatic status checking
      if (result.transactionId) {
        // Clear any existing interval
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
        }
        
        // Check status every 5 seconds
        const interval = setInterval(() => {
          checkPaymentStatus(result.transactionId);
        }, 5000);
        
        setStatusCheckInterval(interval);
      }
      
      return result;
    } catch (err) {
      setError(err.message || 'Failed to create payment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check payment status
  const checkPaymentStatus = async (transactionId) => {
    if (!transactionId) return;
    
    // Don't show loading indicator for automatic checks
    const isManualCheck = !statusCheckInterval;
    if (isManualCheck) setLoading(true);
    
    try {
      const result = await paymentService.checkClickPesaPaymentStatus(transactionId);
      
      // Update transaction state if it's the current transaction
      if (transaction && transaction.transactionId === transactionId) {
        setTransaction({
          ...transaction,
          status: result.status,
          message: result.message,
          updated: result.updated,
          details: result.details
        });
        
        // If payment is completed or failed, stop checking
        if (result.status === 'COMPLETED' || result.status === 'FAILED') {
          if (statusCheckInterval) {
            clearInterval(statusCheckInterval);
            setStatusCheckInterval(null);
          }
        }
      }
      
      return result;
    } catch (err) {
      setError(err.message || 'Failed to check payment status');
      if (isManualCheck) throw err;
    } finally {
      if (isManualCheck) setLoading(false);
    }
  };

  // Get supported payment methods
  const getSupportedPaymentMethods = async (countryCode) => {
    setLoading(true);
    
    try {
      return await paymentService.getSupportedPaymentMethods(countryCode);
    } catch (err) {
      setError(err.message || 'Failed to get payment methods');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear transaction state
  const clearTransaction = () => {
    setTransaction(null);
    setError(null);
    
    // Clear status check interval
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
  };

  // Context value
  const value = {
    loading,
    error,
    transaction,
    availableProviders,
    createPayment,
    checkPaymentStatus,
    getSupportedPaymentMethods,
    clearTransaction,
    isCheckingStatus: !!statusCheckInterval
  };

  return (
    <ClickPesaContext.Provider value={value}>
      {children}
    </ClickPesaContext.Provider>
  );
};

export default ClickPesaProvider;
