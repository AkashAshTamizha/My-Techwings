const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

const sendTokenCookie = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.cookie('token', token, {
    httpOnly: true, // not readable by JS -> mitigates XSS token theft
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', // mitigates CSRF
    maxAge: 24 * 60 * 60 * 1000,
  });

  user.password = undefined;
  res.status(statusCode).json({ success: true, user });
};

// POST /api/v1/auth/register  (should be disabled/protected in production; seed admins via script instead)
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password });
  sendTokenCookie(user, 201, res);
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
  res.cookie('token', 'loggedout', { httpOnly: true, expires: new Date(Date.now() + 1000) });
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
