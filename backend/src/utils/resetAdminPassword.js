require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('./logger');

// Recovery tool for when an admin is locked out and can't use the
// in-app "change password" form (PATCH /api/v1/auth/update-password,
// which requires knowing the current password).
//
// Usage:
//   node src/utils/resetAdminPassword.js <email> <newPassword>
// or via the npm script:
//   npm run reset-password -- <email> <newPassword>
async function run() {
  const [, , email, newPassword] = process.argv;

  if (!email || !newPassword) {
    logger.error('Usage: node src/utils/resetAdminPassword.js <email> <newPassword>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    logger.error(`No user found with email: ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  user.password = newPassword; // re-hashed by the pre('save') hook on User
  await user.save();

  logger.info(`Password reset for ${email}`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  logger.error(err.message);
  process.exit(1);
});
