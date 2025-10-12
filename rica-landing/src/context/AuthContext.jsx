import React, { createContext } from 'react';
import { useFirebaseAuth } from './FirebaseAuthContext';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const firebaseAuth = useFirebaseAuth();

  return {
    ...firebaseAuth,
    signup: firebaseAuth.register,
  };
};

export const AuthProvider = ({ children }) => {
  return <>{children}</>;
};

export default AuthProvider;
