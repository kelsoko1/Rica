/**
 * Rica API Server - Main Entry Point
 * Production-ready server with device linking capabilities
 */

// Import dependencies
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

// Import configuration
const config = require('./config');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const authMiddleware = require('./middleware/auth');

// Import routes
const deviceRoutes = require('./routes/deviceRoutes');
const authRoutes = require('./routes/authRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Import services
const deviceDiscoveryService = require('./services/deviceDiscoveryService');
const dataCollectionService = require('./services/dataCollectionService');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: config.server.corsOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect to MongoDB if configured
if (config.server.env !== 'test') {
  mongoose.connect(config.db.uri, config.db.options)
    .then(() => {
      logger.info('Connected to MongoDB');
    })
    .catch((err) => {
      logger.error('MongoDB connection error:', err);
      // Don't exit in development to allow working without MongoDB
      if (config.server.env === 'production') {
        process.exit(1);
      }
    });
}

// Apply middleware
app.use(cors({
  origin: config.server.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.http(message.trim()) } }));
app.use(requestLogger);

// Apply rate limiting
const limiter = rateLimit({
  windowMs: config.server.rateLimitWindow,
  max: config.server.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api/', limiter);

// Health check endpoint (no authentication required)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', authMiddleware, deviceRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Handle device events
  socket.on('subscribe:devices', (data) => {
    // Authenticate socket connection
    const token = data.token;
    if (!token) {
      socket.emit('error', { message: 'Authentication required' });
      return;
    }

    // Join device room to receive updates
    socket.join('devices');
    socket.emit('subscribed:devices');
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Export socket.io instance for use in services
app.set('io', io);

// Start server
if (config.server.env !== 'test') {
  server.listen(config.server.port, () => {
    logger.info(`Rica API Server running in ${config.server.env} mode on port ${config.server.port}`);
    
    // Start device discovery and data collection services
    deviceDiscoveryService.initialize(io);
    dataCollectionService.initialize(io);
  });
}

// For testing purposes
module.exports = { app, server };
