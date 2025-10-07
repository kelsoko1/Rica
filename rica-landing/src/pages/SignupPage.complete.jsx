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
  alpha,
  FormHelperText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import EventIcon from '@mui/icons-material/Event';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

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

const steps = ['Account Details', 'Personal Information', 'Subscription Plan', 'Payment Information'];

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
    plan: 'team',
    saveCard: false
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
  
  useEffect(() => {
    if (currentUser) {
      window.location.href = 'http://localhost:3000';
    }
  }, [currentUser]);
  
  useEffect(() => {
    if (authError) {
      setSignupError(authError);
    }
  }, [authError]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    if (['cvc', 'expiry', 'name', 'number', 'saveCard'].includes(name)) {
      if (name === 'saveCard') {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      } else {
        setCardData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleCardInputFocus = (e) => {
    setCardData({
      ...cardData,
      focus: e.target.name
    });
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
        try {
          await signup({
            ...formData,
            cardData: formData.saveCard ? cardData : null
          });
        } catch (error) {
          setSignupError(error.message || 'Registration failed. Please try again.');
          return;
        }
      } else {
        setActiveStep(prevStep => prevStep + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
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
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select the plan that best fits your needs. You can change your plan at any time.
            </Typography>
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
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    $9.99<Typography component="span" variant="body2" color="text.secondary">/mo</Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    For individuals getting started with Rica
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                    <li><Typography variant="body2">1 user</Typography></li>
                    <li><Typography variant="body2">10,000 tokens/month</Typography></li>
                    <li><Typography variant="body2">Basic analytics</Typography></li>
                    <li><Typography variant="body2">Email support</Typography></li>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: formData.plan === 'team' ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                    }
                  }}
                  onClick={() => handlePlanSelect('team')}
                >
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 12, 
                    right: -30, 
                    backgroundColor: 'primary.main',
                    color: 'white',
                    px: 3,
                    py: 0.5,
                    transform: 'rotate(45deg)',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    width: 120,
                    textAlign: 'center'
                  }}>
                    POPULAR
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Team</Typography>
                    {formData.plan === 'team' && (
                      <CheckCircleOutlineIcon color="primary" />
                    )}
                  </Box>
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    $29.99<Typography component="span" variant="body2" color="text.secondary">/user/mo</Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    For teams and businesses
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                    <li><Typography variant="body2">Up to 10 users</Typography></li>
                    <li><Typography variant="body2">50,000 tokens/month</Typography></li>
                    <li><Typography variant="body2">Advanced analytics</Typography></li>
                    <li><Typography variant="body2">Priority support</Typography></li>
                    <li><Typography variant="body2">Team management</Typography></li>
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
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    Custom<Typography component="span" variant="body2" color="text.secondary">/mo</Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    For large organizations with custom needs
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                    <li><Typography variant="body2">Unlimited users</Typography></li>
                    <li><Typography variant="body2">Custom token limits</Typography></li>
                    <li><Typography variant="body2">Dedicated infrastructure</Typography></li>
                    <li><Typography variant="body2">24/7 support</Typography></li>
                    <li><Typography variant="body2">Custom integrations</Typography></li>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>Payment Information</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your payment details to complete your subscription.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Cards
                  cvc={cardData.cvc}
                  expiry={cardData.expiry}
                  focused={cardData.focus}
                  name={cardData.name}
                  number={cardData.number}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    name="number"
                    value={cardData.number}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      setCardData({...cardData, number: formatted});
                    }}
                    onFocus={handleCardInputFocus}
                    error={!!errors.cardNumber}
                    helperText={errors.cardNumber}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreditCardIcon />
                        </InputAdornment>
                      ),
                      placeholder: '1234 5678 9012 3456'
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Cardholder Name"
                    name="name"
                    value={cardData.name}
                    onChange={handleChange}
                    onFocus={handleCardInputFocus}
                    error={!!errors.cardName}
                    helperText={errors.cardName}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineIcon />
                        </InputAdornment>
                      ),
                      placeholder: 'John Doe'
                    }}
                  />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <TextField
                        fullWidth
                        label="Expiry Date"
                        name="expiry"
                        value={cardData.expiry}
                        onChange={(e) => {
                          const formatted = formatExpiry(e.target.value);
                          setCardData({...cardData, expiry: formatted});
                        }}
                        onFocus={handleCardInputFocus}
                        error={!!errors.cardExpiry}
                        helperText={errors.cardExpiry}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EventIcon />
                            </InputAdornment>
                          ),
                          placeholder: 'MM/YY'
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="CVC"
                        name="cvc"
                        value={cardData.cvc}
                        onChange={handleChange}
                        onFocus={handleCardInputFocus}
                        error={!!errors.cardCvc}
                        helperText={errors.cardCvc}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <VpnKeyIcon />
                            </InputAdornment>
                          ),
                          placeholder: '123',
                          inputProps: { maxLength: 4 }
                        }}
                      />
                    </Grid>
                  </Grid>
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="saveCard"
                        checked={formData.saveCard}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label="Save card for future payments"
                  />
                  <FormHelperText sx={{ mt: -1, mb: 2 }}>
                    Your card details are encrypted and stored securely.
                  </FormHelperText>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      By continuing, you agree to our{' '}
                      <Link component={RouterLink} to="/terms" color="primary">
                        Terms of Service
                      </Link>{' '}
                      and authorize Rica to charge your card for the selected plan.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8, position: 'relative' }}>
      <GradientBox 
        sx={{ 
          top: '30%', 
          left: '10%',
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        }} 
      />
      
      <StyledPaper component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Create Your Rica Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join thousands of users securing their digital lives
          </Typography>
        </Box>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
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
        
        <Box sx={{ minHeight: 300, mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            variant="outlined"
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            size="large"
          >
            {activeStep === steps.length - 1 ? 'Complete Registration' : 'Continue'}
          </Button>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default SignupPage;
