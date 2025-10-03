import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { styled } from '@mui/material/styles';
import analyticsService from '../../services/analyticsService';
import subscriptionService from '../../services/subscriptionService';
import paymentHistoryService from '../../services/paymentHistoryService';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';

const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const StatsCardHeader = styled(CardHeader)(({ theme }) => ({
  paddingBottom: theme.spacing(0),
}));

const StatsCardContent = styled(CardContent)(({ theme }) => ({
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(2),
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

const StatsValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  marginBottom: theme.spacing(1),
}));

const StatsIcon = styled(Box)(({ theme, color = 'primary' }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: '50%',
  backgroundColor: theme.palette[color].light,
  color: theme.palette[color].dark,
}));

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    events: [],
    eventCounts: {},
    conversionRate: 0
  });
  const [subscriptionMetrics, setSubscriptionMetrics] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    cancelledSubscriptions: 0,
    countByStatus: {},
    countByPlan: {},
    countByBillingCycle: {},
    mrr: 0
  });
  const [paymentStats, setPaymentStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    paymentsByStatus: {},
    paymentsByMethod: {}
  });

  // Load analytics data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get analytics data
        const events = analyticsService.getAnalyticsEvents();
        const eventCounts = analyticsService.getEventCountsByType();
        const conversionRate = analyticsService.getPaymentConversionRate();
        
        setAnalyticsData({
          events,
          eventCounts,
          conversionRate
        });
        
        // Get subscription metrics
        const metrics = subscriptionService.getSubscriptionMetrics();
        setSubscriptionMetrics(metrics);
        
        // Get payment stats
        const payments = paymentHistoryService.getPaymentHistory();
        
        // Calculate payment stats
        const paymentsByStatus = payments.reduce((counts, payment) => {
          counts[payment.status] = (counts[payment.status] || 0) + 1;
          return counts;
        }, {});
        
        const paymentsByMethod = payments.reduce((counts, payment) => {
          const method = payment.paymentMethod || (payment.provider ? 'mobile_money' : 'card');
          counts[method] = (counts[method] || 0) + 1;
          return counts;
        }, {});
        
        const totalAmount = payments.reduce((total, payment) => {
          if (payment.status === 'COMPLETED') {
            return total + (payment.amount || 0);
          }
          return total;
        }, 0);
        
        setPaymentStats({
          totalPayments: payments.length,
          totalAmount,
          paymentsByStatus,
          paymentsByMethod
        });
      } catch (err) {
        console.error('Error loading analytics data:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.0%';
    }
    return `${Number(value).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <DashboardContainer>
      <Typography variant="h5" gutterBottom>
        Analytics Dashboard
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Overview of payment and subscription analytics.
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard elevation={1}>
            <StatsCardHeader
              avatar={
                <StatsIcon color="success">
                  <AttachMoneyIcon />
                </StatsIcon>
              }
              title="Total Revenue"
            />
            <StatsCardContent>
              <StatsValue>
                {formatCurrency(paymentStats.totalAmount)}
              </StatsValue>
              <Typography variant="body2" color="text.secondary">
                From {paymentStats.paymentsByStatus.COMPLETED || 0} completed payments
              </Typography>
            </StatsCardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard elevation={1}>
            <StatsCardHeader
              avatar={
                <StatsIcon color="primary">
                  <ReceiptIcon />
                </StatsIcon>
              }
              title="Transactions"
            />
            <StatsCardContent>
              <StatsValue>
                {paymentStats.totalPayments}
              </StatsValue>
              <Typography variant="body2" color="text.secondary">
                {paymentStats.paymentsByStatus.PENDING || 0} pending
              </Typography>
            </StatsCardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard elevation={1}>
            <StatsCardHeader
              avatar={
                <StatsIcon color="info">
                  <PeopleIcon />
                </StatsIcon>
              }
              title="Active Subscriptions"
            />
            <StatsCardContent>
              <StatsValue>
                {subscriptionMetrics.activeSubscriptions}
              </StatsValue>
              <Typography variant="body2" color="text.secondary">
                MRR: {formatCurrency(subscriptionMetrics.mrr)}
              </Typography>
            </StatsCardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard elevation={1}>
            <StatsCardHeader
              avatar={
                <StatsIcon color="warning">
                  <TrendingUpIcon />
                </StatsIcon>
              }
              title="Conversion Rate"
            />
            <StatsCardContent>
              <StatsValue>
                {formatPercentage(analyticsData.conversionRate)}
              </StatsValue>
              <Typography variant="body2" color="text.secondary">
                Payment completion rate
              </Typography>
            </StatsCardContent>
          </StatsCard>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Subscription Distribution
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  By Plan
                </Typography>
                
                <List dense>
                  {Object.entries(subscriptionMetrics.countByPlan).map(([plan, count]) => (
                    <ListItem key={plan} disableGutters>
                      <ListItemText
                        primary={subscriptionService.subscriptionPlans[plan]?.name || plan}
                        secondary={`${count} subscriptions`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  By Billing Cycle
                </Typography>
                
                <List dense>
                  {Object.entries(subscriptionMetrics.countByBillingCycle).map(([cycle, count]) => (
                    <ListItem key={cycle} disableGutters>
                      <ListItemText
                        primary={cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                        secondary={`${count} subscriptions`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Payment Methods
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  By Type
                </Typography>
                
                <List dense>
                  {Object.entries(paymentStats.paymentsByMethod).map(([method, count]) => (
                    <ListItem key={method} disableGutters>
                      <ListItemText
                        primary={method === 'card' ? 'Credit/Debit Card' : 'Mobile Money'}
                        secondary={`${count} payments (${formatPercentage((count / paymentStats.totalPayments) * 100)})`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  By Status
                </Typography>
                
                <List dense>
                  {Object.entries(paymentStats.paymentsByStatus).map(([status, count]) => (
                    <ListItem key={status} disableGutters>
                      <ListItemText
                        primary={status}
                        secondary={`${count} payments (${formatPercentage((count / paymentStats.totalPayments) * 100)})`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Analytics Events
              </Typography>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  analyticsService.clearAnalyticsEvents();
                  window.location.reload();
                }}
              >
                Clear Events
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {analyticsData.events.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No analytics events recorded yet
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analyticsData.events.slice(0, 10).map((event, index) => (
                      <TableRow key={index}>
                        <TableCell>{event.eventName}</TableCell>
                        <TableCell>
                          {new Date(event.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {Object.entries(event)
                            .filter(([key]) => !['eventName', 'timestamp'].includes(key))
                            .map(([key, value]) => (
                              <Typography key={key} variant="caption" display="block">
                                <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
                              </Typography>
                            ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {analyticsData.events.length > 10 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Showing 10 of {analyticsData.events.length} events
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default AnalyticsDashboard;
