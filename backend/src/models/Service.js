const mongoose = require('mongoose');

// Powers the public "Service" page and is fully manageable from the admin
// screen (create / edit / delete), same pattern as Product.
const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true, trim: true },
    icon: { type: String, default: 'FiTool' }, // react-icons/fi icon name, rendered on the frontend
    price: { type: String, trim: true }, // e.g. "Starting at Rs 499" — free text since services are quoted, not fixed-price
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 }, // controls display order on the Service page
  },
  { timestamps: true }
);

serviceSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Service', serviceSchema);
