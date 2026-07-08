import jwt from "jsonwebtoken";
import config from "../config/config.js";

/**
 * HARD AUTH — redirects to /auth/login if no valid token found.
 * Use this on routes that absolutely require the user to be logged in.
 */
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.redirect("/auth/login");
  }

  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;           // attach decoded payload to request
    res.locals.user = decoded;    // make user available inside every EJS view
    next();
  } catch (err) {
    // Token is invalid or expired — clear it and force re-login
    res.clearCookie("token");
    return res.redirect("/auth/login");
  }
};

/**
 * SOFT AUTH — never redirects; just sets res.locals.user if a valid token exists.
 * Apply this globally so every view (even public ones) knows whether the user is logged in.
 */
const softAuth = (req, res, next) => {
  const token = req.cookies?.token;

  // Default: no user
  res.locals.user = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      req.user = decoded;
      res.locals.user = decoded;  // views read this to show/hide auth buttons
    } catch (err) {
      // Invalid token — silently clear it
      res.clearCookie("token");
    }
  }

  next();
};

export { verifyToken, softAuth };
