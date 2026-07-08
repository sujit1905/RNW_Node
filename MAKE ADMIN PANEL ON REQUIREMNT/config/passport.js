const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

// Configure Passport authentication with the local strategy.
module.exports = (passport) => {
  passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));

  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
};
