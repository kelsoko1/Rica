import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PaymentMethodSelector from '../components/payments/PaymentMethodSelector';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const CheckoutContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
}));

const CheckoutPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
}));

const OrderSummary = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.default,
  position: 'sticky',
  top: theme.spacing(2),
}));

const SummaryRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1),
}));

const TotalRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: theme.spacing(2),
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  fontWeight: 'bold',
  fontSize: '1.1rem',
}));

const plans = {
  starter: {
    name: 'Starter',
    price: {
      monthly: 29,
      annual: 290, // 10 months price for annual (2 months free)
    },
    features: [
      'Basic threat detection',
      'Up to 5 browser profiles',
      'Standard analytics',
      'Email support'
    ]
  },
  professional: {
    name: 'Professional',
    price: {
      monthly: 79,
      annual: 790, // 10 months price for annual (2 months free)
    },
    features: [
      'Advanced threat detection',
      'Up to 20 browser profiles',
      'Real-time analytics',
      'API access',
      '24/7 priority support',
      'Team collaboration'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: {
      monthly: 199,
      annual: 1990, // 10 months price for annual (2 months free)
    },
    features: [
      'Custom threat intelligence',
      'Unlimited browser profiles',
      'Advanced analytics & reporting',
      'Dedicated account manager',
      'Custom integrations',
      'On-premise deployment option',
      'SSO & advanced security'
    ]
  }
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: currentUser?.name?.split(' ')[0] || '',
    lastName: currentUser?.name?.split(' ')[1] || '',
    email: currentUser?.email || '',
    company: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    planId: 'professional',
    billingCycle: 'annual',
    couponCode: ''
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState({});
  
  // Get selected plan details
  const selectedPlan = plans[formData.planId] || plans.professional;
  const planPrice = selectedPlan.price[formData.billingCycle];
  
  // Calculate totals
  const subtotal = planPrice;
  const discount = formData.couponCode === 'RICA20' ? subtotal * 0.2 : 0;
  const total = subtotal - discount;
  
  // Currency based on country
  const currencies = {
    'US': 'USD',
    'GB': 'GBP',
    'EU': 'EUR',
    'TZ': 'TZS',
    'KE': 'KES',
    'UG': 'UGX'
  };
  
  const currency = currencies[formData.country] || 'USD';
  
  // Steps for checkout process
  const steps = ['Billing Information', 'Payment Method', 'Confirmation'];
  
  // Initialize form data from location state if available
  useEffect(() => {
    if (location.state?.planId) {
      setFormData(prev => ({
        ...prev,
        planId: location.state.planId,
        billingCycle: location.state.billingCycle || prev.billingCycle
      }));
    }
  }, [location.state]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if any
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    // Required fields
    ['firstName', 'lastName', 'email', 'address', 'city', 'country'].forEach(field => {
      if (!formData[field]) {
        errors[field] = 'This field is required';
      }
    });
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle next step
  const handleNext = () => {
    if (activeStep === 0) {
      // Validate billing information
      if (!validateForm()) {
        return;
      }
    }
    
    setActiveStep(prevStep => prevStep + 1);
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  // Handle payment success
  const handlePaymentSuccess = (result) => {
    setPaymentSuccess(true);
    setActiveStep(2); // Move to confirmation step
  };
  
  // Handle payment error
  const handlePaymentError = (error) => {
    setError(error.message || 'Payment failed. Please try again.');
  };
  
  // Handle coupon code application
  const handleApplyCoupon = () => {
    // In a real app, you would validate the coupon code with an API call
    if (formData.couponCode === 'RICA20') {
      // Valid coupon
    } else {
      setError('Invalid coupon code');
    }
  };
  
  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                error={!!formErrors.address}
                helperText={formErrors.address}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                error={!!formErrors.city}
                helperText={formErrors.city}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State/Province"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ZIP / Postal Code"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="country-label">Country</InputLabel>
                <Select
                  labelId="country-label"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  label="Country"
                  error={!!formErrors.country}
                >
                  <MenuItem value="US">United States</MenuItem>
                  <MenuItem value="GB">United Kingdom</MenuItem>
                  <MenuItem value="EU">European Union</MenuItem>
                  <MenuItem value="TZ">Tanzania</MenuItem>
                  <MenuItem value="KE">Kenya</MenuItem>
                  <MenuItem value="UG">Uganda</MenuItem>
                </Select>
                {formErrors.country && (
                  <FormHelperText error>{formErrors.country}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="plan-label">Subscription Plan</InputLabel>
                <Select
                  labelId="plan-label"
                  name="planId"
                  value={formData.planId}
                  onChange={handleInputChange}
                  label="Subscription Plan"
                >
                  <MenuItem value="starter">Starter</MenuItem>
                  <MenuItem value="professional">Professional</MenuItem>
                  <MenuItem value="enterprise">Enterprise</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="billing-cycle-label">Billing Cycle</InputLabel>
                <Select
                  labelId="billing-cycle-label"
                  name="billingCycle"
                  value={formData.billingCycle}
                  onChange={handleInputChange}
                  label="Billing Cycle"
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="annual">Annual (Save 20%)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <PaymentMethodSelector 
            amount={total}
            currency={currency}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        );
      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Thank You for Your Order!
            </Typography>
            <Typography variant="body1" paragraph>
              Your subscription to the {selectedPlan.name} plan has been confirmed.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              We've sent a confirmation email to {formData.email} with your order details.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/dashboard')}
              sx={{ mt: 2 }}
            >
              Go to Dashboard
            </Button>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <CheckoutContainer maxWidth="lg">
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Home
          </Link>
          <Link component={RouterLink} to="/pricing" color="inherit">
            Pricing
          </Link>
          <Typography color="text.primary">Checkout</Typography>
        </Breadcrumbs>
        
        <Typography variant="h3" component="h1" gutterBottom>
          Checkout
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <CheckoutPaper elevation={1}>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              {getStepContent(activeStep)}
              
              {activeStep !== 2 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  {activeStep === 0 && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              )}
            </CheckoutPaper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <OrderSummary elevation={1}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {selectedPlan.name} Plan ({formData.billingCycle === 'annual' ? 'Annual' : 'Monthly'})
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {selectedPlan.features.map((feature) => (
                    <Box key={feature} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      • {feature}
                    </Box>
                  ))}
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Coupon Code"
                      name="couponCode"
                      value={formData.couponCode}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleApplyCoupon}
                      disabled={!formData.couponCode}
                    >
                      Apply
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              
              <SummaryRow>
                <Typography variant="body1">Subtotal</Typography>
                <Typography variant="body1">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency
                  }).format(subtotal)}
                </Typography>
              </SummaryRow>
              
              {discount > 0 && (
                <SummaryRow>
                  <Typography variant="body1">Discount</Typography>
                  <Typography variant="body1" color="error">
                    -{new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: currency
                    }).format(discount)}
                  </Typography>
                </SummaryRow>
              )}
              
              <TotalRow>
                <Typography variant="subtitle1">Total</Typography>
                <Typography variant="subtitle1">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency
                  }).format(total)}
                </Typography>
              </TotalRow>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'right' }}>
                {formData.billingCycle === 'annual' ? 'Billed annually' : 'Billed monthly'}
              </Typography>
            </OrderSummary>
          </Grid>
        </Grid>
      </CheckoutContainer>
    </motion.div>
  );
};

export default CheckoutPage;
