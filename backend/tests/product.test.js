const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongod;
let Product;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  process.env.COOKIE_SECRET = 'test-cookie-secret';
  process.env.CLIENT_URL = 'https://my-techwings.onrender.com';
  process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  await mongoose.connect(process.env.MONGO_URI);

  Product = require('../src/models/Product');
  app = require('../src/app');

  await Product.create({
    name: 'Test Laptop',
    slug: 'test-laptop',
    brand: 'TestBrand',
    category: 'Ultrabook',
    price: 50000,
    isActive: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('GET /api/v1/products', () => {
  it('returns a paginated list of active products', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
  });
});

describe('GET /api/v1/products/:slug', () => {
  it('returns a single product by slug', async () => {
    const res = await request(app).get('/api/v1/products/test-laptop');
    expect(res.statusCode).toBe(200);
    expect(res.body.product.name).toBe('Test Laptop');
  });

  it('returns 404 for unknown slug', async () => {
    const res = await request(app).get('/api/v1/products/does-not-exist');
    expect(res.statusCode).toBe(404);
  });
});

describe('Product variants', () => {
  it('saves multiple independent variants (dynamic attributes) and retrieves them intact', async () => {
    const product = await Product.create({
      name: 'Variant Test Shoe',
      slug: 'variant-test-shoe',
      brand: 'TestBrand',
      category: 'Gaming',
      price: 2000,
      isActive: true,
      images: [
        { url: 'https://res.cloudinary.com/demo/image/upload/main.jpg', publicId: 'mytechwings/products/main' },
      ],
      attributes: [
        { name: 'Color', values: ['White', 'Black'], useForVariants: true },
        { name: 'Size', values: ['6', '8'], useForVariants: true },
      ],
      variants: [
        {
          attributes: [
            { name: 'Color', value: 'White' },
            { name: 'Size', value: '6' },
          ],
          sku: 'shoe-wht-06',
          price: 2000,
          stock: 5,
          images: [{ url: 'https://res.cloudinary.com/demo/image/upload/white.jpg', publicId: 'mytechwings/variants/white' }],
        },
        {
          attributes: [
            { name: 'Color', value: 'Black' },
            { name: 'Size', value: '8' },
          ],
          sku: 'shoe-blk-08',
          price: 2200,
          stock: 3,
          images: [{ url: 'https://res.cloudinary.com/demo/image/upload/black.jpg', publicId: 'mytechwings/variants/black' }],
        },
      ],
    });

    const fetched = await Product.findById(product._id).lean();
    expect(fetched.variants).toHaveLength(2);

    const white = fetched.variants.find((v) => v.sku === 'SHOE-WHT-06');
    const black = fetched.variants.find((v) => v.sku === 'SHOE-BLK-08');

    const attrValue = (variant, name) => variant.attributes.find((a) => a.name === name)?.value;

    // Each variant keeps its own independent attributes/price/stock/images —
    // editing one must never leak into the other.
    expect(attrValue(white, 'Color')).toBe('White');
    expect(attrValue(white, 'Size')).toBe('6');
    expect(white.images[0].publicId).toBe('mytechwings/variants/white');

    expect(attrValue(black, 'Color')).toBe('Black');
    expect(attrValue(black, 'Size')).toBe('8');
    expect(black.images[0].publicId).toBe('mytechwings/variants/black');

    // The product's own images are unaffected by variant images.
    expect(fetched.images).toHaveLength(1);
    expect(fetched.images[0].isPrimary).toBe(true);
  });

  it('rejects duplicate SKUs within the same product', async () => {
    await expect(
      Product.create({
        name: 'Dup SKU Product',
        slug: 'dup-sku-product',
        brand: 'TestBrand',
        category: 'Gaming',
        price: 1000,
        variants: [
          { attributes: [{ name: 'Color', value: 'White' }], sku: 'DUP1', price: 10, stock: 1 },
          { attributes: [{ name: 'Color', value: 'Black' }], sku: 'dup1', price: 10, stock: 1 },
        ],
      })
    ).rejects.toThrow(/Duplicate variant SKU/);
  });

  it('rejects a duplicate attribute combination within the same product', async () => {
    await expect(
      Product.create({
        name: 'Dup Combo Product',
        slug: 'dup-combo-product',
        brand: 'TestBrand',
        category: 'Gaming',
        price: 1000,
        variants: [
          { attributes: [{ name: 'Color', value: 'White' }, { name: 'Size', value: '6' }], sku: 'A1', price: 10, stock: 1 },
          { attributes: [{ name: 'Color', value: 'white' }, { name: 'Size', value: '6' }], sku: 'A2', price: 10, stock: 1 },
        ],
      })
    ).rejects.toThrow(/Duplicate variant/);
  });

  it('updates only the targeted variant, leaving others untouched (same code path as the admin PATCH controller)', async () => {
    const product = await Product.create({
      name: 'Patchable Shoe',
      slug: 'patchable-shoe',
      brand: 'TestBrand',
      category: 'Gaming',
      price: 1500,
      variants: [
        { attributes: [{ name: 'Color', value: 'White' }, { name: 'Size', value: '6' }], sku: 'PATCH-1', price: 1500, stock: 5 },
        { attributes: [{ name: 'Color', value: 'Black' }, { name: 'Size', value: '8' }], sku: 'PATCH-2', price: 1600, stock: 2 },
      ],
    });

    const updatedVariants = [
      { attributes: [{ name: 'Color', value: 'Red' }, { name: 'Size', value: '7' }], sku: 'PATCH-1', price: 1550, stock: 9 }, // variant 1 edited
      { attributes: [{ name: 'Color', value: 'Black' }, { name: 'Size', value: '8' }], sku: 'PATCH-2', price: 1600, stock: 2 }, // variant 2 unchanged
    ];

    // Mirrors exactly what product.controller.js#updateProduct now does:
    // fetch the document, product.set(req.body), then product.save() — this
    // is what makes the pre('validate') hook (dup-SKU/primary-image checks)
    // apply on edits too, not just on create.
    const doc = await Product.findById(product._id);
    doc.set({ variants: updatedVariants });
    await doc.save();
    const updated = await Product.findById(product._id).lean();

    const v1 = updated.variants.find((v) => v.sku === 'PATCH-1');
    const v2 = updated.variants.find((v) => v.sku === 'PATCH-2');
    const attrValue = (variant, name) => variant.attributes.find((a) => a.name === name)?.value;

    expect(attrValue(v1, 'Color')).toBe('Red');
    expect(attrValue(v1, 'Size')).toBe('7');
    expect(v1.stock).toBe(9);

    // Second variant must be completely unaffected by the first one's edit.
    expect(attrValue(v2, 'Color')).toBe('Black');
    expect(attrValue(v2, 'Size')).toBe('8');
    expect(v2.stock).toBe(2);
  });

  it('rejects duplicate SKUs introduced via an update, not just on create', async () => {
    const product = await Product.create({
      name: 'Update Dup Guard',
      slug: 'update-dup-guard',
      brand: 'TestBrand',
      category: 'Gaming',
      price: 1000,
      variants: [{ attributes: [{ name: 'Color', value: 'White' }], sku: 'GUARD-1', price: 10, stock: 1 }],
    });

    const doc = await Product.findById(product._id);
    doc.set({
      variants: [
        { attributes: [{ name: 'Color', value: 'White' }], sku: 'GUARD-1', price: 10, stock: 1 },
        { attributes: [{ name: 'Color', value: 'Black' }], sku: 'guard-1', price: 10, stock: 1 }, // dup, case-insensitive
      ],
    });

    await expect(doc.save()).rejects.toThrow(/Duplicate variant SKU/);
  });
});

describe('GET /api/v1/products/filters', () => {
  it('returns distinct categories, brands, screen sizes and a price range derived from the DB', async () => {
    const res = await request(app).get('/api/v1/products/filters');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.filters.categories)).toBe(true);
    expect(Array.isArray(res.body.filters.brands)).toBe(true);
    expect(res.body.filters.brands).toContain('TestBrand');
    expect(typeof res.body.filters.priceRange.min).toBe('number');
    expect(typeof res.body.filters.priceRange.max).toBe('number');
  });
});

describe('GET /api/v1/services', () => {
  it('returns an empty list when no services are seeded', async () => {
    const res = await request(app).get('/api/v1/services');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.services)).toBe(true);
  });
});

describe('GET /api/v1/health', () => {
  it('reports ok status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
