const Service = require('../models/Service');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const { cacheAside, invalidateByPrefix } = require('../config/redis');

// GET /api/v1/services  (public, cached — used by the Service page)
exports.getServices = asyncHandler(async (req, res) => {
  const services = await cacheAside('services:all', 300, () =>
    Service.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean()
  );
  res.status(200).json({ success: true, services });
});

// GET /api/v1/services/admin  (admin — includes inactive so they can be re-enabled)
exports.getAllServicesAdmin = asyncHandler(async (req, res) => {
  const services = await Service.find({}).sort({ order: 1, createdAt: 1 }).lean();
  res.status(200).json({ success: true, services });
});

exports.getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw new AppError('Service not found', 404);
  res.status(200).json({ success: true, service });
});

exports.createService = asyncHandler(async (req, res) => {
  const service = await Service.create(req.body);
  await invalidateByPrefix('services:');
  res.status(201).json({ success: true, service });
});

exports.updateService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!service) throw new AppError('Service not found', 404);
  await invalidateByPrefix('services:');
  res.status(200).json({ success: true, service });
});

exports.deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) throw new AppError('Service not found', 404);
  await invalidateByPrefix('services:');
  res.status(200).json({ success: true, message: 'Service deleted' });
});
