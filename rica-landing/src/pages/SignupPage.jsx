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
  Stepper,
  Step,
  StepLabel,
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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

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

const steps = ['Account Details', 'Personal Information', 'Subscription Plan'];

const SignupPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { signup, currentUser, error: authError } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: '',
    jobTitle: '',
    agreeTerms: false,
    plan: 'professional'
  });
  const [errors, setErrors] = useState({});
  const [signupError, setSignupError] = useState('');
  
  useEffect(() => {
    // If user is already logged in, redirect to Rica UI
    if (currentUser) {
      window.location.href = 'http://localhost:3000';
    }
  }, [currentUser]);
  
  useEffect(() => {
    // Set signup error from auth context
    if (authError) {
      setSignupError(authError);
    }
  }, [authError]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'agreeTerms' ? checked : value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handlePlanSelect = (plan) => {
    setFormData({
      ...formData,
      plan
    });
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (activeStep === 0) {
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (activeStep === 1) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateStep()) {
      if (activeStep === steps.length - 1) {
        // Submit form and register user
        try {
          await signup(formData);
          // If successful, the user will be redirected to Rica UI
          // by the useEffect hook that watches currentUser
        } catch (error) {
          setSignupError(error.message || 'Registration failed. Please try again.');
          // Stay on the current step if there's an error
          return;
        }
      } else {
        setActiveStep((prevStep) => prevStep + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>Create your account</Typography>
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
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  variant="outlined"
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4, mb: 2 }}>
              <Divider>
                <Typography variant="body2" color="text.secondary">
                  Or sign up with
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
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>Personal Information</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company (Optional)"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Job Title (Optional)"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the{' '}
                      <Link component={RouterLink} to="/terms" color="primary">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link component={RouterLink} to="/privacy" color="primary">
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                />
                {errors.agreeTerms && (
                  <Typography color="error" variant="caption">
                    {errors.agreeTerms}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>Choose your plan</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: '1px solid',
                    borderColor: formData.plan === 'starter' ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: formData.plan === 'starter' ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                  onClick={() => handlePlanSelect('starter')}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Starter</Typography>
                    {formData.plan === 'starter' && (
                      <CheckCircleOutlineIcon color="primary" />
                    )}
                  </Box>
                  <Typography variant="h5" sx={{ mb: 1 }}>$49<Typography component="span" variant="body2" color="text.secondary">/mo</Typography></Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Perfect for individuals and small teams
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      Basic threat detection
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      Up to 5 browser profiles
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      Standard analytics
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: '1px solid',
                    borderColor: formData.plan === 'professional' ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: formData.plan === 'professional' ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                    position: 'relative',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                  onClick={() => handlePlanSelect('professional')}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: -12, 
                      right: 24, 
                      backgroundColor: 'primary.main',
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  >
                    POPULAR
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Professional</Typography>
                    {formData.plan === 'professional' && (
                      <CheckCircleOutlineIcon color="primary" />
                    )}
                  </Box>
                  <Typography variant="h5" sx={{ mb: 1 }}>$99<Typography component="span" variant="body2" color="text.secondary">/mo</Typography></Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Ideal for growing businesses
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      Advanced threat detection
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      Up to 20 browser profiles
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      Real-time analytics
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      API access
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: '1px solid',
                    borderColor: formData.plan === 'enterprise' ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: formData.plan === 'enterprise' ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                  onClick={() => handlePlanSelect('enterprise')}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Enterprise</Typography>
                    {formData.plan === 'enterprise' && (
                      <CheckCircleOutlineIcon color="primary" />
                    )}
                  </Box>
                  <Typography variant="h5" sx={{ mb: 1 }}>Custom</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    For large organizations with complex needs
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      Custom threat detection rules
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      Unlimited browser profiles
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      Advanced analytics & reporting
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      Dedicated account manager
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
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
          left: '10%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)' 
        }} 
      />
      <GradientBox 
        sx={{ 
          bottom: '10%', 
          right: '10%',
          background: 'radial-gradient(circle, rgba(244, 63, 94, 0.2) 0%, transparent 70%)' 
        }} 
      />
      
      <Container maxWidth="md">
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
                Join Rica
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create your account and start your security journey
              </Typography>
            </Box>
            
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {signupError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {signupError}
              </Alert>
            )}
            
            {activeStep === steps.length ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" sx={{ mb: 2 }}>Registration Complete!</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Thank you for signing up. You'll be redirected to your dashboard shortly.
                </Typography>
                <Alert severity="success" sx={{ mb: 3 }}>
                  Your 14-day free trial has been activated.
                </Alert>
              </Box>
            ) : (
              <>
                {renderStepContent(activeStep)}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    variant="outlined"
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                  >
                    {activeStep === steps.length - 1 ? 'Complete Registration' : 'Next'}
                  </Button>
                </Box>
              </>
            )}
            
            {activeStep === 0 && (
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login" color="primary">
                    Log in
                  </Link>
                </Typography>
              </Box>
            )}
          </StyledPaper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default SignupPage;
