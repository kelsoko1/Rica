/**
 * Mock server for handling ClickPesa webhooks
 * 
 * This is a simple Express server that handles ClickPesa webhooks.
 * In a production environment, this would be part of your backend API.
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// In-memory storage for payments (in production, use a database)
const payments = {};

// Mock secret for webhook signature verification
const CLICKPESA_WEBHOOK_SECRET = 'your_webhook_secret';

// Verify webhook signature
const verifySignature = (req) => {
  const signature = req.headers['x-clickpesa-signature'];
  if (!signature) {
    return false;
  }

  const payload = JSON.stringify(req.body);
  const hmac = crypto.createHmac('sha256', CLICKPESA_WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
};

// ClickPesa webhook endpoint
app.post('/webhooks/clickpesa', (req, res) => {
  console.log('Received ClickPesa webhook:', req.body);

  // Verify signature in production
  // if (!verifySignature(req)) {
  //   return res.status(401).json({ error: 'Invalid signature' });
  // }

  const { transaction_id, status, reference, amount, currency, provider } = req.body;

  // Update payment status
  payments[transaction_id] = {
    status,
    reference,
    amount,
    currency,
    provider,
    updatedAt: new Date().toISOString()
  };

  // Respond to ClickPesa
  res.status(200).json({ success: true });
});

// Get payment status endpoint
app.get('/api/payments/:transactionId', (req, res) => {
  const { transactionId } = req.params;
  const payment = payments[transactionId];

  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  res.json(payment);
});

// Create payment endpoint
app.post('/api/payments', (req, res) => {
  const { amount, phoneNumber, description, reference } = req.body;

  // Validate input
  if (!amount || !phoneNumber || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Create transaction ID
  const transactionId = `CP${Date.now()}`;

  // Store payment
  payments[transactionId] = {
    amount,
    phoneNumber,
    description,
    reference,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  // Return transaction ID
  res.json({
    success: true,
    transactionId,
    status: 'PENDING',
    message: 'Payment request sent successfully'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Mock API server listening at http://localhost:${port}`);
});

module.exports = app;
