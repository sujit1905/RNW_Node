import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../model/user.model.js";
import config from "../config/config.js";

// ─── REGISTER ────────────────────────────────────────────────────────────────
/**
 * POST /auth/register
 * Creates a new user account after validating uniqueness and hashing the password.
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic server-side validation
    if (!username || !email || !password) {
      return res.render("auth/register", {
        error: "All fields are required.",
        title: "Register",
      });
    }

    if (password.length < 6) {
      return res.render("auth/register", {
        error: "Password must be at least 6 characters.",
        title: "Register",
      });
    }

    // Check if the username or email is already taken
    const existing = await userModel.findOne({ $or: [{ email }, { username }] });

    if (existing) {
      return res.render("auth/register", {
        error: "An account with this email or username already exists.",
        title: "Register",
      });
    }

    // Hash the password with bcrypt (cost factor 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    await userModel.create({ username, email, password: hashedPassword });

    // Redirect to login with a success flash message
    res.redirect("/auth/login?success=Account+created+successfully!+Please+sign+in.");
  } catch (err) {
    console.error("[Auth] Register error:", err.message);
    res.render("auth/register", {
      error: "Something went wrong. Please try again.",
      title: "Register",
    });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
/**
 * POST /auth/login
 * Verifies credentials and issues a signed JWT stored in an httpOnly cookie.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("auth/login", {
        error: "Email and password are required.",
        title: "Login",
        success: null,
      });
    }

    // Find user by email
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.render("auth/login", {
        error: "Invalid email or password.",
        title: "Login",
        success: null,
      });
    }

    // Compare plain-text password against stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("auth/login", {
        error: "Invalid email or password.",
        title: "Login",
        success: null,
      });
    }

    // Sign JWT — embed minimal, non-sensitive user data
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set token in an httpOnly cookie (not accessible from JS — XSS safe)
    res.cookie("token", token, {
      httpOnly: true,
      maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
      sameSite: "Lax",
    });

    // Redirect to home after successful login
    res.redirect("/");
  } catch (err) {
    console.error("[Auth] Login error:", err.message);
    res.render("auth/login", {
      error: "Something went wrong. Please try again.",
      title: "Login",
      success: null,
    });
  }
};

// ─── LOGOUT ──────────────────────────────────────────────────────────────────
/**
 * GET /auth/logout
 * Clears the JWT cookie and redirects to login.
 */
const logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/auth/login");
};

export { register, login, logout };
