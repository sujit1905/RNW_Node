const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

// User account model for admin authentication and profile management.
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'admin'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  errorMessages: {
    UserExistsError: 'An account with this email already exists',
    MissingPasswordError: 'Password is required',
    AttemptTooSoonError: 'Too many attempts, please try again later',
    TooManyAttemptsError: 'Account locked due to too many failed attempts',
    NoSaltValueStoredError: 'Authentication not possible',
    IncorrectPasswordError: 'Incorrect password',
    IncorrectUsernameError: 'No account found with this email'
  }
});

module.exports = mongoose.model('User', userSchema);
