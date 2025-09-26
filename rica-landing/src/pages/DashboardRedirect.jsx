import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const DashboardRedirect = () => {
  const { currentUser } = useAuth();

  // Removed automatic redirection to allow users to stay on the landing page

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
        Rica Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mb: 3 }}>
        You can access the Rica application dashboard by clicking the button below.
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
