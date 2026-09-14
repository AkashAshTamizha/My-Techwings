const mongoose = require('mongoose');

// Powers the homepage hero slider and is fully manageable from the admin
// screen (create / edit / delete / reorder), same pattern as Service /
// AboutSection. `heading` is stored as an ordered list of lines so the
// frontend can render each on its own line and independently highlight
// any of them in brand blue, matching the original hardcoded slide shape.
const headingLineSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 80 },
    highlighted: { type: Boolean, default: false },
  },
  { _id: false }
);

const sliderSchema = new mongoose.Schema(
  {
    eyebrow: { type: String, trim: true, maxlength: 50 }, // small label above the heading, e.g. "LIMITED TIME"
    heading: {
      type: [headingLineSchema],
      required: true,
      validate: {
        validator: (lines) => Array.isArray(lines) && lines.length > 0 && lines.length <= 4,
        message: 'Heading must have between 1 and 4 lines',
      },
    },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    ctaLabel: { type: String, trim: true, maxlength: 50 },
    ctaTo: { type: String, trim: true, maxlength: 200 },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    alt: { type: String, trim: true, maxlength: 150, default: 'Promotional slide' },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 }, // controls display order on the homepage slider
  },
  { timestamps: true }
);

sliderSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Slider', sliderSchema);
