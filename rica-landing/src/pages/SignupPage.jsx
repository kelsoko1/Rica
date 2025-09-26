import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css';
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

const steps = ['Account Details', 'Personal Information', 'Payment Information'];

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
    plan: 'team'
  });

  // Credit card state
  const [cardData, setCardData] = useState({
    cvc: '',
    expiry: '',
    focus: '',
    name: '',
    number: '',
  });
  const [errors, setErrors] = useState({});
  const [signupError, setSignupError] = useState('');
  
  // State to track successful signup
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  // Removed automatic redirection after signup
  // User will now see a success message and can navigate manually
  
  useEffect(() => {
    // Set signup error from auth context
    if (authError) {
      setSignupError(authError);
    }
  }, [authError]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    
    // Handle credit card inputs separately
    if (['cvc', 'expiry', 'name', 'number'].includes(name)) {
      setCardData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData({
        ...formData,
        [name]: name === 'agreeTerms' ? checked : value
      });
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleCardInputFocus = (e) => {
    setCardData(prev => ({
      ...prev,
      focus: e.target.name
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 3) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
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
    
    if (activeStep === 3) {
      if (!cardData.number || cardData.number.replace(/\s/g, '').length < 15) {
        newErrors.cardNumber = 'Please enter a valid card number';
      }
      if (!cardData.name) {
        newErrors.cardName = 'Cardholder name is required';
      }
      if (!cardData.expiry || !/\d{2}\/\d{2}/.test(cardData.expiry)) {
        newErrors.cardExpiry = 'Please enter a valid expiry date (MM/YY)';
      }
      if (!cardData.cvc || cardData.cvc.length < 3) {
        newErrors.cardCvc = 'Please enter a valid CVC';
      }
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
          // Show success message
          setSignupError('');
          setSignupSuccess(true);
          // Reset form
          setActiveStep(0);
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            company: '',
            jobTitle: '',
            agreeTerms: false,
            plan: 'team'
          });
          setCardData({
            cvc: '',
            expiry: '',
            focus: '',
            name: '',
            number: '',
          });
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
            <Grid container spacing={2}>
              <Grid item xs={12}>
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
            <Typography variant="h6" sx={{ mb: 3 }}>Complete Your Subscription</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review your plan and complete payment to get started.
            </Typography>
            
            <Box sx={{ mb: 4, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Selected Plan: {formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1)}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {formData.plan === 'personal' 
                  ? '$9.99 per month' 
                  : formData.plan === 'team' 
                    ? '$29.99 per user/month' 
                    : '$5 per month + tokens (Pay As You Go)'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Select Payment Method</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper 
                    elevation={0}
                    sx={{
                      p: 3,
                      border: '1px solid',
                      borderColor: 'primary.main',
                      borderRadius: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 1 }}>Credit/Debit Card</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Pay securely using your Visa, Mastercard, or other major credit/debit cards.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Cards
                        cvc={cardData.cvc || ''}
                        expiry={cardData.expiry || ''}
                        focused={cardData.focus}
                        name={cardData.name || ''}
                        number={cardData.number || ''}
                      />
                      <Box sx={{ mt: 2 }}>
                        <TextField
                          fullWidth
                          label="Card Number"
                          name="number"
                          value={cardData.number}
                          onChange={handleChange}
                          onFocus={handleCardInputFocus}
                          placeholder="1234 5678 9012 3456"
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          label="Name on Card"
                          name="name"
                          value={cardData.name}
                          onChange={handleChange}
                          onFocus={handleCardInputFocus}
                          sx={{ mb: 2 }}
                        />
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Expiry Date"
                              name="expiry"
                              value={cardData.expiry}
                              onChange={handleChange}
                              onFocus={handleCardInputFocus}
                              placeholder="MM/YY"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="CVC"
                              name="cvc"
                              value={cardData.cvc}
                              onChange={handleChange}
                              onFocus={handleCardInputFocus}
                              placeholder="123"
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper 
                    elevation={0}
                    sx={{
                      p: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 1 }}>Mobile Money</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Pay conveniently using your mobile money account.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        select
                        label="Mobile Network"
                        value={formData.mobileNetwork || ''}
                        onChange={handleChange}
                        name="mobileNetwork"
                        sx={{ mb: 2 }}
                        SelectProps={{
                          native: true,
                        }}
                      >
                        <option value="">Select network</option>
                        <option value="airtel">Airtel Money</option>
                        <option value="vodacom">M-Pesa (Vodacom)</option>
                        <option value="halo">Halo Pesa</option>
                        <option value="mix">Mix by Yas</option>
                      </TextField>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phoneNumber"
                        value={formData.phoneNumber || ''}
                        onChange={handleChange}
                        placeholder="e.g., 255712345678"
                        sx={{ mb: 2 }}
                      />
                      <Alert severity="info" sx={{ mb: 2 }}>
                        You'll receive a payment request on your phone to complete the transaction. Standard network charges may apply.
                      </Alert>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: '1px solid',
                    borderColor: formData.plan === 'personal' ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: formData.plan === 'personal' ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                  onClick={() => handlePlanSelect('personal')}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Personal</Typography>
                    {formData.plan === 'personal' && (
                      <CheckCircleOutlineIcon color="primary" />
                    )}
                  </Box>
                  <Typography variant="h5" sx={{ mb: 1 }}>$9.99<Typography component="span" variant="body2" color="text.secondary">/mo</Typography></Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Perfect for individual users
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      Basic threat protection
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      Secure browsing
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      Email protection
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
                    borderColor: formData.plan === 'team' ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: formData.plan === 'team' ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                    position: 'relative',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                  onClick={() => handlePlanSelect('team')}
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
                    <Typography variant="h6">Team</Typography>
                    {formData.plan === 'team' && (
                      <CheckCircleOutlineIcon color="primary" />
                    )}
                  </Box>
                  <Typography variant="h5" sx={{ mb: 1 }}>$29.99<Typography component="span" variant="body2" color="text.secondary">/user/mo</Typography></Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Perfect for teams and families
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      All Personal features
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      Family protection
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      Child monitoring
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      Shared family dashboard
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
                    borderColor: formData.plan === 'payAsYouGo' ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: formData.plan === 'payAsYouGo' ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                  onClick={() => handlePlanSelect('payAsYouGo')}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Pay As You Go</Typography>
                    {formData.plan === 'payAsYouGo' && (
                      <CheckCircleOutlineIcon color="primary" />
                    )}
                  </Box>
                  <Typography variant="h5" sx={{ mb: 1 }}>$5<Typography component="span" variant="body2" color="text.secondary">/mo + tokens</Typography></Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Flexible pay-per-use option
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      Pay only for what you use
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      No long-term commitment
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      Purchase tokens as needed
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

  if (signupSuccess) {
    return (
      <Box 
        sx={{ 
          py: { xs: 10, md: 12 }, 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="sm">
          <StyledPaper>
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <CheckCircleOutlineIcon 
                sx={{ 
                  fontSize: 64, 
                  color: 'success.main',
                  mb: 2 
                }} 
              />
              <Typography variant="h5" gutterBottom>
                Registration Successful!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Thank you for signing up for Rica. Your account has been created successfully.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => window.location.href = 'http://localhost:3000'}
                sx={{ mt: 2, mr: 2 }}
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => setSignupSuccess(false)}
                sx={{ mt: 2 }}
              >
                Back to Login
              </Button>
            </Box>
          </StyledPaper>
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        py: { xs: 6, md: 8 },
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
