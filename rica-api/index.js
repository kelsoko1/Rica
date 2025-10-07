require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { request, gql } = require('graphql-request');
const axios = require('axios');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const winston = require('winston');
const fs = require('fs');
const path = require('path');
const { check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Configure logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'rica-api' },
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

// Environment variables
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const OPENCTI_GRAPHQL_URL = process.env.OPENCTI_GRAPHQL_URL || 'http://localhost:4000/graphql';
const OPENBAS_API_URL = process.env.OPENBAS_API_URL || 'http://localhost:8080/api';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const API_KEY = process.env.API_KEY || (NODE_ENV === 'production' ? undefined : 'changeme-in-dev');

// Validate required environment variables in production
if (NODE_ENV === 'production') {
  const requiredEnvVars = ['API_KEY'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
  }
}

// Initialize Express app
const app = express();

// Apply security headers
app.use(helmet());

// Enable compression
app.use(compression());

// Request logging
app.use(morgan('combined', {
  stream: { write: message => logger.info(message.trim()) }
}));

// Configure CORS
const allowedOrigins = NODE_ENV === 'production' 
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
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Body parsing middleware with limits for security
app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    return res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later.'
    });
  }
});

// Apply rate limiting to all requests
app.use(apiLimiter);

// Simple in-memory credit wallet for demo
// In production, this should be replaced with a database
const wallets = {}; // { orgId: { credits: number } }

// Load wallets from file if exists
const walletsFile = path.join(dataDir, 'wallets.json');
if (fs.existsSync(walletsFile)) {
  try {
    const data = fs.readFileSync(walletsFile, 'utf8');
    Object.assign(wallets, JSON.parse(data));
    logger.info('Wallets loaded from file');
  } catch (err) {
    logger.error(`Failed to load wallets from file: ${err.message}`);
  }
}

// Save wallets to file periodically
setInterval(() => {
  try {
    fs.writeFileSync(walletsFile, JSON.stringify(wallets), 'utf8');
    logger.debug('Wallets saved to file');
  } catch (err) {
    logger.error(`Failed to save wallets to file: ${err.message}`);
  }
}, 60000); // Save every minute

function ensureWallet(org) {
  if(!wallets[org]) wallets[org] = { credits: 25 }; // free tier refill
  return wallets[org];
}

// API Key authentication middleware
const apiKeyAuth = (req, res, next) => {
  const key = req.headers['x-api-key'] || '';
  
  if(!key || key !== API_KEY) {
    // allow read-only public endpoints in dev if API_KEY is 'changeme-in-dev'
    if(NODE_ENV !== 'production' && API_KEY === 'changeme-in-dev') {
      logger.debug('Development mode: allowing request without valid API key');
      return next();
    }
    
    logger.warn(`Unauthorized API access attempt from ${req.ip}`);
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized: missing or invalid API key' 
    });
  }
  
  next();
};

// Apply API key auth to all routes
app.use(apiKeyAuth);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: NODE_ENV
  });
});

// Proxy OpenCTI GraphQL - example: fetch top threat actors (paginated)
app.get('/api/threat-actors', [
  check('first').optional().isInt({ min: 1, max: 100 }).toInt()
], async (req, res) => {
  // Validate request parameters
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  
  try {
    const query = gql`
      query ThreatActors($first:Int){
        threatActors(first:$first){
          edges{
            node{
              id
              name
              description
            }
          }
        }
      }
    `;
    const variables = { first: req.query.first ? parseInt(req.query.first, 10) : 10 };
    
    logger.debug(`Querying OpenCTI for ${variables.first} threat actors`);
    const data = await request(OPENCTI_GRAPHQL_URL, query, variables);
    const items = data.threatActors.edges.map(e => e.node);
    
    res.json({ success: true, items });
  } catch(err) {
    logger.error(`OpenCTI query error: ${err.message || err}`);
    res.status(500).json({ 
      success: false, 
      error: 'OpenCTI query failed', 
      detail: NODE_ENV === 'production' ? 'Internal server error' : String(err.message || err) 
    });
  }
});

