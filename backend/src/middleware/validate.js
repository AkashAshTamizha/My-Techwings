const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// Run after any express-validator chain(s) in a route to short-circuit
// with a 400 if validation failed.
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => `${e.path}: ${e.msg}`).join('; ');
    return next(new AppError(message, 400));
  }
  next();
};
