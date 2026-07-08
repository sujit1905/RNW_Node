const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const isValid = allowed.test(path.extname(file.originalname).toLowerCase()) &&
    allowed.test(file.mimetype.split('/')[1]);

  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, webp, gif) are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    req.flash('error', err.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 5MB' : err.message);
    return res.redirect('back');
  }

  if (err) {
    req.flash('error', err.message);
    return res.redirect('back');
  }

  next();
};

module.exports = { upload, handleUploadError };
