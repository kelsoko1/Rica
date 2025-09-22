const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const winston = require('winston');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'rica-server' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log') 
    })
  ],
});

// Map to store active browser processes
const activeBrowsers = new Map();

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  logger.error(`${err.stack}`);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
};

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'http://localhost:3000', 'http://localhost:3001'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      fontSrc: ["'self'", 'data:']
    }
  }
}));

// Enable compression
app.use(compression());

// Configure CORS
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL || 'http://localhost'] 
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware with limits for security
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Rate limiting (simple implementation)
const requestCounts = {};
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  // Initialize or reset expired entries
  if (!requestCounts[ip] || now - requestCounts[ip].timestamp > RATE_LIMIT_WINDOW_MS) {
    requestCounts[ip] = {
      count: 1,
      timestamp: now
    };
    return next();
  }
  
  // Increment count
  requestCounts[ip].count++;
  
  // Check if over limit
  if (requestCounts[ip].count > RATE_LIMIT_MAX) {
    logger.warn(`Rate limit exceeded for IP: ${ip}`);
    return res.status(429).json({ 
      success: false, 
      error: 'Too many requests, please try again later.' 
    });
  }
  
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Launch a browser profile
app.post('/api/browser/launch', (req, res) => {
  try {
    const { profile } = req.body;
    
    // Validate input
    if (!profile || !profile.id || !profile.config) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid profile data' 
      });
    }
    
    const pythonScript = path.join(__dirname, 'launch_browser.py');
    
    // Check if script exists
    if (!fs.existsSync(pythonScript)) {
      logger.error(`Python script not found: ${pythonScript}`);
      return res.status(500).json({ 
        success: false, 
        error: 'Browser launcher script not found' 
      });
    }
    
    // Launch the Python script that manages CamouFox
    const browser = spawn('python', [
      pythonScript,
      '--config', JSON.stringify(profile.config),
      '--profile-id', profile.id.toString()
    ]);

    // Store the browser process
    activeBrowsers.set(profile.id, browser);

    // Handle browser process events
    browser.on('error', (error) => {
      logger.error(`Browser launch error for profile ${profile.id}: ${error.message}`);
      activeBrowsers.delete(profile.id);
    });

    browser.on('exit', (code) => {
      logger.info(`Browser process exited with code ${code} for profile ${profile.id}`);
      activeBrowsers.delete(profile.id);
    });
    
    // Capture stdout and stderr
    browser.stdout.on('data', (data) => {
      logger.debug(`Browser stdout [${profile.id}]: ${data.toString().trim()}`);
    });
    
    browser.stderr.on('data', (data) => {
      logger.error(`Browser stderr [${profile.id}]: ${data.toString().trim()}`);
    });

    logger.info(`Browser launched for profile ${profile.id}`);
    res.json({ success: true });
  } catch (error) {
    logger.error(`Failed to launch browser: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stop a browser profile
app.post('/api/browser/stop', (req, res) => {
  try {
    const { profileId } = req.body;
    
    // Validate input
    if (!profileId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Profile ID is required' 
      });
    }
    
    const browser = activeBrowsers.get(profileId);
    
    if (browser) {
      browser.kill();
      activeBrowsers.delete(profileId);
      logger.info(`Browser stopped for profile ${profileId}`);
      res.json({ success: true });
    } else {
      logger.warn(`Browser not found for profile ${profileId}`);
      res.status(404).json({ success: false, error: 'Browser not found' });
    }
  } catch (error) {
    logger.error(`Failed to stop browser: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get status of all running browsers
app.get('/api/browser/status', (req, res) => {
  try {
    const runningProfiles = Array.from(activeBrowsers.keys());
    logger.debug(`Browser status requested, running profiles: ${runningProfiles.length}`);
    res.json({ success: true, runningProfiles });
  } catch (error) {
    logger.error(`Failed to get browser status: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Catch-all for 404 errors
app.use((req, res, next) => {
  logger.warn(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, error: 'Not Found' });
});

// Error handling
app.use(errorHandler);

// Process cleanup on exit
const cleanupAndExit = (signal) => {
  logger.info(`${signal} received. Cleaning up...`);
  for (const [id, browser] of activeBrowsers) {
    try {
      browser.kill();
      logger.info(`Killed browser process ${id}`);
    } catch (err) {
      logger.error(`Error killing browser ${id}: ${err.message}`);
    }
  }
  process.exit(0);
};

process.on('SIGTERM', () => cleanupAndExit('SIGTERM'));
process.on('SIGINT', () => cleanupAndExit('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught exception: ${err.message}\n${err.stack}`);
  // Keep the process alive but log the error
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  // Keep the process alive but log the error
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  logger.info(`Health check available at http://localhost:${PORT}/api/health`);
});
