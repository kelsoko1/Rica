import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Icons
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LanguageIcon from '@mui/icons-material/Language';
import GroupsIcon from '@mui/icons-material/Groups';
import ShieldIcon from '@mui/icons-material/Shield';
import ApiIcon from '@mui/icons-material/Api';
import StorageIcon from '@mui/icons-material/Storage';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import BugReportIcon from '@mui/icons-material/BugReport';
import TerminalIcon from '@mui/icons-material/Terminal';
import DevicesIcon from '@mui/icons-material/Devices';
import CloudIcon from '@mui/icons-material/Cloud';

const GradientBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '60%',
  height: '60%',
  borderRadius: '50%',
  filter: 'blur(100px)',
  zIndex: -1,
  opacity: 0.15,
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 30px rgba(0, 0, 0, 0.1)',
  },
}));

const IconBox = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 60,
  height: 60,
  borderRadius: 12,
  backgroundColor: alpha(color, 0.1),
  color: color,
  marginBottom: theme.spacing(2),
}));

const features = [
  {
    title: 'Advanced Threat Detection',
    description: 'Identify and respond to sophisticated threats with our AI-powered detection engine that continuously monitors your environment.',
    icon: <SecurityIcon fontSize="large" />,
    color: '#6366f1'
  },
  {
    title: 'Real-time Analytics',
    description: 'Get instant insights with real-time dashboards and analytics that help you understand your security posture at a glance.',
    icon: <SpeedIcon fontSize="large" />,
    color: '#10b981'
  },
  {
    title: 'Seamless Integration',
    description: 'Easily integrate with your existing security tools and workflows through our extensive API and pre-built connectors.',
    icon: <IntegrationInstructionsIcon fontSize="large" />,
    color: '#f43f5e'
  },
  {
    title: 'Intelligent Automation',
    description: 'Automate routine security tasks and response workflows to reduce alert fatigue and focus on what matters.',
    icon: <AutoGraphIcon fontSize="large" />,
    color: '#8b5cf6'
  },
  {
    title: 'Compliance Management',
    description: 'Stay compliant with regulatory requirements through continuous monitoring and comprehensive reporting capabilities.',
    icon: <VerifiedUserIcon fontSize="large" />,
    color: '#f59e0b'
  },
  {
    title: 'Multi-browser Profiles',
    description: 'Create and manage multiple browser profiles with unique fingerprints for secure and isolated browsing sessions.',
    icon: <LanguageIcon fontSize="large" />,
    color: '#3b82f6'
  },
  {
    title: 'Team Collaboration',
    description: 'Share browser profiles and security findings with team members for collaborative security research and response.',
    icon: <GroupsIcon fontSize="large" />,
    color: '#ec4899'
  },
  {
    title: 'Secure Browsing',
    description: 'Browse the web securely with anti-fingerprinting technology that protects your identity and prevents tracking.',
    icon: <ShieldIcon fontSize="large" />,
    color: '#14b8a6'
  },
  {
    title: 'Comprehensive API',
    description: 'Access all Rica features programmatically through our well-documented RESTful API for custom integrations.',
    icon: <ApiIcon fontSize="large" />,
    color: '#6366f1'
  },
  {
    title: 'Data Storage & Management',
    description: 'Securely store and manage security data with our encrypted storage solution that ensures data integrity.',
    icon: <StorageIcon fontSize="large" />,
    color: '#f43f5e'
  },
  {
    title: 'Alert Management',
    description: 'Configure custom alert rules and notification channels to ensure you never miss critical security events.',
    icon: <NotificationsActiveIcon fontSize="large" />,
    color: '#f59e0b'
  },
  {
    title: 'Customizable Dashboard',
    description: 'Build personalized security dashboards with drag-and-drop widgets to monitor what matters most to your organization.',
    icon: <DashboardCustomizeIcon fontSize="large" />,
    color: '#10b981'
  },
  {
    title: 'Vulnerability Management',
    description: 'Identify, prioritize, and remediate vulnerabilities across your infrastructure with our comprehensive scanning tools.',
    icon: <BugReportIcon fontSize="large" />,
    color: '#8b5cf6'
  },
  {
    title: 'Command Line Interface',
    description: 'Automate Rica tasks with our powerful CLI tool, perfect for scripting and integration with your DevSecOps pipeline.',
    icon: <TerminalIcon fontSize="large" />,
    color: '#3b82f6'
  },
  {
    title: 'Cross-Platform Support',
    description: 'Run Rica on Windows, MacOS, and Linux with consistent functionality and performance across all platforms.',
    icon: <DevicesIcon fontSize="large" />,
    color: '#14b8a6'
  },
  {
    title: 'Cloud Deployment',
    description: 'Deploy Rica in your preferred cloud environment with our Docker containers and Kubernetes manifests.',
    icon: <CloudIcon fontSize="large" />,
    color: '#ec4899'
  }
];

