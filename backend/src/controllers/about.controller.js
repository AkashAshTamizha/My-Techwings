const AboutSection = require('../models/AboutSection');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const { cacheAside, invalidateByPrefix } = require('../config/redis');

// GET /api/v1/about  (public, cached — used by the About page)
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
