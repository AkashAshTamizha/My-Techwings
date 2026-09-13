const express = require('express');
const { body, param, query } = require('express-validator');
const ctrl = require('../controllers/product.controller');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const { doubleCsrfProtection } = require('../middleware/csrf');

const router = express.Router();

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    // The storefront now paginates client-side (fetches every matching
    // product once per filter change, then slices 10-per-page in the
    // browser), so the ceiling here is "large enough for the whole
    // filtered catalog in one request", not "one page worth of items".
    query('limit').optional().isInt({ min: 1, max: 1000 }),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
  ],
  validate,
  ctrl.getProducts
);

router.get('/categories/summary', ctrl.getCategorySummary);

// Distinct categories/brands/price-range/screen-sizes actually present in the
// catalog, so the storefront Filters sidebar never has to hard-code values.
router.get('/filters', ctrl.getFilterOptions);

// Admin lookup by Mongo _id (the public GET below is slug-based only, and the
// admin edit screen needs a reliable, direct-by-id fetch rather than paging
// through the full product list). Two path segments, so this never collides
// with the single-segment "/:slug" route below regardless of order.
router.get(
  '/admin/:id',
  protect,
  restrictTo('admin', 'staff'),
  [param('id').isMongoId()],
  validate,
  ctrl.getProductByIdAdmin
);

router.get('/:slug', [param('slug').isSlug()], validate, ctrl.getProductBySlug);

// Reusable validation for the image sub-document shape (product images and
// variant images share this exact shape, coming straight from the upload API).
const imageValidation = (field) => [
  body(field).optional().isArray().withMessage(`${field} must be an array`),
  body(`${field}.*.url`).optional().isURL().withMessage('Each image needs a valid Cloudinary url'),
  body(`${field}.*.publicId`).optional().notEmpty().withMessage('Each image needs a Cloudinary publicId'),
];

// Custom specification fields (Specs & Variants section). Each field has a
// name and one or more selectable values; `useForVariants` marks whether the
// field is one of the dimensions combined to generate variants.
const attributesValidation = [
  body('attributes').optional().isArray().withMessage('attributes must be an array'),
  body('attributes.*.name').if(body('attributes').exists()).notEmpty().withMessage('Custom field name is required'),
  body('attributes.*.values')
    .if(body('attributes').exists())
    .isArray({ min: 1 })
    .withMessage('Custom field needs at least one value'),
  body('attributes.*.useForVariants').optional().isBoolean(),
  body('attributes').custom((attributes) => {
    if (!Array.isArray(attributes) || attributes.length === 0) return true;
    const names = attributes.map((a) => String(a?.name || '').trim().toLowerCase());
    if (new Set(names).size !== names.length) throw new Error('Custom field names must be unique within a product');
    return true;
  }),
];

const variantValidation = [
  body('variants').optional().isArray().withMessage('variants must be an array'),
  body('variants.*.attributes')
    .if(body('variants').exists())
    .isArray({ min: 1 })
    .withMessage('Each variant needs at least one attribute (e.g. Color: Black)'),
  body('variants.*.attributes.*.name').if(body('variants').exists()).notEmpty().withMessage('Variant attribute name is required'),
  body('variants.*.attributes.*.value').if(body('variants').exists()).notEmpty().withMessage('Variant attribute value is required'),
  body('variants.*.sku').if(body('variants').exists()).notEmpty().withMessage('Variant SKU is required'),
  body('variants.*.price').if(body('variants').exists()).isFloat({ min: 0 }).withMessage('Variant price must be a non-negative number'),
  body('variants.*.stock').if(body('variants').exists()).optional().isInt({ min: 0 }).withMessage('Variant stock must be a non-negative integer'),
  ...imageValidation('variants.*.images'),
  // Guards against the exact "editing one variant changes another" class of
  // bug at the API boundary too: reject duplicate SKUs / attribute combos
  // before they ever reach the DB (the model's pre-validate hook is the
  // second line of defense).
  body('variants').custom((variants) => {
    if (!Array.isArray(variants) || variants.length === 0) return true;
    const skus = variants.map((v) => String(v?.sku || '').trim().toUpperCase());
    const combos = variants.map((v) =>
      (v?.attributes || [])
        .map((a) => `${String(a?.name || '').toLowerCase().trim()}:${String(a?.value || '').toLowerCase().trim()}`)
        .sort()
        .join('|')
    );
    if (new Set(skus).size !== skus.length) throw new Error('Variant SKUs must be unique within a product');
    if (new Set(combos).size !== combos.length) throw new Error('Each variant attribute combination must be unique within a product');
    return true;
  }),
];

// Admin-only mutations
router.use(protect, restrictTo('admin', 'staff'));

router.post(
  '/',
  doubleCsrfProtection,
  [
    body('name').notEmpty().trim(),
    body('slug').isSlug(),
    body('sku').optional({ checkFalsy: true }).trim(),
    body('brand').notEmpty().trim(),
    body('category').isIn(['Ultrabook', 'Gaming', 'Business', 'Refurbished', 'CCTV', 'Printer']),
    body('price').isFloat({ min: 0 }),
    ...imageValidation('images'),
    ...attributesValidation,
    ...variantValidation,
  ],
  validate,
  ctrl.createProduct
);

router.patch(
  '/:id',
  doubleCsrfProtection,
  [
    param('id').isMongoId(),
    body('sku').optional({ checkFalsy: true }).trim(),
    body('price').optional().isFloat({ min: 0 }),
    body('category')
      .optional()
      .isIn(['Ultrabook', 'Gaming', 'Business', 'Refurbished', 'CCTV', 'Printer']),
    ...imageValidation('images'),
    ...attributesValidation,
    ...variantValidation,
  ],
  validate,
  ctrl.updateProduct
);
router.delete('/:id', doubleCsrfProtection, [param('id').isMongoId()], validate, ctrl.deleteProduct);

module.exports = router;
