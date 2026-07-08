const { validationResult } = require('express-validator');

// Check for validation errors after request body checks run.
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => e.msg).join('. ');
    req.flash('error', message);
    return res.redirect('back');
  }

  next();
};

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { validate, catchAsync };
