const Slider = require('../models/Slider');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const { cacheAside, invalidateByPrefix } = require('../config/redis');

// GET /api/v1/sliders  (public, cached — used by the homepage hero slider)
exports.getSliders = asyncHandler(async (req, res) => {
  const slides = await cacheAside('sliders:all', 300, () =>
    Slider.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean()
  );
  res.status(200).json({ success: true, slides });
});

// GET /api/v1/sliders/admin/all  (admin — includes inactive so they can be re-enabled)
exports.getAllSlidersAdmin = asyncHandler(async (req, res) => {
  const slides = await Slider.find({}).sort({ order: 1, createdAt: 1 }).lean();
  res.status(200).json({ success: true, slides });
});

exports.getSliderById = asyncHandler(async (req, res) => {
  const slide = await Slider.findById(req.params.id);
  if (!slide) throw new AppError('Slide not found', 404);
  res.status(200).json({ success: true, slide });
});

exports.createSlider = asyncHandler(async (req, res) => {
  const slide = await Slider.create(req.body);
  await invalidateByPrefix('sliders:');
  res.status(201).json({ success: true, slide });
});

exports.updateSlider = asyncHandler(async (req, res) => {
  const slide = await Slider.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!slide) throw new AppError('Slide not found', 404);
  await invalidateByPrefix('sliders:');
  res.status(200).json({ success: true, slide });
});

exports.deleteSlider = asyncHandler(async (req, res) => {
  const slide = await Slider.findByIdAndDelete(req.params.id);
  if (!slide) throw new AppError('Slide not found', 404);
  await invalidateByPrefix('sliders:');
  res.status(200).json({ success: true, message: 'Slide deleted' });
});
