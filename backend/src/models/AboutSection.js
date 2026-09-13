const mongoose = require('mongoose');

// Powers the public "About" page and is fully manageable from the admin
// screen (create / edit / delete / reorder), same pattern as Service.
const aboutSectionSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true, trim: true, maxlength: 150 },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    icon: { type: String, trim: true, maxlength: 50 }, // optional react-icons/fi name, rendered on the frontend
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 }, // controls display order on the About page
  },
  { timestamps: true }
);

aboutSectionSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('AboutSection', aboutSectionSchema);
