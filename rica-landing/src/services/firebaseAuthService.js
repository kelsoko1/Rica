// Mock Firebase auth methods
// These will be replaced with actual Firebase when deployed
import { auth, firestore } from '../config/firebase';
import analyticsService from './analyticsService';

// Mock Firestore methods
const doc = (db, collection, id) => firestore.collection(collection).doc(id);
const setDoc = async (docRef, data) => docRef.set(data);
const getDoc = async (docRef) => docRef.get();
const updateDoc = async (docRef, data) => docRef.update(data);
const serverTimestamp = () => new Date().toISOString();

/**
 * Firebase Authentication Service
 * 
 * This service handles user authentication using Firebase Auth.
 * It provides methods for user registration, login, logout, and profile management.
 */
const firebaseAuthService = {
  /**
   * Register a new user with email and password
   * 
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} userData - Additional user data
   * @returns {Promise<Object>} User data
   */
  registerWithEmailAndPassword: async (email, password, userData = {}) => {
    try {
      // Create user in Firebase Auth
      // Use our mock auth implementation
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Update user profile in our mock implementation
      user.displayName = userData.displayName || '';
      user.photoURL = userData.photoURL || '';
      
      // Mock email verification
      console.log(`Mock email verification sent to ${email}`);
      
      // Create user document in Firestore
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName || '',
        photoURL: userData.photoURL || '',
        phoneNumber: userData.phoneNumber || '',
        country: userData.country || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        emailVerified: user.emailVerified,
        role: 'user',
        credits: 0,
        subscription: null
      });
      
      // Track registration event
      analyticsService.trackEvent('user_registered', {
        method: 'email',
        userId: user.uid
      });
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName || '',
        emailVerified: user.emailVerified
      };
    } catch (error) {
      console.error('Error registering user:', error);
      
      // Track registration error
      analyticsService.trackEvent('registration_error', {
        error: error.message,
        code: error.code
      });
      
      throw error;
    }
  },
  
  /**
   * Sign in with email and password
   * 
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data
   */
  signInWithEmailAndPassword: async (email, password) => {
    try {
      // Use our mock auth implementation
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Set current user in our mock auth
      auth.currentUser = user;
      
      // Update last login timestamp
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp()
      });
      
      // Track login event
      analyticsService.trackEvent('user_login', {
        method: 'email',
        userId: user.uid
      });
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL
      };
    } catch (error) {
      console.error('Error signing in:', error);
      
      // Track login error
      analyticsService.trackEvent('login_error', {
        error: error.message,
        code: error.code
      });
      
      throw error;
    }
  },
  
  /**
   * Sign in with Google
   * 
   * @returns {Promise<Object>} User data
   */
  signInWithGoogle: async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Check if user exists in Firestore
      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create user document in Firestore
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          phoneNumber: user.phoneNumber || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          emailVerified: user.emailVerified,
          role: 'user',
          credits: 0,
          subscription: null
        });
        
        // Track registration event
        analyticsService.trackEvent('user_registered', {
          method: 'google',
          userId: user.uid
        });
      } else {
        // Update last login timestamp
        await updateDoc(userRef, {
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      // Track login event
      analyticsService.trackEvent('user_login', {
        method: 'google',
        userId: user.uid
      });
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL
      };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      
      // Track login error
      analyticsService.trackEvent('login_error', {
        method: 'google',
        error: error.message,
        code: error.code
      });
      
      throw error;
    }
  },
  
  /**
   * Sign out current user
   * 
   * @returns {Promise<void>}
   */
  signOut: async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Track logout event
        analyticsService.trackEvent('user_logout', {
          userId: currentUser.uid
        });
      }
      
      // Use our mock auth implementation
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },
  
  /**
   * Send password reset email
   * 
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  sendPasswordResetEmail: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      
      // Track password reset request
      analyticsService.trackEvent('password_reset_requested', {
        email
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      
      // Track password reset error
      analyticsService.trackEvent('password_reset_error', {
        error: error.message,
        code: error.code
      });
      
      throw error;
    }
  },
  
  /**
   * Update user profile
   * 
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated user data
   */
  updateUserProfile: async (profileData) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user is currently signed in');
      
      // Update profile in Firebase Auth
      await updateProfile(currentUser, {
        displayName: profileData.displayName || currentUser.displayName,
        photoURL: profileData.photoURL || currentUser.photoURL
      });
      
      // Update profile in Firestore
      const userRef = doc(firestore, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: profileData.displayName || currentUser.displayName,
        photoURL: profileData.photoURL || currentUser.photoURL,
        phoneNumber: profileData.phoneNumber || '',
        country: profileData.country || '',
        updatedAt: serverTimestamp()
      });
      
      // Track profile update
      analyticsService.trackEvent('profile_updated', {
        userId: currentUser.uid
      });
      
      return {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: profileData.displayName || currentUser.displayName,
        emailVerified: currentUser.emailVerified,
        photoURL: profileData.photoURL || currentUser.photoURL
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      
      // Track profile update error
      analyticsService.trackEvent('profile_update_error', {
        error: error.message,
        code: error.code
      });
      
      throw error;
    }
  },
  
  /**
   * Update user email
   * 
   * @param {string} newEmail - New email address
   * @param {string} password - Current password for verification
   * @returns {Promise<void>}
   */
  updateUserEmail: async (newEmail, password) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user is currently signed in');
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update email in Firebase Auth
      await updateEmail(currentUser, newEmail);
      
      // Send email verification
      await sendEmailVerification(currentUser);
      
      // Update email in Firestore
      const userRef = doc(firestore, 'users', currentUser.uid);
      await updateDoc(userRef, {
        email: newEmail,
        emailVerified: false,
        updatedAt: serverTimestamp()
      });
      
      // Track email update
      analyticsService.trackEvent('email_updated', {
        userId: currentUser.uid
      });
    } catch (error) {
      console.error('Error updating user email:', error);
      
      // Track email update error
      analyticsService.trackEvent('email_update_error', {
        error: error.message,
        code: error.code
      });
      
      throw error;
    }
  },
  
  /**
   * Update user password
   * 
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  updateUserPassword: async (currentPassword, newPassword) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user is currently signed in');
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update password in Firebase Auth
      await updatePassword(currentUser, newPassword);
      
      // Track password update
      analyticsService.trackEvent('password_updated', {
        userId: currentUser.uid
      });
    } catch (error) {
      console.error('Error updating user password:', error);
      
      // Track password update error
      analyticsService.trackEvent('password_update_error', {
        error: error.message,
        code: error.code
      });
      
      throw error;
    }
  },
  
  /**
   * Get current user data
   * 
   * @returns {Promise<Object|null>} User data or null if not signed in
   */
  getCurrentUser: async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    
    try {
      // Get user data from Firestore
      const userRef = doc(firestore, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          emailVerified: currentUser.emailVerified,
          photoURL: currentUser.photoURL,
          phoneNumber: userData.phoneNumber || '',
          country: userData.country || '',
          role: userData.role || 'user',
          credits: userData.credits || 0,
          subscription: userData.subscription || null,
          createdAt: userData.createdAt,
          lastLoginAt: userData.lastLoginAt
        };
      }
      
      return {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        emailVerified: currentUser.emailVerified,
        photoURL: currentUser.photoURL
      };
    } catch (error) {
      console.error('Error getting current user data:', error);
      
      // Return basic user data from Auth
      return {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        emailVerified: currentUser.emailVerified,
        photoURL: currentUser.photoURL
      };
    }
  },
  
  /**
   * Listen for auth state changes
   * 
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChanged: (callback) => {
    // Use our mock auth implementation
    return auth.onAuthStateChanged(callback);
  }
};

export default firebaseAuthService;
