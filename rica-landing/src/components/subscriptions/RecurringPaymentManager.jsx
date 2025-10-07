import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Tabs,
  Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import recurringPaymentService from '../../services/recurringPaymentService';
import analyticsService from '../../services/analyticsService';
import schedulerService from '../../services/schedulerService';
import config from '../../config/environment';
import ErrorBoundary from '../ErrorBoundary';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import PaymentIcon from '@mui/icons-material/Payment';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HistoryIcon from '@mui/icons-material/History';

const RecurringPaymentContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`recurring-payment-tabpanel-${index}`}
      aria-labelledby={`recurring-payment-tab-${index}`}
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

const RecurringPaymentManager = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recurringPayments, setRecurringPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('create'); // create, edit, delete, pause
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    description: '',
    frequency: 'monthly',
    paymentMethod: 'card',
    phoneNumber: '',
    cardDetails: {
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
      cardName: ''
    }
  });
  
  // Memoize load functions to avoid recreating them on each render
  const loadRecurringPaymentsCallback = useCallback(() => {
    loadRecurringPayments();
  }, []);
  
  const loadStatsCallback = useCallback(() => {
    loadStats();
  }, []);
  
  // Load recurring payments
  useEffect(() => {
    loadRecurringPaymentsCallback();
    loadStatsCallback();
    
    // Set up refresh interval in production
    let refreshInterval;
    if (config.isProd) {
      refreshInterval = setInterval(() => {
        loadRecurringPaymentsCallback();
        loadStatsCallback();
      }, 60000); // Refresh every minute in production
    }
    
    // Clean up interval
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [loadRecurringPaymentsCallback, loadStatsCallback]);
  
  // Load recurring payments with error handling
  const loadRecurringPayments = () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get user ID (use demo user if not logged in)
      const userId = currentUser?.id || 'demo-user-123';
      
      // Get user's recurring payments
      const payments = recurringPaymentService.getUserRecurringPayments(userId);
      
      // Sort payments by next payment date
      const sortedPayments = [...payments].sort((a, b) => {
        // Active payments first
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        
        // Then by next payment date
        return new Date(a.nextPaymentDate || 0) - new Date(b.nextPaymentDate || 0);
      });
      
      setRecurringPayments(sortedPayments);
      
      // Track page view with additional metrics
      analyticsService.trackPageView('recurring_payment_manager', {
        paymentCount: payments.length,
        activeCount: payments.filter(p => p.status === 'active').length,
        pausedCount: payments.filter(p => p.status === 'paused').length,
        cancelledCount: payments.filter(p => p.status === 'cancelled').length,
        userId
      });
    } catch (err) {
      console.error('Error loading recurring payments:', err);
      setError('Failed to load recurring payments. Please try again.');
      
      // Track error
      analyticsService.trackEvent('recurring_payment_load_error', {
        error: err.message,
        userId: currentUser?.id || 'demo-user-123'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Load recurring payment statistics with error handling
  const loadStats = () => {
    try {
      const stats = recurringPaymentService.getRecurringPaymentStats();
      setStats(stats);
    } catch (err) {
      console.error('Error loading recurring payment stats:', err);
      
      // Track error
      analyticsService.trackEvent('recurring_payment_stats_error', {
        error: err.message,
        userId: currentUser?.id || 'demo-user-123'
      });
    }
  };
  
  // Process due payments manually (for admin/testing)
  const processDuePayments = async () => {
    try {
      setLoading(true);
      
      // Run the task
      await schedulerService.runTask('process-recurring-payments');
      
      // Reload data
      loadRecurringPayments();
      loadStats();
      
      // Show success message
      setError(null);
    } catch (err) {
      console.error('Error processing due payments:', err);
      setError('Failed to process due payments: ' + err.message);
      
      // Track error
      analyticsService.trackEvent('recurring_payment_process_error', {
        error: err.message,
        userId: currentUser?.id || 'demo-user-123'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('card')) {
      // Handle card details
      const cardField = name.replace('card', '').toLowerCase();
      setFormData({
        ...formData,
        cardDetails: {
          ...formData.cardDetails,
          [cardField]: value
        }
      });
    } else {
      // Handle other fields
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Open create dialog
  const handleOpenCreateDialog = () => {
    setDialogType('create');
    setSelectedPayment(null);
    setFormData({
      amount: '',
      currency: 'USD',
      description: '',
      frequency: 'monthly',
      paymentMethod: 'card',
      phoneNumber: '',
      cardDetails: {
        cardNumber: '',
        cardExpiry: '',
        cardCvc: '',
        cardName: ''
      }
    });
    setDialogOpen(true);
  };
  
  // Open edit dialog
  const handleOpenEditDialog = (payment) => {
    setDialogType('edit');
    setSelectedPayment(payment);
    setFormData({
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description,
      frequency: payment.frequency,
      paymentMethod: payment.paymentMethod,
      phoneNumber: payment.phoneNumber || '',
      cardDetails: {
        cardNumber: '',
        cardExpiry: '',
        cardCvc: '',
        cardName: ''
      }
    });
    setDialogOpen(true);
  };
  
  // Open delete dialog
  const handleOpenDeleteDialog = (payment) => {
    setDialogType('delete');
    setSelectedPayment(payment);
    setDialogOpen(true);
  };
  
  // Open pause/resume dialog
  const handleOpenPauseDialog = (payment) => {
    setDialogType(payment.status === 'active' ? 'pause' : 'resume');
    setSelectedPayment(payment);
    setDialogOpen(true);
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Handle form submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Get user ID (use demo user if not logged in)
      const userId = currentUser?.id || 'demo-user-123';
      
      if (dialogType === 'create') {
        // Create recurring payment
        await recurringPaymentService.createRecurringPayment({
          userId,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          description: formData.description,
          frequency: formData.frequency,
          paymentMethod: formData.paymentMethod,
          phoneNumber: formData.phoneNumber,
          paymentMethodDetails: formData.paymentMethod === 'card' ? formData.cardDetails : {}
        });
        
        // Track event
        analyticsService.trackEvent('recurring_payment_created_ui', {
          paymentMethod: formData.paymentMethod,
          frequency: formData.frequency,
          currency: formData.currency
        });
      } else if (dialogType === 'edit') {
        // Update recurring payment
        await recurringPaymentService.updateRecurringPayment(selectedPayment.id, {
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          description: formData.description,
          frequency: formData.frequency
        });
        
        // Track event
        analyticsService.trackEvent('recurring_payment_updated_ui', {
          paymentId: selectedPayment.id
        });
      } else if (dialogType === 'delete') {
        // Cancel recurring payment
        await recurringPaymentService.cancelRecurringPayment(
          selectedPayment.id,
          'Cancelled by user'
        );
        
        // Track event
        analyticsService.trackEvent('recurring_payment_cancelled_ui', {
          paymentId: selectedPayment.id
        });
      } else if (dialogType === 'pause') {
        // Pause recurring payment
        await recurringPaymentService.updateRecurringPayment(selectedPayment.id, {
          status: 'paused',
          pauseReason: 'Paused by user'
        });
        
        // Track event
        analyticsService.trackEvent('recurring_payment_paused_ui', {
          paymentId: selectedPayment.id
        });
      } else if (dialogType === 'resume') {
        // Resume recurring payment
        await recurringPaymentService.updateRecurringPayment(selectedPayment.id, {
          status: 'active',
          pauseReason: null
        });
        
        // Track event
        analyticsService.trackEvent('recurring_payment_resumed_ui', {
          paymentId: selectedPayment.id
        });
      }
      
      // Close dialog
      handleCloseDialog();
      
      // Reload data
      loadRecurringPayments();
      loadStats();
    } catch (err) {
      console.error('Error handling form submit:', err);
      setError(err.message || 'An error occurred. Please try again.');
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Render dialog content
  const renderDialogContent = () => {
    switch (dialogType) {
      case 'create':
      case 'edit':
        return (
          <form onSubmit={handleFormSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleFormChange}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    name="currency"
                    value={formData.currency}
                    onChange={handleFormChange}
                    label="Currency"
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                    <MenuItem value="TZS">TZS</MenuItem>
                    <MenuItem value="KES">KES</MenuItem>
                    <MenuItem value="UGX">UGX</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="e.g., Monthly subscription"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Frequency</InputLabel>
                  <Select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleFormChange}
                    label="Frequency"
                  >
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="annual">Annual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {dialogType === 'create' && (
                <>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Payment Method</InputLabel>
                      <Select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleFormChange}
                        label="Payment Method"
                      >
                        <MenuItem value="card">Credit/Debit Card</MenuItem>
                        <MenuItem value="mobile_money">Mobile Money</MenuItem>
                        <MenuItem value="wallet">Digital Wallet</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {formData.paymentMethod === 'mobile_money' && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleFormChange}
                        placeholder="+255123456789"
                        required
                      />
                    </Grid>
                  )}
                  
                  {formData.paymentMethod === 'card' && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Card Number"
                          name="cardNumber"
                          value={formData.cardDetails.cardNumber}
                          onChange={handleFormChange}
                          placeholder="4242 4242 4242 4242"
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Expiry Date"
                          name="cardExpiry"
                          value={formData.cardDetails.cardExpiry}
                          onChange={handleFormChange}
                          placeholder="MM/YY"
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="CVC"
                          name="cardCvc"
                          value={formData.cardDetails.cardCvc}
                          onChange={handleFormChange}
                          placeholder="123"
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Cardholder Name"
                          name="cardName"
                          value={formData.cardDetails.cardName}
                          onChange={handleFormChange}
                          placeholder="John Doe"
                          required
                        />
                      </Grid>
                    </>
                  )}
                </>
              )}
            </Grid>
          </form>
        );
        
      case 'delete':
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to cancel this recurring payment?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This will stop all future payments. This action cannot be undone.
            </Typography>
          </Box>
        );
        
      case 'pause':
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to pause this recurring payment?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You can resume the payment at any time.
            </Typography>
          </Box>
        );
        
      case 'resume':
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to resume this recurring payment?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Future payments will be processed according to the schedule.
            </Typography>
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  // Render dialog title
  const renderDialogTitle = () => {
    switch (dialogType) {
      case 'create':
        return 'Create Recurring Payment';
      case 'edit':
        return 'Edit Recurring Payment';
      case 'delete':
        return 'Cancel Recurring Payment';
      case 'pause':
        return 'Pause Recurring Payment';
      case 'resume':
        return 'Resume Recurring Payment';
      default:
        return 'Recurring Payment';
    }
  };
  
  // Render dialog actions
  const renderDialogActions = () => {
    return (
      <>
        <Button onClick={handleCloseDialog}>Cancel</Button>
        <Button
          onClick={handleFormSubmit}
          variant="contained"
          color={dialogType === 'delete' ? 'error' : 'primary'}
        >
          {dialogType === 'create' ? 'Create' : 
           dialogType === 'edit' ? 'Update' : 
           dialogType === 'delete' ? 'Cancel Payment' : 
           dialogType === 'pause' ? 'Pause' : 'Resume'}
        </Button>
      </>
    );
  };

  return (
    <ErrorBoundary fallback={<Alert severity="error">An error occurred while loading recurring payments. Please refresh the page.</Alert>}>
      <RecurringPaymentContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Recurring Payments</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {config.isProd && config.features.recurringPayments && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<RefreshIcon />}
              onClick={processDuePayments}
              disabled={loading}
            >
              Process Due Payments
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            disabled={loading}
          >
            New Recurring Payment
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab icon={<PaymentIcon />} label="Active Payments" />
        <Tab icon={<HistoryIcon />} label="Payment History" />
        <Tab icon={<ScheduleIcon />} label="Schedule" />
      </Tabs>
      
      <TabPanel value={tabValue} index={0}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : recurringPayments.length === 0 ? (
          <Alert severity="info">
            You don't have any recurring payments yet. Click the "New Recurring Payment" button to create one.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Next Payment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recurringPayments
                  .filter(payment => payment.status !== 'cancelled')
                  .map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.description}</TableCell>
                      <TableCell>{formatCurrency(payment.amount, payment.currency)}</TableCell>
                      <TableCell>{payment.frequency}</TableCell>
                      <TableCell>{formatDate(payment.nextPaymentDate)}</TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          color={getStatusColor(payment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditDialog(payment)}
                          title="Edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenPauseDialog(payment)}
                          title={payment.status === 'active' ? 'Pause' : 'Resume'}
                        >
                          {payment.status === 'active' ? (
                            <PauseIcon fontSize="small" />
                          ) : (
                            <PlayArrowIcon fontSize="small" />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDeleteDialog(payment)}
                          title="Cancel"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Last Payment</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recurringPayments
                .filter(payment => payment.lastPaymentDate)
                .sort((a, b) => new Date(b.lastPaymentDate) - new Date(a.lastPaymentDate))
                .map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell>{formatCurrency(payment.amount, payment.currency)}</TableCell>
                    <TableCell>{formatDate(payment.lastPaymentDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={payment.status}
                        color={getStatusColor(payment.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Next Payment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recurringPayments
                .filter(payment => payment.status === 'active')
                .sort((a, b) => new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate))
                .map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell>{formatCurrency(payment.amount, payment.currency)}</TableCell>
                    <TableCell>{payment.frequency}</TableCell>
                    <TableCell>{formatDate(payment.nextPaymentDate)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
      
      {/* Recurring Payment Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{renderDialogTitle()}</DialogTitle>
        <DialogContent dividers>
          {renderDialogContent()}
        </DialogContent>
        <DialogActions>
          {renderDialogActions()}
        </DialogActions>
      </Dialog>
      {/* Stats summary */}
      {stats && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>Summary</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary">Total Recurring Payments</Typography>
              <Typography variant="h6">{stats.totalCount}</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary">Active</Typography>
              <Typography variant="h6">{stats.statusCounts?.active || 0}</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary">Paused</Typography>
              <Typography variant="h6">{stats.statusCounts?.paused || 0}</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary">Cancelled</Typography>
              <Typography variant="h6">{stats.statusCounts?.cancelled || 0}</Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </RecurringPaymentContainer>
    </ErrorBoundary>
  );
};

export default RecurringPaymentManager;
