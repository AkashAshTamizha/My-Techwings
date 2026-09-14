const streamifier = require('streamifier');
const { cloudinary, ROOT_FOLDER } = require('../config/cloudinary');
const AppError = require('./AppError');

// Only these sub-folders are allowed so a caller can never write into an
// arbitrary Cloudinary path via a crafted request body.
const ALLOWED_FOLDERS = ['products', 'variants', 'files', 'slider'];

function resolveFolder(folder) {
  const safe = ALLOWED_FOLDERS.includes(folder) ? folder : 'products';
  return `${ROOT_FOLDER}/${safe}`;
}

/**
 * Uploads a single in-memory buffer (from multer) to Cloudinary via a
 * streamed upload — nothing ever touches disk or gets held in the DB.
 * @param {Buffer} buffer
 * @param {{ folder: string, resourceType?: 'image'|'raw'|'auto' }} options
 */
function uploadBufferToCloudinary(buffer, { folder, resourceType = 'image' } = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: resolveFolder(folder),
        resource_type: resourceType,
        // Keep a reasonable max dimension for product photos; Cloudinary
        // stores the original too, this just caps what get served by default.
        transformation: resourceType === 'image' ? [{ width: 2000, height: 2000, crop: 'limit' }] : undefined,
      },
      (error, result) => {
        if (error) {
          // Cloudinary returns a generic network-style error ("Request
          // Timeout", ENOTFOUND, 401 Invalid Signature, etc.) when the
          // cloud_name/api_key/api_secret are wrong rather than a clear
          // "bad credentials" message, which is confusing to debug from the
          // frontend alone. Re-wrap it here so both the server log and the
          // JSON response actually point at the fix.
          const looksLikeAuthOrConfigIssue =
            error.http_code === 401 ||
            error.http_code === 404 ||
            /timeout/i.test(error.message || '') ||
            /ENOTFOUND|ECONNREFUSED/i.test(error.message || '');

          // Always log the raw Cloudinary error server-side — the wrapped
          // message below is a helpful guess for the client, but the real
          // cause (ETIMEDOUT, ECONNRESET, 401 Invalid Signature, ENOTFOUND,
          // etc.) is what actually tells us whether this is bad credentials
          // vs. a network/firewall/antivirus problem blocking the connection.
          // eslint-disable-next-line no-console
          console.error('[Cloudinary upload error - raw]', error);

          if (looksLikeAuthOrConfigIssue) {
            return reject(
              new AppError(
                'Image upload failed: Cloudinary rejected the request. Check that CLOUDINARY_CLOUD_NAME, ' +
                'CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env are the real values from ' +
                'https://console.cloudinary.com/settings/api-keys (not placeholders/mistyped), then restart the server.',
                502
              )
            );
          }
          return reject(error);
        }
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

function deleteFromCloudinary(publicId, resourceType = 'image') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

module.exports = { uploadBufferToCloudinary, deleteFromCloudinary, ALLOWED_FOLDERS };