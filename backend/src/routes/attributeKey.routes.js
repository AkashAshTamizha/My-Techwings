const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/attributeKey.controller');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const { doubleCsrfProtection } = require('../middleware/csrf');

const router = express.Router();

// Admin-only — this registry is purely a convenience source for the Add/Edit
// Product form's attribute-name dropdown, not public data.
router.get('/', protect, restrictTo('admin', 'staff'), ctrl.getAttributeKeys);

router.post(
  '/',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  [body('name').trim().notEmpty().withMessage('Attribute name is required').isLength({ max: 60 })],
  validate,
  ctrl.createAttributeKey
);

module.exports = router;
