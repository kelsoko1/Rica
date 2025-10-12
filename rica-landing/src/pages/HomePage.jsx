import React, { useEffect } from 'react';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Stack,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LanguageIcon from '@mui/icons-material/Language';
// These components are implemented directly in this file
// import HeroSection from '../components/HeroSection';
// import FeatureCard from '../components/FeatureCard';
// import TestimonialCard from '../components/TestimonialCard';
// import PricingCard from '../components/PricingCard';
// import CTASection from '../components/CTASection';

const GradientBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '60%',
  height: '60%',
  borderRadius: '50%',
  filter: 'blur(100px)',
  zIndex: -1,
  opacity: 0.15,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.4)',
    '& .MuiCardMedia-root': {
      transform: 'scale(1.05)',
    },
  },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 240,
  transition: 'transform 0.3s ease-in-out',
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  fontWeight: 500,
  marginBottom: theme.spacing(2),
}));

const features = [
  {
    title: 'AI-Powered Protection',
    description: 'Our advanced AI acts as your 24/7 online bodyguard, detecting and preventing cyberbullying and harassment before it affects you.',
    icon: <SecurityIcon fontSize="large" />,
    color: '#6366f1'
  },
  {
    title: 'Leak Detection & Takedown',
    description: 'Automatically scan the web for your personal information and get instant alerts with one-click takedown options.',
    icon: <SpeedIcon fontSize="large" />,
    color: '#10b981'
  },
  {
    title: 'Digital Identity Protection',
    description: 'Secure and manage your online presence across all platforms with our intelligent identity protection system.',
    icon: <IntegrationInstructionsIcon fontSize="large" />,
    color: '#f43f5e'
  },
  {
    title: 'Multi-Account Security',
    description: 'Safely manage all your online accounts with our secure vault and automated security checks.',
    icon: <AutoGraphIcon fontSize="large" />,
    color: '#8b5cf6'
  },
  {
    title: 'Vulnerability Scanner',
    description: 'Continuously monitor your devices and accounts for security weaknesses and get personalized recommendations.',
    icon: <VerifiedUserIcon fontSize="large" />,
    color: '#f59e0b'
  },
  {
    title: 'Privacy-First AI',
    description: 'Our AI works for you, not against you - protecting your privacy while keeping you safe online.',
    icon: <LanguageIcon fontSize="large" />,
    color: '#3b82f6'
  }
];

const testimonials = [
  {
    name: 'Emma Wilson',
    role: 'High School Teacher & Parent',
    content: 'Rica has been a game-changer for my students and my own family. The cyberbullying detection helped us identify and address issues before they escalated, and the peace of mind is priceless.',
    avatar: 'https://i.pravatar.cc/150?img=32',
    rating: 5
  },
  {
    name: 'David Kim',
    role: 'Small Business Owner',
    content: 'When our company data was leaked online, Rica\'s AI detected it within minutes. The one-click takedown feature saved us from what could have been a PR disaster.',
    avatar: 'https://i.pravatar.cc/150?img=8',
    rating: 5
  },
  {
    name: 'Priya Patel',
    role: 'Social Media Influencer',
    content: 'As someone in the public eye, I was constantly worried about my online safety. Rica\'s AI bodyguard monitors my accounts 24/7 and has stopped multiple harassment attempts before they reached me.',
    avatar: 'https://i.pravatar.cc/150?img=60',
    rating: 5
  }
];

