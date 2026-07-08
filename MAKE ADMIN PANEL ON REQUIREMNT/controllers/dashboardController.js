const User = require('../models/User');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const ExtraCategory = require('../models/ExtraCategory');
const Product = require('../models/Product');
const { deleteFile } = require('../utils/helpers');

// Dashboard overview with stats
exports.dashboard = async (req, res, next) => {
  try {
    const [categories, subcategories, extraCategories, products, users, recentProducts, recentUsers] =
      await Promise.all([
        Category.countDocuments(),
        Subcategory.countDocuments(),
        ExtraCategory.countDocuments(),
        Product.countDocuments(),
        User.countDocuments(),
        Product.find()
          .populate('category subcategory extraCategory')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        User.find().sort({ createdAt: -1 }).limit(5).select('fullName email createdAt').lean()
      ]);

    const lowStock = await Product.countDocuments({ stock: { $lte: 5 } });

    res.render('admin/dashboard', {
      title: 'Dashboard',
      stats: { categories, subcategories, extraCategories, products, users, lowStock },
      recentProducts,
      recentUsers
    });
  } catch (error) {
    next(error);
  }
};

// Profile page
exports.showProfile = (req, res) => {
  res.render('admin/profile', {
    title: 'My Profile',
    profile: req.user
  });
};

// Update profile details
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;
    const user = await User.findById(req.user._id);

    user.fullName = fullName;
    user.phone = phone || '';

    if (req.file) {
      if (user.avatar) deleteFile(user.avatar);
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();
    req.flash('success', 'Profile updated successfully');
    res.redirect('/admin/profile');
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isValid = await user.authenticate(currentPassword);

    if (!isValid.user) {
      req.flash('error', 'Current password is incorrect');
      return res.redirect('/admin/profile');
    }

    await user.setPassword(newPassword);
    await user.save();

    req.flash('success', 'Password changed successfully');
    res.redirect('/admin/profile');
  } catch (error) {
    next(error);
  }
};
