const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

// Configured once, entirely from server-side env vars. CLOUDINARY_API_SECRET
// never reaches the frontend bundle — the browser only ever talks to our own
// backend (/api/v1/uploads/*), which then talks to Cloudinary over HTTPS
// using this signed config.
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

// Catches the two most common misconfigurations: the var is missing entirely,
// or it's still the literal placeholder text from .env.example (people often
// copy the file and forget to swap in real values, which otherwise fails
// silently on every upload with a confusing Cloudinary SDK error).
function isPlaceholder(value) {
  return !value || /your_cloudinary/i.test(value);
}

if (isPlaceholder(CLOUDINARY_CLOUD_NAME) || isPlaceholder(CLOUDINARY_API_KEY) || isPlaceholder(CLOUDINARY_API_SECRET)) {
  logger.error(
    'Cloudinary is not configured: CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in .env ' +
    'are missing or still placeholder values. Get real ones from https://console.cloudinary.com/settings/api-keys, ' +
    'paste them into backend/.env, and restart the server. Uploads will fail until this is fixed.'
  );
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

// Root folder for every asset this app uploads, namespaced by env so dev/stage
// uploads never collide with production ones in the same Cloudinary account.
const ROOT_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || 'mytechwings';

module.exports = { cloudinary, ROOT_FOLDER };