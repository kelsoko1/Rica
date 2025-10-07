import React, { useEffect } from 'react';
import { Box, Typography, Container, Breadcrumbs, Link, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SubscriptionManager from '../components/subscriptions/SubscriptionManager';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import analyticsService from '../services/analyticsService';

const SubscriptionPage = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Track page view
    analyticsService.trackPageView('subscription_page');
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ pt: { xs: 10, md: 12 }, pb: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link component={RouterLink} to="/" color="inherit">
              Home
            </Link>
            <Link component={RouterLink} to="/profile" color="inherit">
              Profile
            </Link>
            <Typography color="text.primary">Subscriptions</Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <SubscriptionsIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 700
              }}
            >
              Subscription Management
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
              Manage your Rica subscription, change plans, or update billing information.
            </Typography>
            
            <Button
              component={RouterLink}
              to="/recurring-payments"
              variant="contained"
              color="primary"
            >
              Set Up Recurring Payments
            </Button>
          </Box>
          
          <SubscriptionManager />
        </Container>
      </Box>
    </motion.div>
  );
};

export default SubscriptionPage;
