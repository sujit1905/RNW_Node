const { body } = require('express-validator');

// Define validation rules for authentication and CRUD forms.
const authRules = {
  signup: [
    body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 80 }),
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((val, { req }) => {
      if (val !== req.body.password) throw new Error('Passwords do not match');
      return true;
    })
  ],
  login: [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  forgotPassword: [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail()
  ],
  verifyOtp: [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ],
  resetPassword: [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((val, { req }) => {
      if (val !== req.body.password) throw new Error('Passwords do not match');
      return true;
    })
  ],
  changePassword: [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    body('confirmPassword').custom((val, { req }) => {
      if (val !== req.body.newPassword) throw new Error('Passwords do not match');
      return true;
    })
  ],
  profile: [
    body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 80 }),
    body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 20 })
  ]
};

const categoryRules = {
  create: [
    body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 100 }),
    body('description').optional({ checkFalsy: true }).trim().isLength({ max: 500 })
  ],
  update: [
    body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 100 }),
    body('description').optional({ checkFalsy: true }).trim().isLength({ max: 500 })
  ]
};

const subcategoryRules = {
  create: [
    body('name').trim().notEmpty().withMessage('Subcategory name is required').isLength({ max: 100 }),
    body('category').notEmpty().withMessage('Category is required'),
    body('description').optional({ checkFalsy: true }).trim().isLength({ max: 500 })
  ],
  update: [
    body('name').trim().notEmpty().withMessage('Subcategory name is required').isLength({ max: 100 }),
    body('category').notEmpty().withMessage('Category is required'),
    body('description').optional({ checkFalsy: true }).trim().isLength({ max: 500 })
  ]
};

const extraCategoryRules = {
  create: [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('category').notEmpty().withMessage('Category is required'),
    body('subcategory').notEmpty().withMessage('Subcategory is required'),
    body('description').optional({ checkFalsy: true }).trim().isLength({ max: 500 })
  ],
  update: [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('category').notEmpty().withMessage('Category is required'),
    body('subcategory').notEmpty().withMessage('Subcategory is required'),
    body('description').optional({ checkFalsy: true }).trim().isLength({ max: 500 })
  ]
};

const productRules = {
  create: [
    body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 150 }),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('stock').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Stock must be a positive number'),
    body('category').notEmpty().withMessage('Category is required'),
    body('subcategory').notEmpty().withMessage('Subcategory is required'),
    body('extraCategory').notEmpty().withMessage('Extra category is required'),
    body('description').optional({ checkFalsy: true }).trim().isLength({ max: 2000 })
  ],
  update: [
    body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 150 }),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('stock').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Stock must be a positive number'),
    body('category').notEmpty().withMessage('Category is required'),
    body('subcategory').notEmpty().withMessage('Subcategory is required'),
    body('extraCategory').notEmpty().withMessage('Extra category is required'),
    body('description').optional({ checkFalsy: true }).trim().isLength({ max: 2000 })
  ]
};

module.exports = {
  authRules,
  categoryRules,
  subcategoryRules,
  extraCategoryRules,
  productRules
};
