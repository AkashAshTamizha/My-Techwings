const express = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/about.controller');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const { doubleCsrfProtection } = require('../middleware/csrf');

const router = express.Router();

// Public — singleton page content (hero / "Story about us" / "What We Repair")
router.get('/', ctrl.getAboutContent);

// Admin-only — singleton page content
// NOTE: '/admin' must be declared before the '/:id' route below, otherwise
// Express would match it as an :id param and reject it as an invalid Mongo ID.
router.get('/admin', protect, restrictTo('admin', 'staff'), ctrl.getAboutContentAdmin);

router.patch(
  '/',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  [
    body('heroHeading').optional({ checkFalsy: true }).trim().isLength({ max: 300 }),
    body('storyTitle').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
    body('storyDescription').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }),
    body('storyImage').optional().isObject(),
    body('repairTitle').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
    body('repairDescription').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }),
    body('repairServicesList').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }),
    body('repairImage').optional().isObject(),
    body('enquiryButtonText').optional({ checkFalsy: true }).trim().isLength({ max: 60 }),
    body('enquiryButtonLink').optional({ checkFalsy: true }).trim().isLength({ max: 300 }),
  ],
  validate,
  ctrl.updateAboutContent
);

// Admin-only — legacy repeatable "sections" resource (kept for backward
// compatibility; not used by the current About page).
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
