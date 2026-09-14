const AttributeKey = require('../models/AttributeKey');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const { cacheAside, invalidateByPrefix } = require('../config/redis');

// GET /api/v1/attribute-keys  (admin — powers the Additional/Variant
// attribute "name" dropdown so it's never hard-coded on the frontend).
exports.getAttributeKeys = asyncHandler(async (req, res) => {
  const keys = await cacheAside('attribute-keys:all', 300, () =>
    AttributeKey.find({}).sort({ name: 1 }).lean()
  );
  res.status(200).json({ success: true, attributeKeys: keys });
});

// POST /api/v1/attribute-keys  { name }
// Creates a new reusable attribute name. Duplicate names (case-insensitive)
// are rejected by the schema's unique index on `normalizedName` — if the
// key already exists we just return it instead of erroring, since from the
// admin UI's point of view "create if missing, else reuse" is the desired
// behaviour.
exports.createAttributeKey = asyncHandler(async (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) throw new AppError('Attribute name is required', 400);

  const normalizedName = name.toLowerCase();
  const existing = await AttributeKey.findOne({ normalizedName });
  if (existing) {
    return res.status(200).json({ success: true, attributeKey: existing, created: false });
  }

  try {
    const attributeKey = await AttributeKey.create({ name });
    await invalidateByPrefix('attribute-keys:');
    return res.status(201).json({ success: true, attributeKey, created: true });
  } catch (err) {
    // Race with another concurrent create of the same (normalized) name —
    // treat it the same as "already exists" rather than surfacing a 409.
    if (err.code === 11000) {
      const winner = await AttributeKey.findOne({ normalizedName });
      if (winner) return res.status(200).json({ success: true, attributeKey: winner, created: false });
    }
    throw err;
  }
});
