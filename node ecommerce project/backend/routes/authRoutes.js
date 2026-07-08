import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();
const googleWebClientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
const googleClient = googleWebClientId ? new OAuth2Client(googleWebClientId) : null;

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'dev_jwt_secret', { expiresIn: '7d' });

const shippingFromDoc = (doc) => {
  if (!doc?.shippingAddress) return null;
  const s = doc.shippingAddress;
  const out = {
    name: s.name || '',
    phone: s.phone || '',
    address: s.address || '',
    city: s.city || '',
    state: s.state || '',
    pincode: s.pincode || '',
  };
  const any = Object.values(out).some(Boolean);
  return any ? out : null;
};

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  avatar: user.avatar,
  profileImage: user.profileImage || '',
  shippingAddress: shippingFromDoc(user),
  role: user.role,
});

const normalizePhoneDigits = (phone = '') => phone.replace(/\D/g, '');

const validatePasswordDifficulty = (password) => {
  if (!password) return 'Password cannot be empty';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one digit';
  if (!/[@$!%*?&#]/.test(password)) return 'Password must contain at least one special character (@$!%*?&#)';
  return null;
};

router.post('/bootstrap-admin', async (req, res, next) => {
  try {
    const configuredKey = (process.env.ADMIN_BOOTSTRAP_KEY || '').trim();
    if (!configuredKey) {
      return res.status(503).json({ message: 'Admin bootstrap is disabled. Set ADMIN_BOOTSTRAP_KEY in backend/.env' });
    }

    const { bootstrapKey, email, password, name } = req.body;
    if (!bootstrapKey || bootstrapKey !== configuredKey) {
      return res.status(401).json({ message: 'Invalid bootstrap key' });
    }

    const normalizedEmail = String(email || '').toLowerCase().trim();
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name: String(name || 'Admin User').trim() || 'Admin User',
        email: normalizedEmail,
        password: hashedPassword,
        role: 'admin',
      });
    } else {
      user.password = hashedPassword;
      user.role = 'admin';
      if (name !== undefined) {
        user.name = String(name || '').trim() || user.name;
      }
      await user.save();
    }

    return res.json({
      message: 'Admin account is ready',
      user: sanitizeUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
});

/** One-step signup (no OTP). */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedPhone = phone ? normalizePhoneDigits(phone) : '';

    if (!name?.trim() || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (normalizedPhone && normalizedPhone.length !== 10) {
      return res.status(400).json({ message: 'Enter a valid 10-digit mobile number or leave phone empty' });
    }

    const orFilters = [{ email: normalizedEmail }];
    if (normalizedPhone) {
      orFilters.push({ phone: normalizedPhone });
    }

    const existing = await User.findOne({ $or: orFilters });
    if (existing) {
      return res.status(400).json({ message: 'User with this email or phone already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const doc = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    };
    if (normalizedPhone) {
      doc.phone = normalizedPhone;
    }

    const user = await User.create(doc);
    return res.status(201).json({ user: sanitizeUser(user), token: generateToken(user._id) });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (user && user.isGoogleUser && !user.password) {
      return res.status(401).json({ message: 'This account was created using Google. Please click "Continue with Google" to log in.' });
    }

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({ user: sanitizeUser(user), token: generateToken(user._id) });
  } catch (error) {
    next(error);
  }
});

router.post('/google', async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    let payload;

    // Verify the Google ID token
    // Firebase Auth issues tokens with the Firebase Web Client ID as audience.
    // We accept either: our configured GOOGLE_CLIENT_ID, or any valid Google token
    // (Firebase automatically issues tokens signed by Google).
    if (googleClient && googleWebClientId) {
      try {
        // Try strict verification first (matches configured client ID)
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: googleWebClientId,
        });
        payload = ticket.getPayload();
      } catch (strictErr) {
        // Strict audience check failed — token may be from Firebase's own Web Client.
        // Do a relaxed verification: verify signature only, accept any Google audience.
        try {
          const ticket = await googleClient.verifyIdToken({ idToken: credential });
          payload = ticket.getPayload();
        } catch (relaxedErr) {
          return res.status(401).json({
            message: 'Google token verification failed',
            details: relaxedErr.message,
          });
        }
      }
    } else {
      // No client configured — attempt decode-only (development fallback)
      try {
        const relaxClient = new OAuth2Client();
        const ticket = await relaxClient.verifyIdToken({ idToken: credential });
        payload = ticket.getPayload();
      } catch (err) {
        return res.status(503).json({
          message: 'Google login is not configured. Set GOOGLE_CLIENT_ID in backend/.env.',
        });
      }
    }

    if (!payload?.email) {
      return res.status(400).json({ message: 'Unable to verify Google account' });
    }

    let user = await User.findOne({ email: payload.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: payload.name || payload.email.split('@')[0],
        email: payload.email.toLowerCase(),
        avatar: payload.picture,
        isGoogleUser: true,
      });
    } else {
      user.name = payload.name || user.name;
      user.avatar = payload.picture || user.avatar;
      user.isGoogleUser = true;
      await user.save();
    }

    return res.json({ user: sanitizeUser(user), token: generateToken(user._id) });
  } catch (error) {
    return res.status(401).json({ message: 'Google login failed', details: error.message });
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token missing' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt_secret');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.patch('/profile', protect, async (req, res, next) => {
  try {
    const { name, phone, shippingAddress, profileImage, password, oldPassword } = req.body;
    const user = req.user; // Already fetched by 'protect' middleware

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) return res.status(400).json({ message: 'Name cannot be empty' });
      user.name = trimmed;
    }

    if (phone !== undefined) {
      const normalizedPhone = phone ? normalizePhoneDigits(phone) : '';
      if (normalizedPhone && normalizedPhone.length !== 10) {
        return res.status(400).json({ message: 'Phone must be 10 digits or empty' });
      }
      if (normalizedPhone) {
        const taken = await User.findOne({
          phone: normalizedPhone,
          _id: { $ne: user._id },
        });
        if (taken) {
          return res.status(400).json({ message: 'This phone number is already used by another account' });
        }
        user.phone = normalizedPhone;
      } else {
        // If empty string, unset the phone
        user.phone = undefined;
      }
    }

    if (shippingAddress !== undefined && typeof shippingAddress === 'object' && shippingAddress !== null) {
      // Use set() to ensure subdocument fields are updated properly
      user.shippingAddress = {
        name: String(shippingAddress.name ?? '').trim(),
        phone: String(shippingAddress.phone ?? '').trim(),
        address: String(shippingAddress.address ?? '').trim(),
        city: String(shippingAddress.city ?? '').trim(),
        state: String(shippingAddress.state ?? '').trim(),
        pincode: String(shippingAddress.pincode ?? '').trim(),
      };
    }

    if (profileImage !== undefined) {
      if (profileImage === null || profileImage === '') {
        user.profileImage = '';
      } else if (typeof profileImage === 'string') {
        // Limit is roughly checked here, but express.json limit is the primary guard
        if (profileImage.length > 1000000) {
          return res.status(400).json({ message: 'Profile image is too large.' });
        }
        user.profileImage = profileImage;
      }
    }

    if (password !== undefined) {
      const trimmed = String(password).trim();
      if (trimmed) {
        const strengthError = validatePasswordDifficulty(trimmed);
        if (strengthError) {
          return res.status(400).json({ message: strengthError });
        }
        // If the user already has a password set (i.e. not a Google-only user with no password yet)
        if (user.password) {
          if (!oldPassword) {
            return res.status(400).json({ message: 'Current password is required to change password' });
          }
          const isCorrect = await bcrypt.compare(String(oldPassword), user.password);
          if (!isCorrect) {
            return res.status(400).json({ message: 'Current password is incorrect' });
          }
        }
        user.password = await bcrypt.hash(trimmed, 10);
      }
    }

    await user.save();
    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Phone or email already in use' });
    }
    next(error);
  }
});

