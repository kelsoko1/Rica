import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsIcon from '@mui/icons-material/Settings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';

// Import the MonetizationDashboard component
// Note: This would need to be copied from rica-ui to rica-landing or shared
// For now, we'll create a placeholder that shows the integration structure

// Styled components
const MonetizationCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  textAlign: 'center',
  background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.05)})`,
  border: `1px solid ${theme.palette.divider}`,
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`monetization-tabpanel-${index}`}
      aria-labelledby={`monetization-tab-${index}`}
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

function a11yProps(index) {
  return {
    id: `monetization-tab-${index}`,
    'aria-controls': `monetization-tabpanel-${index}`,
  };
}

const MonetizationPage = () => {
  const theme = useTheme();
  const { currentUser } = useFirebaseAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [monetizationData, setMonetizationData] = useState({
    totalEarnings: 0,
    totalImpressions: 0,
    activeWorlds: 0,
    averageDailyEarnings: 0,
    adsEnabled: false,
    placements: []
  });

  useEffect(() => {
    if (currentUser) {
      loadMonetizationData();
    }
  }, [currentUser]);

  const loadMonetizationData = async () => {
    try {
      setLoading(true);

      // In a real implementation, this would call the ads API
      // For now, we'll simulate the data structure
      const mockData = {
        totalEarnings: 0,
        totalImpressions: 0,
        activeWorlds: 0,
        averageDailyEarnings: 0,
        adsEnabled: false,
        placements: []
      };

      setMonetizationData(mockData);
    } catch (error) {
      console.error('Error loading monetization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const toggleAds = async (enabled) => {
    try {
      // In a real implementation, this would call the ads API
      setMonetizationData(prev => ({
        ...prev,
        adsEnabled: enabled
      }));
    } catch (error) {
      console.error('Error toggling ads:', error);
    }
  };

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="info">
          Please log in to access the monetization dashboard.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading monetization data...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Vircadia Monetization Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Monetize your virtual worlds with our YouTube-style ads system
          </Typography>
        </Box>
      </motion.div>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Typography variant="h4" color="primary" gutterBottom>
                ${monetizationData.totalEarnings.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Earnings
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Typography variant="h4" color="primary" gutterBottom>
                {monetizationData.totalImpressions.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Impressions
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Typography variant="h4" color="primary" gutterBottom>
                {monetizationData.activeWorlds}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Worlds
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Typography variant="h4" color="primary" gutterBottom>
                ${monetizationData.averageDailyEarnings.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Daily Earnings
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>

      {/* Monetization Toggle */}
      <MonetizationCard sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Enable Monetization
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start earning revenue by showing ads in your virtual worlds
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {monetizationData.adsEnabled ? 'Enabled' : 'Disabled'}
              </Typography>
              <Button
                variant={monetizationData.adsEnabled ? "outlined" : "contained"}
                color={monetizationData.adsEnabled ? "error" : "success"}
                onClick={() => toggleAds(!monetizationData.adsEnabled)}
                startIcon={<MonetizationOnIcon />}
              >
                {monetizationData.adsEnabled ? 'Disable' : 'Enable'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </MonetizationCard>

      {/* Tabs for different sections */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="monetization tabs">
            <Tab
              icon={<TrendingUpIcon />}
              label="Overview"
              {...a11yProps(0)}
            />
            <Tab
              icon={<SettingsIcon />}
              label="Settings"
              {...a11yProps(1)}
            />
            <Tab
              icon={<AnalyticsIcon />}
              label="Analytics"
              {...a11yProps(2)}
            />
          </Tabs>
        </CardHeader>

        <TabPanel value={activeTab} index={0}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Earnings Overview
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Your monetization dashboard will show real-time earnings, impression data, and performance metrics once ads are enabled in your Vircadia worlds.
            </Typography>

            {monetizationData.adsEnabled ? (
              <Alert severity="success">
                Ads are enabled! Start creating engaging content in your virtual worlds to maximize earnings.
              </Alert>
            ) : (
              <Alert severity="info">
                Enable monetization to start earning revenue from your virtual worlds.
              </Alert>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Monetization Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Configure your monetization preferences including revenue share, ad frequency, and placement settings.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Revenue Share
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      70% Creator / 30% Platform (default)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Minimum Users
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      5 users required for ad display
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Performance Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Detailed analytics including user engagement, impression data, and revenue trends will be available here.
            </Typography>

            <Alert severity="info">
              Analytics data will appear once you enable monetization and start receiving traffic in your virtual worlds.
            </Alert>
          </Box>
        </TabPanel>
      </Card>
    </Container>
  );
};

export default MonetizationPage;
