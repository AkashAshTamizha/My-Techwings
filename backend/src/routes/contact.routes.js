const express = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/contact.controller');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const { doubleCsrfProtection } = require('../middleware/csrf');

const router = express.Router();

// Public
router.get('/', ctrl.getContactInfo);

// Admin-only
router.get('/admin/all', protect, restrictTo('admin', 'staff'), ctrl.getAllContactAdmin);
router.get('/:id', protect, restrictTo('admin', 'staff'), [param('id').isMongoId()], validate, ctrl.getContactInfoById);

router.post(
  '/',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  [
    body('type').isIn(['address', 'phone', 'whatsapp', 'email', 'hours', 'social', 'other']),
    body('label').trim().notEmpty().isLength({ max: 100 }),
    body('value').trim().notEmpty().isLength({ max: 300 }),
    body('link').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
    body('icon').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
    body('order').optional().isInt(),
  ],
  validate,
  ctrl.createContactInfo
);

router.patch(
  '/:id',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  [param('id').isMongoId()],
  validate,
  ctrl.updateContactInfo
);

router.delete(
  '/:id',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  [param('id').isMongoId()],
  validate,
  ctrl.deleteContactInfo
);

module.exports = router;
