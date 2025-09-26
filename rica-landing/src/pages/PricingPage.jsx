import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import CreditCardIcon from '@mui/icons-material/CreditCard';
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
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  useTheme,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import SecurityIcon from '@mui/icons-material/Security';

const GradientBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '60%',
  height: '60%',
  borderRadius: '50%',
  filter: 'blur(100px)',
  zIndex: -1,
  opacity: 0.15,
}));

const PricingCard = styled(Card)(({ theme, popular }) => ({
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

const FeatureItem = styled(Box)(({ theme, included }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  color: included ? theme.palette.text.primary : theme.palette.text.disabled,
}));

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
      'Ideal for custom users',
      'Usage analytics dashboard'
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outlined',
    popular: false
  }
];

const faqs = [
  {
    question: 'What is included in the free trial?',
    answer: 'Our 14-day free trial includes full access to all features of the selected plan with no restrictions. You can create browser profiles, use threat detection capabilities, access analytics, and explore all available features. No credit card is required to start your trial.'
  },
  {
    question: 'Can I change plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged the prorated difference for the remainder of your billing period. When downgrading, the new lower rate will apply at the start of your next billing cycle.'
  },
  {
    question: 'Do you offer discounts for non-profits or educational institutions?',
    answer: 'Yes, we offer special pricing for non-profit organizations, educational institutions, and open-source projects. Please contact our sales team to learn more about our discount programs and eligibility requirements.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and bank transfers for annual plans. For Enterprise customers, we also offer invoicing with net-30 payment terms.'
  },
  {
    question: 'Is there a limit to how many users I can add to my account?',
    answer: 'The Starter plan allows up to 3 users, the Professional plan allows up to 10 users, and the Enterprise plan has unlimited users. Additional users can be added to any plan for an additional per-user fee.'
  },
  {
    question: 'Can I cancel my subscription at any time?',
    answer: 'Yes, you can cancel your subscription at any time from your account settings. If you cancel, you\'ll still have access to your plan until the end of your current billing period. We don\'t offer refunds for partial months.'
  },
  {
    question: 'Do you offer custom features or integrations?',
    answer: 'Custom features and integrations are available for Enterprise customers. Our development team can work with you to build custom solutions that meet your specific security needs and integrate with your existing tools and workflows.'
  },
  {
    question: 'How secure is my data with Rica?',
    answer: 'Rica employs industry-leading security measures including end-to-end encryption, secure data storage, regular security audits, and compliance with major security standards. Your data is stored in SOC 2 compliant data centers and is never shared with third parties.'
  }
];

