import express from "express";
import { index, renderCreateForm, createBlog, showBlog } from "../controller/blog.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const blogRoute = express.Router();

blogRoute.get("/", index);
blogRoute.get("/blog/new", verifyToken, renderCreateForm);
blogRoute.post("/blog", verifyToken, createBlog);
blogRoute.get("/blog/:id", showBlog);

export default blogRoute;
