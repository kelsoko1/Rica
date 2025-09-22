import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  FormControlLabel,
  Checkbox,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  border: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(6),
  },
}));

const SocialButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    borderColor: theme.palette.primary.main,
  },
}));

const GradientBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '60%',
  height: '60%',
  borderRadius: '50%',
  filter: 'blur(100px)',
  zIndex: -1,
  opacity: 0.15,
}));

const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login, currentUser, error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // If user is already logged in, redirect to Rica UI
    if (currentUser) {
      window.location.href = 'http://localhost:3000';
    }
  }, [currentUser]);
  
  useEffect(() => {
    // Set login error from auth context
    if (authError) {
      setLoginError(authError);
    }
  }, [authError]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rememberMe' ? checked : value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Clear login error when any field changes
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setLoginError('');
      
      try {
        // Call login function from auth context
        await login(formData.email, formData.password);
        
        // If successful, the user will be redirected to Rica UI
        // by the useEffect hook that watches currentUser
        
        // For demo purposes, we'll also store the rememberMe preference
        if (formData.rememberMe) {
          localStorage.setItem('ricaRememberMe', 'true');
        } else {
          localStorage.removeItem('ricaRememberMe');
        }
      } catch (error) {
        setLoginError(error.message || 'Login failed. Please check your credentials.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box 
      sx={{ 
        py: { xs: 10, md: 12 }, 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <GradientBox 
        sx={{ 
          top: '30%', 
          right: '10%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)' 
        }} 
      />
      <GradientBox 
        sx={{ 
          bottom: '10%', 
          left: '10%',
          background: 'radial-gradient(circle, rgba(244, 63, 94, 0.2) 0%, transparent 70%)' 
        }} 
      />
      
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StyledPaper>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  mb: 1,
                  background: 'linear-gradient(90deg, #6366f1 0%, #f43f5e 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Log in to access your Rica dashboard
              </Typography>
            </Box>
            
            {loginError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {loginError}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    variant="outlined"
                    autoComplete="email"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    variant="outlined"
                    autoComplete="current-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={toggleShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onChange={handleChange}
                          color="primary"
                        />
                      }
                      label={<Typography variant="body2">Remember me</Typography>}
                    />
                    <Link component={RouterLink} to="/forgot-password" variant="body2" color="primary">
                      Forgot password?
                    </Link>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={isSubmitting}
                    sx={{ py: 1.5 }}
                  >
                    {isSubmitting ? 'Logging in...' : 'Log In'}
                  </Button>
                </Grid>
              </Grid>
            </form>
            
            <Box sx={{ mt: 4, mb: 2 }}>
              <Divider>
                <Typography variant="body2" color="text.secondary">
                  Or log in with
                </Typography>
              </Divider>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <SocialButton fullWidth startIcon={<GoogleIcon />}>
                  Google
                </SocialButton>
              </Grid>
              <Grid item xs={12} sm={4}>
                <SocialButton fullWidth startIcon={<GitHubIcon />}>
                  GitHub
                </SocialButton>
              </Grid>
              <Grid item xs={12} sm={4}>
                <SocialButton fullWidth startIcon={<LinkedInIcon />}>
                  LinkedIn
                </SocialButton>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/signup" color="primary">
                  Sign up
                </Link>
              </Typography>
            </Box>
          </StyledPaper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LoginPage;
