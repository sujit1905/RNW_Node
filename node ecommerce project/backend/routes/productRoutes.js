import express from 'express';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const {
      name,
      price,
      originalPrice,
      discount,
      description,
      image,
      images,
      category,
      sizes,
      fabric,
      color,
      colors,
      inStock,
    } = req.body;

    // Normalize colors: accept array or comma-string; derive legacy color field
    const colorsArr = Array.isArray(colors) && colors.length
      ? colors.filter(Boolean)
      : typeof colors === 'string' && colors.trim()
        ? colors.split(',').map(c => c.trim()).filter(Boolean)
        : color ? color.split(',').map(c => c.trim()).filter(Boolean) : [];

    const product = new Product({
      name,
      price,
      originalPrice,
      discount,
      image,
      images: images || [image],
      category,
      sizes,
      description,
      fabric: fabric || 'Cotton',
      colors: colorsArr,
      color: colorsArr[0] || color || 'Multicolor',
      inStock: inStock !== undefined ? inStock : true,
      rating: 0,
      reviews: 0,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const {
      name,
      price,
      originalPrice,
      discount,
      description,
      image,
      images,
      category,
      sizes,
      fabric,
      color,
      colors,
      inStock,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price !== undefined ? price : product.price;
      product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
      product.discount = discount !== undefined ? discount : product.discount;
      product.description = description || product.description;
      product.image = image || product.image;
      product.images = images || product.images;
      product.category = category || product.category;
      product.sizes = sizes || product.sizes;
      product.fabric = fabric || product.fabric;
      product.inStock = inStock !== undefined ? inStock : product.inStock;

      // Normalize colors on update
      const colorsArr = Array.isArray(colors) && colors.length
        ? colors.filter(Boolean)
        : typeof colors === 'string' && colors.trim()
          ? colors.split(',').map(c => c.trim()).filter(Boolean)
          : color ? color.split(',').map(c => c.trim()).filter(Boolean) : null;
      if (colorsArr !== null) {
        product.colors = colorsArr;
        product.color = colorsArr[0] || product.color;
      } else if (color) {
        product.color = color;
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Toggle product stock status
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin
router.patch('/:id/stock', protect, adminOnly, async (req, res, next) => {
  try {
    const { inStock } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    product.inStock = typeof inStock === 'boolean' ? inStock : !product.inStock;
    const updated = await product.save();
    res.json({ _id: updated._id, inStock: updated.inStock });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
});

export default router;
