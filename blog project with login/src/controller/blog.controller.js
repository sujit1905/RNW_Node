import blogModel from "../model/blog.model.js";

// GET / - Home page showing all blogs
export const index = async (req, res) => {
  try {
    const blogs = await blogModel.find().sort({ _id: -1 });
    res.render("index", { title: "Home", blogs });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

// GET /blog/new - Form to create a new blog
export const renderCreateForm = (req, res) => {
  res.render("blog/create", { title: "Create Blog", error: null });
};

// POST /blog - Create new blog
export const createBlog = async (req, res) => {
  try {
    const { title, content, category, images } = req.body;

    if (!title || !content || !category) {
      return res.render("blog/create", { title: "Create Blog", error: "Please fill all required fields." });
    }

    const payload = { title, content, category };
    if (images && images.trim() !== "") {
        payload.images = images;
    }

    await blogModel.create(payload);
    res.redirect("/");
  } catch (error) {
    res.render("blog/create", { title: "Create Blog", error: "Error creating blog or duplicate title/content." });
  }
};

// GET /blog/:id - Show single blog
export const showBlog = async (req, res) => {
  try {
    const blog = await blogModel.findById(req.params.id);
    if (!blog) {
      return res.status(404).render("error", { title: "Not Found", message: "Blog not found" });
    }
    res.render("blog/show", { title: blog.title, blog });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};
