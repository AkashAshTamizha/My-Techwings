const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const { uploadBufferToCloudinary, deleteFromCloudinary, ALLOWED_FOLDERS } = require('../utils/cloudinaryUpload');

function toImagePayload(cloudinaryResult) {
  return {
    url: cloudinaryResult.secure_url,
    publicId: cloudinaryResult.public_id,
    width: cloudinaryResult.width,
    height: cloudinaryResult.height,
    format: cloudinaryResult.format,
    bytes: cloudinaryResult.bytes,
  };
}

function resolveRequestedFolder(req) {
  const requested = req.body?.folder || req.query?.folder;
  return ALLOWED_FOLDERS.includes(requested) ? requested : 'products';
}

// POST /api/v1/uploads/image  (multipart field: "image")
// Used for a single product image or a single variant image.
exports.uploadSingleImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No image file provided', 400);

  const folder = resolveRequestedFolder(req);
  const result = await uploadBufferToCloudinary(req.file.buffer, { folder, resourceType: 'image' });

  res.status(201).json({ success: true, image: toImagePayload(result) });
});

// POST /api/v1/uploads/images  (multipart field: "images", up to 10)
// Bulk upload for the product/variant gallery — uploads run in parallel and
// partial failures are reported per-file instead of failing the whole batch.
exports.uploadMultipleImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) throw new AppError('No image files provided', 400);

  const folder = resolveRequestedFolder(req);

  const settled = await Promise.allSettled(
    req.files.map((file) => uploadBufferToCloudinary(file.buffer, { folder, resourceType: 'image' }))
  );

  const images = [];
  const errors = [];

  settled.forEach((outcome, idx) => {
    const originalName = req.files[idx].originalname;
    if (outcome.status === 'fulfilled') {
      images.push({ originalName, ...toImagePayload(outcome.value) });
    } else {
      errors.push({ originalName, message: outcome.reason?.message || 'Upload failed' });
    }
  });

  res.status(errors.length && images.length === 0 ? 502 : 201).json({
    success: images.length > 0,
    images,
    errors,
  });
});

// POST /api/v1/uploads/file  (multipart field: "file")
// For any non-image product-related document (spec sheet, manual, etc.).
exports.uploadSingleFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file provided', 400);

  const isImage = req.file.mimetype.startsWith('image/');
  const result = await uploadBufferToCloudinary(req.file.buffer, {
    folder: 'files',
    resourceType: isImage ? 'image' : 'raw',
  });

  res.status(201).json({
    success: true,
    file: {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
      originalName: req.file.originalname,
    },
  });
});

// DELETE /api/v1/uploads?publicId=mytechwings/products/abc123&resourceType=image
// publicId is passed as a query param (not a route param) because it
// legitimately contains slashes.
exports.deleteUpload = asyncHandler(async (req, res) => {
  const { publicId } = req.query;
  const resourceType = req.query.resourceType === 'raw' ? 'raw' : 'image';

  const result = await deleteFromCloudinary(publicId, resourceType);

  if (result.result !== 'ok' && result.result !== 'not found') {
    throw new AppError('Failed to delete asset from Cloudinary', 502);
  }

  res.status(200).json({ success: true, result: result.result });
});
