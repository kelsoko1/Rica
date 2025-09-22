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
  Avatar,
  Divider,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import SecurityIcon from '@mui/icons-material/Security';
import GroupsIcon from '@mui/icons-material/Groups';
import SpeedIcon from '@mui/icons-material/Speed';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const GradientBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '60%',
  height: '60%',
  borderRadius: '50%',
  filter: 'blur(100px)',
  zIndex: -1,
  opacity: 0.15,
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  marginBottom: theme.spacing(2),
  border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const ValueCard = styled(Card)(({ theme }) => ({
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



const values = [
  {
    title: 'Security First',
    description: 'We believe that security should never be an afterthought. Every feature we build is designed with security as the top priority.',
    icon: <SecurityIcon fontSize="large" />,
    color: '#6366f1'
  },
  {
    title: 'Customer Collaboration',
    description: 'We work closely with our customers to understand their security challenges and build solutions that address their specific needs.',
    icon: <GroupsIcon fontSize="large" />,
    color: '#10b981'
  },
  {
    title: 'Continuous Innovation',
    description: 'The threat landscape is constantly evolving, and so are we. We\'re committed to staying ahead of emerging threats with innovative solutions.',
    icon: <SpeedIcon fontSize="large" />,
    color: '#f43f5e'
  },
  {
    title: 'Ethical Practices',
    description: 'We believe in ethical security practices and transparent operations. We never compromise on privacy or data protection.',
    icon: <VerifiedUserIcon fontSize="large" />,
    color: '#8b5cf6'
  }
];

const milestones = [
  {
    year: '2019',
    title: 'Company Founded',
    description: 'Rica was founded with a mission to revolutionize security intelligence through advanced technology.'
  },
  {
    year: '2020',
    title: 'First Product Launch',
    description: 'Launched our core threat intelligence platform with browser fingerprinting capabilities.'
  },
  {
    year: '2021',
    title: 'Series A Funding',
    description: 'Secured $12M in Series A funding to accelerate product development and expand the team.'
  },
  {
    year: '2022',
    title: 'Enterprise Platform',
    description: 'Released our enterprise platform with advanced threat detection and team collaboration features.'
  },
  {
    year: '2023',
    title: 'Global Expansion',
    description: 'Expanded operations to Europe and Asia with new offices and data centers.'
  },
  {
    year: '2024',
    title: 'Series B Funding',
    description: 'Raised $30M in Series B funding to further develop AI capabilities and expand market reach.'
  },
  {
    year: '2025',
    title: 'Next-Gen Platform',
    description: 'Launched our next-generation platform with advanced AI-powered threat detection and response.'
  }
];

const AboutPage = () => {
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
              About Rica
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
              We're on a mission to revolutionize security intelligence with advanced technology and intuitive design.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Our Story Section */}
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
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
                  OUR STORY
                </Typography>
                <Typography variant="h3" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
                  Building the future of security intelligence
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Rica was founded in 2019 by a team of cybersecurity experts who recognized the need for more effective security tools in an increasingly complex threat landscape. We saw that existing solutions were often fragmented, difficult to use, and failed to provide the comprehensive insights that security teams needed.
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Our journey began with a simple idea: to build a security intelligence platform that combines advanced threat detection with intuitive design. We wanted to create a tool that security professionals would actually enjoy using—one that would help them work more effectively and respond to threats more quickly.
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Today, Rica is trusted by security teams at organizations of all sizes, from startups to Fortune 500 companies. Our platform continues to evolve as we work closely with our customers to address their most pressing security challenges.
                </Typography>
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
                  src="/src/assets/about-story.svg"
                  alt="Rica Team"
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

      {/* Our Values */}
      <Box sx={{ py: 10, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h6" component="p" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
              OUR VALUES
            </Typography>
            <Typography variant="h3" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
              What drives us
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Our core values guide everything we do, from product development to customer support.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ValueCard>
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      <IconBox color={value.color}>
                        {value.icon}
                      </IconBox>
                      <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                        {value.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {value.description}
                      </Typography>
                    </CardContent>
                  </ValueCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>



      {/* Our Journey */}
      <Box sx={{ py: 10, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h6" component="p" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
              OUR JOURNEY
            </Typography>
            <Typography variant="h3" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
              Key milestones
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              From our founding to today, we've been on an exciting journey of growth and innovation.
            </Typography>
          </Box>

          <Box sx={{ position: 'relative' }}>
            <Box sx={{ 
              position: 'absolute', 
              left: '50%', 
              top: 0, 
              bottom: 0, 
              width: 2, 
              bgcolor: 'divider',
              transform: 'translateX(-50%)',
              display: { xs: 'none', md: 'block' }
            }} />
            
            {milestones.map((milestone, index) => (
              <Box 
                key={index} 
                sx={{ 
                  position: 'relative', 
                  mb: 6,
                  '&:last-child': { mb: 0 }
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Grid 
                    container 
                    spacing={4} 
                    sx={{ 
                      flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
                      display: { xs: 'block', md: 'flex' }
                    }}
                  >
                    <Grid item xs={12} md={5} sx={{ position: 'relative' }}>
                      <Box sx={{ 
                        position: { xs: 'static', md: 'relative' },
                        textAlign: { 
                          xs: 'left', 
                          md: index % 2 === 0 ? 'right' : 'left' 
                        },
                        pr: { xs: 0, md: index % 2 === 0 ? 4 : 0 },
                        pl: { xs: 0, md: index % 2 === 0 ? 0 : 4 },
                      }}>
                        <Typography 
                          variant="h2" 
                          sx={{ 
                            color: 'primary.main',
                            fontWeight: 700,
                            mb: 1
                          }}
                        >
                          {milestone.year}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                          {milestone.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {milestone.description}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={2} sx={{ 
                      display: { xs: 'none', md: 'flex' },
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: '50%', 
                        bgcolor: 'primary.main',
                        border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        zIndex: 1
                      }} />
                    </Grid>
                    <Grid item xs={12} md={5} />
                  </Grid>
                </motion.div>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Why Choose Rica */}
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Box 
                  component="img"
                  src="/src/assets/why-rica.svg"
                  alt="Why Choose Rica"
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
                <Typography variant="h6" component="p" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                  WHY CHOOSE RICA
                </Typography>
                <Typography variant="h3" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
                  What sets us apart
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Rica isn't just another security tool—it's a comprehensive platform designed to address the most pressing security challenges facing organizations today.
                </Typography>
                
                <List>
                  {[
                    'Advanced AI-powered threat detection that identifies threats other tools miss',
                    'Intuitive design that makes complex security tasks simple',
                    'Comprehensive browser fingerprinting and anti-detect capabilities',
                    'Seamless integration with your existing security stack',
                    'Dedicated customer success team to ensure you get the most value',
                    'Continuous innovation based on customer feedback and emerging threats'
                  ].map((item, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleOutlineIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </motion.div>
            </Grid>
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
                Join us on our mission
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
                Experience the Rica difference with a 14-day free trial or schedule a demo to see our platform in action.
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
                  Schedule Demo
                </Button>
              </Box>
            </motion.div>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutPage;
