const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const { cacheAside, invalidateByPrefix } = require('../config/redis');
const { CATEGORY_CONFIG, CATEGORIES, SPEC_FIELDS_BY_CATEGORY, getSpecFields } = require('../config/categorySpecs');

// GET /api/v1/products
// Supports: category, brand, minPrice, maxPrice, screenSize, processor, onSale, search, sort, page, limit
// Result is cached in Redis for 60s per unique query string — the Products
// grid is read-heavy and identical filter combos are requested repeatedly
// under load, so this materially cuts DB load at 1,000+ concurrent users.
exports.getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    screenSize,
    processor,
    search,
    onSale,
    sort = 'recommended',
    page = 1,
    limit = 12,
  } = req.query;

  const cacheKey = `products:${JSON.stringify(req.query)}`;

  const result = await cacheAside(cacheKey, 60, async () => {
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (brand) filter.brand = { $in: brand.split(',') };
    if (screenSize) filter.screenSize = screenSize;
    if (processor) filter['specs.processor'] = new RegExp(processor, 'i');
    // "Deals" / offer-price products: anything currently marked down, i.e.
    // compareAtPrice is set and higher than the actual selling price.
    if (onSale === 'true') filter.$expr = { $gt: ['$compareAtPrice', '$price'] };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.$text = { $search: search };

    const sortMap = {
      recommended: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
      newest: { createdAt: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sortMap[sort] || sortMap.recommended)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    return {
      items,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    };
  });

  res.status(200).json({ success: true, ...result });
});

// GET /api/v1/products/:slug
exports.getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const cacheKey = `product:${slug}`;

  const product = await cacheAside(cacheKey, 300, () =>
    Product.findOne({ slug, isActive: true }).lean()
  );

  if (!product) throw new AppError('Product not found', 404);

  // "Customers also viewed" — same category, excluding current product
  const related = await cacheAside(`related:${slug}`, 300, () =>
    Product.find({ category: product.category, slug: { $ne: slug }, isActive: true })
      .limit(4)
      .lean()
  );

  // Ordered list of the spec fields relevant to this product's category, so
  // the Product Details page renders only what applies (Printer specs for a
  // printer, CCTV specs for a CCTV camera, etc.) without hard-coding any
  // category's fields itself.
  const specFields = getSpecFields(product.category);

  res.status(200).json({ success: true, product, related, specFields });
});

// GET /api/v1/products/category-specs — the full category → spec-field-list
// config, used by the Add/Edit Product admin form to render the right inputs
// as soon as an admin picks a category. Adding a new category only ever
// requires editing config/categorySpecs.js — this endpoint (and everything
// that calls it) automatically picks up the change.
exports.getCategorySpecs = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    categories: CATEGORIES,
    categorySpecs: SPEC_FIELDS_BY_CATEGORY,
    categoryConfig: CATEGORY_CONFIG,
  });
});

// GET /api/v1/products/filters — distinct categories, brands, screen sizes and
// the min/max price actually present in the active catalog. Backs the
// storefront Filters sidebar so its options are always derived from real
// data instead of a hard-coded list that drifts out of sync with the DB.
exports.getFilterOptions = asyncHandler(async (req, res) => {
  const filters = await cacheAside('filters:options', 300, async () => {
    const [categories, brands, screenSizes, processors, priceStats] = await Promise.all([
      Product.distinct('category', { isActive: true }),
      Product.distinct('brand', { isActive: true }),
      Product.distinct('screenSize', { isActive: true, screenSize: { $nin: [null, ''] } }),
      Product.distinct('specs.processor', { isActive: true, 'specs.processor': { $nin: [null, ''] } }),
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } },
      ]),
    ]);

    return {
      categories: categories.filter(Boolean).sort(),
      brands: brands.filter(Boolean).sort(),
      screenSizes: screenSizes.filter(Boolean).sort(),
      processors: processors.filter(Boolean).sort(),
      priceRange: {
        min: priceStats[0]?.min ?? 0,
        max: priceStats[0]?.max ?? 0,
      },
    };
  });

  res.status(200).json({ success: true, filters });
});

// GET /api/v1/products/categories/summary  (for the homepage "Shop by Category" row)
exports.getCategorySummary = asyncHandler(async (req, res) => {
  const summary = await cacheAside('categories:summary', 300, () =>
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, sampleImage: { $first: '$images' } } },
    ])
  );
  res.status(200).json({ success: true, categories: summary });
});

// ----- Admin (JWT-protected) -----

// GET /api/v1/products/admin/:id — direct by-id fetch for the admin edit
// screen (bypasses the isActive filter and slug-only lookup the public API
// uses, and doesn't depend on the product being in the first page of results).
exports.getProductByIdAdmin = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) throw new AppError('Product not found', 404);
  res.status(200).json({ success: true, product, specFields: getSpecFields(product.category) });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  await invalidateByPrefix('products:');
  await invalidateByPrefix('categories:');
  await invalidateByPrefix('filters:');
  res.status(201).json({ success: true, product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);

  // Using .set() + .save() (document middleware) rather than
  // findByIdAndUpdate (query middleware) is deliberate: the model's
  // pre('validate') hook — which normalizes primary images and rejects
  // duplicate variant SKUs/color+size combos — only runs on document saves,
  // not on query-based updates, even with { runValidators: true }. Editing a
  // product must go through the same validation as creating one.
  product.set(req.body);
  await product.save();

  await invalidateByPrefix('products:');
  await invalidateByPrefix(`product:${product.slug}`);
  await invalidateByPrefix('filters:');
  res.status(200).json({ success: true, product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) throw new AppError('Product not found', 404);
  await invalidateByPrefix('products:');
  await invalidateByPrefix(`product:${product.slug}`);
  await invalidateByPrefix('filters:');
  res.status(200).json({ success: true, message: 'Product deactivated' });
});
