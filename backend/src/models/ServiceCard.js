const mongoose = require('mongoose');

// The repeatable "How We Work" step cards shown on the public Service page,
// underneath the fixed hero/warranty/intro copy that lives in `Service.js`
// (ServiceContent). Fully manageable from the admin screen (create / edit /
// delete / reorder), same pattern as AboutSection / ContactInfo / Slider.
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true, default: '' },
    publicId: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const serviceCardSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, maxlength: 100 }, // optional, e.g. "Quality Testing"
    description: { type: String, required: true, trim: true, maxlength: 600 },
    image: { type: imageSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 }, // controls display order on the Service page
  },
  { timestamps: true }
);

serviceCardSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('ServiceCard', serviceCardSchema);
