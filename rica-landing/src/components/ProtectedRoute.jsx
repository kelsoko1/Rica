import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress color="primary" size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (requireAuth && !currentUser) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && currentUser) {
    // Redirect to Rica UI if user is already authenticated
    // In a real app, this would be the URL of the Rica UI application
    window.location.href = 'http://localhost:3000';
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress color="primary" size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          Redirecting to dashboard...
        </Typography>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;
