const mongoose = require('mongoose');

// Extra category model used for more specific product grouping.
const extraCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Extra category name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: [true, 'Subcategory is required']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

extraCategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

extraCategorySchema.index({ subcategory: 1, name: 1 }, { unique: true });
extraCategorySchema.index({ name: 'text' });

module.exports = mongoose.model('ExtraCategory', extraCategorySchema);
