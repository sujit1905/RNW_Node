const Category = require('../models/Category');
const { paginate, buildPagination } = require('../utils/helpers');

const PER_PAGE = 10;

// List categories with search and pagination
exports.index = async (req, res, next) => {
  try {
    const { search = '', page = 1 } = req.query;
    const filter = {};

    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Category.countDocuments(filter);
    const { currentPage, perPage, totalPages, skip } = paginate(page, PER_PAGE, total);

    const categories = await Category.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean();

    res.render('admin/categories/index', {
      title: 'Categories',
      categories,
      search,
      pagination: buildPagination('/admin/categories', currentPage, totalPages, { search })
    });
  } catch (error) {
    next(error);
  }
};

exports.showCreate = (req, res) => {
  res.render('admin/categories/create', { title: 'Add Category' });
};

// Save new category
exports.create = async (req, res, next) => {
  try {
    await Category.create(req.body);
    req.flash('success', 'Category created successfully');
    res.redirect('/admin/categories');
  } catch (error) {
    if (error.code === 11000) {
      req.flash('error', 'Category with this name already exists');
      return res.redirect('/admin/categories/create');
    }
    next(error);
  }
};

exports.showEdit = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect('/admin/categories');
    }

    res.render('admin/categories/edit', { title: 'Edit Category', category });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, req.body, { runValidators: true });
    req.flash('success', 'Category updated successfully');
    res.redirect('/admin/categories');
  } catch (error) {
    if (error.code === 11000) {
      req.flash('error', 'Category with this name already exists');
      return res.redirect(`/admin/categories/${req.params.id}/edit`);
    }
    next(error);
  }
};

exports.view = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect('/admin/categories');
    }

    res.render('admin/categories/view', { title: category.name, category });
  } catch (error) {
    next(error);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      req.flash('error', 'Category not found');
    } else {
      req.flash('success', 'Category deleted successfully');
    }
    res.redirect('/admin/categories');
  } catch (error) {
    next(error);
  }
};
