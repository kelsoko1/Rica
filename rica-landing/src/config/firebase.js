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

// Mock auth service
const auth = {
  currentUser: null,
  onAuthStateChanged: (callback) => {
    // Mock implementation
    setTimeout(() => callback(null), 100);
    return () => {}; // Unsubscribe function
  },
  signInWithEmailAndPassword: async (email, password) => {
    console.log('Mock sign in with:', email);
    return { user: { uid: 'mock-user-id', email, displayName: email.split('@')[0], emailVerified: true } };
  },
  createUserWithEmailAndPassword: async (email, password) => {
    console.log('Mock create user with:', email);
    return { user: { uid: 'mock-user-id', email, displayName: null, emailVerified: false } };
  },
  signOut: async () => {
    console.log('Mock sign out');
    auth.currentUser = null;
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
