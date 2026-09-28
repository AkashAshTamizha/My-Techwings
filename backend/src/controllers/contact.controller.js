const ContactInfo = require('../models/ContactInfo');
const ContactContent = require('../models/ContactContent');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const { cacheAside, invalidateByPrefix } = require('../config/redis');

// ---------------------------------------------------------------------
// Content (singleton): hero, "Get in Touch", phone, email, map copy that
// powers the fixed layout of the public Contact page (see Contact.jsx /
// AdminContact.jsx). Same pattern as Service's ServiceContent.
// ---------------------------------------------------------------------

async function getOrCreateContactContent() {
  let doc = await ContactContent.findOne();
  if (!doc) doc = await ContactContent.create({});
  return doc;
}

// GET /api/v1/contact  (public, cached — used by the Contact page)
exports.getContactContent = asyncHandler(async (req, res) => {
  const contact = await cacheAside('contact:content', 300, async () => {
    const doc = await getOrCreateContactContent();
    return doc.toObject();
  });
  res.status(200).json({ success: true, contact });
});

// GET /api/v1/contact/admin  (admin — uncached, for editing)
exports.getContactContentAdmin = asyncHandler(async (req, res) => {
  const contact = await getOrCreateContactContent();
  res.status(200).json({ success: true, contact });
});

// PATCH /api/v1/contact  (admin — upserts the single content document)
exports.updateContactContent = asyncHandler(async (req, res) => {
  const {
    heroHeading,
    heroSubheading,
    getInTouchTitle,
    getInTouchDescription,
    phoneLabel,
    phoneValue,
    emailLabel,
    emailValue,
    mapImage,
  } = req.body;

  const update = {
    heroHeading,
    heroSubheading,
    getInTouchTitle,
    getInTouchDescription,
    phoneLabel,
    phoneValue,
    emailLabel,
    emailValue,
    mapImage,
  };
  Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

  const contact = await ContactContent.findOneAndUpdate({}, update, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  });

  await invalidateByPrefix('contact:');
  res.status(200).json({ success: true, contact });
});

// ---------------------------------------------------------------------
// Items (repeatable, legacy resource — kept for backward compatibility;
// not used by the current Contact page, which reads the singleton content
// above).
// ---------------------------------------------------------------------

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
