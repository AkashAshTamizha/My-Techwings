const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');
const AppError = require('../utils/AppError');

// Verifies the JWT (sent as httpOnly cookie OR Authorization: Bearer header)
// and attaches the authenticated user to req.user. Used only for
// admin/staff-protected routes (product create/update/delete, inquiry list).
const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) throw new AppError('Not authenticated', 401);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('User no longer exists', 401);

  req.user = user;
  next();
});

const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action', 403));
  }
  next();
};

module.exports = { protect, restrictTo };
