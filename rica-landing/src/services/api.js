// API service for authentication and other requests

// Base URL for API requests
const API_URL = (window.env && window.env.NODE_ENV === 'production')
  ? 'https://api.rica.io' 
  : 'http://localhost:8080';

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = data.message || response.statusText;
    return Promise.reject(error);
  }
  
  return data;
};

// Authentication API
export const authService = {
  // Login user
  login: async (email, password) => {
    // In a real application, this would make an API call
    // For demo purposes, we'll simulate a successful login
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check credentials (simple validation for demo)
    if (!email || !password) {
      return Promise.reject('Email and password are required');
    }
    
    // Create a mock user and token
    const user = {
      id: 'user-123',
      email,
      name: email.split('@')[0],
      role: 'Security Analyst',
      avatar: null
    };
    
    const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
    
    // Return mock response
    return { user, token };
  },
  
  // Register new user
  register: async (userData) => {
    // In a real application, this would make an API call
    // For demo purposes, we'll simulate a successful registration
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check required fields
    if (!userData.email || !userData.password) {
      return Promise.reject('Required fields are missing');
    }
    
    // Create a mock user and token
    const user = {
      id: 'user-' + Math.random().toString(36).substring(2),
      email: userData.email,
      name: userData.firstName + ' ' + userData.lastName,
      role: 'Security Analyst',
      avatar: null
    };
    
    const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
    
    // Return mock response
    return { user, token };
  },
  
  // Validate token
  validateToken: async (token) => {
    // In a real application, this would make an API call to validate the token
    // For demo purposes, we'll assume the token is valid if it exists
    
    if (!token) {
      return Promise.reject('Invalid token');
    }
    
    // Return mock user data
    return {
      id: 'user-123',
      email: 'user@example.com',
      name: 'Demo User',
      role: 'Security Analyst',
      avatar: null
    };
  }
};

// User API
export const userService = {
  // Get user profile
  getProfile: async () => {
    // In a real application, this would make an API call
    // For demo purposes, we'll return mock data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock profile data
    return {
      id: 'user-123',
      email: 'user@example.com',
      name: 'Demo User',
      role: 'Security Analyst',
      company: 'Acme Corporation',
      phone: '+1 (555) 123-4567',
      avatar: null,
      plan: 'Professional',
      subscription: {
        status: 'active',
        renewalDate: '2025-10-20',
        plan: 'Professional',
        features: [
          'Advanced threat detection',
          'Up to 20 browser profiles',
          'Real-time analytics',
          'API access',
          '24/7 priority support',
          'Team collaboration'
        ]
      }
    };
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    // In a real application, this would make an API call
    // For demo purposes, we'll simulate a successful update
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return updated profile data
    return {
      ...profileData,
      updatedAt: new Date().toISOString()
    };
  }
};

export default {
  auth: authService,
  user: userService
};
