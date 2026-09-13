const ContactInfo = require('../models/ContactInfo');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const { cacheAside, invalidateByPrefix } = require('../config/redis');

// GET /api/v1/contact  (public, cached — used by the Contact page)
exports.getContactInfo = asyncHandler(async (req, res) => {
  const items = await cacheAside('contact:all', 300, () =>
    ContactInfo.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean()
  );
  res.status(200).json({ success: true, items });
});

// GET /api/v1/contact/admin/all  (admin — includes inactive so they can be re-enabled)
exports.getAllContactAdmin = asyncHandler(async (req, res) => {
  const items = await ContactInfo.find({}).sort({ order: 1, createdAt: 1 }).lean();
  res.status(200).json({ success: true, items });
});

exports.getContactInfoById = asyncHandler(async (req, res) => {
  const item = await ContactInfo.findById(req.params.id);
  if (!item) throw new AppError('Contact info not found', 404);
  res.status(200).json({ success: true, item });
});

exports.createContactInfo = asyncHandler(async (req, res) => {
  const item = await ContactInfo.create(req.body);
  await invalidateByPrefix('contact:');
  res.status(201).json({ success: true, item });
});

exports.updateContactInfo = asyncHandler(async (req, res) => {
  const item = await ContactInfo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) throw new AppError('Contact info not found', 404);
  await invalidateByPrefix('contact:');
  res.status(200).json({ success: true, item });
});

exports.deleteContactInfo = asyncHandler(async (req, res) => {
  const item = await ContactInfo.findByIdAndDelete(req.params.id);
  if (!item) throw new AppError('Contact info not found', 404);
  await invalidateByPrefix('contact:');
  res.status(200).json({ success: true, message: 'Contact info deleted' });
});
