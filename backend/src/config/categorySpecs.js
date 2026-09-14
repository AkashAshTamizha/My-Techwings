// Single source of truth for "which category maps to which product type,
// and which spec fields does that product type need". Everything else
// (validation, the Add/Edit Product form, and the Product Details page)
// reads from this file instead of hard-coding fields anywhere else, so
// adding support for a brand-new category is a one-time edit here — no
// schema migration and no changes to controllers/routes/React components.
//
// `productType` groups several categories under one spec set (e.g. all
// laptop sub-categories share the same Laptop spec fields), which is how
// the existing Ultrabook/Gaming/Business/Refurbished categories keep
// working unchanged.
//
// Field shape: { key, label, type: 'text' | 'select', options?: string[] }
// `key` is the property name stored inside a product's `specs` map.

const LAPTOP_FIELDS = [
  { key: 'processor', label: 'Processor', type: 'text' },
  { key: 'ram', label: 'RAM', type: 'text' },
  { key: 'storage', label: 'Storage', type: 'text' },
  { key: 'display', label: 'Display', type: 'text' },
];

const PRINTER_FIELDS = [
  { key: 'printType', label: 'Print Type', type: 'select', options: ['Inkjet', 'LaserJet', 'Dot Matrix', 'All-in-One'] },
  { key: 'printSpeed', label: 'Print Speed (ppm)', type: 'text' },
  { key: 'resolution', label: 'Resolution', type: 'text' },
  { key: 'connectivity', label: 'Connectivity', type: 'text' },
  { key: 'duplex', label: 'Duplex Printing', type: 'select', options: ['Yes', 'No'] },
];

const CAMERA_FIELDS = [
  { key: 'sensorType', label: 'Sensor Type', type: 'text' },
  { key: 'megapixels', label: 'Megapixels', type: 'text' },
  { key: 'lensMount', label: 'Lens Mount', type: 'text' },
  { key: 'videoResolution', label: 'Video Resolution', type: 'text' },
  { key: 'zoom', label: 'Optical Zoom', type: 'text' },
];

const CCTV_FIELDS = [
  { key: 'cameraType', label: 'Camera Type', type: 'select', options: ['Dome', 'Bullet', 'PTZ', 'Turret'] },
  { key: 'resolution', label: 'Resolution', type: 'text' },
  { key: 'nightVision', label: 'Night Vision', type: 'select', options: ['Yes', 'No'] },
  { key: 'storageType', label: 'Storage Type', type: 'text' },
  { key: 'channels', label: 'Channels', type: 'text' },
];

// Ordered list of every selectable category, and which spec-field set it uses.
// Order here is the order shown in the admin "Category" dropdown.
const CATEGORY_CONFIG = [
  { category: 'Laptop', productType: 'Laptop', fields: LAPTOP_FIELDS },
  { category: 'Ultrabook', productType: 'Laptop', fields: LAPTOP_FIELDS },
  { category: 'Gaming', productType: 'Laptop', fields: LAPTOP_FIELDS },
  { category: 'Business', productType: 'Laptop', fields: LAPTOP_FIELDS },
  { category: 'Refurbished', productType: 'Laptop', fields: LAPTOP_FIELDS },
  { category: 'Printer', productType: 'Printer', fields: PRINTER_FIELDS },
  { category: 'Camera', productType: 'Camera', fields: CAMERA_FIELDS },
  { category: 'CCTV', productType: 'CCTV', fields: CCTV_FIELDS },
];

const CATEGORIES = CATEGORY_CONFIG.map((c) => c.category);

// { Laptop: [...fields], Ultrabook: [...fields], Printer: [...], ... }
const SPEC_FIELDS_BY_CATEGORY = CATEGORY_CONFIG.reduce((acc, c) => {
  acc[c.category] = c.fields;
  return acc;
}, {});

function getSpecFields(category) {
  return SPEC_FIELDS_BY_CATEGORY[category] || [];
}

module.exports = {
  CATEGORY_CONFIG,
  CATEGORIES,
  SPEC_FIELDS_BY_CATEGORY,
  getSpecFields,
};