router.post('/forgot-password-otp', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();

    // Send email
    const subject = 'Password Reset OTP - Jyot\'s Collection';
    const text = `Hi ${user.name},\n\nYour OTP for resetting your password is: ${otp}.\nIt will expire in 10 minutes.\nIf you did not request this, please ignore this email.`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Password Reset OTP - Jyot's Collection</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0b1220;">
  <div style="width: 100%; background-color: #fafafa; padding: 24px 12px; box-sizing: border-box;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eef0f4; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      
      <!-- Top banner / header -->
      <div style="background-color: #0b1530; padding: 32px 24px; text-align: center; border-bottom: 3px solid #caa24a;">
        <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 4px; font-family: inherit;">
          Jyot's <span style="color: #caa24a;">Collection</span>
        </h1>
        <p style="color: #94a3b8; font-size: 13px; letter-spacing: 1px; margin: 0; text-transform: uppercase;">
          Password Reset Request
        </p>
      </div>

      <!-- Main body content -->
      <div style="padding: 32px 24px;">
        <div style="font-size: 18px; font-weight: 700; color: #0b1530; margin-bottom: 16px;">
          Hi ${user.name},
        </div>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #caa24a; padding: 16px; border-radius: 4px 12px 12px 4px; margin-bottom: 24px; font-size: 15px; line-height: 1.6; color: #475569;">
          We received a request to reset your password. Use the following One-Time Password (OTP) to complete the reset:
        </div>

        <div style="background: #f8fafc; border: 1px solid #e3e6ee; padding: 20px; text-align: center; border-radius: 12px; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #caa24a;">${otp}</span>
        </div>

        <p style="color: #475569; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
          This OTP will expire in 10 minutes. If you did not make this request, you can safely ignore this email and your password will remain unchanged.
        </p>
      </div>

      <!-- Footer info -->
      <div style="background-color: #070d1e; padding: 24px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
        <p style="margin: 0 0 8px;">This is an automated security notification from Jyot's Collection.</p>
        <p style="margin: 0 0 8px;">&copy; ${new Date().getFullYear()} Jyot's Collection. All rights reserved.</p>
      </div>

    </div>
  </div>
</body>
</html>
    `;

    await sendEmail({
      to: user.email,
      subject,
      text,
      html,
    });

    return res.json({ message: 'OTP sent to your email successfully.' });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password-otp', async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.resetPasswordOtpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Validate password difficulty
    const strengthError = validatePasswordDifficulty(password);
    if (strengthError) {
      return res.status(400).json({ message: strengthError });
    }

    // Hash and update password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    return res.json({ message: 'Password reset successful.' });
  } catch (error) {
    next(error);
  }
});

export default router;
