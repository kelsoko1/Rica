import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Grid,
  Divider,
  Chip,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Link as RouterLink } from 'react-router-dom';

import subscriptionService from '../../services/subscriptionService';
import creditService from '../../services/creditService';

// Styled components
const SubscriptionCard = styled(Card)(({ theme, popular }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  border: popular ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
  '& .MuiCardHeader-root': {
    backgroundColor: popular ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(3, 2, 2),
  },
  '& .MuiCardContent-root': {
    flexGrow: 1,
    padding: theme.spacing(3, 2),
  },
  '& .MuiCardActions-root': {
    padding: theme.spacing(0, 2, 3),
  },
}));

const GradientBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '60%',
  height: '60%',
  borderRadius: '50%',
  filter: 'blur(100px)',
  zIndex: -1,
  opacity: 0.15,
}));

const FeatureItem = styled(Box)(({ theme, included }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  color: included ? theme.palette.text.primary : theme.palette.text.disabled,
}));

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`hybrid-tabpanel-${index}`}
      aria-labelledby={`hybrid-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const HybridSubscriptionManager = () => {
  const theme = useTheme();
  const [annual, setAnnual] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [credits, setCredits] = useState(0);

  // Get current user from Firebase
  const { currentUser } = useFirebaseAuth();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!currentUser) {
          console.log('No user logged in');
          setLoading(false);
          return;
        }
        
        const userId = currentUser.uid;
        
        // Get active subscription
        const subscription = subscriptionService.getActiveUserSubscription(userId);
        setActiveSubscription(subscription);

        // Get user credits
        const userCredits = creditService.getUserCredits(userId);
        setCredits(userCredits);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  const handleBillingChange = () => {
    setAnnual(!annual);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getPrice = (plan, billingCycle) => {
    if (plan === 'payAsYouGo') {
      return subscriptionService.subscriptionPlans.payAsYouGo.price.monthly;
    }
    return subscriptionService.subscriptionPlans[plan].price[billingCycle ? 'annual' : 'monthly'];
  };

  const getFormattedPrice = (plan, billingCycle) => {
    const price = getPrice(plan, billingCycle);
    return `$${price}${billingCycle ? '/year' : '/month'}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, position: 'relative', overflow: 'hidden' }}>
        <GradientBox sx={{ background: 'radial-gradient(circle, #4f46e5 0%, #3b82f6 100%)', top: -40, left: -20 }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Rica Hybrid Pricing
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Choose the plan that works best for you. Combine subscriptions with pay-as-you-go credits for maximum flexibility.
          </Typography>
        </motion.div>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="hybrid pricing tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<AutorenewIcon />} label="Subscription Plans" />
          <Tab icon={<LocalAtmIcon />} label="Credit Packages" />
        </Tabs>
      </Box>

      {/* Subscription Plans Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <FormControlLabel
            control={<Switch checked={annual} onChange={handleBillingChange} />}
            label={annual ? 'Annual Billing (Save ~17%)' : 'Monthly Billing'}
          />
        </Box>

        <Grid container spacing={3}>
          {Object.keys(subscriptionService.subscriptionPlans).map((key) => {
            const plan = subscriptionService.subscriptionPlans[key];
            const isPayAsYouGo = key === 'payAsYouGo';
            const popular = key === 'team';

            return (
              <Grid item xs={12} sm={6} md={4} key={plan.id}>
                <SubscriptionCard popular={popular}>
                  {popular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 1
                      }}
                    />
                  )}
                  <CardHeader
                    title={plan.name}
                    subheader={plan.description}
                  />
                  <CardContent>
                    <Typography variant="h4" component="div" sx={{ mb: 2, fontWeight: 'bold' }}>
                      {isPayAsYouGo 
                        ? "Credits" 
                        : getFormattedPrice(key, annual)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {isPayAsYouGo 
                        ? "Pay only for what you use" 
                        : annual ? 'Billed annually' : 'Billed monthly'}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    {plan.features.map((feature, index) => (
                      <FeatureItem key={index} included={true}>
                        <CheckCircleOutlineIcon 
                          sx={{ mr: 1, fontSize: '1rem', color: theme.palette.primary.main }} 
                        />
                        <Typography variant="body2">{feature}</Typography>
                      </FeatureItem>
                    ))}

                    {isPayAsYouGo && (
                      <Box sx={{ mt: 2, p: 1, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 1 }}>
                        <Typography variant="body2" color="primary">
                          $10 for 250 credits ($0.04 per credit)
                        </Typography>
                        <Button 
                          component={RouterLink} 
                          to="/credits"
                          variant="outlined" 
                          color="primary"
                          size="small"
                          sx={{ mt: 1, width: '100%' }}
                        >
                          Buy Credits
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      variant={popular ? "contained" : "outlined"} 
                      fullWidth
                      component={RouterLink}
                      to="/subscription"
                    >
                      {activeSubscription && activeSubscription.planId === key 
                        ? 'Manage Plan' 
                        : 'Choose Plan'}
                    </Button>
                  </CardActions>
                </SubscriptionCard>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ mt: 4, p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Hybrid Model Benefits
          </Typography>
          <Typography variant="body1" paragraph>
            Our hybrid pricing model gives you the best of both worlds:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Subscription Benefits
                </Typography>
                <Typography variant="body2" paragraph>
                  • Predictable monthly/annual costs
                </Typography>
                <Typography variant="body2" paragraph>
                  • Access to all core features
                </Typography>
                <Typography variant="body2" paragraph>
                  • Priority support
                </Typography>
                <Typography variant="body2">
                  • Regular updates and new features
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Credit Benefits
                </Typography>
                <Typography variant="body2" paragraph>
                  • Pay only for what you use
                </Typography>
                <Typography variant="body2" paragraph>
                  • Scale usage up or down as needed
                </Typography>
                <Typography variant="body2" paragraph>
                  • Credits never expire
                </Typography>
                <Typography variant="body2">
                  • Bulk discounts available
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </TabPanel>

      {/* Credit Packages Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <LocalAtmIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6" component="div">
            Current Balance: <strong>{credits}</strong> credits
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            sx={{ ml: 2 }}
            component={RouterLink}
            to="/credits"
          >
            View Details
          </Button>
        </Box>

        <Grid container spacing={3}>
          {Object.keys(creditService.creditPackages).map((key) => {
            const pkg = creditService.creditPackages[key];
            return (
              <Grid item xs={12} sm={6} md={3} key={pkg.id}>
                <SubscriptionCard popular={pkg.popular}>
                  {pkg.popular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 1
                      }}
                    />
                  )}
                  <CardHeader
                    title={pkg.name}
                    subheader={`${pkg.amount} credits`}
                  />
                  <CardContent>
                    <Typography variant="h4" component="div" sx={{ mb: 2, fontWeight: 'bold' }}>
                      ${pkg.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {pkg.description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2">
                      Rate: ${(pkg.price / pkg.amount).toFixed(4)} per credit
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      variant="contained" 
                      fullWidth
                      component={RouterLink}
                      to="/credits"
                    >
                      Purchase
                    </Button>
                  </CardActions>
                </SubscriptionCard>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Credit Usage Costs
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(creditService.creditCosts).map(([feature, cost]) => (
              <Grid item xs={12} sm={6} md={4} key={feature}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">
                    {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {cost} credits
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </TabPanel>
    </Box>
  );
};

export default HybridSubscriptionManager;
