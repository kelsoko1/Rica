import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import subscriptionService from '../../services/subscriptionService';
import analyticsService from '../../services/analyticsService';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import EditIcon from '@mui/icons-material/Edit';

const SubscriptionContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const PlanCard = styled(Card)(({ theme, selected }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  border: selected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-4px)',
  },
}));

const PlanCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
}));

const PlanPrice = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  marginBottom: theme.spacing(1),
}));

const PlanFeature = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  let color;
  switch (status) {
    case 'active':
      color = theme.palette.success;
      break;
    case 'cancelled':
      color = theme.palette.error;
      break;
    case 'pending':
      color = theme.palette.warning;
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

const SubscriptionManager = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [billingCycle, setBillingCycle] = useState('annual');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false);
  
  // Load subscriptions
  useEffect(() => {
    const loadSubscriptions = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get user subscriptions
        const userSubscriptions = subscriptionService.getUserSubscriptions(currentUser?.id || 'demo-user');
        setSubscriptions(userSubscriptions);
        
        // Get active subscription
        const active = subscriptionService.getActiveUserSubscription(currentUser?.id || 'demo-user');
        setActiveSubscription(active);
        
        // Set selected plan and billing cycle based on active subscription
        if (active) {
          setSelectedPlan(active.planId);
          setBillingCycle(active.billingCycle);
        }
        
        // Track page view
        analyticsService.trackPageView('subscription_manager', {
          hasActiveSubscription: !!active,
          subscriptionCount: userSubscriptions.length
        });
      } catch (err) {
        console.error('Error loading subscriptions:', err);
        setError('Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    };
    
    loadSubscriptions();
  }, [currentUser]);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  // Calculate days remaining
  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };
  
  // Handle plan selection
  const handlePlanSelection = (planId) => {
    setSelectedPlan(planId);
  };
  
  // Handle billing cycle change
  const handleBillingCycleChange = (event) => {
    setBillingCycle(event.target.value);
  };
  
  // Handle subscription creation
  const handleCreateSubscription = () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create subscription
      const subscription = subscriptionService.createSubscription({
        userId: currentUser?.id || 'demo-user',
        planId: selectedPlan,
        billingCycle,
        currency: 'USD',
        paymentMethod: 'card',
        paymentMethodDetails: {
          last4: '4242',
          brand: 'visa'
        }
      });
      
      // Update state
      setSubscriptions([...subscriptions, subscription]);
      setActiveSubscription(subscription);
      
      // Track event
      analyticsService.trackEvent('subscription_created', {
        planId: selectedPlan,
        billingCycle,
        price: subscription.price
      });
      
      // Show success dialog
      setDialogType('success');
      setDialogOpen(true);
    } catch (err) {
      console.error('Error creating subscription:', err);
      setError('Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle subscription cancellation
  const handleCancelSubscription = () => {
    if (!activeSubscription) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Cancel subscription
      const cancelled = subscriptionService.cancelSubscription(
        activeSubscription.id,
        cancelReason
      );
      
      // Update state
      const updatedSubscriptions = subscriptions.map(sub => 
        sub.id === cancelled.id ? cancelled : sub
      );
      setSubscriptions(updatedSubscriptions);
      setActiveSubscription(null);
      
      // Track event
      analyticsService.trackEvent('subscription_cancelled', {
        subscriptionId: activeSubscription.id,
        planId: activeSubscription.planId,
        reason: cancelReason
      });
      
      // Close dialog
      setDialogOpen(false);
      setCancelReason('');
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError('Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle subscription renewal
  const handleRenewSubscription = (subscriptionId) => {
    setLoading(true);
    setError(null);
    
    try {
      // Renew subscription
      const renewed = subscriptionService.renewSubscription(subscriptionId);
      
      // Update state
      const updatedSubscriptions = subscriptions.map(sub => 
        sub.id === renewed.id ? renewed : sub
      );
      setSubscriptions(updatedSubscriptions);
      setActiveSubscription(renewed);
      
      // Track event
      analyticsService.trackEvent('subscription_renewed', {
        subscriptionId,
        planId: renewed.planId,
        billingCycle: renewed.billingCycle
      });
    } catch (err) {
      console.error('Error renewing subscription:', err);
      setError('Failed to renew subscription');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle change plan
  const handleChangePlan = () => {
    if (!activeSubscription) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Change subscription plan
      const updated = subscriptionService.changeSubscriptionPlan(
        activeSubscription.id,
        selectedPlan,
        billingCycle
      );
      
      // Update state
      const updatedSubscriptions = subscriptions.map(sub => 
        sub.id === updated.id ? updated : sub
      );
      setSubscriptions(updatedSubscriptions);
      setActiveSubscription(updated);
      
      // Track event
      analyticsService.trackEvent('subscription_plan_changed', {
        subscriptionId: activeSubscription.id,
        oldPlanId: activeSubscription.planId,
        newPlanId: selectedPlan,
        oldBillingCycle: activeSubscription.billingCycle,
        newBillingCycle: billingCycle
      });
      
      // Close dialog
      setChangePlanDialogOpen(false);
    } catch (err) {
      console.error('Error changing subscription plan:', err);
      setError('Failed to change subscription plan');
    } finally {
      setLoading(false);
    }
  };
  
  // Open dialog
  const openDialog = (type) => {
    setDialogType(type);
    setDialogOpen(true);
  };
  
  // Close dialog
  const closeDialog = () => {
    setDialogOpen(false);
    setCancelReason('');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <SubscriptionContainer>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {activeSubscription ? (
        <Box>
          <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">
                Current Subscription
              </Typography>
              
              <StatusChip
                label={activeSubscription.status}
                status={activeSubscription.status}
              />
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Plan
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {subscriptionService.subscriptionPlans[activeSubscription.planId]?.name || activeSubscription.planId}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                  Billing Cycle
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {activeSubscription.billingCycle.charAt(0).toUpperCase() + activeSubscription.billingCycle.slice(1)}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                  Price
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {formatCurrency(activeSubscription.price, activeSubscription.currency)}
                  {activeSubscription.billingCycle === 'annual' ? ' / year' : ' / month'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Current Period
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(activeSubscription.currentPeriodStart)} - {formatDate(activeSubscription.currentPeriodEnd)}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                  Days Remaining
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {calculateDaysRemaining(activeSubscription.currentPeriodEnd)} days
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                  Payment Method
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {activeSubscription.paymentMethodDetails?.brand || 'Card'} ending in {activeSubscription.paymentMethodDetails?.last4 || '****'}
                </Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setChangePlanDialogOpen(true)}
                startIcon={<EditIcon />}
                sx={{ mr: 2 }}
              >
                Change Plan
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                onClick={() => openDialog('cancel')}
                startIcon={<CancelIcon />}
              >
                Cancel Subscription
              </Button>
            </Box>
          </Paper>
          
          {subscriptions.length > 1 && (
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Subscription History
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Plan</TableCell>
                      <TableCell>Billing Cycle</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subscriptions
                      .filter(sub => sub.id !== activeSubscription.id)
                      .map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell>
                            {subscriptionService.subscriptionPlans[subscription.planId]?.name || subscription.planId}
                          </TableCell>
                          <TableCell>
                            {subscription.billingCycle.charAt(0).toUpperCase() + subscription.billingCycle.slice(1)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(subscription.price, subscription.currency)}
                          </TableCell>
                          <TableCell>
                            <StatusChip
                              label={subscription.status}
                              status={subscription.status}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {formatDate(subscription.createdAt)}
                          </TableCell>
                          <TableCell>
                            {subscription.status === 'cancelled' && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                onClick={() => handleRenewSubscription(subscription.id)}
                                startIcon={<AutorenewIcon />}
                              >
                                Renew
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>
      ) : (
        <Box>
          <Typography variant="h5" gutterBottom>
            Choose a Subscription Plan
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            Select a plan that best fits your needs.
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <TextField
              select
              label="Billing Cycle"
              value={billingCycle}
              onChange={handleBillingCycleChange}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="annual">Annual (Save 20%)</MenuItem>
            </TextField>
          </Box>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {Object.entries(subscriptionService.subscriptionPlans).map(([planId, plan]) => (
              <Grid item xs={12} md={4} key={planId}>
                <PlanCard 
                  elevation={selectedPlan === planId ? 3 : 1}
                  selected={selectedPlan === planId}
                  onClick={() => handlePlanSelection(planId)}
                >
                  <CardHeader
                    title={plan.name}
                    subheader={plan.description}
                  />
                  
                  <PlanCardContent>
                    <PlanPrice>
                      {formatCurrency(plan.price[billingCycle])}
                      <Typography variant="body2" component="span" color="text.secondary">
                        {billingCycle === 'annual' ? ' / year' : ' / month'}
                      </Typography>
                    </PlanPrice>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    {plan.features.map((feature, index) => (
                      <PlanFeature key={index}>
                        <CheckCircleOutlineIcon color="primary" sx={{ mr: 1 }} fontSize="small" />
                        <Typography variant="body2">{feature}</Typography>
                      </PlanFeature>
                    ))}
                  </PlanCardContent>
                  
                  <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button
                      variant={selectedPlan === planId ? "contained" : "outlined"}
                      color="primary"
                      onClick={() => handlePlanSelection(planId)}
                    >
                      {selectedPlan === planId ? "Selected" : "Select"}
                    </Button>
                  </CardActions>
                </PlanCard>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleCreateSubscription}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Subscribe Now'}
            </Button>
          </Box>
        </Box>
      )}
      
      {/* Success Dialog */}
      <Dialog
        open={dialogOpen && dialogType === 'success'}
        onClose={closeDialog}
      >
        <DialogTitle>Subscription Created</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <DialogContentText>
              Your subscription has been created successfully. You now have access to all the features of the {subscriptionService.subscriptionPlans[selectedPlan]?.name} plan.
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Cancel Dialog */}
      <Dialog
        open={dialogOpen && dialogType === 'cancel'}
        onClose={closeDialog}
      >
        <DialogTitle>Cancel Subscription</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for cancellation (optional)"
            fullWidth
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>
            Keep Subscription
          </Button>
          <Button onClick={handleCancelSubscription} color="error">
            Cancel Subscription
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Change Plan Dialog */}
      <Dialog
        open={changePlanDialogOpen}
        onClose={() => setChangePlanDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Change Subscription Plan</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Select a new plan or billing cycle for your subscription.
          </DialogContentText>
          
          <Box sx={{ mb: 3 }}>
            <TextField
              select
              label="Billing Cycle"
              value={billingCycle}
              onChange={handleBillingCycleChange}
              fullWidth
              margin="normal"
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="annual">Annual (Save 20%)</MenuItem>
            </TextField>
          </Box>
          
          <Grid container spacing={2}>
            {Object.entries(subscriptionService.subscriptionPlans).map(([planId, plan]) => (
              <Grid item xs={12} md={4} key={planId}>
                <PlanCard 
                  elevation={selectedPlan === planId ? 3 : 1}
                  selected={selectedPlan === planId}
                  onClick={() => handlePlanSelection(planId)}
                >
                  <CardHeader
                    title={plan.name}
                    subheader={plan.description}
                  />
                  
                  <PlanCardContent>
                    <PlanPrice>
                      {formatCurrency(plan.price[billingCycle])}
                      <Typography variant="body2" component="span" color="text.secondary">
                        {billingCycle === 'annual' ? ' / year' : ' / month'}
                      </Typography>
                    </PlanPrice>
                    
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant={selectedPlan === planId ? "contained" : "outlined"}
                        color="primary"
                        fullWidth
                        onClick={() => handlePlanSelection(planId)}
                      >
                        {selectedPlan === planId ? "Selected" : "Select"}
                      </Button>
                    </Box>
                  </PlanCardContent>
                </PlanCard>
              </Grid>
            ))}
          </Grid>
          
          {activeSubscription && selectedPlan !== activeSubscription.planId && (
            <Alert severity="info" sx={{ mt: 3 }}>
              Changing your plan will take effect immediately. You will be charged or credited the difference in price.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePlanDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleChangePlan} 
            color="primary"
            disabled={activeSubscription && 
              selectedPlan === activeSubscription.planId && 
              billingCycle === activeSubscription.billingCycle}
          >
            Change Plan
          </Button>
        </DialogActions>
      </Dialog>
    </SubscriptionContainer>
  );
};

export default SubscriptionManager;
