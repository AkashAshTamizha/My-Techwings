const AboutSection = require('../models/AboutSection');
const AboutContent = require('../models/AboutContent');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const { cacheAside, invalidateByPrefix } = require('../config/redis');

// ---------------------------------------------------------------------
// Content (singleton): hero, "Story about us", "What We Repair" copy that
// powers the fixed layout of the public About page (see About.jsx /
// AdminAbout.jsx). Same pattern as Service's ServiceContent.
// ---------------------------------------------------------------------

async function getOrCreateAboutContent() {
  let doc = await AboutContent.findOne();
  if (!doc) doc = await AboutContent.create({});
  return doc;
}

// GET /api/v1/about  (public, cached — used by the About page)
exports.getAboutContent = asyncHandler(async (req, res) => {
  const about = await cacheAside('about:content', 300, async () => {
    const doc = await getOrCreateAboutContent();
    return doc.toObject();
  });
  res.status(200).json({ success: true, about });
});

// GET /api/v1/about/admin  (admin — uncached, for editing)
exports.getAboutContentAdmin = asyncHandler(async (req, res) => {
  const about = await getOrCreateAboutContent();
  res.status(200).json({ success: true, about });
});

// PATCH /api/v1/about  (admin — upserts the single content document)
exports.updateAboutContent = asyncHandler(async (req, res) => {
  const {
    heroHeading,
    storyTitle,
    storyDescription,
    storyImage,
    repairTitle,
    repairDescription,
    repairServicesList,
    repairImage,
    enquiryButtonText,
    enquiryButtonLink,
  } = req.body;

  const update = {
    heroHeading,
    storyTitle,
    storyDescription,
    storyImage,
    repairTitle,
    repairDescription,
    repairServicesList,
    repairImage,
    enquiryButtonText,
    enquiryButtonLink,
  };
  Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

  const about = await AboutContent.findOneAndUpdate({}, update, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  });

  await invalidateByPrefix('about:');
  res.status(200).json({ success: true, about });
});

// ---------------------------------------------------------------------
// Sections (repeatable, legacy resource — kept for backward compatibility;
// not used by the current About page, which reads the singleton content
// above).
// ---------------------------------------------------------------------

exports.getAboutSections = asyncHandler(async (req, res) => {
  const sections = await cacheAside('about:all', 300, () =>
    AboutSection.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean()
  );
  res.status(200).json({ success: true, sections });
});

// GET /api/v1/about/admin/all  (admin — includes inactive so they can be re-enabled)
exports.getAllAboutAdmin = asyncHandler(async (req, res) => {
  const sections = await AboutSection.find({}).sort({ order: 1, createdAt: 1 }).lean();
  res.status(200).json({ success: true, sections });
});

exports.getAboutSectionById = asyncHandler(async (req, res) => {
  const section = await AboutSection.findById(req.params.id);
  if (!section) throw new AppError('About section not found', 404);
  res.status(200).json({ success: true, section });
});

exports.createAboutSection = asyncHandler(async (req, res) => {
  const section = await AboutSection.create(req.body);
  await invalidateByPrefix('about:');
  res.status(201).json({ success: true, section });
});

exports.updateAboutSection = asyncHandler(async (req, res) => {
  const section = await AboutSection.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!section) throw new AppError('About section not found', 404);
  await invalidateByPrefix('about:');
  res.status(200).json({ success: true, section });
});

exports.deleteAboutSection = asyncHandler(async (req, res) => {
  const section = await AboutSection.findByIdAndDelete(req.params.id);
  if (!section) throw new AppError('About section not found', 404);
  await invalidateByPrefix('about:');
  res.status(200).json({ success: true, message: 'About section deleted' });
});
