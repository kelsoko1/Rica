import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import paymentHistoryService from '../../services/paymentHistoryService';
import receiptService from '../../services/receiptService';

const ReceiptContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
}));

const ReceiptHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(3),
}));

const ReceiptLogo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  fontWeight: 'bold',
  fontSize: '1.2rem',
}));

const ReceiptTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(1),
}));

const ReceiptSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const ReceiptTable = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

const ReceiptTableHeader = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr auto auto',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(1, 2),
}));

const ReceiptTableRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr auto auto',
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const ReceiptTotal = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginTop: theme.spacing(2),
  padding: theme.spacing(1, 2),
}));

const ReceiptFooter = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(4),
}));

const ReceiptViewer = ({ transactionId, onClose }) => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load payment details
  useEffect(() => {
    const loadPayment = () => {
      try {
        const paymentData = paymentHistoryService.getPaymentById(transactionId);
        
        if (!paymentData) {
          throw new Error('Payment not found');
        }
        
        setPayment(paymentData);
      } catch (err) {
        console.error('Error loading payment:', err);
        setError(err.message || 'Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };
    
    loadPayment();
  }, [transactionId]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  // Handle download receipt
  const handleDownloadReceipt = () => {
    try {
      receiptService.downloadReceiptPDF(transactionId);
    } catch (err) {
      console.error('Error downloading receipt:', err);
      setError('Failed to download receipt');
    }
  };

  // Handle open receipt in new window
  const handleOpenReceipt = () => {
    try {
      receiptService.openReceiptPDF(transactionId);
    } catch (err) {
      console.error('Error opening receipt:', err);
      setError('Failed to open receipt');
    }
  };

  // Handle print receipt
  const handlePrintReceipt = () => {
    try {
      const receiptWindow = window.open('', '_blank');
      receiptWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${transactionId}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                color: #333;
              }
              .receipt {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 5px;
              }
              .receipt-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
              }
              .receipt-logo {
                background-color: #2962ff;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-weight: bold;
              }
              .receipt-title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .receipt-section {
                margin-bottom: 20px;
              }
              .receipt-section-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .receipt-table {
                width: 100%;
                border-collapse: collapse;
              }
              .receipt-table th {
                background-color: #2962ff;
                color: white;
                text-align: left;
                padding: 8px;
              }
              .receipt-table td {
                padding: 8px;
                border-bottom: 1px solid #ddd;
              }
              .receipt-total {
                text-align: right;
                font-weight: bold;
                margin-top: 10px;
              }
              .receipt-footer {
                text-align: center;
                margin-top: 30px;
                color: #666;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
                .receipt {
                  border: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="receipt-header">
                <div class="receipt-logo">RICA</div>
                <div>
                  <div>Receipt #: ${payment.transactionId}</div>
                  <div>Date: ${formatDate(payment.createdAt)}</div>
                </div>
              </div>
              
              <div class="receipt-title">Payment Receipt</div>
              
              <div class="receipt-section">
                <div class="receipt-section-title">Customer Information</div>
                <div>Customer: John Doe</div>
                <div>Email: john.doe@example.com</div>
                ${payment.phoneNumber ? `<div>Phone: ${payment.phoneNumber}</div>` : ''}
              </div>
              
              <div class="receipt-section">
                <div class="receipt-section-title">Payment Information</div>
                <div>Transaction ID: ${payment.transactionId}</div>
                <div>Payment Method: ${payment.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Mobile Money'}</div>
                ${payment.paymentMethod === 'card' && payment.details?.cardBrand ? 
                  `<div>${payment.details.cardBrand} ending in ${payment.details.cardLast4}</div>` : ''}
                ${payment.provider ? `<div>Provider: ${payment.provider}</div>` : ''}
                <div>Status: ${payment.status}</div>
                <div>Reference: ${payment.reference || 'N/A'}</div>
              </div>
              
              <div class="receipt-section">
                <div class="receipt-section-title">Item Details</div>
                <table class="receipt-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Currency</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>${payment.description || 'Rica Payment'}</td>
                      <td>${payment.amount.toFixed(2)}</td>
                      <td>${payment.currency.toUpperCase()}</td>
                    </tr>
                  </tbody>
                </table>
                
                <div class="receipt-total">
                  Total: ${formatCurrency(payment.amount, payment.currency)}
                </div>
              </div>
              
              <div class="receipt-footer">
                <div>Thank you for your payment!</div>
                <div>Rica - Advanced Security Intelligence Platform</div>
                <div>www.rica.io</div>
              </div>
            </div>
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      receiptWindow.document.close();
    } catch (err) {
      console.error('Error printing receipt:', err);
      setError('Failed to print receipt');
    }
  };

  if (loading) {
    return (
      <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Receipt</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !payment) {
    return (
      <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Receipt</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Payment not found'}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Receipt</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadReceipt}
            >
              Download
            </Button>
            <Button
              size="small"
              startIcon={<PrintIcon />}
              onClick={handlePrintReceipt}
            >
              Print
            </Button>
            <Button
              size="small"
              startIcon={<OpenInNewIcon />}
              onClick={handleOpenReceipt}
            >
              Open
            </Button>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <ReceiptContainer elevation={0}>
          <ReceiptHeader>
            <ReceiptLogo>
              <ReceiptIcon sx={{ mr: 1 }} />
              RICA
            </ReceiptLogo>
            <Box>
              <Typography variant="body2">
                <strong>Receipt #:</strong> {payment.transactionId}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong> {formatDate(payment.createdAt)}
              </Typography>
            </Box>
          </ReceiptHeader>
          
          <ReceiptTitle variant="h5">
            Payment Receipt
          </ReceiptTitle>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ReceiptSection>
                <Typography variant="subtitle2" gutterBottom>
                  Customer Information
                </Typography>
                <Typography variant="body2">
                  <strong>Customer:</strong> John Doe
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> john.doe@example.com
                </Typography>
                {payment.phoneNumber && (
                  <Typography variant="body2">
                    <strong>Phone:</strong> {payment.phoneNumber}
                  </Typography>
                )}
              </ReceiptSection>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <ReceiptSection>
                <Typography variant="subtitle2" gutterBottom>
                  Payment Information
                </Typography>
                <Typography variant="body2">
                  <strong>Transaction ID:</strong> {payment.transactionId}
                </Typography>
                <Typography variant="body2">
                  <strong>Payment Method:</strong> {payment.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Mobile Money'}
                </Typography>
                {payment.paymentMethod === 'card' && payment.details?.cardBrand && (
                  <Typography variant="body2">
                    {payment.details.cardBrand} ending in {payment.details.cardLast4}
                  </Typography>
                )}
                {payment.provider && (
                  <Typography variant="body2">
                    <strong>Provider:</strong> {payment.provider}
                  </Typography>
                )}
                <Typography variant="body2">
                  <strong>Status:</strong> {payment.status}
                </Typography>
                <Typography variant="body2">
                  <strong>Reference:</strong> {payment.reference || 'N/A'}
                </Typography>
              </ReceiptSection>
            </Grid>
          </Grid>
          
          <ReceiptSection>
            <Typography variant="subtitle2" gutterBottom>
              Item Details
            </Typography>
            
            <ReceiptTable>
              <ReceiptTableHeader>
                <Typography variant="body2" fontWeight="bold">Description</Typography>
                <Typography variant="body2" fontWeight="bold">Amount</Typography>
                <Typography variant="body2" fontWeight="bold">Currency</Typography>
              </ReceiptTableHeader>
              
              <ReceiptTableRow>
                <Typography variant="body2">{payment.description || 'Rica Payment'}</Typography>
                <Typography variant="body2">{payment.amount.toFixed(2)}</Typography>
                <Typography variant="body2">{payment.currency.toUpperCase()}</Typography>
              </ReceiptTableRow>
            </ReceiptTable>
            
            <ReceiptTotal>
              <Typography variant="subtitle2" sx={{ mr: 2 }}>
                Total:
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                {formatCurrency(payment.amount, payment.currency)}
              </Typography>
            </ReceiptTotal>
          </ReceiptSection>
          
          <Divider sx={{ my: 2 }} />
          
          <ReceiptFooter>
            <Typography variant="body2" color="text.secondary">
              Thank you for your payment!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rica - Advanced Security Intelligence Platform
            </Typography>
            <Typography variant="body2" color="text.secondary">
              www.rica.io
            </Typography>
          </ReceiptFooter>
        </ReceiptContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReceiptViewer;
