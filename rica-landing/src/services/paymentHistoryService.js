/**
 * Payment History Service
 * 
 * This service handles payment history tracking and management.
 * It stores payment history in localStorage for demo purposes.
 * In a real application, this would be fetched from a server API.
 */

// Local storage key for payment history
const PAYMENT_HISTORY_KEY = 'rica_payment_history';

// Get payment history from localStorage
const getPaymentHistory = () => {
  try {
    const history = localStorage.getItem(PAYMENT_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting payment history:', error);
    return [];
  }
};

// Add a payment to history
const addPaymentToHistory = (payment) => {
  try {
    const history = getPaymentHistory();
    
    // Check if payment already exists
    const existingIndex = history.findIndex(p => p.transactionId === payment.transactionId);
    
    if (existingIndex >= 0) {
      // Update existing payment
      history[existingIndex] = {
        ...history[existingIndex],
        ...payment,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new payment
      history.unshift({
        ...payment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // Store updated history
    localStorage.setItem(PAYMENT_HISTORY_KEY, JSON.stringify(history));
    
    return history;
  } catch (error) {
    console.error('Error adding payment to history:', error);
    return [];
  }
};

// Update payment status in history
const updatePaymentStatus = (transactionId, status, details = {}) => {
  try {
    const history = getPaymentHistory();
    
    // Find payment in history
    const existingIndex = history.findIndex(p => p.transactionId === transactionId);
    
    if (existingIndex >= 0) {
      // Update payment status
      history[existingIndex] = {
        ...history[existingIndex],
        status,
        ...details,
        updatedAt: new Date().toISOString()
      };
      
      // Store updated history
      localStorage.setItem(PAYMENT_HISTORY_KEY, JSON.stringify(history));
    }
    
    return history;
  } catch (error) {
    console.error('Error updating payment status:', error);
    return [];
  }
};

// Clear payment history
const clearPaymentHistory = () => {
  try {
    localStorage.removeItem(PAYMENT_HISTORY_KEY);
    return [];
  } catch (error) {
    console.error('Error clearing payment history:', error);
    return [];
  }
};

// Get payment by transaction ID
const getPaymentById = (transactionId) => {
  try {
    const history = getPaymentHistory();
    return history.find(p => p.transactionId === transactionId) || null;
  } catch (error) {
    console.error('Error getting payment by ID:', error);
    return null;
  }
};

// Filter payments by status
const filterPaymentsByStatus = (status) => {
  try {
    const history = getPaymentHistory();
    return status ? history.filter(p => p.status === status) : history;
  } catch (error) {
    console.error('Error filtering payments by status:', error);
    return [];
  }
};

// Filter payments by date range
const filterPaymentsByDateRange = (startDate, endDate) => {
  try {
    const history = getPaymentHistory();
    
    if (!startDate && !endDate) {
      return history;
    }
    
    return history.filter(p => {
      const paymentDate = new Date(p.createdAt).getTime();
      const start = startDate ? new Date(startDate).getTime() : 0;
      const end = endDate ? new Date(endDate).getTime() : Infinity;
      
      return paymentDate >= start && paymentDate <= end;
    });
  } catch (error) {
    console.error('Error filtering payments by date range:', error);
    return [];
  }
};

// Export payment history service
export default {
  getPaymentHistory,
  addPaymentToHistory,
  updatePaymentStatus,
  clearPaymentHistory,
  getPaymentById,
  filterPaymentsByStatus,
  filterPaymentsByDateRange
};
