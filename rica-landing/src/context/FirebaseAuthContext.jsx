import React, { createContext, useContext, useState, useEffect } from 'react';
import firebaseAuthService from '../services/firebaseAuthService';
import { auth } from '../config/firebase';

// Create Firebase Auth Context with default value
const FirebaseAuthContext = createContext({
  currentUser: null,
  loading: true,
  error: null,
  register: async () => {},
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updateUserProfile: async () => {},
  sendEmailVerification: async () => {},
  updateUserEmail: async () => {},
  updateUserPassword: async () => {},
  deleteUserAccount: async () => {}
});

// Custom hook to use the Firebase Auth Context
export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

// Firebase Auth Provider Component
export const FirebaseAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Listen for auth state changes
  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = firebaseAuthService.onAuthStateChanged(async (user) => {
      try {
        if (!mounted) return;
        
        if (user) {
          // User is signed in
          try {
            const userData = await firebaseAuthService.getCurrentUser();
            if (mounted) {
              setCurrentUser(userData);
              setError(null);
            }
          } catch (userErr) {
            console.error('Error fetching user data:', userErr);
            // Still set the basic user info even if fetching full data fails
            if (mounted) {
              setCurrentUser({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                emailVerified: user.emailVerified
              });
            }
          }
        } else {
          // User is signed out
          if (mounted) {
            setCurrentUser(null);
            setError(null);
          }
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        if (mounted) {
          setError(err.message);
          setCurrentUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });
    
    // Cleanup subscription on unmount
    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
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
