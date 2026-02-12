const express = require('express');
const authController = require('./auth.controller');
const strictLimiter = require('../../middlewares/strictLimiter.middleware');
const validate = require('../../middlewares/validate.middleware');
const { createUserSchema, userLoginSchema, forgotPasswordLimiter, resetPasswordLimiter} = require('../user/user.validation');
const router = express.Router();

router.post(
  '/auth/register',
  strictLimiter,
  validate(createUserSchema),
  authController.registerUser
);

router.post('/auth/login', strictLimiter, validate(userLoginSchema), authController.loginUser);

router.post('/auth/refresh', authController.refreshAuth);
router.post('/auth/logout', authController.logoutUser);

router.get('/auth/verifyemail/:token', authController.verifyEmail);

router.post(
  '/forgot-password', 
  forgotPasswordLimiter, 
  authController.forgotPassword
);
router.patch(
  '/reset-password/:token', 
  resetPasswordLimiter, 
  authController.resetPassword
);

module.exports = router;
