/**
 * Payment Routes
 * API endpoints for payment processing
 */

const express = require('express');
const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const logger = require('../utils/logger');

const router = express.Router();

// In-memory storage for payments (in production, use a database)
const payments = {};

/**
 * @route   POST /api/payments
 * @desc    Create a new payment
 * @access  Public
 */
router.post(
  '/',
  [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('reference').optional(),
    validateRequest,
  ],
  (req, res) => {
    const { amount, phoneNumber, description, reference } = req.body;

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

    logger.info(`Created payment: ${transactionId}`);

    // Return transaction ID
    res.json({
      success: true,
      transactionId,
      status: 'PENDING',
      message: 'Payment request sent successfully'
    });
  }
);

/**
 * @route   GET /api/payments/:transactionId
 * @desc    Get payment status
 * @access  Public
 */
router.get(
  '/:transactionId',
  [
    param('transactionId').notEmpty().withMessage('Transaction ID is required'),
    validateRequest,
  ],
  (req, res) => {
    const { transactionId } = req.params;
    const payment = payments[transactionId];

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  }
);

module.exports = router;
