import React, { createContext, useContext, useState, useEffect } from 'react';
import firebaseAuthService from '../services/firebaseAuthService';
import { auth } from '../config/firebase';

// Create Firebase Auth Context
const FirebaseAuthContext = createContext();

// Custom hook to use the Firebase Auth Context
export const useFirebaseAuth = () => {
  return useContext(FirebaseAuthContext);
};

// Firebase Auth Provider Component
export const FirebaseAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          // User is signed in
          const userData = await firebaseAuthService.getCurrentUser();
          setCurrentUser(userData);
        } else {
          // User is signed out
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  // Register with email and password
  const register = async (email, password, userData) => {
    setError(null);
    try {
      const user = await firebaseAuthService.registerWithEmailAndPassword(email, password, userData);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  // Sign in with email and password
  const login = async (email, password) => {
    setError(null);
    try {
      const user = await firebaseAuthService.signInWithEmailAndPassword(email, password);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  // Sign in with Google
  const loginWithGoogle = async () => {
    setError(null);
    try {
      const user = await firebaseAuthService.signInWithGoogle();
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  // Sign out
  const logout = async () => {
    setError(null);
    try {
      await firebaseAuthService.signOut();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  // Send password reset email
  const resetPassword = async (email) => {
    setError(null);
    try {
      await firebaseAuthService.sendPasswordResetEmail(email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  // Update user profile
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const updatedUser = await firebaseAuthService.updateUserProfile(profileData);
      setCurrentUser(prevUser => ({
        ...prevUser,
        ...updatedUser
      }));
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  // Update user email
  const updateEmail = async (newEmail, password) => {
    setError(null);
    try {
      await firebaseAuthService.updateUserEmail(newEmail, password);
      setCurrentUser(prevUser => ({
        ...prevUser,
        email: newEmail,
        emailVerified: false
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  // Update user password
  const updatePassword = async (currentPassword, newPassword) => {
    setError(null);
    try {
      await firebaseAuthService.updateUserPassword(currentPassword, newPassword);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  // Context value
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateProfile,
    updateEmail,
    updatePassword
  };
  
  return (
    <FirebaseAuthContext.Provider value={value}>
      {!loading && children}
    </FirebaseAuthContext.Provider>
  );
};

export default FirebaseAuthContext;
