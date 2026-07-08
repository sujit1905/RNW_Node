const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const path = require('path');
require('dotenv').config();

const app = express();
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const blogRoutes = require('./routes/blog.routes');
const User = require('./models/user.model');

// Connect to Database
connectDB();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongoUrl: process.env.MONGODB_URI || 'mongodb+srv://sujit:sujit123@backend.b4a3mgm.mongodb.net/blogproject'
    }),
    cookie: { 
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
}));

// Flash messages middleware
app.use(flash());

// Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        console.log(`[Auth Strategy] Login attempt received for email: "${email}"`);
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            console.log(`[Auth Strategy] Fail: No user found with email: "${email}"`);
            return done(null, false, { message: 'User not found' });
        }
        
        console.log(`[Auth Strategy] User found: "${user.username}". Comparing password...`);
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log(`[Auth Strategy] Fail: Incorrect password for user: "${user.username}"`);
            return done(null, false, { message: 'Incorrect password' });
        }
        
        console.log(`[Auth Strategy] Success: Logged in user: "${user.username}" (ID: ${user._id})`);
        return done(null, user);
    } catch (err) {
        console.error(`[Auth Strategy] Error encountered during login flow:`, err);
        return done(err);
    }
}));

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Cache control middleware
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// View Engine Setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

// Make user and flash messages available in all views
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/blog', blogRoutes);
app.get('/', (req, res) => {
    res.redirect('/blog');
});

// 404 Error Handler
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        title: 'Error', 
        message: err.message 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✓ Server is running on http://localhost:${PORT}`);
});