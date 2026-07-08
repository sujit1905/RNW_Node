// Load environment variables before the app starts.
require('dotenv').config();

// Import core packages for the Express admin application.
const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

const connectDB = require('./config/db');
const configurePassport = require('./config/passport');
const { notFound, errorHandler } = require('./middlewares/error');
const { isAuthenticated } = require('./middlewares/auth');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subcategoryRoutes = require('./routes/subcategoryRoutes');
const extraCategoryRoutes = require('./routes/extraCategoryRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();
configurePassport(passport);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/admin');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'nexvault_dev_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 14 * 24 * 60 * 60
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global template variables
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user || null;
  res.locals.currentPath = req.path;
  res.locals.appName = 'NexVault';
  next();
});

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/admin/dashboard');
  }
  res.redirect('/auth/login');
});

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/categories', isAuthenticated, categoryRoutes);
app.use('/admin/subcategories', isAuthenticated, subcategoryRoutes);
app.use('/admin/extra-categories', isAuthenticated, extraCategoryRoutes);
app.use('/admin/products', isAuthenticated, productRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`NexVault Admin running at ${process.env.APP_URL || `http://localhost:${PORT}`}`);
});
