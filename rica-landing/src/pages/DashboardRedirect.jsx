import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const DashboardRedirect = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    // If user is authenticated, redirect to Rica UI
    if (currentUser) {
      const redirectTimer = setTimeout(() => {
        window.location.href = 'http://localhost:3000';
      }, 1500);

      return () => clearTimeout(redirectTimer);
    }
  }, [currentUser]);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '70vh',
        textAlign: 'center'
      }}
    >
      <CircularProgress color="primary" size={60} sx={{ mb: 4 }} />
      <Typography variant="h4" sx={{ mb: 2 }}>
        Redirecting to Rica Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mb: 3 }}>
        You're being redirected to the Rica application dashboard. If you're not redirected automatically,
        please click the button below.
      </Typography>
      <Box 
        component="a"
        href="http://localhost:3000"
        sx={{
          display: 'inline-block',
          bgcolor: 'primary.main',
          color: 'white',
          py: 1.5,
          px: 4,
          borderRadius: 2,
          textDecoration: 'none',
          fontWeight: 500,
          '&:hover': {
            bgcolor: 'primary.dark',
          }
        }}
      >
        Go to Dashboard
      </Box>
    </Box>
  );
};

export default DashboardRedirect;
