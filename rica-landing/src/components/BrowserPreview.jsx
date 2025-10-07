import React from 'react';
import { Box, Typography, Paper, IconButton, TextField, AppBar, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const BrowserContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
}));

const BrowserToolbar = styled(AppBar)(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const TabsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  overflowX: 'auto',
  '&::-webkit-scrollbar': {
    height: '4px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.divider,
    borderRadius: '4px',
  },
}));

const Tab = styled(Box)(({ theme, active }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: '8px 8px 0 0',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: active ? theme.palette.background.default : 'transparent',
  borderBottom: active ? `2px solid ${theme.palette.primary.main}` : 'none',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  minWidth: '120px',
  maxWidth: '200px',
}));

const AddressBar = styled(TextField)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.default,
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
    height: '36px',
  },
}));

const BrowserContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
}));

const BrowserPreview = () => {
  return (
    <BrowserContainer elevation={3}>
      <BrowserToolbar>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <TabsContainer>
            <Tab active={true}>
              <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                Rica Dashboard
              </Typography>
              <IconButton size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tab>
            <Tab active={false}>
              <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                Threat Analysis
              </Typography>
              <IconButton size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tab>
            <IconButton size="small" sx={{ ml: 1 }}>
              <AddIcon fontSize="small" />
            </IconButton>
          </TabsContainer>
          
          <Toolbar variant="dense" sx={{ minHeight: 'auto', py: 1 }}>
            <IconButton size="small" sx={{ mr: 1 }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ mr: 1 }}>
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ mr: 1 }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
            <AddressBar
              fullWidth
              size="small"
              placeholder="https://app.rica.io/dashboard"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <Box
                    component="img"
                    src="/src/assets/favicon.svg"
                    alt="Rica"
                    sx={{ width: 16, height: 16, mr: 1 }}
                  />
                ),
              }}
            />
            <IconButton size="small" sx={{ ml: 1 }}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Toolbar>
        </Box>
      </BrowserToolbar>
      
      <BrowserContent>
        <Box
          component="img"
          src="/src/assets/dashboard-preview.svg"
          alt="Rica Dashboard"
          sx={{ width: '100%', maxWidth: '800px', mb: 3 }}
        />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Rica Security Intelligence Platform
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Advanced threat detection and browser fingerprinting capabilities
        </Typography>
      </BrowserContent>
    </BrowserContainer>
  );
};

export default BrowserPreview;
