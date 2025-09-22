import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  AccordionDetails
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 30px rgba(0, 0, 0, 0.1)',
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
    title: 'Starter',
    price: {
      monthly: 49,
      annual: 39
    },
    description: 'Perfect for individuals and small teams',
    features: [
      { name: 'Basic threat detection', included: true },
      { name: 'Up to 5 browser profiles', included: true },
      { name: 'Standard analytics', included: true },
      { name: '8 hours email support', included: true },
      { name: 'Community access', included: true },
      { name: 'API access (100 calls/day)', included: true },
      { name: 'Team collaboration', included: false },
      { name: 'Advanced threat detection', included: false },
      { name: 'Custom integrations', included: false },
      { name: 'Priority support', included: false }
    ],
    buttonText: 'Start Free Trial',
    buttonVariant: 'outlined',
    popular: false
  },
  {
    title: 'Professional',
    price: {
      monthly: 99,
      annual: 79
    },
    description: 'Ideal for growing businesses',
    features: [
      { name: 'Advanced threat detection', included: true },
      { name: 'Up to 20 browser profiles', included: true },
      { name: 'Real-time analytics', included: true },
      { name: 'API access (1000 calls/day)', included: true },
      { name: '24/7 priority support', included: true },
      { name: 'Team collaboration', included: true },
      { name: 'Custom dashboards', included: true },
      { name: 'Vulnerability scanning', included: true },
      { name: 'Custom integrations', included: false },
      { name: 'Dedicated account manager', included: false }
    ],
    buttonText: 'Start Free Trial',
    buttonVariant: 'contained',
    popular: true
  },
  {
    title: 'Enterprise',
    price: {
      monthly: 'Custom',
      annual: 'Custom'
    },
    description: 'For large organizations with complex needs',
    features: [
      { name: 'Custom threat detection rules', included: true },
      { name: 'Unlimited browser profiles', included: true },
      { name: 'Advanced analytics & reporting', included: true },
      { name: 'Unlimited API access', included: true },
      { name: 'Dedicated account manager', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'On-premise deployment option', included: true },
      { name: 'SLA guarantees', included: true },
      { name: 'White-labeling options', included: true },
      { name: 'Custom feature development', included: true }
    ],
    buttonText: 'Contact Sales',
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBillingChange = () => {
    setAnnual(!annual);
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
              <Grid item xs={12} md={4} key={index} sx={{ display: 'flex' }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  style={{ width: '100%', display: 'flex' }}
                >
                  <PricingCard popular={plan.popular} sx={{ width: '100%' }}>
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
                    <CardHeader
                      title={plan.title}
                      subheader={plan.description}
                      titleTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                      subheaderTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      sx={{ pb: 0 }}
                    />
                    <CardContent sx={{ pt: 2, pb: 1, flexGrow: 1 }}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h3" component="p" sx={{ fontWeight: 700, display: 'inline' }}>
                          {typeof plan.price[annual ? 'annual' : 'monthly'] === 'number' ? 
                            `$${plan.price[annual ? 'annual' : 'monthly']}` : 
                            plan.price[annual ? 'annual' : 'monthly']}
                        </Typography>
                        {typeof plan.price[annual ? 'annual' : 'monthly'] === 'number' && (
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'inline', ml: 1 }}>
                            /{annual ? 'mo (billed annually)' : 'month'}
                          </Typography>
                        )}
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ mt: 2 }}>
                        {plan.features.map((feature, i) => (
                          <FeatureItem key={i} included={feature.included}>
                            {feature.included ? (
                              <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                            ) : (
                              <CheckCircleOutlineIcon fontSize="small" color="disabled" sx={{ mr: 1 }} />
                            )}
                            <Typography variant="body2" sx={{ opacity: feature.included ? 1 : 0.6 }}>
                              {feature.name}
                            </Typography>
                          </FeatureItem>
                        ))}
                      </Box>
                    </CardContent>
                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <Button 
                        component={RouterLink}
                        to={plan.title === 'Enterprise' ? '/contact' : '/signup'}
                        variant={plan.buttonVariant} 
                        color="primary" 
                        fullWidth
                        sx={{ py: 1.5 }}
                      >
                        {plan.buttonText}
                      </Button>
                    </CardActions>
                  </PricingCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Feature Comparison */}
      <Box sx={{ py: 10, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" sx={{ mb: 2, fontWeight: 700 }}>
              Compare Plan Features
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Find the plan that best suits your security needs with our detailed feature comparison.
            </Typography>
          </Box>

          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: 800, width: '100%' }}>
              <Grid container>
                {/* Header Row */}
                <Grid item xs={4}>
                  <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Features</Typography>
                  </Box>
                </Grid>
                {plans.map((plan, index) => (
                  <Grid item xs={8/3} key={index}>
                    <Box sx={{ 
                      p: 2, 
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      bgcolor: plan.popular ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                      borderTop: plan.popular ? `2px solid ${theme.palette.primary.main}` : 'none'
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{plan.title}</Typography>
                    </Box>
                  </Grid>
                ))}

                {/* Feature Rows */}
                {[
                  { name: 'Browser Profiles', values: ['5 profiles', '20 profiles', 'Unlimited'] },
                  { name: 'Threat Detection', values: ['Basic', 'Advanced', 'Custom'] },
                  { name: 'Analytics', values: ['Standard', 'Real-time', 'Advanced'] },
                  { name: 'API Access', values: ['100 calls/day', '1000 calls/day', 'Unlimited'] },
                  { name: 'Support', values: ['8 hours email', '24/7 priority', 'Dedicated manager'] },
                  { name: 'Team Members', values: ['3 users', '10 users', 'Unlimited'] },
                  { name: 'Custom Dashboards', values: ['✕', '✓', '✓'] },
                  { name: 'Vulnerability Scanning', values: ['✕', '✓', '✓'] },
                  { name: 'Custom Integrations', values: ['✕', '✕', '✓'] },
                  { name: 'On-premise Deployment', values: ['✕', '✕', '✓'] },
                  { name: 'SLA Guarantees', values: ['✕', '✕', '✓'] },
                ].map((feature, fIndex) => (
                  <React.Fragment key={fIndex}>
                    <Grid item xs={4}>
                      <Box sx={{ 
                        p: 2, 
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        bgcolor: fIndex % 2 === 1 ? alpha(theme.palette.background.paper, 0.3) : 'transparent'
                      }}>
                        <Typography variant="body1">{feature.name}</Typography>
                      </Box>
                    </Grid>
                    {feature.values.map((value, vIndex) => (
                      <Grid item xs={8/3} key={vIndex}>
                        <Box sx={{ 
                          p: 2, 
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          bgcolor: fIndex % 2 === 1 ? alpha(theme.palette.background.paper, 0.3) : 'transparent',
                          color: value === '✓' ? 'success.main' : value === '✕' ? 'text.disabled' : 'text.primary',
                          fontWeight: plans[vIndex].popular ? 600 : 400
                        }}>
                          <Typography variant="body1">{value}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </React.Fragment>
                ))}
              </Grid>
            </Box>
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
