import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import mongoConnect from "./config/db.js";
import blogRoute from "./router/blog.route.js";
import authRoute from "./router/auth.route.js";
import { softAuth } from "./middleware/auth.middleware.js";

mongoConnect();

const app = express();

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.resolve("view")); // Using the existing 'view' folder

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.resolve("public")));

// Global soft auth to expose user to all views
app.use(softAuth);

// Routes
app.use("/auth", authRoute);
app.use("/", blogRoute);

export default app;
