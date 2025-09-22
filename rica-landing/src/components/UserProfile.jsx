import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Button, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaymentIcon from '@mui/icons-material/Payment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';

const ProfileContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(4),
  maxWidth: '1200px',
  margin: '0 auto',
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
  },
}));

const SidebarContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  width: '100%',
  [theme.breakpoints.up('md')]: {
    width: '280px',
    marginRight: theme.spacing(3),
    marginBottom: 0,
  },
}));

const ContentContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  flexGrow: 1,
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  marginBottom: theme.spacing(2),
  border: `4px solid ${theme.palette.primary.main}`,
}));

const UserProfile = () => {
  const { currentUser, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('personal');
  const [editMode, setEditMode] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [userData, setUserData] = useState({
    name: currentUser?.name || 'User',
    email: currentUser?.email || 'user@example.com',
    role: currentUser?.role || 'Security Analyst',
    company: 'Acme Corporation',
    phone: '+1 (555) 123-4567',
    emailNotifications: true,
    twoFactorAuth: false,
    darkMode: true,
    plan: 'Professional'
  });

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Save changes
      setSnackbarMessage('Profile updated successfully');
      setSnackbarOpen(true);
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setUserData({
      ...userData,
      [name]: name === 'emailNotifications' || name === 'twoFactorAuth' || name === 'darkMode' ? checked : value
    });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Personal Information</Typography>
              <Button 
                variant={editMode ? "contained" : "outlined"} 
                color="primary" 
                startIcon={<EditIcon />}
                onClick={handleEditToggle}
              >
                {editMode ? "Save Changes" : "Edit Profile"}
              </Button>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box component="form" sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              <TextField
                label="Full Name"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                disabled={!editMode}
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                disabled={!editMode}
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Role"
                name="role"
                value={userData.role}
                onChange={handleInputChange}
                disabled={!editMode}
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Company"
                name="company"
                value={userData.company}
                onChange={handleInputChange}
                disabled={!editMode}
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Phone"
                name="phone"
                value={userData.phone}
                onChange={handleInputChange}
                disabled={!editMode}
                fullWidth
                variant="outlined"
              />
            </Box>
          </Box>
        );
      case 'security':
        return (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>Security Settings</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Password</Typography>
              <Button variant="outlined" color="primary">Change Password</Button>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Two-Factor Authentication</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={userData.twoFactorAuth}
                    onChange={handleInputChange}
                    name="twoFactorAuth"
                    color="primary"
                  />
                }
                label="Enable two-factor authentication"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Enhance your account security by enabling two-factor authentication.
              </Typography>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Sessions</Typography>
              <Button variant="outlined" color="error">Log Out All Devices</Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This will log you out from all devices except the current one.
              </Typography>
            </Box>
          </Box>
        );
      case 'notifications':
        return (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>Notification Preferences</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <FormControlLabel
              control={
                <Switch
                  checked={userData.emailNotifications}
                  onChange={handleInputChange}
                  name="emailNotifications"
                  color="primary"
                />
              }
              label="Email Notifications"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Receive email notifications about security alerts, updates, and account activity.
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={userData.darkMode}
                  onChange={handleInputChange}
                  name="darkMode"
                  color="primary"
                />
              }
              label="Dark Mode"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Toggle between light and dark theme for the application.
            </Typography>
          </Box>
        );
      case 'subscription':
        return (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>Subscription Details</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ mb: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Current Plan: {userData.plan}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Your subscription renews on October 20, 2025
              </Typography>
              <Button variant="contained" color="primary" sx={{ mr: 2 }}>Upgrade Plan</Button>
              <Button variant="outlined" color="primary">View Billing History</Button>
            </Box>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              You have 14 days remaining in your current billing cycle.
            </Alert>
            
            <Typography variant="h6" sx={{ mb: 2 }}>Payment Method</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box 
                component="img" 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png"
                alt="Visa"
                sx={{ height: 30, mr: 2 }}
              />
              <Typography>•••• •••• •••• 4242</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>Expires 12/27</Typography>
            </Box>
            <Button variant="outlined" color="primary" size="small">Update Payment Method</Button>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, px: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ProfileContainer>
          <SidebarContainer elevation={1}>
            <ProfileHeader>
              <StyledAvatar src={currentUser?.avatar || null}>
                {userData.name.charAt(0).toUpperCase()}
              </StyledAvatar>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {userData.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {userData.email}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: 1,
                    fontWeight: 500
                  }}
                >
                  {userData.plan}
                </Typography>
                <IconButton size="small" onClick={handleMenuOpen} sx={{ ml: 1 }}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => { handleMenuClose(); window.location.href = 'http://localhost:3000'; }}>
                    Go to Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => { handleMenuClose(); logout(); }}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                  </MenuItem>
                </Menu>
              </Box>
            </ProfileHeader>
            
            <Divider sx={{ mb: 2 }} />
            
            <List component="nav" sx={{ p: 0 }}>
              <ListItem 
                button 
                selected={activeSection === 'personal'}
                onClick={() => setActiveSection('personal')}
                sx={{ borderRadius: 1, mb: 1 }}
              >
                <ListItemIcon>
                  <PersonIcon color={activeSection === 'personal' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Personal Info" />
              </ListItem>
              <ListItem 
                button 
                selected={activeSection === 'security'}
                onClick={() => setActiveSection('security')}
                sx={{ borderRadius: 1, mb: 1 }}
              >
                <ListItemIcon>
                  <SecurityIcon color={activeSection === 'security' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Security" />
              </ListItem>
              <ListItem 
                button 
                selected={activeSection === 'notifications'}
                onClick={() => setActiveSection('notifications')}
                sx={{ borderRadius: 1, mb: 1 }}
              >
                <ListItemIcon>
                  <NotificationsIcon color={activeSection === 'notifications' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Notifications" />
              </ListItem>
              <ListItem 
                button 
                selected={activeSection === 'subscription'}
                onClick={() => setActiveSection('subscription')}
                sx={{ borderRadius: 1 }}
              >
                <ListItemIcon>
                  <PaymentIcon color={activeSection === 'subscription' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Subscription" />
              </ListItem>
            </List>
            
            <Box sx={{ mt: 4 }}>
              <Button 
                variant="outlined" 
                color="primary" 
                fullWidth
                href="http://localhost:3000"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="text" 
                color="inherit" 
                fullWidth
                onClick={logout}
                sx={{ mt: 1 }}
                startIcon={<LogoutIcon />}
              >
                Log Out
              </Button>
            </Box>
          </SidebarContainer>
          
          <ContentContainer elevation={1}>
            {renderContent()}
          </ContentContainer>
        </ProfileContainer>
      </motion.div>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default UserProfile;
