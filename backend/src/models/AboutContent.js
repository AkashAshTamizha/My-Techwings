const mongoose = require('mongoose');

// Powers the fixed sections of the public "About" page (hero, "Story about
// us", "What We Repair") — same singleton pattern as ServiceContent. This is
// the single content document edited from /admin/about (see AdminAbout.jsx)
// and rendered by About.jsx. Distinct from the repeatable `AboutSection`
// collection, which is a separate, unrelated resource.
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true, default: '' },
    publicId: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const aboutContentSchema = new mongoose.Schema(
  {
    // ---- Hero ----
    heroHeading: {
      type: String,
      trim: true,
      maxlength: 300,
      default: 'Bringing over **5+** Years of Trusted experience to Chennai for the past **3+** Years.',
    },

    // ---- Story about us ----
    storyTitle: { type: String, trim: true, maxlength: 100, default: 'Story about us' },
    storyDescription: { type: String, trim: true, maxlength: 2000, default: '' },
    storyImage: { type: imageSchema, default: () => ({}) },

    // ---- What We Repair ----
    repairTitle: { type: String, trim: true, maxlength: 100, default: 'What We Repair' },
    repairDescription: { type: String, trim: true, maxlength: 2000, default: '' },
    // Pipe-separated list of repair services, e.g. "Screen Replacement | Keyboard Replacement"
    repairServicesList: { type: String, trim: true, maxlength: 2000, default: '' },
    repairImage: { type: imageSchema, default: () => ({}) },
    enquiryButtonText: { type: String, trim: true, maxlength: 60, default: 'Service Enquiry Form' },
    enquiryButtonLink: { type: String, trim: true, maxlength: 300, default: '/contact' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AboutContent', aboutContentSchema);
