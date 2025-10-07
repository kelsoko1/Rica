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
import paymentService from '../../services/paymentService.jsx';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [cardErrors, setCardErrors] = useState({});
  const [walletType, setWalletType] = useState('paypal');
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Steps for the payment process
  const steps = ['Enter Details', 'Confirm Payment', 'Payment Status'];

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

  // Handle payment method change
  const handlePaymentMethodChange = (event, newValue) => {
    setPaymentMethod(newValue);
  };

  // Handle payment submission
  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate phone number for mobile money payments
      if (paymentMethod === 'mobile_money') {
        if (!phoneNumber) {
          setPhoneError('Phone number is required');
          setLoading(false);
          return;
        }
        
        // Validate phone number format
        if (!phoneNumber.match(/^\+?\d{1,15}$/)) {
          setPhoneError('Invalid phone number format. Use E.164 format (e.g., +255123456789)');
          setLoading(false);
          return;
        }
        
        setPhoneError('');
      }
      
      // Validate card details for card payments
      if (paymentMethod === 'card') {
        const errors = {};
        
        if (!cardDetails.number) {
          errors.number = 'Card number is required';
        } else if (!cardDetails.number.match(/^\d{16}$/)) {
          errors.number = 'Invalid card number';
        }
        
        if (!cardDetails.expiry) {
          errors.expiry = 'Expiry date is required';
        } else if (!cardDetails.expiry.match(/^\d{2}\/\d{2}$/)) {
          errors.expiry = 'Invalid expiry date format (MM/YY)';
        }
        
        if (!cardDetails.cvc) {
          errors.cvc = 'CVC is required';
        } else if (!cardDetails.cvc.match(/^\d{3,4}$/)) {
          errors.cvc = 'Invalid CVC';
        }
        
        if (!cardDetails.name) {
          errors.name = 'Cardholder name is required';
        }
        
        if (Object.keys(errors).length > 0) {
          setCardErrors(errors);
          setLoading(false);
          return;
        }
        
        setCardErrors({});
      }
      
      // Create a description based on payment method
      const description = `Rica ${paymentMethod === 'mobile_money' ? 'Mobile Money' : paymentMethod === 'card' ? 'Card' : 'Wallet'} Payment`;
      
      try {
        // Use the payment service to create a payment using ClickPesa collection account
        const result = await paymentService.createClickPesaPayment(
          amount,
          phoneNumber,
          description,
          reference,
          paymentMethod
        );
        
        // Store transaction details
        setTransaction(result);
        
        // Move to next step
        setActiveStep(1);
        
        // Start checking payment status
        startStatusCheck(result.transactionId);
      } catch (paymentError) {
        console.error('Payment error:', paymentError);
        setError(paymentError.message || 'Failed to process payment');
        if (onError) {
          onError(paymentError);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to process payment');
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Start status check interval
  const startStatusCheck = (transactionId) => {
    // Clear any existing interval
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
    }
    
    // Check status immediately
    checkStatus(transactionId);
    
    // Set up interval to check status every 5 seconds
    const interval = setInterval(() => {
      checkStatus(transactionId);
    }, 5000);
    
    setStatusCheckInterval(interval);
  };
  
  // Check payment status
  const checkStatus = async (transactionId) => {
    if (!transactionId) return;
    
    setCheckingStatus(true);
    
    try {
      // Use the payment service to check payment status
      const status = await paymentService.checkClickPesaPaymentStatus(transactionId);
      setPaymentStatus(status);
      
      // If payment is completed or failed, stop checking
      if (status.status === 'SUCCESS' || status.status === 'COMPLETED') {
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
        }
        
        // Move to success step
        setActiveStep(2);
        
        // Call onSuccess callback
        if (onSuccess) {
          onSuccess(status);
        }
      } else if (status.status === 'FAILED') {
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
        }
        
        // Set error
        setError('Payment failed. Please try again.');
        
        // Move to final step to show failure
        setActiveStep(2);
        
        // Call onError callback
        if (onError) {
          onError(new Error('Payment failed'));
        }
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
      setError('Error checking payment status. Please check your payment history.');
    } finally {
      setCheckingStatus(false);
    }
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

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
        
        <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>
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