// Launch a BAS simulation via OpenBAS/Camoufox
app.post('/api/simulate', [
  check('name').optional().isString().trim().escape(),
  check('org').optional().isString().trim(),
  check('target').optional().isObject(),
  check('scenario').optional().isObject()
], async (req, res) => {
  // Validate request parameters
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  
  try {
    // expected body: { name, target, scenario }
    const wallet = ensureWallet(req.body.org || 'demo');
    if(wallet.credits < 2) {
      logger.warn(`Insufficient credits for org: ${req.body.org || 'demo'}`);
      return res.status(402).json({ 
        success: false, 
        error: 'Insufficient credits' 
      });
    }
    
    // charge 2 credits per sim as per product design
    wallet.credits -= 2;

    const payload = {
      name: req.body.name || 'Rica Simulation',
      target: req.body.target || {},
      scenario: req.body.scenario || {},
    };
    
    logger.info(`Launching simulation: ${payload.name}`);
    const r = await axios.post(`${OPENBAS_API_URL}/campaigns`, payload, { 
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    res.json({ 
      success: true, 
      result: r.data, 
      credits: wallet.credits 
    });
  } catch(err) {
    logger.error(`OpenBAS error: ${err.message || err}`);
    // fallback: return simulated response for demo if OpenBAS unreachable
    res.status(500).json({ 
      success: false, 
      error: 'OpenBAS call failed', 
      detail: NODE_ENV === 'production' ? 'Internal server error' : String(err.message || err) 
    });
  }
});

// Starry copilot endpoint - sends prompt to DeepSeek API
app.post('/api/starry', [
  check('prompt').isString().notEmpty(),
  check('org').optional().isString().trim(),
  check('command').optional().isString().trim(),
  check('file').optional().isString().trim()
], async (req, res) => {
  // Validate request parameters
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  
  try {
    const { prompt, org='demo' } = req.body;
    const wallet = ensureWallet(org);
    
    if(wallet.credits < 2) {
      logger.warn(`Insufficient credits for org: ${org}`);
      return res.status(402).json({ 
        success: false, 
        error: 'Insufficient credits' 
      });
    }
    
    // charge 2 credits per Starry interaction
    wallet.credits -= 2;

    try {
      // Check if DeepSeek API key is configured
      if (!DEEPSEEK_API_KEY) {
        logger.error('DeepSeek API key is not configured');
        throw new Error('DeepSeek API key is not configured');
      }
      
      // Call DeepSeek API
      const headers = {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      };

      // Prepare system message based on command
      let systemMessage = 'You are Starry, an expert AI coding assistant.';
      if (req.body.command) {
        systemMessage += ` The user wants you to ${req.body.command} their code. `;
        if (req.body.command === 'edit' || req.body.command === 'refactor') {
          systemMessage += 'Provide your response in a code block using markdown syntax. The code should be complete and ready to use.';
        }
      }
      if (req.body.file) {
        systemMessage += ` The current file being worked on is ${req.body.file}.`;
      }

      logger.debug(`Sending prompt to DeepSeek API: ${prompt.substring(0, 50)}...`);
      const r = await axios.post('https://api.deepseek.com/v1/chat/completions', {
        model: 'deepseek-coder-33b-instruct',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }, { 
        headers,
        timeout: 30000
      });

      const reply = {
        content: r.data.choices[0].message.content,
        usage: r.data.usage
      };

      logger.info(`DeepSeek API response received, tokens: ${r.data.usage.total_tokens}`);
      return res.json({ 
        success: true, 
        reply, 
        credits: wallet.credits 
      });
    } catch(apiErr) {
      logger.error(`DeepSeek API error: ${apiErr.message || apiErr}`);
      // Provide a more helpful error message
      const errorMsg = apiErr.response?.data?.error?.message || apiErr.message || 'Unknown error';
      throw new Error(`DeepSeek API error: ${errorMsg}`);
    }
  } catch(err) {
    logger.error(`Starry error: ${err.message || err}`);
    res.status(500).json({ 
      success: false, 
      error: 'Starry failed', 
      detail: NODE_ENV === 'production' ? 'Internal server error' : String(err.message || err) 
    });
  }
});

// Wallet status
app.get('/api/wallet', [
  check('org').optional().isString().trim()
], (req, res) => {
  // Validate request parameters
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  
  const org = req.query.org || 'demo';
  const w = ensureWallet(org);
  logger.debug(`Wallet status requested for org: ${org}, credits: ${w.credits}`);
  res.json({ success: true, credits: w.credits });
});

// Refill credits (disabled in production)
app.post('/api/wallet/refill', [
  check('org').optional().isString().trim(),
  check('amount').optional().isInt({ min: 1, max: 1000 }).toInt()
], (req, res) => {
  // In production, disable this endpoint
  if (NODE_ENV === 'production' && !process.env.ENABLE_WALLET_REFILL) {
    logger.warn(`Wallet refill attempted in production from ${req.ip}`);
    return res.status(403).json({ 
      success: false, 
      error: 'This endpoint is disabled in production' 
    });
  }
  
  // Validate request parameters
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  
  const org = req.body.org || 'demo';
  const amount = parseInt(req.body.amount || 100, 10);
  const w = ensureWallet(org);
  w.credits += amount;
  
  logger.info(`Wallet refilled for org: ${org}, amount: ${amount}, new balance: ${w.credits}`);
  res.json({ success: true, credits: w.credits });
});

// Catch-all for 404 errors
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, error: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}\n${err.stack}`);
  res.status(500).json({
    success: false,
    error: NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

// Process cleanup on exit
const cleanupAndExit = (signal) => {
  logger.info(`${signal} received. Cleaning up...`);
  
  // Save wallets to file before exit
  try {
    fs.writeFileSync(walletsFile, JSON.stringify(wallets), 'utf8');
    logger.info('Wallets saved to file before exit');
  } catch (err) {
    logger.error(`Failed to save wallets to file before exit: ${err.message}`);
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

// Start the server
app.listen(PORT, () => {
  logger.info(`Rica API listening on port ${PORT} in ${NODE_ENV} mode`);
  logger.info(`Health check available at http://localhost:${PORT}/api/health`);
});
