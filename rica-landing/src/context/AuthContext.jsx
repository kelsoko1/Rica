import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check localStorage for authentication token
    const token = localStorage.getItem('ricaAuthToken');
    const userData = localStorage.getItem('ricaUserData');
    
    if (token && userData) {
      try {
        // Parse user data from localStorage
        const user = JSON.parse(userData);
        setCurrentUser(user);
        
        // In a real app, we would validate the token with an API call
        // validateToken(token).then(...)
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('ricaAuthToken');
        localStorage.removeItem('ricaUserData');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      // Call the login method from the API service
      const { user, token } = await authService.login(email, password);
      
      // Store in localStorage
      localStorage.setItem('ricaAuthToken', token);
      localStorage.setItem('ricaUserData', JSON.stringify(user));
      
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.message || err || 'Authentication failed');
      throw err;
    }
  };

  const signup = async (userData) => {
    setError(null);
    try {
      // Call the register method from the API service
      const { user, token } = await authService.register(userData);
      
      // Store in localStorage
      localStorage.setItem('ricaAuthToken', token);
      localStorage.setItem('ricaUserData', JSON.stringify(user));
      
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.message || err || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('ricaAuthToken');
    localStorage.removeItem('ricaUserData');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
