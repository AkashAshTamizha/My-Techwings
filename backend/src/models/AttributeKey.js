const mongoose = require('mongoose');

// A small, admin-managed registry of attribute *names* (e.g. "Color",
// "Warranty", "Battery Life") reused across:
//   - a product's "Additional attributes" (Product.attributes[].name)
//   - a variant's attributes (Product.variants[].attributes[].name)
//
// This does NOT replace either of those — it's purely a dropdown/autocomplete
// source so admins pick from previously-used names instead of hand-typing
// (and accidentally creating near-duplicates like "Battery life" vs
// "battery-life"). The actual key/value pairs still live on the product and
// variant documents exactly as before.
const attributeKeySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    // Lowercased, trimmed copy of `name` used for a case-insensitive unique
    // index so "Color" and "color" can never both be created.
    normalizedName: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

attributeKeySchema.pre('validate', function normalize(next) {
  if (this.name) this.normalizedName = this.name.trim().toLowerCase();
  next();
});

module.exports = mongoose.model('AttributeKey', attributeKeySchema);
