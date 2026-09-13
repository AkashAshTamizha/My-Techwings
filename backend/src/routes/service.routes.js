const express = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/service.controller');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const { doubleCsrfProtection } = require('../middleware/csrf');

const router = express.Router();

// Public
router.get('/', ctrl.getServices);

// Admin-only
router.get('/admin/all', protect, restrictTo('admin', 'staff'), ctrl.getAllServicesAdmin);
router.get('/:id', protect, restrictTo('admin', 'staff'), [param('id').isMongoId()], validate, ctrl.getServiceById);

router.post(
  '/',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  [
    body('title').trim().notEmpty().isLength({ max: 100 }),
    body('slug').isSlug(),
    body('description').trim().notEmpty().isLength({ max: 1000 }),
    body('price').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
    body('icon').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
    body('order').optional().isInt(),
  ],
  validate,
  ctrl.createService
);

router.patch(
  '/:id',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  [param('id').isMongoId()],
  validate,
  ctrl.updateService
);

router.delete(
  '/:id',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  [param('id').isMongoId()],
  validate,
  ctrl.deleteService
);

module.exports = router;
