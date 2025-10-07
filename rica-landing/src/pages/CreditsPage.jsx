import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HistoryIcon from '@mui/icons-material/History';
import BarChartIcon from '@mui/icons-material/BarChart';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

import creditService from '../services/creditService';
import PaymentMethodSelector from '../components/payments/PaymentMethodSelector';

// We'll get the real user ID from Firebase auth

// Styled components
const CreditCard = styled(Card)(({ theme, popular }) => ({
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

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`credit-tabpanel-${index}`}
      aria-labelledby={`credit-tab-${index}`}
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

const CreditsPage = () => {
  const theme = useTheme();
  const { currentUser } = useFirebaseAuth();
  const [tabValue, setTabValue] = useState(0);
  const [credits, setCredits] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);
  const [showLowCreditWarning, setShowLowCreditWarning] = useState(false);
  
  // Credit threshold for warning
  const LOW_CREDIT_THRESHOLD = 50;

  // Load user credits and transactions
  useEffect(() => {
    const loadUserData = () => {
      try {
        if (!currentUser) {
          console.log('No user logged in');
          setLoading(false);
          return;
        }
        
        const userId = currentUser.uid;
        
        // Get user credits
        const userCredits = creditService.getUserCredits(userId);
        setCredits(userCredits);
        
        // Check if credits are below threshold
        setShowLowCreditWarning(userCredits < LOW_CREDIT_THRESHOLD);

        // Get transactions
        const userTransactions = creditService.getCreditTransactions(userId);
        setTransactions(userTransactions);

        // Get metrics
        const userMetrics = creditService.getCreditMetrics(userId);
        setMetrics(userMetrics);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, [currentUser]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePurchaseClick = (packageId) => {
    setSelectedPackage(packageId);
    setTabValue(3); // Switch to purchase tab
  };

  const handlePurchaseSubmit = async (paymentMethod, paymentDetails) => {
    if (!selectedPackage || !currentUser) return;

    setPurchasing(true);
    setPurchaseSuccess(false);
    setPurchaseError(null);

    try {
      const userId = currentUser.uid;
      
      // Purchase credits
      await creditService.purchaseCredits(
        userId,
        selectedPackage,
        paymentMethod,
        paymentDetails
      );

      // Update credits
      const userCredits = creditService.getUserCredits(userId);
      setCredits(userCredits);

      // Update transactions
      const userTransactions = creditService.getCreditTransactions(userId);
      setTransactions(userTransactions);

      // Update metrics
      const userMetrics = creditService.getCreditMetrics(userId);
      setMetrics(userMetrics);

      setPurchaseSuccess(true);
    } catch (error) {
      console.error('Error purchasing credits:', error);
      setPurchaseError(error.message || 'Failed to purchase credits');
    } finally {
      setPurchasing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon color="success" />;
      case 'PENDING':
        return <HourglassEmptyIcon color="warning" />;
      case 'FAILED':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
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
              Credit Management
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalAtmIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h5" component="div">
                Current Balance: <strong>{credits}</strong> credits
              </Typography>
            </Box>
            {showLowCreditWarning && (
              <Alert 
                severity="warning" 
                sx={{ mb: 2 }}
                action={
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={() => setTabValue(0)}
                  >
                    Buy Credits
                  </Button>
                }
              >
                Your credit balance is running low! You have less than {LOW_CREDIT_THRESHOLD} credits remaining.
              </Alert>
            )}
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Purchase and manage your Rica credits. Credits can be used for various features and services.
            </Typography>
          </motion.div>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="credit management tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<ShoppingCartIcon />} label="Buy Credits" />
            <Tab icon={<HistoryIcon />} label="Transaction History" />
            <Tab icon={<BarChartIcon />} label="Usage Analytics" />
            <Tab icon={<PaymentIcon />} label="Payment" sx={{ display: selectedPackage ? 'flex' : 'none' }} />
          </Tabs>
        </Box>

        {/* Buy Credits Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {Object.keys(creditService.creditPackages).map((key) => {
              const pkg = creditService.creditPackages[key];
              return (
                <Grid item xs={12} sm={6} md={3} key={pkg.id}>
                  <CreditCard popular={pkg.popular}>
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
                        onClick={() => handlePurchaseClick(pkg.id)}
                      >
                        Purchase
                      </Button>
                    </CardActions>
                  </CreditCard>
                </Grid>
              );
            })}
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Credit Usage Costs
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Feature</TableCell>
                    <TableCell align="right">Credits</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(creditService.creditCosts).map(([feature, cost]) => (
                    <StyledTableRow key={feature}>
                      <TableCell component="th" scope="row">
                        {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </TableCell>
                      <TableCell align="right">{cost}</TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Transaction History Tab */}
        <TabPanel value={tabValue} index={1}>
          {transactions.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell align="right">Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <StyledTableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.type === 'credit' ? 'Added' : 'Used'} 
                          color={transaction.type === 'credit' ? 'success' : 'primary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {transaction.type === 'credit' ? '+' : ''}{transaction.amount}
                      </TableCell>
                      <TableCell>
                        {transaction.source === 'purchase' && 'Credit Purchase'}
                        {transaction.feature && `Used for ${transaction.feature}`}
                      </TableCell>
                      <TableCell align="right">{transaction.balance}</TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No transactions yet. Purchase some credits to get started!
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Usage Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          {metrics ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Credit Summary" />
                  <CardContent>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Current Balance</TableCell>
                            <TableCell align="right">{metrics.currentBalance}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Total Purchased</TableCell>
                            <TableCell align="right">{metrics.totalPurchased}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Total Used</TableCell>
                            <TableCell align="right">{metrics.totalUsed}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Usage by Feature" />
                  <CardContent>
                    {Object.keys(metrics.usageByFeature).length > 0 ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Feature</TableCell>
                              <TableCell align="right">Credits Used</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(metrics.usageByFeature).map(([feature, amount]) => (
                              <TableRow key={feature}>
                                <TableCell>{feature}</TableCell>
                                <TableCell align="right">{amount}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No feature usage data yet
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No usage data available yet
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Payment Tab */}
        <TabPanel value={tabValue} index={3}>
          {selectedPackage && (
            <>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Purchase {creditService.creditPackages[selectedPackage].amount} Credits
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Package: {creditService.creditPackages[selectedPackage].name}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Price: ${creditService.creditPackages[selectedPackage].price}
                </Typography>
              </Box>

              {purchaseSuccess ? (
                <Alert 
                  severity="success" 
                  sx={{ mb: 3 }}
                  action={
                    <Button 
                      color="inherit" 
                      size="small" 
                      onClick={() => {
                        setTabValue(0);
                        setPurchaseSuccess(false);
                        setSelectedPackage(null);
                      }}
                    >
                      Back to Credits
                    </Button>
                  }
                >
                  Credits purchased successfully! Your new balance is {credits} credits.
                </Alert>
              ) : (
                <>
                  {purchaseError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {purchaseError}
                    </Alert>
                  )}
                  
                  <Box sx={{ mb: 3 }}>
                    <PaymentMethodSelector 
                      amount={creditService.creditPackages[selectedPackage].price}
                      onSubmit={handlePurchaseSubmit}
                      loading={purchasing}
                      buttonText="Complete Purchase"
                    />
                  </Box>
                  
                  <Button 
                    variant="outlined" 
                    onClick={() => setTabValue(0)}
                    disabled={purchasing}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </>
          )}
        </TabPanel>
      </Box>
    </Container>
  );
};

export default CreditsPage;
