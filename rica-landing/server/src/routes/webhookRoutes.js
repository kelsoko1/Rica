/**
 * Webhook Routes
 * API endpoints for handling webhooks from external services
 */

const express = require('express');
const crypto = require('crypto');
const config = require('../config');
const logger = require('../utils/logger');

const router = express.Router();

// In-memory storage for payments (in production, use a database)
const payments = {};

/**
 * Verify webhook signature
 */
const verifySignature = (req) => {
  const signature = req.headers['x-clickpesa-signature'];
  if (!signature) {
    return false;
  }

  const payload = JSON.stringify(req.body);
  const hmac = crypto.createHmac('sha256', config.clickPesa.webhookSecret);
  const digest = hmac.update(payload).digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
};

/**
 * @route   POST /webhooks/clickpesa
 * @desc    Handle ClickPesa webhook
 * @access  Public
 */
router.post('/clickpesa', (req, res) => {
  logger.info('Received ClickPesa webhook:', req.body);

  // Verify signature in production
  if (config.server.env === 'production') {
    if (!verifySignature(req)) {
      logger.warn('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

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

module.exports = router;
