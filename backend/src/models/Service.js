const mongoose = require('mongoose');

// Powers the fixed sections of the public "Service" page (hero, warranty
// promise, "how we work" intro) — same singleton pattern as AboutSection /
// ContactInfo. The repeatable "How We Work" step cards themselves live in
// the separate `ServiceCard` collection (title/description/image/order).
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true, default: '' },
    publicId: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const serviceContentSchema = new mongoose.Schema(
  {
    // ---- Hero ----
    heroHeading: {
      type: String,
      trim: true,
      maxlength: 300,
      default: 'Your Laptop Deserves Better Than a Guess.\nSlow laptop? Cracked screen?\nBattery draining fast? Whatever the issue',
    },
    heroDescription: {
      type: String,
      trim: true,
      maxlength: 1000,
      default:
        "we take a good look first, explain what's needed, and fix it carefully.\nJireh Byte Tech Solutions is Chennai's dedicated laptop service center in Chennai.\nDrop it off and walk out with a laptop that works. We work on every major brand — no exceptions",
    },
    enquiryButtonText: { type: String, trim: true, maxlength: 60, default: 'Laptop Enquiry Form' },
    enquiryButtonLink: { type: String, trim: true, maxlength: 300, default: '/contact' },

    // ---- Warranty Protection Promise ----
    warrantyTitle: { type: String, trim: true, maxlength: 100, default: 'Warranty Protection Promise:' },
    warrantyDescription: {
      type: String,
      trim: true,
      maxlength: 1000,
      default:
        'We never open laptops still under brand warranty. Out-of-warranty devices are assessed transparently — and serviced only with your go-ahead.\nMost common repairs resolved same-day or next-day — subject to part availability.',
    },
    warrantyImage: { type: imageSchema, default: () => ({}) },

    // ---- How We Work ----
    howWeWorkTitle: { type: String, trim: true, maxlength: 100, default: 'How We work' },
    howWeWorkDescription: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "We assess first, then quote — so you know exactly what you're paying for and why, before any work begins.",
    },
    howWeWorkImage: { type: imageSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceContent', serviceContentSchema);