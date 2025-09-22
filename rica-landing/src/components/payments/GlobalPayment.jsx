import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Link,
  Stepper,
  Step,
  StepLabel,
  Tabs,
  Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useClickPesa } from '../../context/ClickPesaContext';
import PhoneIcon from '@mui/icons-material/Phone';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const PaymentContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
}));

const ProviderLogo = styled('img')(({ theme }) => ({
  height: 40,
  marginRight: theme.spacing(2),
}));

const ProviderOption = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.selected': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.lighter,
  }
}));

const StatusIcon = styled(Box)(({ theme, status }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 80,
  height: 80,
  borderRadius: '50%',
  marginBottom: theme.spacing(2),
  backgroundColor: 
    status === 'COMPLETED' ? theme.palette.success.lighter :
    status === 'FAILED' ? theme.palette.error.lighter :
    theme.palette.warning.lighter,
  color: 
    status === 'COMPLETED' ? theme.palette.success.dark :
    status === 'FAILED' ? theme.palette.error.dark :
    theme.palette.warning.dark,
}));

const GlobalPayment = ({ 
  amount, 
  currency = 'TZS', 
  onSuccess, 
  onError, 
  buttonText = 'Pay Now',
  reference = `RICA-${Date.now()}`
}) => {
  const { 
    loading, 
    error, 
    transaction, 
    availableProviders,
    createPayment, 
    checkPaymentStatus, 
    getSupportedPaymentMethods,
    clearTransaction,
    isCheckingStatus 
  } = useClickPesa();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [providers, setProviders] = useState(availableProviders || []);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardError, setCardError] = useState('');

  // Steps for the payment process
  const steps = ['Enter Details', 'Confirm Payment', 'Payment Status'];

  // Update providers when availableProviders changes
  useEffect(() => {
    if (availableProviders && availableProviders.length > 0) {
      setProviders(availableProviders);
      
      // Set default provider if available
      if (!selectedProvider && availableProviders.length > 0) {
        // Set default provider based on payment method
        const defaultProvider = availableProviders.find(p => p.type === paymentMethod);
        if (defaultProvider) {
          setSelectedProvider(defaultProvider.id);
        }
      }
    } else {
      // Fallback to loading providers from service
      const loadProviders = async () => {
        setProvidersLoading(true);
        try {
          // Get country code from currency
          const countryCode = currency === 'TZS' ? 'TZ' : 
                             currency === 'KES' ? 'KE' : 
                             currency === 'UGX' ? 'UG' : 'GLOBAL';
          
          const methods = await getSupportedPaymentMethods(countryCode);
          setProviders(methods);
          
          // Set default provider if available
          if (methods.length > 0) {
            setSelectedProvider(methods[0].id);
          }
        } catch (err) {
          console.error('Error loading providers:', err);
        } finally {
          setProvidersLoading(false);
        }
      };
      
      loadProviders();
    }
  }, [availableProviders, currency, getSupportedPaymentMethods, paymentMethod, selectedProvider]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  // Handle phone number change
  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    
    // Validate phone number
    if (value && !/^\+\d{1,15}$/.test(value)) {
      setPhoneError('Please enter a valid phone number in international format (e.g., +255123456789)');
    } else {
      setPhoneError('');
    }
  };

  // Handle provider selection
  const handleProviderChange = (e) => {
    setSelectedProvider(e.target.value);
  };

  // Handle payment method change
  const handlePaymentMethodChange = (event, newValue) => {
    setPaymentMethod(newValue);
    
    // Reset selected provider when payment method changes
    const defaultProvider = providers.find(p => p.type === newValue);
    if (defaultProvider) {
      setSelectedProvider(defaultProvider.id);
    } else {
      setSelectedProvider('');
    }
  };

  // Validate card details
  const validateCardDetails = () => {
    if (!cardNumber) {
      setCardError('Card number is required');
      return false;
    } else if (!/^\d{13,19}$/.test(cardNumber.replace(/\s/g, ''))) {
      setCardError('Please enter a valid card number');
      return false;
    }

    if (!cardExpiry) {
      setCardError('Expiry date is required');
      return false;
    } else if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      setCardError('Please enter a valid expiry date (MM/YY)');
      return false;
    }

    if (!cardCvc) {
      setCardError('CVC is required');
      return false;
    } else if (!/^\d{3,4}$/.test(cardCvc)) {
      setCardError('Please enter a valid CVC');
      return false;
    }

    if (!cardName) {
      setCardError('Cardholder name is required');
      return false;
    }

    return true;
  };

  // Handle payment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (paymentMethod === 'mobile_money') {
      // Validate phone number
      if (!phoneNumber) {
        setPhoneError('Phone number is required');
        return;
      } else if (!/^\+\d{1,15}$/.test(phoneNumber)) {
        setPhoneError('Please enter a valid phone number in international format (e.g., +255123456789)');
        return;
      }
    } else if (paymentMethod === 'card') {
      // Validate card details
      if (!validateCardDetails()) {
        return;
      }
    }
    
    try {
      // Create payment
      if (paymentMethod === 'mobile_money') {
        await createPayment(
          amount,
          phoneNumber,
          `Rica Subscription - ${reference}`,
          reference,
          'mobile_money'
        );
      } else if (paymentMethod === 'card') {
        await createPayment(
          amount,
          '+00000000000', // Placeholder for card payments
          `Rica Subscription - ${reference}`,
          reference,
          'card'
        );
      } else if (paymentMethod === 'wallet') {
        await createPayment(
          amount,
          '+00000000000', // Placeholder for wallet payments
          `Rica Subscription - ${reference}`,
          reference,
          'wallet'
        );
      }
      
      // Open dialog and move to next step
      setDialogOpen(true);
      setActiveStep(1);
      
      // Set up interval to check payment status
      const interval = setInterval(async () => {
        if (transaction) {
          await handleCheckStatus(transaction.transactionId);
        }
      }, 5000); // Check every 5 seconds
      
      setStatusCheckInterval(interval);
    } catch (err) {
      console.error('Payment error:', err);
      if (onError) onError(err);
    }
  };

  // Handle checking payment status
  const handleCheckStatus = async (transactionId) => {
    if (!transactionId || checkingStatus) return;
    
    setCheckingStatus(true);
    
    try {
      const result = await checkPaymentStatus(transactionId);
      
      // If payment completed or failed, move to final step
      if (result.status === 'COMPLETED' || result.status === 'FAILED') {
        setActiveStep(2);
        
        // Clear interval
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
        }
        
        // Call onSuccess if payment completed
        if (result.status === 'COMPLETED' && onSuccess) {
          onSuccess(result);
        }
        
        // Call onError if payment failed
        if (result.status === 'FAILED' && onError) {
          onError(new Error(result.message));
        }
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    // Only allow closing if payment is complete or failed
    if (transaction && (transaction.status === 'COMPLETED' || transaction.status === 'FAILED')) {
      setDialogOpen(false);
      clearTransaction();
    }
  };

  // Render payment status content
  const renderStatusContent = () => {
    if (!transaction) {
      return (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Initializing payment...
          </Typography>
        </Box>
      );
    }
    
    switch (transaction.status) {
      case 'COMPLETED':
        return (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <StatusIcon status="COMPLETED">
              <CheckCircleOutlineIcon sx={{ fontSize: 40 }} />
            </StatusIcon>
            <Typography variant="h6" gutterBottom>
              Payment Successful
            </Typography>
            <Typography variant="body1" gutterBottom>
              Your payment of {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
              }).format(amount)} has been processed successfully.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Transaction ID: {transaction.transactionId}
            </Typography>
          </Box>
        );
      
      case 'FAILED':
        return (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <StatusIcon status="FAILED">
              <ErrorOutlineIcon sx={{ fontSize: 40 }} />
            </StatusIcon>
            <Typography variant="h6" gutterBottom>
              Payment Failed
            </Typography>
            <Typography variant="body1" gutterBottom>
              Your payment could not be processed.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {transaction.message || 'Please try again or use a different payment method.'}
            </Typography>
          </Box>
        );
      
      default: // PENDING
        return (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <StatusIcon status="PENDING">
              <HourglassEmptyIcon sx={{ fontSize: 40 }} />
            </StatusIcon>
            <Typography variant="h6" gutterBottom>
              Payment Pending
            </Typography>
            <Typography variant="body1" gutterBottom>
              {paymentMethod === 'mobile_money' ? 
                'Please check your mobile phone and complete the payment.' :
                'Please wait while we process your payment.'}
            </Typography>
            {paymentMethod === 'mobile_money' && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You should receive a prompt on {phoneNumber} to confirm the payment.
              </Typography>
            )}
            <CircularProgress size={24} sx={{ mb: 2 }} />
            <Typography variant="caption" display="block">
              This dialog will update automatically when payment is complete.
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Transaction ID: {transaction.transactionId}
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Provider: {transaction.provider || (paymentMethod === 'mobile_money' ? 'Mobile Money' : 
                        paymentMethod === 'card' ? 'Card' : 'Digital Wallet')}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <PaymentContainer elevation={1}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box>
        <Tabs
          value={paymentMethod}
          onChange={handlePaymentMethodChange}
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab 
            icon={<PhoneIcon />} 
            label="Mobile Money" 
            value="mobile_money" 
          />
          <Tab 
            icon={<CreditCardIcon />} 
            label="Credit Card" 
            value="card" 
          />
          <Tab 
            icon={<AccountBalanceWalletIcon />} 
            label="Digital Wallet" 
            value="wallet" 
          />
        </Tabs>
        
        <form onSubmit={handleSubmit}>
          {paymentMethod === 'mobile_money' && (
            <>
              <TextField
                fullWidth
                label="Phone Number"
                variant="outlined"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                error={!!phoneError}
                helperText={phoneError || 'Enter your phone number in international format (e.g., +255123456789)'}
                InputProps={{
                  startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />,
                }}
                sx={{ mb: 3 }}
              />
              
              {providers.length > 0 && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="provider-label">Mobile Money Provider</InputLabel>
                  <Select
                    labelId="provider-label"
                    value={selectedProvider}
                    onChange={handleProviderChange}
                    label="Mobile Money Provider"
                  >
                    {providers
                      .filter(provider => provider.type === 'mobile_money')
                      .map((provider) => (
                        <MenuItem key={provider.id} value={provider.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {provider.icon && (
                              <ProviderLogo 
                                src={`/assets/payment-icons/${provider.icon}`} 
                                alt={provider.name}
                                onError={(e) => {
                                  e.target.src = '/assets/payment-icons/default-provider.png';
                                }}
                              />
                            )}
                            {provider.name}
                          </Box>
                        </MenuItem>
                      ))}
                  </Select>
                  {providersLoading && (
                    <FormHelperText>Loading providers...</FormHelperText>
                  )}
                </FormControl>
              )}
            </>
          )}
          
          {paymentMethod === 'card' && (
            <>
              <TextField
                fullWidth
                label="Card Number"
                variant="outlined"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                error={!!cardError}
                helperText={cardError}
                sx={{ mb: 3 }}
              />
              
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  label="Expiry Date"
                  variant="outlined"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  sx={{ flex: 1 }}
                />
                
                <TextField
                  label="CVC"
                  variant="outlined"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  sx={{ flex: 1 }}
                />
              </Box>
              
              <TextField
                fullWidth
                label="Cardholder Name"
                variant="outlined"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                sx={{ mb: 3 }}
              />
              
              {providers.length > 0 && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="card-provider-label">Card Type</InputLabel>
                  <Select
                    labelId="card-provider-label"
                    value={selectedProvider}
                    onChange={handleProviderChange}
                    label="Card Type"
                  >
                    {providers
                      .filter(provider => provider.type === 'card')
                      .map((provider) => (
                        <MenuItem key={provider.id} value={provider.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {provider.icon && (
                              <ProviderLogo 
                                src={`/assets/payment-icons/${provider.icon}`} 
                                alt={provider.name}
                                onError={(e) => {
                                  e.target.src = '/assets/payment-icons/default-provider.png';
                                }}
                              />
                            )}
                            {provider.name}
                          </Box>
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}
            </>
          )}
          
          {paymentMethod === 'wallet' && (
            <>
              {providers.length > 0 && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="wallet-provider-label">Digital Wallet</InputLabel>
                  <Select
                    labelId="wallet-provider-label"
                    value={selectedProvider}
                    onChange={handleProviderChange}
                    label="Digital Wallet"
                  >
                    {providers
                      .filter(provider => provider.type === 'wallet')
                      .map((provider) => (
                        <MenuItem key={provider.id} value={provider.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {provider.icon && (
                              <ProviderLogo 
                                src={`/assets/payment-icons/${provider.icon}`} 
                                alt={provider.name}
                                onError={(e) => {
                                  e.target.src = '/assets/payment-icons/default-provider.png';
                                }}
                              />
                            )}
                            {provider.name}
                          </Box>
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}
              
              <Alert severity="info" sx={{ mb: 3 }}>
                You will be redirected to complete the payment with your selected digital wallet provider.
              </Alert>
            </>
          )}
          
          <Typography variant="body1" gutterBottom>
            Amount: {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency
            }).format(amount)}
          </Typography>
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth
            disabled={loading || 
              (paymentMethod === 'mobile_money' && (!phoneNumber || providers.length === 0)) ||
              (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvc || !cardName)) ||
              (paymentMethod === 'wallet' && !selectedProvider)
            }
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : buttonText}
          </Button>
        </form>
      </Box>
      
      {/* Payment Status Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="payment-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="payment-dialog-title">
          {paymentMethod === 'mobile_money' ? 'Mobile Money Payment' : 
           paymentMethod === 'card' ? 'Card Payment' : 'Digital Wallet Payment'}
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {renderStatusContent()}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDialogClose}
            disabled={transaction && transaction.status === 'PENDING'}
          >
            {transaction && transaction.status === 'COMPLETED' ? 'Done' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>
    </PaymentContainer>
  );
};

export default GlobalPayment;
