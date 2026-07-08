const Product = require('../models/Product');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const ExtraCategory = require('../models/ExtraCategory');
const { paginate, buildPagination, deleteFile } = require('../utils/helpers');

const PER_PAGE = 10;

exports.index = async (req, res, next) => {
  try {
    const { search = '', page = 1, sort = 'newest' } = req.query;
    const filter = {};

    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name: { name: 1 }
    };

    const total = await Product.countDocuments(filter);
    const { currentPage, perPage, totalPages, skip } = paginate(page, PER_PAGE, total);

    const products = await Product.find(filter)
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .populate('extraCategory', 'name')
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip)
      .limit(perPage)
      .lean();

    res.render('admin/products/index', {
      title: 'Products',
      products,
      search,
      sort,
      pagination: buildPagination('/admin/products', currentPage, totalPages, { search, sort })
    });
  } catch (error) {
    next(error);
  }
};

exports.showCreate = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    res.render('admin/products/create', {
      title: 'Add Product',
      categories,
      subcategories: [],
      extraCategories: []
    });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };

    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    }

    data.price = parseFloat(data.price);
    data.stock = parseInt(data.stock, 10) || 0;

    await Product.create(data);
    req.flash('success', 'Product created successfully');
    res.redirect('/admin/products');
  } catch (error) {
    if (req.file) deleteFile(`/uploads/${req.file.filename}`);
    if (error.code === 11000) {
      req.flash('error', 'Product with this SKU already exists');
      return res.redirect('/admin/products/create');
    }
    next(error);
  }
};

exports.showEdit = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/admin/products');
    }

    const [categories, subcategories, extraCategories] = await Promise.all([
      Category.find({ isActive: true }).sort({ name: 1 }).lean(),
      Subcategory.find({ category: product.category }).sort({ name: 1 }).lean(),
      ExtraCategory.find({ subcategory: product.subcategory }).sort({ name: 1 }).lean()
    ]);

    res.render('admin/products/edit', {
      title: 'Edit Product',
      product,
      categories,
      subcategories,
      extraCategories
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/admin/products');
    }

    const data = { ...req.body };
    data.price = parseFloat(data.price);
    data.stock = parseInt(data.stock, 10) || 0;

    // Replace image if new one uploaded
    if (req.file) {
      if (product.image) deleteFile(product.image);
      data.image = `/uploads/${req.file.filename}`;
    }

    await Product.findByIdAndUpdate(req.params.id, data, { runValidators: true });
    req.flash('success', 'Product updated successfully');
    res.redirect('/admin/products');
  } catch (error) {
    if (req.file) deleteFile(`/uploads/${req.file.filename}`);
    next(error);
  }
};

exports.view = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('subcategory')
      .populate('extraCategory')
      .populate('createdBy', 'fullName email')
      .lean();

    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/admin/products');
    }

    res.render('admin/products/view', { title: product.name, product });
  } catch (error) {
    next(error);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      req.flash('error', 'Product not found');
    } else {
      if (product.image) deleteFile(product.image);
      req.flash('success', 'Product deleted successfully');
    }

    res.redirect('/admin/products');
  } catch (error) {
    next(error);
  }
};
