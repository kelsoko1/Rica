import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link, 
  IconButton, 
  Divider,
  styled
} from '@mui/material';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';

const StyledFooter = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderTop: `1px solid ${theme.palette.divider}`,
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontFamily: '"Space Grotesk", sans-serif',
  fontWeight: 700,
  fontSize: '1.75rem',
  background: 'linear-gradient(90deg, #6366f1 0%, #f43f5e 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent',
  marginBottom: theme.spacing(2),
}));

const FooterHeading = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
}));

const FooterLink = styled(Link)(({ theme }) => ({
  display: 'block',
  marginBottom: theme.spacing(1),
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  transition: 'color 0.2s ease',
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));

const SocialIcon = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.primary.main,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
}));

const Footer = () => {
  return (
    <StyledFooter component="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <LogoText variant="h6" component={RouterLink} to="/" sx={{ textDecoration: 'none' }}>
              RICA
            </LogoText>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Advanced Security Intelligence Platform for modern threat detection and response.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <SocialIcon aria-label="Twitter" size="small">
                <TwitterIcon fontSize="small" />
              </SocialIcon>
              <SocialIcon aria-label="LinkedIn" size="small">
                <LinkedInIcon fontSize="small" />
              </SocialIcon>
              <SocialIcon aria-label="GitHub" size="small">
                <GitHubIcon fontSize="small" />
              </SocialIcon>
              <SocialIcon aria-label="Email" size="small">
                <EmailIcon fontSize="small" />
              </SocialIcon>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FooterHeading variant="h6">Product</FooterHeading>
            <FooterLink component={RouterLink} to="/features">Features</FooterLink>
            <FooterLink component={RouterLink} to="/pricing">Pricing</FooterLink>
            <FooterLink component={RouterLink} to="/integrations">Integrations</FooterLink>
            <FooterLink component={RouterLink} to="/changelog">Changelog</FooterLink>
            <FooterLink component={RouterLink} to="/roadmap">Roadmap</FooterLink>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FooterHeading variant="h6">Resources</FooterHeading>
            <FooterLink component={RouterLink} to="/documentation">Documentation</FooterLink>
            <FooterLink component={RouterLink} to="/api">API Reference</FooterLink>
            <FooterLink component={RouterLink} to="/guides">Guides</FooterLink>
            <FooterLink component={RouterLink} to="/blog">Blog</FooterLink>
            <FooterLink component={RouterLink} to="/community">Community</FooterLink>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FooterHeading variant="h6">Company</FooterHeading>
            <FooterLink component={RouterLink} to="/about">About</FooterLink>
            <FooterLink component={RouterLink} to="/careers">Careers</FooterLink>
            <FooterLink component={RouterLink} to="/contact">Contact</FooterLink>
            <FooterLink component={RouterLink} to="/privacy">Privacy Policy</FooterLink>
            <FooterLink component={RouterLink} to="/terms">Terms of Service</FooterLink>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Rica. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, mt: { xs: 2, sm: 0 } }}>
            <Link component={RouterLink} to="/privacy" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              <Typography variant="body2">Privacy</Typography>
            </Link>
            <Link component={RouterLink} to="/terms" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              <Typography variant="body2">Terms</Typography>
            </Link>
            <Link component={RouterLink} to="/cookies" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              <Typography variant="body2">Cookies</Typography>
            </Link>
          </Box>
        </Box>
      </Container>
    </StyledFooter>
  );
};

export default Footer;
