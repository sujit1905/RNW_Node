import express from 'express';
import crypto from 'crypto';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { sendEmail } from '../services/emailService.js';
import {
  buildCancellationRefundEmail,
  buildOrderPlacedEmail,
  buildPaymentSuccessEmail,
  buildStatusUpdateEmail,
} from '../services/orderEmailTemplates.js';

const router = express.Router();

const ADMIN_STATUSES = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];

const resolveOrderUser = async (order) => {
  if (order?.user?.email) return order.user;
  if (order?.user?._id) return User.findById(order.user._id).lean();
  return User.findById(order.user).lean();
};

const sendOrderEmailSafely = async ({ order, user, templateBuilder }) => {
  if (!user?.email) {
    console.warn(`[email] User email missing for order ${order?._id}`);
    return;
  }

  try {
    const { subject, html, text } = templateBuilder(order, user);
    await sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error(`[email] Failed to send email for order ${order?._id}:`, error.message);
  }
};

router.get('/admin', protect, adminOnly, async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    return res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!ADMIN_STATUSES.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status',
        details: `Must be one of: ${ADMIN_STATUSES.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const previousStatus = order.status;
    const statusChanged = previousStatus !== status;
    order.status = status;
    await order.save();

    const populated = await Order.findById(order._id).populate('user', 'name email phone').lean();

    res.json(populated);

    if (statusChanged) {
      resolveOrderUser(populated)
        .then((user) => {
          if (status === 'cancelled') {
            return sendOrderEmailSafely({
              order: populated,
              user,
              templateBuilder: buildCancellationRefundEmail,
            });
          }

          return sendOrderEmailSafely({
            order: populated,
            user,
            templateBuilder: (savedOrder, savedUser) =>
              buildStatusUpdateEmail(
                savedOrder,
                savedUser,
                previousStatus,
                status
              ),
          });
        })
        .catch((err) => {
          console.error('Background email failed:', err);
        });
    }

    return;
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/payment-status', protect, adminOnly, async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    if (!['pending', 'paid', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order is already paid and its status cannot be changed' });
    }

    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'paid') {
      order.paidAt = new Date();
    }
    await order.save();

    const populated = await Order.findById(order._id).populate('user', 'name email phone').lean();
    return res.json(populated);
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!items?.length) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    // Clean up any previous unpaid pending online orders for this user to prevent ghost orders
    await Order.deleteMany({
      user: req.user._id,
      paymentMethod: { $ne: 'cod' },
      paymentStatus: 'pending'
    });

    // Security check: require a phone number on user's profile
    if (!req.user.phone) {
      return res.status(400).json({ message: 'Please add a valid mobile number to your profile/account before placing an order.' });
    }

    // Enforce shipping phone matches user's registered profile phone
    if (shippingAddress?.phone !== req.user.phone) {
      return res.status(400).json({ message: 'For security reasons, the shipping phone number must match your registered account phone number.' });
    }

    const itemsPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingPrice = itemsPrice >= 999 ? 0 : 49;
    const totalPrice = itemsPrice + shippingPrice;

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    const populatedOrder = await Order.findById(order._id).populate('user', 'name email').lean();
    const user = await resolveOrderUser(populatedOrder);
    if (paymentMethod === 'cod') {
      sendOrderEmailSafely({
        order: populatedOrder,
        user,
        templateBuilder: buildOrderPlacedEmail,
      }).catch(console.error);
    }

    return res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

router.get('/my', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const query = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.json(order);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/pay', protect, async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If order payment method is NOT 'cod', we require signature verification.
    if (order.paymentMethod !== 'cod') {
      const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

      if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        return res.status(400).json({ message: 'Payment verification failed: Missing required payment fields' });
      }

      // Verify Razorpay signature using key_secret
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generated_signature !== razorpaySignature) {
        return res.status(400).json({ message: 'Payment verification failed: Invalid signature' });
      }

      // Save Razorpay details
      order.razorpayPaymentId = razorpayPaymentId;
      order.razorpayOrderId = razorpayOrderId;
      order.razorpaySignature = razorpaySignature;
    }

    order.paymentStatus = 'paid';
    order.paidAt = new Date();
    await order.save();

    const populatedOrder = await Order.findById(order._id).populate('user', 'name email').lean();
    const user = await resolveOrderUser(populatedOrder);
    
    // Send both Order Placed (confirmed) and Payment Success emails for online payments
    sendOrderEmailSafely({
      order: populatedOrder,
      user,
      templateBuilder: buildOrderPlacedEmail,
    }).catch(console.error);

    sendOrderEmailSafely({
      order: populatedOrder,
      user,
      templateBuilder: buildPaymentSuccessEmail,
    }).catch(console.error);

    return res.json(order);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Cannot delete a paid order' });
    }
    if (order.paymentMethod === 'cod') {
      return res.status(400).json({ message: 'Cannot delete a COD order' });
    }
    await Order.deleteOne({ _id: req.params.id });
    return res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
