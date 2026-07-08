import express from "express";
import { login, register, logout } from "../controller/auth.controller.js";

const authRoute = express.Router();

// Render pages
authRoute.get("/login", (req, res) => res.render("auth/login", { title: "Login", error: null, success: req.query.success }));
authRoute.get("/register", (req, res) => res.render("auth/register", { title: "Register", error: null }));

// Handle form submissions
authRoute.post("/login", login);
authRoute.post("/register", register);
authRoute.get("/logout", logout);

export default authRoute;
