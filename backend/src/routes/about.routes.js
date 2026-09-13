const express = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/about.controller');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const { doubleCsrfProtection } = require('../middleware/csrf');

const router = express.Router();

// Public
router.get('/', ctrl.getAboutSections);

// Admin-only
router.get('/admin/all', protect, restrictTo('admin', 'staff'), ctrl.getAllAboutAdmin);
router.get('/:id', protect, restrictTo('admin', 'staff'), [param('id').isMongoId()], validate, ctrl.getAboutSectionById);

router.post(
  '/',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  [
    body('heading').trim().notEmpty().isLength({ max: 150 }),
    body('body').trim().notEmpty().isLength({ max: 4000 }),
    body('icon').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
    body('order').optional().isInt(),
  ],
  validate,
  ctrl.createAboutSection
);

router.patch(
  '/:id',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  [param('id').isMongoId()],
  validate,
  ctrl.updateAboutSection
);

router.delete(
  '/:id',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  [param('id').isMongoId()],
  validate,
  ctrl.deleteAboutSection
);

module.exports = router;
