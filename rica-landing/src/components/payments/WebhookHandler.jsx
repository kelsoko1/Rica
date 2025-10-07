import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Button,
  TextField,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import paymentHistoryService from '../../services/paymentHistoryService';

const WebhookContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
}));

const WebhookItem = styled(ListItem)(({ theme }) => ({
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  let color;
  switch (status) {
    case 'COMPLETED':
      color = theme.palette.success;
      break;
    case 'PENDING':
      color = theme.palette.warning;
      break;
    case 'FAILED':
      color = theme.palette.error;
      break;
    default:
      color = theme.palette.info;
  }
  
  return {
    backgroundColor: color.light,
    color: color.dark,
    fontWeight: 500,
  };
});

// Mock webhook events for demonstration
const mockWebhookEvents = [
  {
    id: 'wh_1',
    type: 'payment.completed',
    transactionId: 'CP1632145678901',
    status: 'COMPLETED',
    amount: 10000,
    currency: 'TZS',
    provider: 'MPESA',
    timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
  },
  {
    id: 'wh_2',
    type: 'payment.failed',
    transactionId: 'CP1632145678902',
    status: 'FAILED',
    amount: 5000,
    currency: 'KES',
    provider: 'MPESA_KE',
    error: 'Insufficient funds',
    timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
  }
];

const WebhookHandler = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testWebhookData, setTestWebhookData] = useState({
    transactionId: '',
    status: 'COMPLETED',
    amount: '',
    currency: 'TZS',
    provider: 'MPESA'
  });
  const [testError, setTestError] = useState('');
  const [testSuccess, setTestSuccess] = useState('');

  // Load webhook events
  useEffect(() => {
    // Simulate loading webhook events
    const loadWebhooks = async () => {
      setLoading(true);
      
      try {
        // In a real app, this would fetch from an API
        // For demo purposes, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        setWebhooks(mockWebhookEvents);
      } catch (error) {
        console.error('Error loading webhook events:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadWebhooks();
  }, []);

  // Handle test webhook input change
  const handleTestInputChange = (e) => {
    const { name, value } = e.target;
    setTestWebhookData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle test webhook submission
  const handleTestWebhook = () => {
    setTestError('');
    setTestSuccess('');
    
    // Validate input
    if (!testWebhookData.transactionId) {
      setTestError('Transaction ID is required');
      return;
    }
    
    if (!testWebhookData.amount) {
      setTestError('Amount is required');
      return;
    }
    
    try {
      // Create webhook event
      const webhookEvent = {
        id: `wh_${Date.now()}`,
        type: `payment.${testWebhookData.status.toLowerCase()}`,
        transactionId: testWebhookData.transactionId,
        status: testWebhookData.status,
        amount: parseFloat(testWebhookData.amount),
        currency: testWebhookData.currency,
        provider: testWebhookData.provider,
        timestamp: new Date().toISOString()
      };
      
      // Add to webhooks list
      setWebhooks([webhookEvent, ...webhooks]);
      
      // Update payment history
      paymentHistoryService.updatePaymentStatus(
        testWebhookData.transactionId, 
        testWebhookData.status,
        {
          amount: parseFloat(testWebhookData.amount),
          currency: testWebhookData.currency,
          provider: testWebhookData.provider,
          provider_reference: `M${Math.floor(Math.random() * 1000000000)}`
        }
      );
      
      setTestSuccess('Webhook processed successfully');
      
      // Reset form
      setTestWebhookData({
        transactionId: '',
        status: 'COMPLETED',
        amount: '',
        currency: 'TZS',
        provider: 'MPESA'
      });
    } catch (error) {
      console.error('Error processing test webhook:', error);
      setTestError('Error processing webhook: ' + error.message);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <WebhookContainer elevation={1}>
      <Typography variant="h6" gutterBottom>
        Webhook Handler
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        This component demonstrates how webhooks from payment providers would be processed.
        In a real application, webhooks would be received by a server endpoint and processed accordingly.
      </Typography>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        Test Webhook
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        {testError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {testError}
          </Alert>
        )}
        
        {testSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {testSuccess}
          </Alert>
        )}
        
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <TextField
            label="Transaction ID"
            name="transactionId"
            value={testWebhookData.transactionId}
            onChange={handleTestInputChange}
            fullWidth
            required
            helperText="Enter an existing transaction ID"
          />
          
          <TextField
            label="Amount"
            name="amount"
            type="number"
            value={testWebhookData.amount}
            onChange={handleTestInputChange}
            fullWidth
            required
          />
          
          <TextField
            select
            label="Status"
            name="status"
            value={testWebhookData.status}
            onChange={handleTestInputChange}
            fullWidth
            SelectProps={{
              native: true
            }}
          >
            <option value="COMPLETED">COMPLETED</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
          </TextField>
          
          <TextField
            select
            label="Currency"
            name="currency"
            value={testWebhookData.currency}
            onChange={handleTestInputChange}
            fullWidth
            SelectProps={{
              native: true
            }}
          >
            <option value="TZS">TZS</option>
            <option value="KES">KES</option>
            <option value="UGX">UGX</option>
            <option value="USD">USD</option>
          </TextField>
          
          <TextField
            select
            label="Provider"
            name="provider"
            value={testWebhookData.provider}
            onChange={handleTestInputChange}
            fullWidth
            SelectProps={{
              native: true
            }}
          >
            <option value="MPESA">MPESA (Tanzania)</option>
            <option value="MPESA_KE">MPESA (Kenya)</option>
            <option value="TIGOPESA">TIGO PESA</option>
            <option value="AIRTELMONEY">AIRTEL MONEY</option>
          </TextField>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleTestWebhook}
          >
            Send Test Webhook
          </Button>
        </Box>
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        Recent Webhook Events
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : webhooks.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No webhook events found
        </Typography>
      ) : (
        <List sx={{ mt: 2 }}>
          {webhooks.map((webhook) => (
            <WebhookItem key={webhook.id} disablePadding>
              <Box sx={{ p: 2, width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2">
                    {webhook.type}
                  </Typography>
                  <StatusChip
                    label={webhook.status}
                    status={webhook.status}
                    size="small"
                  />
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Transaction ID
                    </Typography>
                    <Typography variant="body2">
                      {webhook.transactionId}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Amount
                    </Typography>
                    <Typography variant="body2">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: webhook.currency
                      }).format(webhook.amount)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Provider
                    </Typography>
                    <Typography variant="body2">
                      {webhook.provider}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Timestamp
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(webhook.timestamp)}
                    </Typography>
                  </Box>
                  
                  {webhook.error && (
                    <Box sx={{ gridColumn: '1 / -1' }}>
                      <Typography variant="caption" color="text.secondary">
                        Error
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        {webhook.error}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </WebhookItem>
          ))}
        </List>
      )}
    </WebhookContainer>
  );
};

export default WebhookHandler;
