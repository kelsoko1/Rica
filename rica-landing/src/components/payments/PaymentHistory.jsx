import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import paymentHistoryService from '../../services/paymentHistoryService';
import ReceiptViewer from './ReceiptViewer';
import { useClickPesa } from '../../context/ClickPesaContext';

const PaymentHistoryContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
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

const PaymentDetailItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const PaymentHistory = () => {
  const { checkPaymentStatus } = useClickPesa();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load payment history
  useEffect(() => {
    loadPaymentHistory();
  }, [statusFilter, dateRange]);

  // Load payment history
  const loadPaymentHistory = () => {
    setLoading(true);
    
    try {
      let filteredPayments = paymentHistoryService.getPaymentHistory();
      
      // Apply status filter
      if (statusFilter) {
        filteredPayments = paymentHistoryService.filterPaymentsByStatus(statusFilter);
      }
      
      // Apply date range filter
      if (dateRange.startDate || dateRange.endDate) {
        filteredPayments = paymentHistoryService.filterPaymentsByDateRange(
          dateRange.startDate,
          dateRange.endDate
        );
      }
      
      setPayments(filteredPayments);
    } catch (error) {
      console.error('Error loading payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  // Handle date range change
  const handleDateRangeChange = (event) => {
    const { name, value } = event.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value,
    }));
    setPage(0);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      // Check status of pending payments
      const pendingPayments = payments.filter(p => p.status === 'PENDING');
      
      for (const payment of pendingPayments) {
        if (payment.transactionId) {
          await checkPaymentStatus(payment.transactionId);
        }
      }
      
      // Reload payment history
      loadPaymentHistory();
    } catch (error) {
      console.error('Error refreshing payment status:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle payment click
  const handlePaymentClick = (payment) => {
    setSelectedPayment(payment);
    setDialogOpen(true);
  };
  
  // Handle close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Handle view receipt
  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceipt(true);
  };

  // Handle clear history
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your payment history?')) {
      paymentHistoryService.clearPaymentHistory();
      loadPaymentHistory();
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
    }).format(date);
  };

  // Format amount
  const formatAmount = (amount, currency = 'USD') => {
    if (!amount) return '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <PaymentHistoryContainer elevation={1}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Payment History</Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Filter">
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Clear History">
            <IconButton onClick={handleClearHistory} disabled={payments.length === 0}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {showFilters && (
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Status"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                size="small"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
          </Grid>
        </Box>
      )}
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">No payment history found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              payments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((payment) => (
                  <TableRow key={payment.transactionId}>
                    <TableCell>{formatDate(payment.createdAt)}</TableCell>
                    <TableCell>{payment.transactionId}</TableCell>
                    <TableCell>
                      {formatAmount(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        label={payment.status}
                        status={payment.status}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {payment.provider || (payment.paymentMethod === 'card' ? 'Credit Card' : 'Mobile Money')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex' }}>
                        <IconButton size="small" onClick={() => handlePaymentClick(payment)} title="View Details">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        {payment.status === 'COMPLETED' && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewReceipt(payment)}
                            title="View Receipt"
                            color="primary"
                          >
                            <ReceiptIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={payments.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      
      {/* Payment Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Payment Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedPayment && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Transaction ID
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedPayment.transactionId}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(selectedPayment.createdAt)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Amount
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatAmount(selectedPayment.amount, selectedPayment.currency)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip 
                    label={selectedPayment.status} 
                    color={
                      selectedPayment.status === 'COMPLETED' ? 'success' :
                      selectedPayment.status === 'PENDING' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Payment Method
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedPayment.paymentMethod === 'card' ? 'Credit/Debit Card' : 
                     selectedPayment.provider ? `Mobile Money (${selectedPayment.provider})` : 'Unknown'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Reference
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedPayment.reference || 'N/A'}
                  </Typography>
                </Grid>
                
                {selectedPayment.description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedPayment.description}
                    </Typography>
                  </Grid>
                )}
                
                {selectedPayment.phoneNumber && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Phone Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedPayment.phoneNumber}
                    </Typography>
                  </Grid>
                )}
                
                {selectedPayment.details && Object.keys(selectedPayment.details).length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Additional Details
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'background.default' }}>
                      <pre style={{ margin: 0, overflow: 'auto', fontSize: '0.875rem' }}>
                        {JSON.stringify(selectedPayment.details, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                )}
              </Grid>
              
              {selectedPayment.status === 'COMPLETED' && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<ReceiptIcon />}
                    onClick={() => {
                      handleCloseDialog();
                      handleViewReceipt(selectedPayment);
                    }}
                  >
                    View Receipt
                  </Button>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                <Typography variant="body2">{formatDate(selectedPayment.updatedAt)}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          
          {selectedPayment && selectedPayment.status === 'PENDING' && (
            <Button
              onClick={() => {
                checkPaymentStatus(selectedPayment.transactionId);
                handleCloseDialog();
                loadPaymentHistory();
              }}
              color="primary"
            >
              Check Status
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Receipt Viewer */}
      {showReceipt && selectedPayment && (
        <ReceiptViewer 
          transactionId={selectedPayment.transactionId} 
          onClose={() => setShowReceipt(false)} 
        />
      )}
    </PaymentHistoryContainer>
  );
};

export default PaymentHistory;
