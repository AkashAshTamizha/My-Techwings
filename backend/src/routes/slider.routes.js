const express = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/slider.controller');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const { doubleCsrfProtection } = require('../middleware/csrf');

const router = express.Router();

const sliderValidators = [
  body('eyebrow').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
  body('heading').isArray({ min: 1, max: 4 }).withMessage('Heading must have 1-4 lines'),
  body('heading.*.text').trim().notEmpty().isLength({ max: 80 }),
  body('heading.*.highlighted').optional().isBoolean(),
  body('description').trim().notEmpty().isLength({ max: 500 }),
  body('ctaLabel').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
  body('ctaTo').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
  body('image.url').notEmpty().withMessage('Slide image is required'),
  body('image.publicId').notEmpty().withMessage('Slide image is required'),
  body('alt').optional({ checkFalsy: true }).trim().isLength({ max: 150 }),
  body('order').optional().isInt(),
  body('isActive').optional().isBoolean(),
];

// Public
router.get('/', ctrl.getSliders);

// Admin-only
router.get('/admin/all', protect, restrictTo('admin', 'staff'), ctrl.getAllSlidersAdmin);
router.get('/:id', protect, restrictTo('admin', 'staff'), [param('id').isMongoId()], validate, ctrl.getSliderById);

router.post(
  '/',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  sliderValidators,
  validate,
  ctrl.createSlider
);

router.patch(
  '/:id',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  [param('id').isMongoId()],
  validate,
  ctrl.updateSlider
);

router.delete(
  '/:id',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  [param('id').isMongoId()],
  validate,
  ctrl.deleteSlider
);

module.exports = router;
