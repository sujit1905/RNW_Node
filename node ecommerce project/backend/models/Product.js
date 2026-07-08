import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discount: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    image: { type: String, required: true },
    images: [{ type: String, required: true }],
    category: { type: String, required: true },
    sizes: [{ type: String, required: true }],
    description: { type: String, required: true },
    fabric: { type: String, required: true },
    color: { type: String, default: '' },
    colors: [{ type: String }],
    inStock: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
