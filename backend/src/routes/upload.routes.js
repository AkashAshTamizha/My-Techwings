const express = require('express');
const { query } = require('express-validator');
const ctrl = require('../controllers/upload.controller');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const { doubleCsrfProtection } = require('../middleware/csrf');
const { uploadImage, uploadImages, uploadFile, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// Every upload/delete route is admin/staff-only and CSRF-protected, same as
// the other product-mutating routes.
router.use(protect, restrictTo('admin', 'staff'));

router.post(
  '/image',
  doubleCsrfProtection,
  uploadImage.single('image'),
  handleMulterError,
  ctrl.uploadSingleImage
);

router.post(
  '/images',
  doubleCsrfProtection,
  uploadImages.array('images', 10),
  handleMulterError,
  ctrl.uploadMultipleImages
);

router.post(
  '/file',
  doubleCsrfProtection,
  uploadFile.single('file'),
  handleMulterError,
  ctrl.uploadSingleFile
);

// publicId (e.g. "mytechwings/products/abc123") contains slashes, which
// Express path params can't safely carry — so it's passed as a query string
// instead of a route param (?publicId=...&resourceType=image).
router.delete(
  '/',
  doubleCsrfProtection,
  [query('publicId').notEmpty().withMessage('publicId is required'), query('resourceType').optional().isIn(['image', 'raw'])],
  validate,
  ctrl.deleteUpload
);

module.exports = router;
