const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');
const { paginate, buildPagination } = require('../utils/helpers');

const PER_PAGE = 10;

exports.index = async (req, res, next) => {
  try {
    const { search = '', page = 1, category: catFilter = '' } = req.query;
    const filter = {};

    if (search.trim()) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (catFilter) {
      filter.category = catFilter;
    }

    const total = await Subcategory.countDocuments(filter);
    const { currentPage, perPage, totalPages, skip } = paginate(page, PER_PAGE, total);

    const [subcategories, categories] = await Promise.all([
      Subcategory.find(filter)
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),
      Category.find({ isActive: true }).sort({ name: 1 }).lean()
    ]);

    res.render('admin/subcategories/index', {
      title: 'Subcategories',
      subcategories,
      categories,
      search,
      catFilter,
      pagination: buildPagination('/admin/subcategories', currentPage, totalPages, { search, category: catFilter })
    });
  } catch (error) {
    next(error);
  }
};

exports.showCreate = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    res.render('admin/subcategories/create', { title: 'Add Subcategory', categories });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    await Subcategory.create(req.body);
    req.flash('success', 'Subcategory created successfully');
    res.redirect('/admin/subcategories');
  } catch (error) {
    if (error.code === 11000) {
      req.flash('error', 'Subcategory already exists under this category');
      return res.redirect('/admin/subcategories/create');
    }
    next(error);
  }
};

exports.showEdit = async (req, res, next) => {
  try {
    const [subcategory, categories] = await Promise.all([
      Subcategory.findById(req.params.id),
      Category.find({ isActive: true }).sort({ name: 1 }).lean()
    ]);

    if (!subcategory) {
      req.flash('error', 'Subcategory not found');
      return res.redirect('/admin/subcategories');
    }

    res.render('admin/subcategories/edit', { title: 'Edit Subcategory', subcategory, categories });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    await Subcategory.findByIdAndUpdate(req.params.id, req.body, { runValidators: true });
    req.flash('success', 'Subcategory updated successfully');
    res.redirect('/admin/subcategories');
  } catch (error) {
    if (error.code === 11000) {
      req.flash('error', 'Subcategory already exists under this category');
      return res.redirect(`/admin/subcategories/${req.params.id}/edit`);
    }
    next(error);
  }
};

exports.view = async (req, res, next) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id).populate('category').lean();
    if (!subcategory) {
      req.flash('error', 'Subcategory not found');
      return res.redirect('/admin/subcategories');
    }

    res.render('admin/subcategories/view', { title: subcategory.name, subcategory });
  } catch (error) {
    next(error);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
    if (!subcategory) {
      req.flash('error', 'Subcategory not found');
    } else {
      req.flash('success', 'Subcategory deleted successfully');
    }
    res.redirect('/admin/subcategories');
  } catch (error) {
    next(error);
  }
};

// API endpoint for cascading dropdowns
exports.byCategory = async (req, res, next) => {
  try {
    const subcategories = await Subcategory.find({ category: req.params.categoryId, isActive: true })
      .sort({ name: 1 })
      .select('name')
      .lean();

    res.json(subcategories);
  } catch (error) {
    next(error);
  }
};
