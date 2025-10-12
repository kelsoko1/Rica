/**
 * Rica API Server
 * 
 * Main entry point for the Rica API server with PostgreSQL-based authentication
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Import services
import tenantManager from './tenantManager.js';
import creditResourceManager from './creditResourceManager.js';
import authManager from './authManager.js';
import adsManager from './adsManager.js';
import vircadiaAnalytics from './vircadiaAnalytics.js';

// Import routes
import adsRoutes from './adsRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'rica-api',
    version: '1.0.0'
  });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    const result = await authManager.registerUser(email, password, firstName, lastName);
    res.status(201).json(result);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const result = await authManager.loginUser(email, password);
    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }
    
    const result = await authManager.verifyEmail(token);
    res.json(result);
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

app.get('/api/auth/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const result = await authManager.getUserProfile(decoded.userId);
    res.json(result);
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Tenant management routes
app.post('/api/tenants/provision', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const { subscriptionTier } = req.body;
    const result = await tenantManager.provisionTenant(decoded.email, subscriptionTier, decoded.userId);
    res.json(result);
  } catch (error) {
    console.error('Tenant provisioning error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

app.get('/api/tenants/:tenantId/status', async (req, res) => {
  try {
    const result = await tenantManager.getTenantStatus(req.params.tenantId);
    res.json(result);
  } catch (error) {
    console.error('Tenant status error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Ads and Analytics routes
app.use('/api/ads', adsRoutes);

// Credit management routes
app.get('/api/credits/status', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const result = await creditResourceManager.getTenantCreditStatus(decoded.userId);
    res.json(result);
  } catch (error) {
    console.error('Credit status error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Initialize services
async function initializeServices() {
  try {
    console.log('Initializing Rica API services...');
    
    // Initialize credit resource manager
    creditResourceManager.initialize();
    
    // Initialize ads system
    await adsManager.initializeDatabase();
    await vircadiaAnalytics.initializeDatabase();
    
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Error initializing services:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    await initializeServices();
    
    app.listen(PORT, () => {
      console.log(`🚀 Rica API server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth endpoints: /api/auth/*`);
      console.log(`🏢 Tenant endpoints: /api/tenants/*`);
      console.log(`💳 Credit endpoints: /api/credits/*`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();
