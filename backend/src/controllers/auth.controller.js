const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

const isProd = process.env.NODE_ENV === 'production';

const sendTokenCookie = (user, statusCode, res, extra = {}) => {
  const token = signToken(user._id);

  res.cookie('token', token, {
    httpOnly: true, // not readable by JS -> mitigates XSS token theft
    secure: isProd, // required by browsers whenever sameSite is 'none'
    // Frontend (Vercel) and backend (Render) are different domains in
    // production, so this cookie is cross-site and 'strict' gets rejected
    // by the browser (same root cause as the CSRF cookie). Use 'none' in
    // prod; 'strict' is fine and tighter for local same-site dev.
    sameSite: isProd ? 'none' : 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });

  user.password = undefined;
  user.recoveryCodeHash = undefined;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  res.status(statusCode).json({ success: true, user, ...extra });
};

// Generates a high-entropy, human-transcribable recovery code, e.g.
// "A1B2C-3D4E5-F6A7B-8C9D0" (20 hex chars / 80 bits of entropy, grouped for
// readability). Only ever returned to the client once; the DB stores a
// bcrypt hash of it, exactly like a password.
const generateRecoveryCode = () => {
  const raw = crypto.randomBytes(10).toString('hex').toUpperCase(); // 20 hex chars
  return raw.match(/.{1,5}/g).join('-');
};

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// GET /api/v1/auth/admin-exists  (public)
// Lets the frontend decide whether to render the registration form (no
// admin yet -> first-run setup) or the login form (admin already exists).
exports.adminExists = asyncHandler(async (req, res) => {
  const count = await User.countDocuments({ role: 'admin' });
  res.status(200).json({ success: true, exists: count > 0 });
});

// POST /api/v1/auth/register  (bootstrap only)
// Only ever succeeds while zero admin accounts exist. Once the first admin
// is created this route always 403s, so it can never be used to add a
// second/rogue admin later — use an authenticated "invite" flow for that if
// the app ever needs multiple admins. Also generates + returns a one-time
// recovery code used later by the forgot-password flow.
exports.register = asyncHandler(async (req, res) => {
  const adminCount = await User.countDocuments({ role: 'admin' });
  if (adminCount > 0) {
    throw new AppError('An admin account already exists. Please log in instead.', 403);
  }

  const { name, email, password } = req.body;
  const recoveryCode = generateRecoveryCode();
  const recoveryCodeHash = await bcrypt.hash(recoveryCode, 12);

  const user = await User.create({
    name,
    email,
    password,
    role: 'admin', // first account is always admin; any client-supplied role is ignored
    recoveryCodeHash,
  });

  sendTokenCookie(user, 201, res, { recoveryCode });
});

// POST /api/v1/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  sendTokenCookie(user, 200, res);
});

// POST /api/v1/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'loggedout', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'strict',
    expires: new Date(Date.now() + 1000),
  });
  res.status(200).json({ success: true, message: 'Logged out' });
});

// GET /api/v1/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// PATCH /api/v1/auth/update-password  (logged-in admin/staff changes their own password)
// Body: { currentPassword, newPassword }
// Re-issues the JWT cookie afterwards so the session stays valid immediately.
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword; // re-hashed by the pre('save') hook on User
  await user.save();

  sendTokenCookie(user, 200, res);
});

// POST /api/v1/auth/forgot-password/verify  (public)
// Body: { email, recoveryCode }
// Step 1 of account recovery. Verifies the email + recovery code pair
// (both required — knowing just the email isn't enough) and, on success,
// issues a random, short-lived, single-use reset token. Only a hash of the
// token is persisted (same pattern as password storage), and it expires in
// 15 minutes. A generic error is returned on any mismatch so failed guesses
// can't be used to enumerate which admin email is valid.
exports.forgotPasswordVerify = asyncHandler(async (req, res) => {
  const { email, recoveryCode } = req.body;
  const genericError = 'Invalid email or recovery code';

  const user = await User.findOne({ email, role: 'admin' }).select('+recoveryCodeHash');
  if (!user || !(await user.compareRecoveryCode(recoveryCode))) {
    throw new AppError(genericError, 401);
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetTokenHash = hashResetToken(resetToken);
  user.passwordResetExpires = Date.now() + RESET_TOKEN_TTL_MS;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    resetToken,
    expiresInMinutes: RESET_TOKEN_TTL_MS / 60000,
  });
});

// POST /api/v1/auth/forgot-password/reset  (public)
// Body: { token, newPassword }
// Step 2 of account recovery. Consumes the token issued by /verify (single
// use — cleared immediately once matched) and sets the new password. Does
// NOT log the admin in; per the intended UX they're sent back to the login
// form to sign in with the new password.
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const tokenHash = hashResetToken(token);

  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetTokenHash +passwordResetExpires');

  if (!user) {
    throw new AppError('This reset link is invalid or has expired. Please start over.', 400);
  }

  user.password = newPassword; // re-hashed by the pre('save') hook on User
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({ success: true, message: 'Password reset successful. Please log in with your new password.' });
});

// POST /api/v1/auth/regenerate-recovery-code  (logged in)
// Body: { currentPassword }
// Lets a signed-in admin rotate their recovery code (e.g. if the original
// was lost) without ever needing the old one. Requires re-entering the
// current password, same trust bar as changing the password itself.
exports.regenerateRecoveryCode = asyncHandler(async (req, res) => {
  const { currentPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }

  const recoveryCode = generateRecoveryCode();
  user.recoveryCodeHash = await bcrypt.hash(recoveryCode, 12);
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, recoveryCode });
});