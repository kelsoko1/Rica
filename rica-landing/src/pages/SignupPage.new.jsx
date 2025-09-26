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
  Card,
  CardContent,
  FormHelperText
} from '@mui/material';
import { styled } from '@mui/material/styles';
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

// ... (keep existing styled components)

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
  
  // ... (keep existing useEffect and handler functions)

  const renderPaymentStep = () => (
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

  const renderStepContent = (step) => {
    switch (step) {
      // ... (keep existing cases 0, 1, and 2)
      case 3:
        return renderPaymentStep();
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8, position: 'relative' }}>
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
