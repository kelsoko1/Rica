import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { Link as RouterLink } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  IconButton, 
  Typography, 
  Menu, 
  Container, 
  Button, 
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useScrollTrigger,
  Slide,
  styled
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';

const pages = [
  { name: 'Features', path: '/features' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'About', path: '/about' }
];

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
  boxShadow: 'none',
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
  marginRight: theme.spacing(2),
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  margin: theme.spacing(0, 1),
  '&:hover': {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
}));

function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Header = () => {
  const { currentUser, logout } = useFirebaseAuth();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 250, height: '100%', backgroundColor: 'background.default', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <LogoText variant="h6" component="div" sx={{ textDecoration: 'none', cursor: 'default' }}>
          RICA
        </LogoText>
        <IconButton onClick={handleDrawerToggle} sx={{ color: 'text.primary' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {pages.map((page) => (
          <ListItem 
            button 
            key={page.name} 
            component={RouterLink} 
            to={page.path}
            onClick={handleDrawerToggle}
            sx={{ mb: 1 }}
          >
            <ListItemText primary={page.name} />
          </ListItem>
        ))}
        {currentUser ? (
          <>
            <ListItem 
              button 
              component="a"
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDrawerToggle}
              sx={{ 
                mb: 1,
                backgroundColor: 'primary.main',
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }}
            >
              <ListItemText primary="Go to Dashboard" sx={{ color: 'white' }} />
            </ListItem>
            <ListItem 
              button 
              component={RouterLink}
              to="/profile"
              onClick={handleDrawerToggle}
              sx={{ mb: 1 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    mr: 2
                  }}
                >
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {currentUser.name || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {currentUser.role || 'User'}
                  </Typography>
                </Box>
              </Box>
            </ListItem>
            <ListItem 
              button 
              component={RouterLink}
              to="/credits"
              onClick={handleDrawerToggle}
              sx={{ mb: 1 }}
            >
              <ListItemText primary="Credits" />
            </ListItem>
            <ListItem 
              button 
              onClick={() => {
                logout();
                handleDrawerToggle();
              }}
              sx={{ mb: 1 }}
            >
              <ListItemText primary="Log Out" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem 
              button 
              component={RouterLink} 
              to="/login"
              onClick={handleDrawerToggle}
              sx={{ mb: 1 }}
            >
              <ListItemText primary="Log In" />
            </ListItem>
            <ListItem 
              button 
              component={RouterLink} 
              to="/signup"
              onClick={handleDrawerToggle}
              sx={{ 
                backgroundColor: 'primary.main',
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }}
            >
              <ListItemText primary="Sign Up" sx={{ color: 'white' }} />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <HideOnScroll>
      <StyledAppBar 
        position="fixed" 
        sx={{ 
          boxShadow: scrolled ? 3 : 0,
          backgroundColor: scrolled ? 'rgba(15, 23, 42, 0.9)' : 'transparent',
          transition: 'all 0.3s ease'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo for desktop */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <LogoText
                variant="h6"
                noWrap
                component="div"
                sx={{
                  mr: 2,
                  display: { xs: 'none', md: 'flex' },
                  textDecoration: 'none',
                  cursor: 'default'
                }}
              >
                RICA
              </LogoText>
            </motion.div>

            {/* Mobile menu icon */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleDrawerToggle}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>

            {/* Logo for mobile */}
            <LogoText
              variant="h6"
              noWrap
              component="div"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                textDecoration: 'none',
                cursor: 'default'
              }}
            >
              RICA
            </LogoText>

            {/* Desktop navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              {pages.map((page, index) => (
                <motion.div
                  key={page.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                >
                  <NavButton
                    component={RouterLink}
                    to={page.path}
                    onClick={handleCloseNavMenu}
                  >
                    {page.name}
                  </NavButton>
                </motion.div>
              ))}
            </Box>

            {/* Auth buttons for desktop */}
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              {currentUser ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Button 
                      component="a"
                      href="http://localhost:3000"
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="contained" 
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      Go to Dashboard
                    </Button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Button 
                      onClick={logout}
                      variant="text" 
                      color="inherit"
                    >
                      Log Out
                    </Button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                  >
                    <Button 
                      component={RouterLink} 
                      to="/credits"
                      variant="text" 
                      color="inherit"
                      sx={{ mr: 1 }}
                    >
                      Credits
                    </Button>
                  </motion.div>
                  <Box 
                    component={RouterLink} 
                    to="/profile"
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      ml: 2,
                      textDecoration: 'none',
                      color: 'inherit',
                      '&:hover': {
                        '& .MuiBox-root': {
                          borderColor: 'primary.main'
                        }
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        mr: 1,
                        border: '2px solid transparent',
                        transition: 'border-color 0.2s ease'
                      }}
                    >
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {currentUser.name || 'User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {currentUser.role || 'User'}
                      </Typography>
                    </Box>
                  </Box>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Button 
                      component={RouterLink} 
                      to="/login"
                      variant="text" 
                      color="inherit"
                      sx={{ mr: 1 }}
                    >
                      Log In
                    </Button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Button 
                      component={RouterLink} 
                      to="/signup"
                      variant="contained" 
                      color="primary"
                    >
                      Sign Up
                    </Button>
                  </motion.div>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>

        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
          }}
        >
          {drawer}
        </Drawer>
      </StyledAppBar>
    </HideOnScroll>
  );
};

export default Header;
