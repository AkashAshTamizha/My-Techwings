const multer = require('multer');
const AppError = require('../utils/AppError');

const MAX_IMAGE_SIZE = Number(process.env.MAX_IMAGE_SIZE_MB || 5) * 1024 * 1024;
const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024;

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_FILE_MIME_TYPES = [...ALLOWED_IMAGE_MIME_TYPES, 'application/pdf'];

// Memory storage: the file buffer is piped straight to Cloudinary and never
// written to disk or persisted in Mongo.
const storage = multer.memoryStorage();

function imageFileFilter(req, file, cb) {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    return cb(new AppError(`Unsupported image type: ${file.mimetype}. Allowed: JPEG, PNG, WEBP, GIF`, 400));
  }
  cb(null, true);
}

function anyFileFilter(req, file, cb) {
  if (!ALLOWED_FILE_MIME_TYPES.includes(file.mimetype)) {
    return cb(new AppError(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WEBP, GIF, PDF`, 400));
  }
  cb(null, true);
}

const uploadImage = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
  fileFilter: imageFileFilter,
});

const uploadImages = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE, files: 10 },
  fileFilter: imageFileFilter,
});

const uploadFile = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: anyFileFilter,
});

// Normalizes Multer's own errors (file too large, too many files, etc.) into
// the app's standard AppError/JSON error shape instead of a raw stack trace.
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File is too large', 413));
    }
    if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new AppError('Too many files in this upload', 400));
    }
    return next(new AppError(err.message, 400));
  }
  next(err);
}

module.exports = { uploadImage, uploadImages, uploadFile, handleMulterError };
