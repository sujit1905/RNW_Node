const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /admin/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.render('admin/categories/index', {
      title: 'Manage Categories',
      categories
    });
  } catch (error) {
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/dashboard');
  }
};

// @desc    Show add category form
// @route   GET /admin/categories/add
exports.getAddCategory = (req, res) => {
  res.render('admin/categories/add', { title: 'Add Category' });
};

// @desc    Add category
// @route   POST /admin/categories
exports.addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      req.flash('error_msg', 'Please add a category name');
      return res.redirect('/admin/categories/add');
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      req.flash('error_msg', 'Category already exists');
      return res.redirect('/admin/categories/add');
    }

    await Category.create({ name, description });
    req.flash('success_msg', 'Category added successfully');
    res.redirect('/admin/categories');
  } catch (error) {
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/categories');
  }
};

// @desc    Show edit category form
// @route   GET /admin/categories/edit/:id
exports.getEditCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      req.flash('error_msg', 'Category not found');
      return res.redirect('/admin/categories');
    }
    res.render('admin/categories/edit', {
      title: 'Edit Category',
      category
    });
  } catch (error) {
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/categories');
  }
};

// @desc    Update category
// @route   PUT /admin/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      req.flash('error_msg', 'Category not found');
      return res.redirect('/admin/categories');
    }

    // Check if new name exists in another category
    const categoryExists = await Category.findOne({ name, _id: { $ne: req.params.id } });
    if (categoryExists) {
      req.flash('error_msg', 'Category name already exists');
      return res.redirect(`/admin/categories/edit/${req.params.id}`);
    }

    category.name = name;
    category.description = description;
    await category.save();

    req.flash('success_msg', 'Category updated successfully');
    res.redirect('/admin/categories');
  } catch (error) {
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/categories');
  }
};

// @desc    Delete category
// @route   DELETE /admin/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    // Note: In a real app, check if there are books using this category first
    await Category.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Category deleted successfully');
    res.redirect('/admin/categories');
  } catch (error) {
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/categories');
  }
};
