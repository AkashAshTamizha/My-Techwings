const express = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/contact.controller');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const { doubleCsrfProtection } = require('../middleware/csrf');

const router = express.Router();

// Public — singleton page content (hero / "Get in Touch" / phone / email / map)
router.get('/', ctrl.getContactContent);

// Admin-only — singleton page content
// NOTE: '/admin' must be declared before the '/:id' route below, otherwise
// Express would match it as an :id param and reject it as an invalid Mongo ID.
router.get('/admin', protect, restrictTo('admin', 'staff'), ctrl.getContactContentAdmin);

router.patch(
  '/',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  [
    body('heroHeading').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
    body('heroSubheading').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
    body('getInTouchTitle').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
    body('getInTouchDescription').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
    body('phoneLabel').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
    body('phoneValue').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
    body('emailLabel').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
    body('emailValue').optional({ checkFalsy: true }).trim().isLength({ max: 150 }),
    body('mapImage').optional().isObject(),
  ],
  validate,
  ctrl.updateContactContent
);

// Admin-only — legacy repeatable "items" resource (kept for backward
// compatibility; not used by the current Contact page).
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
