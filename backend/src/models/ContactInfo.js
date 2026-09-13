const mongoose = require('mongoose');

// Powers the public "Contact" page (address / phone / email / WhatsApp /
// hours / social links) and is fully manageable from the admin screen
// (create / edit / delete / reorder), same pattern as Service.
const contactInfoSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['address', 'phone', 'whatsapp', 'email', 'hours', 'social', 'other'],
      default: 'other',
    },
    label: { type: String, required: true, trim: true, maxlength: 100 }, // e.g. "Store Address", "Support Email"
    value: { type: String, required: true, trim: true, maxlength: 300 }, // e.g. "Chennai, Tamil Nadu" or "+91 94457 54129"
    link: { type: String, trim: true, maxlength: 500 }, // optional href, e.g. "https://wa.me/919445754129" or "mailto:..."
    icon: { type: String, trim: true, maxlength: 50 }, // optional react-icons/fi name
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 }, // controls display order on the Contact page
  },
  { timestamps: true }
);

contactInfoSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('ContactInfo', contactInfoSchema);
