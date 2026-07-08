import express from 'express';
import crypto from 'crypto';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @desc    Generate ImageKit upload authentication signature
 * @route   POST /api/upload/auth
 * @access  Private/Admin
 *
 * ImageKit secure upload flow:
 *  1. Frontend requests this endpoint (admin only)
 *  2. Backend signs the request with IMAGEKIT_PRIVATE_KEY
 *  3. Frontend uses the returned { token, expire, signature, publicKey }
 *     to upload directly to ImageKit's API
 *  4. ImageKit returns the final URL which gets stored in MongoDB
 */
router.post('/auth', protect, adminOnly, (req, res) => {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey  = process.env.IMAGEKIT_PUBLIC_KEY;

  if (!privateKey || !publicKey) {
    return res.status(500).json({
      message:
        'ImageKit keys not configured. Add IMAGEKIT_PRIVATE_KEY and IMAGEKIT_PUBLIC_KEY to backend/.env',
    });
  }

  // token = random string, expire = unix timestamp 30 min from now
  const token  = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 30 * 60; // 30 minutes

  // signature = HMAC-SHA1(token + expire, privateKey)
  const signature = crypto
    .createHmac('sha1', privateKey)
    .update(token + expire)
    .digest('hex');

  return res.json({ token, expire, signature, publicKey });
});

export default router;