const PricingPage = () => {
  const theme = useTheme();
  const [annual, setAnnual] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [cardData, setCardData] = useState({
    cvc: '',
    expiry: '',
    focus: '',
    name: '',
    number: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBillingChange = () => {
    setAnnual(!annual);
  };

  const handlePaymentSubmit = (e, plan) => {
    e.preventDefault();
    // Here you would typically process the payment with a payment gateway
    console.log('Processing payment for plan:', plan.title, 'with card:', cardData);
    alert(`Payment submitted for ${plan.title} plan!`);
    setShowPaymentForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputFocus = (e) => {
    setCardData(prev => ({
      ...prev,
      focus: e.target.name
    }));
  };

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
              Simple, Transparent Pricing
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
              Choose the plan that fits your security needs. All plans include a 14-day free trial.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={annual}
                    onChange={handleBillingChange}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ mr: 1 }}>Monthly</Typography>
                    <Typography sx={{ fontWeight: annual ? 700 : 400 }}>Annual</Typography>
                    {annual && (
                      <Chip 
                        label="Save 20%" 
                        size="small" 
                        color="secondary" 
                        sx={{ ml: 1, height: 20, fontSize: '0.625rem' }} 
                      />
                    )}
                  </Box>
                }
                labelPlacement="end"
              />
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Pricing Cards */}
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="stretch">
            {plans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <PricingCard popular={plan.popular}>
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        right: 16,
                        top: 16,
                        fontWeight: 600,
                        boxShadow: theme.shadows[2]
                      }}
                    />
                  )}
                  <CardHeader
                    title={
                      <Typography variant="h5" component="h3" align="center" sx={{ fontWeight: 700, mb: 1 }}>
                        {plan.title}
                      </Typography>
                    }
                    subheader={
                      <Typography variant="body1" color="text.secondary" align="center">
                        {plan.description}
                      </Typography>
                    }
                    sx={{ pb: 1 }}
                  />
                  <CardContent>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', mb: 1 }}>
                        <Typography variant="h3" component="div" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {plan.price}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ ml: 1, fontWeight: 400 }}>
                          {plan.period}
                        </Typography>
                      </Box>
                      {plan.popular && (
                        <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
                          Most Popular Choice
                        </Typography>
                      )}
                    </Box>
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ mb: 3 }}>
                      {plan.features.map((feature, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <CheckCircleOutlineIcon 
                            sx={{ 
                              mr: 1.5, 
                              color: 'success.main',
                              fontSize: '1.1rem'
                            }} 
                          />
                          <Typography variant="body2">
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ flexDirection: 'column', gap: 2 }}>
                    {showPaymentForm && selectedPlan === plan.title ? (
                      <Box component="form" onSubmit={(e) => handlePaymentSubmit(e, plan)} sx={{ width: '100%' }}>
                        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Card Details</Typography>
                          
                          <TextField
                            fullWidth
                            label="Card Number"
                            name="number"
                            value={cardData.number}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            placeholder="1234 5678 9012 3456"
                            margin="normal"
                            required
                            inputProps={{ maxLength: 19 }}
                            sx={{ mb: 2 }}
                          />
                          
                          <TextField
                            fullWidth
                            label="Name on Card"
                            name="name"
                            value={cardData.name}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            placeholder="JOHN DOE"
                            margin="normal"
                            required
                            sx={{ mb: 2 }}
                          />
                          
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                              fullWidth
                              label="Expiry Date"
                              name="expiry"
                              value={cardData.expiry}
                              onChange={handleInputChange}
                              onFocus={handleInputFocus}
                              placeholder="MM/YY"
                              inputProps={{ maxLength: 5 }}
                              required
                            />
                            <TextField
                              fullWidth
                              label="CVC"
                              name="cvc"
                              value={cardData.cvc}
                              onChange={handleInputChange}
                              onFocus={handleInputFocus}
                              placeholder="123"
                              inputProps={{ maxLength: 4 }}
                              required
                            />
                          </Box>
                          
                          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            {['visa', 'mastercard', 'amex', 'discover'].map((type) => (
                              <Box key={type} component="img" 
                                src={`/src/assets/cards/${type}.svg`} 
                                alt={type}
                                sx={{ height: 24, opacity: 0.7, '&:hover': { opacity: 1 } }}
                              />
                            ))}
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            fullWidth
                            variant="outlined"
                            color="primary"
                            onClick={() => setShowPaymentForm(false)}
                            sx={{ py: 1.5, fontWeight: 600, borderRadius: 2 }}
                          >
                            Cancel
                          </Button>
                          <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{ py: 1.5, fontWeight: 600, borderRadius: 2 }}
                          >
                            Pay ${plan.title === 'Personal' ? '9.99' : plan.title === 'Team' ? '29.99' : '5.00'}
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Button
                        fullWidth
                        variant={plan.buttonVariant}
                        color="primary"
                        size="large"
                        startIcon={<CreditCardIcon />}
                        onClick={() => {
                          setSelectedPlan(plan.title);
                          setShowPaymentForm(true);
                        }}
                        sx={{
                          py: 1.5,
                          fontWeight: 600,
                          borderRadius: 2,
                          ...(plan.popular && {
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            '&:hover': {
                              bgcolor: 'primary.dark',
                            },
                          }),
                        }}
                      >
                        {plan.buttonText}
                      </Button>
                    )}
                  </CardActions>
                </PricingCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Protection For You & Your Family */}
      <Box sx={{ py: 10, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
              Protection For Every Member of Your Family
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mb: 4, fontWeight: 400 }}>
              Whether you're securing your digital life or protecting your loved ones, Rica adapts to your family's needs.
            </Typography>
          </Box>

          <Grid container spacing={4} alignItems="stretch">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card sx={{ height: '100%', p: 4, borderRadius: 4, boxShadow: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ 
                      width: 60, 
                      height: 60, 
                      borderRadius: '50%', 
                      bgcolor: alpha(theme.palette.primary.main, 0.1), 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 3
                    }}>
                      <SecurityIcon color="primary" sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 700 }}>
                      For You
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Take control of your digital security with our Personal plan. Perfect for individuals who want comprehensive protection without the complexity.
                  </Typography>
                  <Box sx={{ mb: 4 }}>
                    {[
                      'Secure all your personal devices',
                      'Protect your online identity',
                      'Monitor your personal email accounts',
                      'Get alerts about potential threats',
                      '24/7 AI-powered protection',
                      'Easy-to-use dashboard'
                    ].map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <CheckCircleOutlineIcon sx={{ color: 'success.main', mr: 1.5, fontSize: '1.1rem' }} />
                        <Typography variant="body2">{item}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    component={RouterLink}
                    to="/signup"
                    sx={{ mt: 'auto', py: 1.5, fontWeight: 600, borderRadius: 2 }}
                  >
                    Protect Yourself Today
                  </Button>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Card sx={{ 
                  height: '100%', 
                  p: 4, 
                  borderRadius: 4, 
                  boxShadow: 3,
                  border: `2px solid ${theme.palette.primary.main}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0, 
                    bgcolor: 'primary.main', 
                    color: 'primary.contrastText',
                    px: 2,
                    py: 0.5,
                    borderBottomLeftRadius: 8,
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    MOST POPULAR
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ 
                      width: 60, 
                      height: 60, 
                      borderRadius: '50%', 
                      bgcolor: alpha(theme.palette.primary.main, 0.1), 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 3
                    }}>
                      <FamilyRestroomIcon color="primary" sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 700 }}>
                      For Your Family
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Keep your entire family safe online with our Family plan. Monitor and protect your children's digital lives while giving them the freedom to explore safely.
                  </Typography>
                  <Box sx={{ mb: 4 }}>
                    {[
                      'Protect up to 5 family members',
                      'Monitor children\'s online activities',
                      'Set screen time limits',
                      'Block inappropriate content',
                      'Get alerts about cyberbullying',
                      'Family dashboard for parents'
                    ].map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <CheckCircleOutlineIcon sx={{ color: 'success.main', mr: 1.5, fontSize: '1.1rem' }} />
                        <Typography variant="body2">{item}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    component={RouterLink}
                    to="/signup"
                    sx={{ 
                      mt: 'auto', 
                      py: 1.5, 
                      fontWeight: 600, 
                      borderRadius: 2,
                      bgcolor: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    }}
                  >
                    Protect Your Family
                  </Button>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              All Your Devices, All Your Accounts - Protected
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
              Connect all your family's devices and online accounts to Rica's protection network. Our AI works 24/7 to monitor, detect, and prevent threats before they become problems.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              component={RouterLink}
              to="/how-it-works"
              sx={{ 
                px: 4, 
                py: 1.5, 
                fontWeight: 600, 
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                },
              }}
            >
              See How It Works
            </Button>
          </Box>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" sx={{ mb: 2, fontWeight: 700 }}>
              Frequently Asked Questions
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Find answers to common questions about Rica's pricing and plans.
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {faqs.map((faq, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Accordion 
                    sx={{ 
                      backgroundColor: 'background.paper',
                      '&:before': { display: 'none' },
                      boxShadow: 'none',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: '8px !important',
                      mb: 2,
                      overflow: 'hidden'
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ 
                        borderRadius: 2,
                        '&.Mui-expanded': {
                          borderBottom: `1px solid ${theme.palette.divider}`
                        }
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {faq.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body1" color="text.secondary">
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
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
                Still have questions?
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
                Our team is ready to help you find the perfect plan for your needs.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  component={RouterLink}
                  to="/checkout"
                  state={{ planId: 'starter', billingCycle: annual ? 'annual' : 'monthly' }}
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ width: '100%', py: 1.5 }}
                >
                  Get Started
                </Button>
                <Button 
                  component={RouterLink}
                  to="/checkout"
                  state={{ planId: 'enterprise', billingCycle: annual ? 'annual' : 'monthly' }}
                  variant="outlined"
                  color="primary"
                  size="large"
                  sx={{ width: '100%', py: 1.5 }}
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

export default PricingPage;
