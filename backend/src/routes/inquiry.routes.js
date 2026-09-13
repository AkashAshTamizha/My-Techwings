const express = require('express');
const { body, param, query } = require('express-validator');
const ctrl = require('../controllers/inquiry.controller');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const { inquiryLimiter } = require('../middleware/rateLimiter');
const { doubleCsrfProtection } = require('../middleware/csrf');

const router = express.Router();

// Public: "Need This Laptop" form submission
router.post(
  '/',
  inquiryLimiter,
  doubleCsrfProtection,
  [
    body('productId').isMongoId(),
    body('variantId').optional({ checkFalsy: true }).isMongoId(),
    body('name').trim().notEmpty().isLength({ max: 100 }).escape(),
    body('phone')
      .trim()
      .matches(/^[0-9+\-\s]{7,15}$/)
      .withMessage('Enter a valid phone number'),
    body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
    body('city').optional({ checkFalsy: true }).trim().isLength({ max: 100 }).escape(),
    body('message').optional({ checkFalsy: true }).trim().isLength({ max: 500 }).escape(),
  ],
  validate,
  ctrl.createInquiry
);

// Admin-only
router.get('/', protect, restrictTo('admin', 'staff'), ctrl.listInquiries);
router.patch(
  '/:id',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  [param('id').isMongoId(), body('status').isIn(['new', 'contacted', 'closed'])],
  validate,
  ctrl.updateInquiryStatus
);

module.exports = router;
