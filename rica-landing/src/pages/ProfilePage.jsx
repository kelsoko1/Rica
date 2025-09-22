import React, { useEffect } from 'react';
import { Box, Typography, Container, Breadcrumbs, Link, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserProfile from '../components/UserProfile';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box sx={{ pt: { xs: 10, md: 12 }, pb: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Home
          </Link>
          <Typography color="text.primary">Profile</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 700
            }}
          >
            Your Profile
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              component={RouterLink} 
              to="/payment-history"
              variant="outlined" 
              color="primary"
            >
              Payment History
            </Button>
            
            <Button 
              component={RouterLink} 
              to="/subscriptions"
              variant="outlined" 
              color="primary"
            >
              Subscriptions
            </Button>
            
            <Button 
              component={RouterLink} 
              to="/analytics"
              variant="outlined" 
              color="primary"
            >
              Analytics
            </Button>
            
            <Button 
              component={RouterLink} 
              to="/recurring-payments"
              variant="outlined" 
              color="primary"
            >
              Recurring Payments
            </Button>
          </Box>
        </Box>
        
        <UserProfile />
      </Container>
    </Box>
  );
};

export default ProfilePage;
