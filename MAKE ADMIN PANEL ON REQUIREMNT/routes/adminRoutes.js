const express = require('express');
const router = express.Router();

// Protected admin routes for dashboard and profile management.
const dashboardController = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middlewares/auth');
const { upload, handleUploadError } = require('../middlewares/upload');
const { validate } = require('../middlewares/validate');
const { authRules } = require('../middlewares/rules');

router.use(isAuthenticated);

router.get('/dashboard', dashboardController.dashboard);
router.get('/profile', dashboardController.showProfile);
router.post('/profile', upload.single('avatar'), handleUploadError, authRules.profile, validate, dashboardController.updateProfile);
router.post('/change-password', authRules.changePassword, validate, dashboardController.changePassword);

module.exports = router;
