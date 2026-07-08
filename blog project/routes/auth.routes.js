const express = require('express');
const passport = require('passport');
const User = require('../models/user.model');

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
};

// Middleware to check if user is not authenticated
const isNotAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/blog');
};

// Register Page
router.get('/register', isNotAuthenticated, (req, res) => {
    res.render('auth/register', { title: 'Register' });
});

// Register POST
router.post('/register', isNotAuthenticated, async (req, res) => {
    try {
        const { username, email, password, confirmPassword, firstName, lastName } = req.body;

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            return res.render('auth/register', { 
                title: 'Register',
                error: 'All fields are required'
            });
        }

        if (password !== confirmPassword) {
            return res.render('auth/register', { 
                title: 'Register',
                error: 'Passwords do not match'
            });
        }

        if (password.length < 6) {
            return res.render('auth/register', { 
                title: 'Register',
                error: 'Password must be at least 6 characters'
            });
        }

        // Check if user already exists
        let user = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
        if (user) {
            return res.render('auth/register', { 
                title: 'Register',
                error: 'Email or username already exists'
            });
        }

        // Create new user
        user = new User({
            username,
            email: email.toLowerCase(),
            password,
            firstName: firstName || '',
            lastName: lastName || ''
        });

        await user.save();

        req.login(user, (err) => {
            if (err) {
                return res.render('auth/register', { 
                    title: 'Register',
                    error: 'Registration successful but login failed. Please login manually.'
                });
            }
            res.redirect('/blog');
        });
    } catch (err) {
        console.error(err);
        res.render('auth/register', { 
            title: 'Register',
            error: 'An error occurred during registration'
        });
    }
});

// Login Page
router.get('/login', isNotAuthenticated, (req, res) => {
    res.render('auth/login', { title: 'Login', message: req.flash() });
});

// Login POST
router.post('/login', isNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/blog',
    failureRedirect: '/auth/login',
    failureFlash: true
}));

// Logout
router.get('/logout', isAuthenticated, (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).send('Logout failed');
        }
        res.redirect('/auth/login');
    });
});

// Profile Page
router.get('/profile', isAuthenticated, (req, res) => {
    res.render('auth/profile', { title: 'My Profile', user: req.user });
});

// Update Profile
router.post('/profile/update', isAuthenticated, async (req, res) => {
    try {
        const { firstName, lastName, bio } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { firstName, lastName, bio, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        res.render('auth/profile', { 
            title: 'My Profile',
            user,
            success: 'Profile updated successfully!'
        });
    } catch (err) {
        console.error(err);
        res.render('auth/profile', { 
            title: 'My Profile',
            user: req.user,
            error: 'Failed to update profile'
        });
    }
});

module.exports = router;
