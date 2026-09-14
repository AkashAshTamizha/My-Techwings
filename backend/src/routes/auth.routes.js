const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authLimiter, forgotPasswordLimiter } = require('../middleware/rateLimiter');
const { doubleCsrfProtection } = require('../middleware/csrf');

const router = express.Router();

// Public: lets the frontend decide whether to render the first-run
// registration form or the normal login form.
router.get('/admin-exists', ctrl.adminExists);

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

// Bootstrap-only: the controller itself refuses this once an admin already
// exists, so it stays safe to leave mounted (still rate limited + CSRF
// protected here for defense in depth).
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

// ---- Forgot password (no email/SMS provider required) ----
// Step 1: prove identity with email + the one-time recovery code issued at
// registration. Returns a short-lived reset token on success.
router.post(
  '/forgot-password/verify',
  forgotPasswordLimiter,
  doubleCsrfProtection,
  [body('email').isEmail().normalizeEmail(), body('recoveryCode').trim().notEmpty()],
  validate,
  ctrl.forgotPasswordVerify
);

// Step 2: spend that reset token to set a new password.
router.post(
  '/forgot-password/reset',
  forgotPasswordLimiter,
  doubleCsrfProtection,
  [
    body('token').trim().notEmpty(),
    body('newPassword')
      .isStrongPassword({ minLength: 8 })
      .withMessage('New password must be at least 8 characters and include upper/lowercase, a number, and a symbol'),
  ],
  validate,
  ctrl.resetPassword
);

// Logged-in admin can rotate their recovery code (e.g. after losing it)
// by re-confirming their current password.
router.post(
  '/regenerate-recovery-code',
  protect,
  doubleCsrfProtection,
  [body('currentPassword').notEmpty()],
  validate,
  ctrl.regenerateRecoveryCode
);

module.exports = router;
