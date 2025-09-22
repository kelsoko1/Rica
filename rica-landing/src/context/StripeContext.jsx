import React, { createContext, useState, useEffect, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { stripeConfig } from '../config/payment';

// Get Stripe public key from config
const STRIPE_PUBLIC_KEY = stripeConfig.publicKey;

// Create a context for Stripe
export const StripeContext = createContext();

export const useStripe = () => useContext(StripeContext);

// Stripe provider component
export const StripeProvider = ({ children }) => {
  const [stripePromise, setStripePromise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize Stripe
    const initStripe = async () => {
      try {
        const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
        setStripePromise(stripe);
      } catch (err) {
        console.error('Failed to load Stripe:', err);
        setError('Failed to initialize payment system');
      } finally {
        setLoading(false);
      }
    };

    initStripe();
  }, []);

  // If Stripe is still loading, you might want to show a loading indicator
  if (loading) {
    return <div>Loading payment system...</div>;
  }

  // If there was an error loading Stripe, show an error message
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Provide Stripe through context
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
