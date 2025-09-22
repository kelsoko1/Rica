import React, { useEffect } from 'react';
import { Box, Typography, Container, Breadcrumbs, Link, Paper, Tabs, Tab } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import PaymentHistory from '../components/payments/PaymentHistory';
import WebhookHandler from '../components/payments/WebhookHandler';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import WebhookIcon from '@mui/icons-material/Webhook';

const PaymentHistoryPage = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = React.useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ pt: { xs: 10, md: 12 }, pb: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link component={RouterLink} to="/" color="inherit">
              Home
            </Link>
            <Link component={RouterLink} to="/profile" color="inherit">
              Profile
            </Link>
            <Typography color="text.primary">Payment History</Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ReceiptIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 700
                }}
              >
                Payment History
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                component={RouterLink} 
                to="/subscriptions"
                variant="outlined" 
                color="primary"
              >
                Subscriptions
              </Button>
              
              <Button 
                component={RouterLink} 
                to="/analytics"
                variant="outlined" 
                color="primary"
              >
                Analytics
              </Button>
            </Box>
          </Box>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
            View and manage your payment history, including transactions, subscriptions, and billing information.
          </Typography>
          
          <Paper sx={{ mb: 4 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab 
                icon={<ReceiptIcon />} 
                label="Transactions" 
                id="tab-0" 
                aria-controls="tabpanel-0" 
              />
              <Tab 
                icon={<SubscriptionsIcon />} 
                label="Subscriptions" 
                id="tab-1" 
                aria-controls="tabpanel-1" 
              />
              <Tab 
                icon={<CreditCardIcon />} 
                label="Payment Methods" 
                id="tab-2" 
                aria-controls="tabpanel-2" 
              />
              <Tab 
                icon={<WebhookIcon />} 
                label="Webhooks" 
                id="tab-3" 
                aria-controls="tabpanel-3" 
              />
            </Tabs>
          </Paper>
          
          <TabPanel value={tabValue} index={0}>
            <PaymentHistory />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <SubscriptionsPanel />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <PaymentMethodsPanel />
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <WebhookHandler />
          </TabPanel>
        </Container>
      </Box>
    </motion.div>
  );
};

// Tab Panel component
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
};

// Subscriptions Panel
const SubscriptionsPanel = () => {
  return (
    <Paper sx={{ p: 3, mb: 4, textAlign: 'center', py: 8 }}>
      <SubscriptionsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        No Active Subscriptions
      </Typography>
      <Typography variant="body1" color="text.secondary">
        You don't have any active subscriptions at the moment.
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Link component={RouterLink} to="/pricing" color="primary" underline="hover">
          View Available Plans
        </Link>
      </Box>
    </Paper>
  );
};

// Payment Methods Panel
const PaymentMethodsPanel = () => {
  return (
    <Paper sx={{ p: 3, mb: 4, textAlign: 'center', py: 8 }}>
      <CreditCardIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        No Saved Payment Methods
      </Typography>
      <Typography variant="body1" color="text.secondary">
        You don't have any saved payment methods.
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Link component={RouterLink} to="/profile" color="primary" underline="hover">
          Manage Payment Methods
        </Link>
      </Box>
    </Paper>
  );
};

export default PaymentHistoryPage;
