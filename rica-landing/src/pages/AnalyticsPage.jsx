import React, { useEffect } from 'react';
import { Box, Typography, Container, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import analyticsService from '../services/analyticsService';

const AnalyticsPage = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Track page view
    analyticsService.trackPageView('analytics_page');
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
            <Typography color="text.primary">Analytics</Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <BarChartIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 700
              }}
            >
              Analytics Dashboard
            </Typography>
          </Box>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
            View detailed analytics about your payments, subscriptions, and usage patterns.
          </Typography>
          
          <AnalyticsDashboard />
        </Container>
      </Box>
    </motion.div>
  );
};

export default AnalyticsPage;
