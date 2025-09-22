import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import GlobalPayment from './GlobalPayment';

const PaymentContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
}));

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`payment-tabpanel-${index}`}
      aria-labelledby={`payment-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index) => {
  return {
    id: `payment-tab-${index}`,
    'aria-controls': `payment-tabpanel-${index}`,
  };
};

const PaymentMethodSelector = ({ 
  amount, 
  currency = 'TZS',
  onSuccess,
  onError
}) => {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Handle payment success
  const handlePaymentSuccess = (result) => {
    setPaymentSuccess(true);
    setPaymentError(null);
    if (onSuccess) onSuccess(result);
  };

  // Handle payment error
  const handlePaymentError = (error) => {
    setPaymentError(error.message || 'Payment failed. Please try again.');
    if (onError) onError(error);
  };

  // All currencies are supported
  const supportedCurrencies = ['TZS', 'KES', 'UGX', 'USD', 'EUR', 'GBP'];
  const isSupported = supportedCurrencies.includes(currency);

  return (
    <PaymentContainer elevation={1}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Payment Method
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      {paymentSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Payment successful! Thank you for your purchase.
        </Alert>
      )}
      
      {paymentError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {paymentError}
        </Alert>
      )}
      
      {isSupported ? (
        <GlobalPayment 
          amount={amount} 
          currency={currency}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      ) : (
        <Alert severity="warning">
          The selected currency ({currency}) is not supported by our payment provider.
          Please select one of the following currencies: TZS, KES, UGX, USD, EUR, GBP.
        </Alert>
      )}
    </PaymentContainer>
  );
};

export default PaymentMethodSelector;
