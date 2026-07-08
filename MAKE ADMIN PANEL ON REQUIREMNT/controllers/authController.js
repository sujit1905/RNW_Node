const passport = require('passport');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendMail } = require('../config/mailer');
const { generateOTP } = require('../utils/helpers');

// Render login page
exports.showLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Sign In',
    layout: 'layouts/auth'
  });
};

// Render signup page
exports.showSignup = (req, res) => {
  res.render('auth/signup', {
    title: 'Create Account',
    layout: 'layouts/auth'
  });
};

// Register new user
exports.signup = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    const user = new User({ fullName, email });
    const registeredUser = await User.register(user, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash('success', 'Welcome aboard! Your account has been created.');
      res.redirect('/admin/dashboard');
    });
  } catch (error) {
    req.flash('error', error.message);
    res.redirect('/auth/signup');
  }
};

// Authenticate user
exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      req.flash('error', info?.message || 'Invalid credentials');
      return res.redirect('/auth/login');
    }

    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      req.flash('success', `Welcome back, ${user.fullName.split(' ')[0]}!`);
      res.redirect('/admin/dashboard');
    });
  })(req, res, next);
};

// Destroy session
exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'You have been logged out successfully.');
    res.redirect('/auth/login');
  });
};

// Forgot password form
exports.showForgotPassword = (req, res) => {
  res.render('auth/forgot-password', {
    title: 'Forgot Password',
    layout: 'layouts/auth'
  });
};

// Generate and send OTP
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      req.flash('error', 'No account found with this email');
      return res.redirect('/auth/forgot-password');
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.deleteMany({ email });
    await OTP.create({ email, otp, expiresAt });

    await sendMail({
      to: email,
      subject: 'Password Reset OTP — NexVault Admin',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f1117;color:#e2e8f0;border-radius:12px;">
          <h2 style="color:#818cf8;margin:0 0 16px;">Password Reset</h2>
          <p style="color:#94a3b8;line-height:1.6;">Use the OTP below to reset your password. It expires in 10 minutes.</p>
          <div style="background:#1e2130;padding:20px;border-radius:8px;text-align:center;margin:24px 0;">
            <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#818cf8;">${otp}</span>
          </div>
          <p style="color:#64748b;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    });

    req.flash('success', 'OTP sent to your email address');
    res.redirect(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
  } catch (error) {
    console.error('OTP send error:', error.message);
    req.flash('error', 'Failed to send OTP. Check your email configuration.');
    res.redirect('/auth/forgot-password');
  }
};

// OTP verification form
exports.showVerifyOtp = (req, res) => {
  res.render('auth/verify-otp', {
    title: 'Verify OTP',
    layout: 'layouts/auth',
    email: req.query.email || ''
  });
};

// Verify OTP code
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await OTP.findOne({ email, otp, verified: false });

    if (!record || record.expiresAt < new Date()) {
      req.flash('error', 'Invalid or expired OTP');
      return res.redirect(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
    }

    record.verified = true;
    await record.save();

    req.flash('success', 'OTP verified. Set your new password.');
    res.redirect(`/auth/reset-password?email=${encodeURIComponent(email)}`);
  } catch (error) {
    req.flash('error', 'Verification failed. Please try again.');
    res.redirect('/auth/forgot-password');
  }
};

// Reset password form
exports.showResetPassword = async (req, res) => {
  const { email } = req.query;
  const verified = await OTP.findOne({ email, verified: true });

  if (!verified) {
    req.flash('error', 'Please verify OTP first');
    return res.redirect('/auth/forgot-password');
  }

  res.render('auth/reset-password', {
    title: 'Reset Password',
    layout: 'layouts/auth',
    email
  });
};

// Update password after OTP verification
exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const verified = await OTP.findOne({ email, verified: true });
    if (!verified) {
      req.flash('error', 'OTP verification required');
      return res.redirect('/auth/forgot-password');
    }

    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/auth/login');
    }

    await user.setPassword(password);
    await user.save();
    await OTP.deleteMany({ email });

    req.flash('success', 'Password updated. You can now sign in.');
    res.redirect('/auth/login');
  } catch (error) {
    req.flash('error', error.message);
    res.redirect('/auth/reset-password');
  }
};
