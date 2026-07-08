// Allow only signed-in users to access protected admin pages.
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  req.flash('error', 'Please login to continue');
  res.redirect('/auth/login');
};

// Redirect logged-in users away from auth pages
const isGuest = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }

  res.redirect('/admin/dashboard');
};

module.exports = { isAuthenticated, isGuest };
