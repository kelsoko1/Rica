// Mock Firebase implementation for development
// This will be replaced with actual Firebase when deployed

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBm5gnFQofXAOCBpod4OQrwLWDrPy-OTzY",
  authDomain: "kelsoko-bddc4.firebaseapp.com",
  projectId: "kelsoko-bddc4",
  storageBucket: "kelsoko-bddc4.appspot.com",
  messagingSenderId: "605278507250",
  appId: "1:605278507250:web:1234567890abcdef"
};

// Mock Firebase app
const app = {
  name: "[DEFAULT]",
  options: { ...firebaseConfig },
  automaticDataCollectionEnabled: false
};

// Store auth state listeners
let authStateListeners = [];
let mockCurrentUser = null;

// Helper to notify all listeners of auth state changes
const notifyAuthStateListeners = (user) => {
  authStateListeners.forEach(listener => {
    try {
      listener(user);
    } catch (error) {
      console.error('Error in auth state listener:', error);
    }
  });
};

// Mock auth service
const auth = {
  get currentUser() {
    return mockCurrentUser;
  },
  set currentUser(user) {
    mockCurrentUser = user;
    notifyAuthStateListeners(user);
  },
  onAuthStateChanged: (callback) => {
    // Add listener to the list
    authStateListeners.push(callback);
    
    // Immediately call with current user state
    setTimeout(() => {
      try {
        callback(mockCurrentUser);
      } catch (error) {
        console.error('Error in initial auth state callback:', error);
      }
    }, 100);
    
    // Return unsubscribe function
    return () => {
      authStateListeners = authStateListeners.filter(listener => listener !== callback);
    };
  },
  signInWithEmailAndPassword: async (email, password) => {
    console.log('Mock sign in with:', email);
    const user = { 
      uid: 'mock-user-id', 
      email, 
      displayName: email.split('@')[0], 
      emailVerified: true,
      photoURL: null,
      phoneNumber: null
    };
    auth.currentUser = user;
    return { user };
  },
  createUserWithEmailAndPassword: async (email, password) => {
    console.log('Mock create user with:', email);
    const user = { 
      uid: 'mock-user-id', 
      email, 
      displayName: null, 
      emailVerified: false,
      photoURL: null,
      phoneNumber: null
    };
    auth.currentUser = user;
    return { user };
  },
  signOut: async () => {
    console.log('Mock sign out');
    auth.currentUser = null;
  },
  sendPasswordResetEmail: async (email) => {
    console.log('Mock password reset email sent to:', email);
  },
  updateProfile: async (user, profile) => {
    console.log('Mock update profile:', profile);
    if (mockCurrentUser) {
      mockCurrentUser = { ...mockCurrentUser, ...profile };
      notifyAuthStateListeners(mockCurrentUser);
    }
  }
};

// Mock firestore service
const firestore = {
  collection: (name) => ({
    doc: (id) => ({
      get: async () => ({
        exists: true,
        data: () => ({
          uid: id,
          email: 'user@example.com',
          displayName: 'Test User',
          credits: 500
        })
      }),
      set: async (data) => console.log(`Mock set document ${name}/${id}:`, data),
      update: async (data) => console.log(`Mock update document ${name}/${id}:`, data)
    })
  })
};

// Mock storage service
const storage = {
  ref: (path) => ({
    put: async (file) => console.log(`Mock upload to ${path}:`, file.name),
    getDownloadURL: async () => 'https://example.com/mock-image.jpg'
  })
};

export { app, auth, firestore, storage };
export default app;
