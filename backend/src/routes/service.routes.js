const express = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/service.controller');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const { doubleCsrfProtection } = require('../middleware/csrf');

const router = express.Router();

// ---- Content (singleton: hero, warranty promise, "how we work" intro) ----

router.get('/content', ctrl.getServiceContent);
router.get('/content/admin', protect, restrictTo('admin', 'staff'), ctrl.getServiceContentAdmin);

router.patch(
  '/content',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  [
    body('heroHeading').optional({ checkFalsy: true }).trim().isLength({ max: 300 }),
    body('heroDescription').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
    body('enquiryButtonText').optional({ checkFalsy: true }).trim().isLength({ max: 60 }),
    body('enquiryButtonLink').optional({ checkFalsy: true }).trim().isLength({ max: 300 }),
    body('warrantyTitle').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
    body('warrantyDescription').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
    body('warrantyImage').optional().isObject(),
    body('howWeWorkTitle').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
    body('howWeWorkDescription').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  ],
  validate,
  ctrl.updateServiceContent
);

// ---- How We Work (intro) sub-resource: title + description + image for
// just the intro copy shown above the step cards. Kept separate from the
// general PATCH above so this one section can be created, fully replaced,
// or reset on its own. No :id — there is only ever one content document,
// so nothing here should require a Mongo ID. ----

const howWeWorkValidators = [
  body('howWeWorkTitle').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('howWeWorkDescription').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  body('howWeWorkImage').optional().isObject(),
];

router.post(
  '/content/how-we-work',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  howWeWorkValidators,
  validate,
  ctrl.createHowWeWorkIntro
);

router.put(
  '/content/how-we-work',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  howWeWorkValidators,
  validate,
  ctrl.replaceHowWeWorkIntro
);

router.delete(
  '/content/how-we-work',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  ctrl.deleteHowWeWorkIntro
);

// ---- Cards (repeatable "How We Work" step cards) ----

router.get('/cards', ctrl.getServiceCards);
router.get('/cards/admin/all', protect, restrictTo('admin', 'staff'), ctrl.getAllServiceCardsAdmin);
router.get(
  '/cards/:id',
  protect,
  restrictTo('admin', 'staff'),
  [param('id').isMongoId()],
  validate,
  ctrl.getServiceCardById
);

router.post(
  '/cards',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  [
    body('title').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
    body('description').trim().notEmpty().isLength({ max: 600 }),
    body('image').optional().isObject(),
    body('order').optional().isInt(),
  ],
  validate,
  ctrl.createServiceCard
);

router.patch(
  '/cards/:id',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  [param('id').isMongoId()],
  validate,
  ctrl.updateServiceCard
);

router.delete(
  '/cards/:id',
  protect,
  restrictTo('admin', 'staff'),
  doubleCsrfProtection,
  [param('id').isMongoId()],
  validate,
  ctrl.deleteServiceCard
);

module.exports = router;