const mongoose = require('mongoose');

// Powers the fixed sections of the public "Contact" page (hero, "Get in
// Touch", phone, email, map image) — same singleton pattern as
// ServiceContent / AboutContent. This is the single content document edited
// from /admin/contact (see AdminContact.jsx) and rendered by Contact.jsx.
// Distinct from the repeatable `ContactInfo` collection, which is a
// separate, unrelated resource.
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true, default: '' },
    publicId: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const contactContentSchema = new mongoose.Schema(
  {
    // ---- Hero ----
    heroHeading: { type: String, trim: true, maxlength: 200, default: 'Any question or remarks?' },
    heroSubheading: { type: String, trim: true, maxlength: 200, default: 'Just write us a message!' },

    // ---- Get in Touch ----
    getInTouchTitle: { type: String, trim: true, maxlength: 100, default: 'Get in Touch' },
    getInTouchDescription: { type: String, trim: true, maxlength: 1000, default: '' },
    phoneLabel: { type: String, trim: true, maxlength: 50, default: 'PHONE' },
    phoneValue: { type: String, trim: true, maxlength: 50, default: '' },
    emailLabel: { type: String, trim: true, maxlength: 50, default: 'EMAIL' },
    emailValue: { type: String, trim: true, maxlength: 150, default: '' },
    mapImage: { type: imageSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactContent', contactContentSchema);