const plans = [
  {
    title: 'Personal',
    price: '$9.99',
    period: 'per month',
    description: 'Essential online protection for individuals',
    features: [
      'AI-powered cyberbullying detection',
      'Leak monitoring for 1 email',
      'Basic identity protection',
      '24/7 AI threat monitoring',
      'Email support',
      'Devices protection'
    ],
    buttonText: 'Start Free Trial',
    buttonVariant: 'contained',
    popular: true
  },
  {
    title: 'Team',
    price: '$29.99',
    period: 'per user/month',
    description: 'Collaborative protection for teams',
    features: [
      'All Personal features',
      'Per-user billing (billed to team leader)',
      'Team safety monitoring',
      'Shared threat intelligence',
      'Priority email & chat support',
      'Devices protection per user',
      'Team dashboard',
      'Basic API access',
      'Centralized billing'
    ],
    buttonText: 'Start Team Trial',
    buttonVariant: 'outlined',
    popular: false
  },
  {
    title: 'Pay As You Go',
    price: '$5',
    period: 'month + tokens',
    description: 'Flexible usage with token-based protection',
    features: [
      '$5 monthly base fee',
      'Includes 100 tokens',
      'Additional tokens at $0.05 each',
      'Tokens never expire',
      'Top up anytime',
      'No long-term commitment',
      'Ideal for custom needs',
      'Usage analytics dashboard'
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outlined',
    popular: false
  }
];

const HomePage = () => {
  const theme = useTheme();
  const { currentUser } = useFirebaseAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Removed automatic redirection to allow users to stay on the landing page

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
            <StyledChip label="AI-Powered Online Protection" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
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
Your AI-Powered Online Bodyguard
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
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
              Rica is your 24/7 AI bodyguard, protecting you from cyberbullying, monitoring for personal data leaks, 
              and keeping your digital identity safe. Choose from flexible plans - from individual protection to team solutions 
              and pay-as-you-go options. Get peace of mind with proactive protection that works while you sleep.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center"
              sx={{ mb: 8 }}
            >
              {currentUser ? (
                <Button 
                  href="http://localhost:3000"
                  variant="contained" 
                  color="primary" 
                  size="large"
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    fontSize: '1rem'
                  }}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
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
                    to="/features"
                    variant="outlined" 
                    color="primary" 
                    size="large"
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                      fontSize: '1rem'
                    }}
                  >
                    Learn More
                  </Button>
                </>
              )}
            </Stack>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Box 
              component="img"
              src="/src/assets/dashboard-preview.svg"
              alt="Rica Dashboard Preview"
              sx={{
                width: '100%',
                maxWidth: '1000px',
                borderRadius: '12px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
          </motion.div>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                mb: 2,
                fontWeight: 700
              }}
            >
              Powerful Features
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                maxWidth: '700px',
                mx: 'auto'
              }}
            >
              Rica combines AI-powered protection with simple controls to keep you safe from online threats, harassment, and identity theft. Whether you're an individual, team, or have custom security needs, we've got you covered with flexible pricing options.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      p: 3,
                      '&:hover': {
                        boxShadow: `0 0 0 2px ${feature.color}`,
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: 60,
                        height: 60,
                        borderRadius: '12px',
                        backgroundColor: alpha(feature.color, 0.1),
                        color: feature.color,
                        mb: 2
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Product Showcase */}
      <Box sx={{ py: 10, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Typography variant="h6" component="p" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                  THREAT INTELLIGENCE
                </Typography>
                <Typography variant="h3" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
                  Real-time threat detection and analysis
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Rica's advanced threat intelligence platform continuously monitors your environment for suspicious activities and provides actionable insights to help you respond quickly and effectively.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {['AI-powered threat detection', 'Behavioral analysis', 'Automated response workflows', 'Comprehensive reporting'].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                          fontWeight: 'bold'
                        }}
                      >
                        ✓
                      </Box>
                      <Typography variant="body1">{item}</Typography>
                    </Box>
                  ))}
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Box 
                  component="img"
                  src="/src/assets/threat-intelligence.svg"
                  alt="Threat Intelligence Dashboard"
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
          </Grid>
        </Container>
      </Box>

      {/* Second Product Feature */}
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center" direction={{ xs: 'column-reverse', md: 'row' }}>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Box 
                  component="img"
                  src="/src/assets/browser-profiles.svg"
                  alt="Browser Profiles"
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
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Typography variant="h6" component="p" color="secondary" sx={{ mb: 2, fontWeight: 600 }}>
                  BROWSER SECURITY
                </Typography>
                <Typography variant="h3" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
                  Multi-profile browser management
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Create and manage multiple browser profiles with unique fingerprints for secure and isolated browsing sessions. Perfect for security research, testing, and maintaining separate digital identities.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {['Unique fingerprint per profile', 'Platform and browser emulation', 'Custom proxy settings', 'Isolated browsing sessions', 'Team sharing capabilities'].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%', 
                          bgcolor: 'secondary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}
                      >
                        ✓
                      </Box>
                      <Typography variant="body1">{item}</Typography>
                    </Box>
                  ))}
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 10, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                mb: 2,
                fontWeight: 700
              }}
            >
              Trusted by Security Professionals
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                maxWidth: '700px',
                mx: 'auto'
              }}
            >
              See what our customers have to say about Rica's security platform.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      {[...Array(5)].map((_, i) => (
                        <Box 
                          key={i} 
                          component="span" 
                          sx={{ 
                            color: i < testimonial.rating ? 'warning.main' : 'text.disabled',
                            mr: 0.5
                          }}
                        >
                          ★
                        </Box>
                      ))}
                    </Box>
                    <Typography variant="body1" sx={{ mb: 3, flex: 1 }}>
                      "{testimonial.content}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        component="img"
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          mr: 2
                        }}
                      />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                mb: 2,
                fontWeight: 700
              }}
            >
              Simple, Transparent Pricing
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                maxWidth: '700px',
                mx: 'auto'
              }}
            >
              Choose the plan that fits your security needs. All plans include a 14-day free trial.
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {plans.map((plan, index) => (
              <Grid 
                item 
                xs={12} 
                md={4} 
                key={index}
                sx={{
                  display: 'flex'
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  style={{ width: '100%' }}
                >
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      p: 3,
                      position: 'relative',
                      border: plan.popular ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                      borderColor: plan.popular ? 'primary.main' : 'divider',
                    }}
                  >
                    {plan.popular && (
                      <Chip 
                        label="Most Popular" 
                        color="primary"
                        size="small"
                        sx={{ 
                          position: 'absolute',
                          top: -12,
                          right: 24,
                          fontWeight: 600
                        }}
                      />
                    )}
                    <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                      {plan.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {plan.description}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h3" component="p" sx={{ fontWeight: 700 }}>
                        {plan.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {plan.period}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3, flex: 1 }}>
                      {plan.features.map((feature, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box 
                            component="span" 
                            sx={{ 
                              color: 'primary.main',
                              mr: 1,
                              fontWeight: 'bold'
                            }}
                          >
                            ✓
                          </Box>
                          <Typography variant="body2">
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <Button 
                      component={RouterLink}
                      to="/signup"
                      variant={plan.buttonVariant} 
                      color="primary" 
                      fullWidth
                      sx={{ 
                        mt: 'auto',
                        py: 1.5
                      }}
                    >
                      {plan.buttonText}
                    </Button>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

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
                Ready to secure your digital assets?
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
                Start your 14-day free trial today. No credit card required.
              </Typography>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                justifyContent="center"
              >
                {currentUser ? (
                  <Button 
                    href="http://localhost:3000"
                    variant="contained" 
                    color="primary" 
                    size="large"
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                      fontSize: '1rem'
                    }}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
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
                  </>
                )}
              </Stack>
            </motion.div>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
