export function formatINR(amount) {
  if (amount == null) return '';
  return `Rs ${Number(amount).toLocaleString('en-IN')}`;
}

// A URL only counts as usable if it's a well-formed absolute http(s) URL.
// Guards against blank strings, relative fragments, or corrupted values ever
// reaching an <img src>, where they'd otherwise render as a broken-image icon
// with no visible explanation.
export function isValidImageUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// Product/variant images moved from plain URL strings to Cloudinary objects
// ({ url, publicId, isPrimary, ... }). This accepts either shape so any
// legacy data seeded before the migration keeps rendering correctly, and
// returns null (never a broken/relative string) if the URL isn't usable —
// callers can then show a clean placeholder instead of a broken-image icon.
export function getImageUrl(image) {
  if (!image) return null;
  const url = typeof image === 'string' ? image : image.url;
  return isValidImageUrl(url) ? url : null;
}

// Picks the primary image (or the first one) from a product/variant images
// array, in either the legacy string or new Cloudinary-object shape. Skips
// over any entry whose URL turns out to be invalid rather than surfacing it.
export function getPrimaryImageUrl(images) {
  if (!Array.isArray(images) || images.length === 0) return null;
  const withValidUrls = images.filter((img) => getImageUrl(img));
  if (withValidUrls.length === 0) return null;
  const primary = withValidUrls.find((img) => img && typeof img === 'object' && img.isPrimary);
  return getImageUrl(primary || withValidUrls[0]);
}
