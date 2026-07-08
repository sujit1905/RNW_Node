const express = require('express');
const router = express.Router();

// Authentication routes for login, signup, logout, and password recovery.
const authController = require('../controllers/authController');
const { isGuest } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { authRules } = require('../middlewares/rules');

router.get('/login', isGuest, authController.showLogin);
router.post('/login', isGuest, authRules.login, validate, authController.login);

router.get('/signup', isGuest, authController.showSignup);
router.post('/signup', isGuest, authRules.signup, validate, authController.signup);

router.get('/logout', authController.logout);

router.get('/forgot-password', isGuest, authController.showForgotPassword);
router.post('/forgot-password', isGuest, authRules.forgotPassword, validate, authController.sendOtp);

router.get('/verify-otp', isGuest, authController.showVerifyOtp);
router.post('/verify-otp', isGuest, authRules.verifyOtp, validate, authController.verifyOtp);

router.get('/reset-password', isGuest, authController.showResetPassword);
router.post('/reset-password', isGuest, authRules.resetPassword, validate, authController.resetPassword);

module.exports = router;
