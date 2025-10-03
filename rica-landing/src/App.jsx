import React, { useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { FirebaseAuthProvider } from './context/FirebaseAuthContext';
import ClickPesaProvider from './context/ClickPesaContext';
import schedulerService from './services/schedulerService';
import integrationService from './services/integrationService';
import config from './config/environment';
import ProtectedRoute from './components/ProtectedRoute';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import DashboardRedirect from './pages/DashboardRedirect';
import ProfilePage from './pages/ProfilePage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RecurringPaymentsPage from './pages/RecurringPaymentsPage';
import CreditsPage from './pages/CreditsPage';
import Header from './components/Header';
import Footer from './components/Footer';

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)',
            transform: 'translateY(-2px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
          border: '1px solid #334155',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 20px 40px -5px rgba(0, 0, 0, 0.4)',
            borderColor: '#818cf8',
          },
        },
      },
    },
  },
});

const App = () => {
  // Initialize services
  useEffect(() => {
    // Initialize scheduler for recurring payments
    schedulerService.initializeScheduler();
    
    // Initialize integration with rica-ui
    // Integration service will get the real user ID from Firebase when a user logs in
    integrationService.initializeIntegration();
    
    // Log initialization in production
    if (config.isProd) {
      console.info(`[${new Date().toISOString()}] Rica application initialized in ${config.env} mode`);
    }
    
    // Clean up on unmount
    return () => {
      // Stop scheduler
      schedulerService.stopScheduler();
    };
  }, []);
  return (
    <ErrorBoundary>
      <FirebaseAuthProvider>
        <ClickPesaProvider>
          <ThemeProvider theme={darkTheme}>
              <CssBaseline />
              <div className="app">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={
                <ProtectedRoute requireAuth={false}>
                  <HomePage />
                </ProtectedRoute>
              } />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/signup" element={
                <ProtectedRoute requireAuth={false}>
                  <SignupPage />
                </ProtectedRoute>
              } />
              <Route path="/login" element={
                <ProtectedRoute requireAuth={false}>
                  <LoginPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute requireAuth={false}>
                  <CheckoutPage />
                </ProtectedRoute>
              } />
              <Route path="/payment-history" element={
                <ProtectedRoute>
                  <PaymentHistoryPage />
                </ProtectedRoute>
              } />
              <Route path="/subscriptions" element={
                <ProtectedRoute>
                  <SubscriptionPage />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              } />
              <Route path="/recurring-payments" element={
                <ProtectedRoute>
                  <RecurringPaymentsPage />
                </ProtectedRoute>
              } />
              <Route path="/credits" element={
                <ProtectedRoute>
                  <CreditsPage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
              </div>
          </ThemeProvider>
        </ClickPesaProvider>
      </FirebaseAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
