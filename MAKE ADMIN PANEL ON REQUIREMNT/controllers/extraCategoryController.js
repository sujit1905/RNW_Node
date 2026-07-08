const ExtraCategory = require('../models/ExtraCategory');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const { paginate, buildPagination } = require('../utils/helpers');

const PER_PAGE = 10;

exports.index = async (req, res, next) => {
  try {
    const { search = '', page = 1 } = req.query;
    const filter = {};

    if (search.trim()) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const total = await ExtraCategory.countDocuments(filter);
    const { currentPage, perPage, totalPages, skip } = paginate(page, PER_PAGE, total);

    const items = await ExtraCategory.find(filter)
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean();

    res.render('admin/extra-categories/index', {
      title: 'Extra Categories',
      items,
      search,
      pagination: buildPagination('/admin/extra-categories', currentPage, totalPages, { search })
    });
  } catch (error) {
    next(error);
  }
};

exports.showCreate = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    res.render('admin/extra-categories/create', {
      title: 'Add Extra Category',
      categories,
      subcategories: []
    });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    await ExtraCategory.create(req.body);
    req.flash('success', 'Extra category created successfully');
    res.redirect('/admin/extra-categories');
  } catch (error) {
    if (error.code === 11000) {
      req.flash('error', 'Extra category already exists under this subcategory');
      return res.redirect('/admin/extra-categories/create');
    }
    next(error);
  }
};

exports.showEdit = async (req, res, next) => {
  try {
    const [item, categories] = await Promise.all([
      ExtraCategory.findById(req.params.id),
      Category.find({ isActive: true }).sort({ name: 1 }).lean()
    ]);

    if (!item) {
      req.flash('error', 'Extra category not found');
      return res.redirect('/admin/extra-categories');
    }

    const subcategories = await Subcategory.find({ category: item.category }).sort({ name: 1 }).lean();

    res.render('admin/extra-categories/edit', {
      title: 'Edit Extra Category',
      item,
      categories,
      subcategories
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    await ExtraCategory.findByIdAndUpdate(req.params.id, req.body, { runValidators: true });
    req.flash('success', 'Extra category updated successfully');
    res.redirect('/admin/extra-categories');
  } catch (error) {
    if (error.code === 11000) {
      req.flash('error', 'Extra category already exists under this subcategory');
      return res.redirect(`/admin/extra-categories/${req.params.id}/edit`);
    }
    next(error);
  }
};

exports.view = async (req, res, next) => {
  try {
    const item = await ExtraCategory.findById(req.params.id)
      .populate('category')
      .populate('subcategory')
      .lean();

    if (!item) {
      req.flash('error', 'Extra category not found');
      return res.redirect('/admin/extra-categories');
    }

    res.render('admin/extra-categories/view', { title: item.name, item });
  } catch (error) {
    next(error);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const item = await ExtraCategory.findByIdAndDelete(req.params.id);
    if (!item) {
      req.flash('error', 'Extra category not found');
    } else {
      req.flash('success', 'Extra category deleted successfully');
    }
    res.redirect('/admin/extra-categories');
  } catch (error) {
    next(error);
  }
};

exports.bySubcategory = async (req, res, next) => {
  try {
    const items = await ExtraCategory.find({ subcategory: req.params.subcategoryId, isActive: true })
      .sort({ name: 1 })
      .select('name')
      .lean();

    res.json(items);
  } catch (error) {
    next(error);
  }
};
