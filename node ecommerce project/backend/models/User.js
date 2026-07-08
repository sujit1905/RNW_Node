import mongoose from 'mongoose';

const shippingAddressSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: '',
      trim: true,
      maxlength: 100
    },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    phone: { type: String, unique: true, sparse: true },
    isGoogleUser: { type: Boolean, default: false },
    avatar: { type: String },
    /** User-uploaded image (data URL or https). Shown in UI over `avatar` when set. */
    profileImage: { type: String, default: '' },
    shippingAddress: { type: shippingAddressSchema, default: () => ({}) },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    resetPasswordOtp: { type: String },
    resetPasswordOtpExpires: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
