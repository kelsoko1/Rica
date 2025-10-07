import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import RecurringPaymentManager from '../components/subscriptions/RecurringPaymentManager';
import analyticsService from '../services/analyticsService';

// Page container with animation
const PageContainer = styled(motion.div)({
  paddingTop: '2rem',
  paddingBottom: '3rem',
});

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

// Page transition
const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

const RecurringPaymentsPage = () => {
  // Track page view
  useEffect(() => {
    analyticsService.trackPageView('recurring_payments_page');
  }, []);

  return (
    <PageContainer
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Home
          </Link>
          <Link component={RouterLink} to="/dashboard" color="inherit">
            Dashboard
          </Link>
          <Typography color="text.primary">Recurring Payments</Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Recurring Payments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your recurring payments and subscriptions
          </Typography>
        </Box>

        {/* Page Content */}
        <Paper sx={{ p: 0, overflow: 'hidden' }}>
          <Box sx={{ p: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>
              Your Recurring Payments
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Set up automatic recurring payments for your subscriptions. You can create, edit, pause, or cancel recurring payments at any time.
            </Typography>
          </Box>
          
          <Divider />
          
          <Box sx={{ p: 0 }}>
            <RecurringPaymentManager />
          </Box>
        </Paper>
      </Container>
    </PageContainer>
  );
};

export default RecurringPaymentsPage;