const detailedFeatures = [
  {
    title: 'Browser Fingerprint Management',
    description: 'Rica\'s advanced browser fingerprinting technology allows security professionals to create and manage multiple browser profiles with unique digital fingerprints. Each profile can have customized settings for:',
    details: [
      'User agent spoofing',
      'Platform emulation (Windows, MacOS, Linux)',
      'Language preferences',
      'Screen resolution',
      'Timezone settings',
      'WebGL vendor and renderer spoofing',
      'Canvas noise generation',
      'Font fingerprinting protection',
      'WebRTC IP leakage prevention',
      'Audio fingerprinting protection'
    ],
    image: '/src/assets/browser-profiles.png',
    reverse: false
  },
  {
    title: 'Threat Intelligence Platform',
    description: 'Our comprehensive threat intelligence platform provides real-time insights into emerging threats and vulnerabilities affecting your organization. Key capabilities include:',
    details: [
      'Real-time threat feeds from multiple sources',
      'Automated threat correlation and analysis',
      'Custom threat scoring and prioritization',
      'Threat hunting capabilities',
      'Historical threat data analysis',
      'Threat intelligence sharing',
      'Integration with MITRE ATT&CK framework',
      'Customizable threat dashboards',
      'Automated threat reports',
      'Threat intelligence API'
    ],
    image: '/src/assets/threat-intelligence.png',
    reverse: true
  },
  {
    title: 'Team Collaboration Features',
    description: 'Rica enables seamless collaboration among security team members with features designed for effective teamwork:',
    details: [
      'Team management with role-based access control',
      'Profile sharing between team members',
      'Collaborative threat analysis',
      'Shared dashboards and reports',
      'Team activity logs',
      'Commenting and annotation tools',
      'Task assignment and tracking',
      'Real-time notifications',
      'Knowledge base integration',
      'Secure team communication'
    ],
    image: '/src/assets/team-collaboration.png',
    reverse: false
  }
];

const FeaturesPage = () => {
  const theme = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box sx={{ pt: { xs: 8, md: 12 } }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          position: 'relative',
          overflow: 'hidden',
          py: { xs: 8, md: 12 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <GradientBox 
            sx={{ 
              top: '-10%', 
              left: '-10%', 
              background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' 
            }} 
          />
          <GradientBox 
            sx={{ 
              bottom: '0%', 
              right: '-10%', 
              background: 'radial-gradient(circle, #f43f5e 0%, transparent 70%)' 
            }} 
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(90deg, #6366f1 0%, #f43f5e 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textFillColor: 'transparent',
              }}
            >
              Powerful Features
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Typography 
              variant="h5" 
              color="text.secondary" 
              sx={{ 
                mb: 4,
                maxWidth: '800px',
                mx: 'auto',
                fontWeight: 400
              }}
            >
              Discover the comprehensive set of tools and capabilities that make Rica the leading security intelligence platform.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* All Features Grid */}
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <FeatureCard>
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      <IconBox color={feature.color}>
                        {feature.icon}
                      </IconBox>
                      <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </FeatureCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Detailed Feature Sections */}
      {detailedFeatures.map((feature, index) => (
        <Box 
          key={index} 
          sx={{ 
            py: 10, 
            bgcolor: index % 2 === 0 ? alpha(theme.palette.primary.main, 0.03) : 'background.default'
          }}
        >
          <Container maxWidth="lg">
            <Grid 
              container 
              spacing={6} 
              alignItems="center" 
              direction={feature.reverse ? { xs: 'column-reverse', md: 'row' } : { xs: 'column-reverse', md: 'row-reverse' }}
            >
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, x: feature.reverse ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Box 
                    component="img"
                    src={feature.image}
                    alt={feature.title}
                    sx={{
                      width: '100%',
                      borderRadius: '12px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, x: feature.reverse ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Typography variant="h3" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    {feature.description}
                  </Typography>
                  <Grid container spacing={1}>
                    {feature.details.map((detail, i) => (
                      <Grid item xs={12} sm={6} key={i}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box 
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              borderRadius: '50%', 
                              bgcolor: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              mr: 1.5
                            }}
                          >
                            ✓
                          </Box>
                          <Typography variant="body1">{detail}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </motion.div>
              </Grid>
            </Grid>
          </Container>
        </Box>
      ))}

      {/* CTA Section */}
      <Box 
        sx={{ 
          py: 10, 
          bgcolor: 'background.paper',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <GradientBox 
          sx={{ 
            top: '50%', 
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)' 
          }} 
        />
        
        <Container maxWidth="md">
          <Box 
            sx={{ 
              textAlign: 'center',
              p: 5,
              borderRadius: 4,
              position: 'relative',
              zIndex: 1
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Typography 
                variant="h2" 
                component="h2" 
                sx={{ 
                  mb: 3,
                  fontWeight: 700
                }}
              >
                Ready to experience Rica?
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                  mb: 4,
                  maxWidth: '700px',
                  mx: 'auto'
                }}
              >
                Start your 14-day free trial today and discover how Rica can transform your security operations.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  component={RouterLink}
                  to="/signup"
                  variant="contained" 
                  color="primary" 
                  size="large"
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    fontSize: '1rem'
                  }}
                >
                  Start Free Trial
                </Button>
                <Button 
                  component={RouterLink}
                  to="/contact"
                  variant="outlined" 
                  color="primary" 
                  size="large"
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    fontSize: '1rem'
                  }}
                >
                  Contact Sales
                </Button>
              </Box>
            </motion.div>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default FeaturesPage;
