const mongoose = require('mongoose');
const { CATEGORIES } = require('../config/categorySpecs');

// `specs` used to be a fixed sub-schema of exactly four laptop fields
// (processor/ram/storage/display). It's now a generic string map so any
// category can persist whatever spec keys it needs (see
// config/categorySpecs.js for the per-category field definitions) without
// ever requiring another schema change. Existing laptop documents already
// store specs as a plain { processor, ram, storage, display } object, which
// is exactly what a Map of String casts from, so old data keeps working
// unchanged.

// A single uploaded asset. Every image in the app — product-level or
// variant-level — now lives on Cloudinary; we only ever persist the secure
// URL + the metadata needed to manage/delete it later. No binary data is
// ever stored in Mongo.
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, required: true, trim: true }, // Cloudinary public_id, needed to delete/replace the asset
    width: { type: Number },
    height: { type: Number },
    format: { type: String },
    bytes: { type: Number },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

// A single name/value pair on a variant, e.g. { name: 'Processor', value: 'Intel' }.
// Kept as an ordered array (not a Map) so insertion order — and therefore
// display order — is preserved exactly as the admin defined it.
const variantAttributeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

// One purchasable variation of a product (e.g. Processor: Intel / RAM: 8GB /
// Color: Black). Each variant is a fully independent subdocument — its own
// attribute set, SKU, price, stock and image set — so editing one never
// touches another. Unlike the old fixed color+size shape, `attributes` is an
// arbitrary, admin-defined list of name/value pairs, so any product type
// (laptops, CCTV, printers, anything future) can define whatever dimensions
// it needs without a code change.
const variantSchema = new mongoose.Schema(
  {
    attributes: {
      type: [variantAttributeSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Each variant needs at least one attribute (e.g. Color: Black)',
      },
    },
    sku: {
      type: String,
      required: [true, 'Variant SKU is required'],
      trim: true,
      uppercase: true,
    },
    price: { type: Number, required: [true, 'Variant price is required'], min: [0, 'Variant price cannot be negative'] },
    compareAtPrice: { type: Number, min: [0, 'Variant compare-at price cannot be negative'] },
    stock: { type: Number, required: true, min: [0, 'Variant stock cannot be negative'], default: 0 },
    images: [imageSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// A custom specification field the admin defines for a product, e.g.
// { name: 'Processor', values: ['Intel', 'AMD', 'Apple'], useForVariants: true }.
// `values` is the full set of options available for that field; `useForVariants`
// controls whether that field is one of the dimensions combined to generate
// variants (purely-informational fields like "Weight" can be defined without
// being part of the variant matrix).
const attributeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    values: {
      type: [String],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'A custom field needs at least one value',
      },
    },
    useForVariants: { type: Boolean, default: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    // Top-level SKU for products that are sold without variants. Optional +
    // sparse so products that only sell through variant SKUs don't collide
    // on an empty string in the unique index.
    sku: { type: String, trim: true, uppercase: true, sparse: true, unique: true },
    brand: { type: String, required: true, index: true }, // Apple, Dell, HP, Lenovo, Acer, Samsung...
    category: {
      type: String,
      required: true,
      index: true,
      enum: CATEGORIES,
    },
    tag: { type: String, enum: ['NEW', 'Refurbished', 'Price Drop', null], default: null },
    price: { type: Number, required: true, index: true },
    compareAtPrice: { type: Number },
    screenSize: { type: String }, // "13\"-14\"", "15\"-16\"", "17\"+" (Laptop-only; harmless if unset for other categories)
    // Generic, category-driven spec key/values — see config/categorySpecs.js.
    // A Map of String casts fine from the plain { processor, ram, ... }
    // objects already stored on existing laptop documents, so old data
    // keeps reading and writing exactly as before.
    specs: { type: Map, of: String, default: {} },
    description: { type: String },
    // Cloudinary-backed images. Kept as an ordered array — index 0 (or the
    // entry with isPrimary=true) is the main product image, and drag-reorder
    // on the admin UI simply rewrites this array's order.
    images: [imageSchema],
    // Admin-defined custom specification fields (Specs & Variants section).
    // Any field flagged useForVariants=true is one of the dimensions used to
    // generate `variants` below — new product types never need a code change.
    attributes: [attributeSchema],
    variants: [variantSchema],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Keep "primary image" well-defined: exactly one image is flagged primary
// whenever images exist (defaulting to the first), and reject duplicate SKUs
// across a product's own variants.
productSchema.pre('validate', function normalizeImagesAndVariants(next) {
  if (Array.isArray(this.images) && this.images.length > 0) {
    const primaryCount = this.images.filter((img) => img.isPrimary).length;
    if (primaryCount !== 1) {
      this.images.forEach((img, idx) => {
        img.isPrimary = idx === 0;
      });
    }
    this.images.forEach((img, idx) => {
      img.order = idx;
    });
  }

  if (Array.isArray(this.variants) && this.variants.length > 0) {
    const skus = this.variants.map((v) => (v.sku || '').toUpperCase().trim());
    const duplicate = skus.find((sku, idx) => sku && skus.indexOf(sku) !== idx);
    if (duplicate) {
      return next(new Error(`Duplicate variant SKU within product: ${duplicate}`));
    }

    // Also guard against the exact same attribute combination (e.g.
    // Processor: Intel / RAM: 8GB / Color: Black) being added twice. Order
    // of attributes doesn't matter for equality, so the fingerprint sorts
    // them first.
    const fingerprint = (attrs) =>
      (attrs || [])
        .map((a) => `${(a.name || '').toLowerCase().trim()}:${(a.value || '').toLowerCase().trim()}`)
        .sort()
        .join('|');
    const combos = this.variants.map((v) => fingerprint(v.attributes));
    const duplicateComboIdx = combos.findIndex((c, idx) => c && combos.indexOf(c) !== idx);
    if (duplicateComboIdx !== -1) {
      const attrs = this.variants[duplicateComboIdx].attributes || [];
      const label = attrs.map((a) => `${a.name}: ${a.value}`).join(' / ');
      return next(new Error(`Duplicate variant: attribute combination "${label}" already exists`));
    }
  }

  next();
});

// Compound indexes matching the real query patterns of the Products page
// (category + price range + sort, and text search on name/brand).
productSchema.index({ category: 1, price: 1 });
productSchema.index({ brand: 1, price: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ name: 'text', brand: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
