const ServiceContent = require('../models/Service');
const ServiceCard = require('../models/ServiceCard');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const { cacheAside, invalidateByPrefix } = require('../config/redis');

// ---------------------------------------------------------------------
// Content (singleton): hero, warranty promise, "how we work" intro copy.
// ---------------------------------------------------------------------

async function getOrCreateContent() {
  let doc = await ServiceContent.findOne();
  if (!doc) doc = await ServiceContent.create({});
  return doc;
}

// Schema defaults for just the "how we work" intro fields, read off an
// unsaved document (no DB hit) so DELETE can reset the intro without
// duplicating the default copy from the model here.
function getHowWeWorkDefaults() {
  const defaults = new ServiceContent();
  return {
    howWeWorkTitle: defaults.howWeWorkTitle,
    howWeWorkDescription: defaults.howWeWorkDescription,
    howWeWorkImage: { url: '', publicId: '' },
  };
}

// GET /api/v1/services/content  (public, cached)
exports.getServiceContent = asyncHandler(async (req, res) => {
  const content = await cacheAside('services:content', 300, async () => {
    const doc = await getOrCreateContent();
    return doc.toObject();
  });
  res.status(200).json({ success: true, content });
});

// GET /api/v1/services/content/admin  (admin — uncached, for editing)
exports.getServiceContentAdmin = asyncHandler(async (req, res) => {
  const content = await getOrCreateContent();
  res.status(200).json({ success: true, content });
});

// PATCH /api/v1/services/content  (admin — upserts the single content document)
exports.updateServiceContent = asyncHandler(async (req, res) => {
  const {
    heroHeading,
    heroDescription,
    enquiryButtonText,
    enquiryButtonLink,
    warrantyTitle,
    warrantyDescription,
    warrantyImage,
    howWeWorkTitle,
    howWeWorkDescription,
    howWeWorkImage,
  } = req.body;

  const update = {
    heroHeading,
    heroDescription,
    enquiryButtonText,
    enquiryButtonLink,
    warrantyTitle,
    warrantyDescription,
    warrantyImage,
    howWeWorkTitle,
    howWeWorkDescription,
    howWeWorkImage,
  };
  Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

  const content = await ServiceContent.findOneAndUpdate({}, update, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  });

  await invalidateByPrefix('services:');
  res.status(200).json({ success: true, content });
});

// ---------------------------------------------------------------------
// How We Work (intro) sub-resource: title + description + image for just
// the intro copy above the step cards. Exposed separately from the
// general PATCH /content above so this one section can be created, fully
// replaced, or reset independently of the hero/warranty copy.
// ---------------------------------------------------------------------

// POST /api/v1/services/content/how-we-work  (admin — sets the intro;
// creates the parent content document too if this is the very first save)
exports.createHowWeWorkIntro = asyncHandler(async (req, res) => {
  const { howWeWorkTitle, howWeWorkDescription, howWeWorkImage } = req.body;

  const update = {};
  if (howWeWorkTitle !== undefined) update.howWeWorkTitle = howWeWorkTitle;
  if (howWeWorkDescription !== undefined) update.howWeWorkDescription = howWeWorkDescription;
  if (howWeWorkImage !== undefined) update.howWeWorkImage = howWeWorkImage;

  const content = await ServiceContent.findOneAndUpdate({}, update, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  });

  await invalidateByPrefix('services:');
  res.status(201).json({ success: true, content });
});

// PUT /api/v1/services/content/how-we-work  (admin — full replace: any of
// the three fields left out of the request body resets to its schema
// default, standard REST PUT semantics)
exports.replaceHowWeWorkIntro = asyncHandler(async (req, res) => {
  const defaults = getHowWeWorkDefaults();
  const {
    howWeWorkTitle = defaults.howWeWorkTitle,
    howWeWorkDescription = defaults.howWeWorkDescription,
    howWeWorkImage = defaults.howWeWorkImage,
  } = req.body;

  const content = await ServiceContent.findOneAndUpdate(
    {},
    { howWeWorkTitle, howWeWorkDescription, howWeWorkImage },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  await invalidateByPrefix('services:');
  res.status(200).json({ success: true, content });
});

// DELETE /api/v1/services/content/how-we-work  (admin — clears the intro
// back to its schema defaults, without touching hero/warranty content)
exports.deleteHowWeWorkIntro = asyncHandler(async (req, res) => {
  const content = await ServiceContent.findOneAndUpdate({}, getHowWeWorkDefaults(), {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  });

  await invalidateByPrefix('services:');
  res.status(200).json({ success: true, content });
});

// ---------------------------------------------------------------------
// Cards (repeatable): the "How We Work" step cards, each with an image.
// ---------------------------------------------------------------------

// GET /api/v1/services/cards  (public, cached — used by the Service page)
exports.getServiceCards = asyncHandler(async (req, res) => {
  const cards = await cacheAside('services:cards', 300, () =>
    ServiceCard.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean()
  );
  res.status(200).json({ success: true, cards });
});

// GET /api/v1/services/cards/admin/all  (admin — includes inactive so they can be re-enabled)
exports.getAllServiceCardsAdmin = asyncHandler(async (req, res) => {
  const cards = await ServiceCard.find({}).sort({ order: 1, createdAt: 1 }).lean();
  res.status(200).json({ success: true, cards });
});

exports.getServiceCardById = asyncHandler(async (req, res) => {
  const card = await ServiceCard.findById(req.params.id);
  if (!card) throw new AppError('Service card not found', 404);
  res.status(200).json({ success: true, card });
});

exports.createServiceCard = asyncHandler(async (req, res) => {
  const card = await ServiceCard.create(req.body);
  await invalidateByPrefix('services:');
  res.status(201).json({ success: true, card });
});

exports.updateServiceCard = asyncHandler(async (req, res) => {
  const card = await ServiceCard.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!card) throw new AppError('Service card not found', 404);
  await invalidateByPrefix('services:');
  res.status(200).json({ success: true, card });
});

exports.deleteServiceCard = asyncHandler(async (req, res) => {
  const card = await ServiceCard.findByIdAndDelete(req.params.id);
  if (!card) throw new AppError('Service card not found', 404);
  await invalidateByPrefix('services:');
  res.status(200).json({ success: true, message: 'Service card deleted' });
});