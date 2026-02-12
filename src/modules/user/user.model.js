const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // Keeps automatic unique index
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'user',
    },
    refreshToken: {
      type: String,
      select: false, // standard practice to hide tokens
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpire: Date,
    lastLogin: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
      select: false, // Hide by default
      index: true,   // Index for faster lookups
    },
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Follows ESR: Equality (role) → Sort (createdAt)
userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ name: 1 });

// Generate and hash password token
userSchema.methods.getVerificationToken = function () {
  // 1. Generate token (random bytes)
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // 2. Hash token and set to schema field
  this.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

  // 3. Set expire (10 mins)
  // 3. Set expire (time in minutes from env * 60 * 1000)
  const expiryMinutes = process.env.EMAIL_VERIFY_EXPIRY || 10;
  this.verificationTokenExpire = Date.now() + expiryMinutes * 60 * 1000;

  // 4. Return original token (to send in email)
  return verificationToken;
};

// Generate Password Reset Token
userSchema.methods.createPasswordResetToken = function () {
  // 1. Generate a secure random token (32 bytes = 64 hex chars)
  const resetToken = crypto.randomBytes(32).toString('hex');
  // 2. Hash it before saving to DB
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // 3. Set expiry (10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // 4. Return unhashed token to send via email
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
