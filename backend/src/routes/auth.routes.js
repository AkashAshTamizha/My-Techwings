const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { doubleCsrfProtection } = require('../middleware/csrf');

const router = express.Router();

router.post(
  '/login',
  authLimiter,
  doubleCsrfProtection,
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  ctrl.login
);

router.post('/logout', ctrl.logout);
router.get('/me', protect, ctrl.getMe);

router.patch(
  '/update-password',
  protect,
  doubleCsrfProtection,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isStrongPassword({ minLength: 8 }).withMessage('New password must be at least 8 characters and include upper/lowercase, a number, and a symbol'),
  ],
  validate,
  ctrl.updatePassword
);

// Registration should be locked down/removed after the first admin is
// seeded in production (see backend/src/utils/seed.js). Left here + rate
// limited for initial setup convenience only.
router.post(
  '/register',
  authLimiter,
  doubleCsrfProtection,
  [
    body('name').trim().notEmpty().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isStrongPassword({ minLength: 8 }),
  ],
  validate,
  ctrl.register
);

module.exports = router;
