const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['admin', 'staff'], default: 'staff' },

    // ---- Account recovery ----
    // Hash of the one-time recovery code shown to the admin right after
    // registration (or after a regenerate). Never store the plaintext code.
    // Used by the "forgot password" flow to verify identity without an
    // email/SMS provider being configured.
    recoveryCodeHash: { type: String, select: false },
    // Short-lived, single-use token (hashed) issued once a forgot-password
    // request is verified via the recovery code. Consumed by the second
    // step of the flow to actually set a new password.
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.compareRecoveryCode = function compareRecoveryCode(candidate) {
  if (!this.recoveryCodeHash) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.recoveryCodeHash);
};

module.exports = mongoose.model('User', userSchema);
