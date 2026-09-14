import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // send/receive httpOnly cookies (JWT + CSRF)
  timeout: 25000,
});

let csrfToken = null;

// Fetch a CSRF token once and attach it to every mutating request. The
// backend issues the token via GET /csrf-token and validates the
// `x-csrf-token` header against the accompanying httpOnly cookie
// (double-submit pattern) on POST/PATCH/DELETE.
async function ensureCsrfToken() {
  if (csrfToken) return csrfToken;
  const { data } = await api.get('/csrf-token');
  csrfToken = data.csrfToken;
  return csrfToken;
}

api.interceptors.request.use(async (config) => {
  if (['post', 'patch', 'delete', 'put'].includes(config.method)) {
    config.headers['x-csrf-token'] = await ensureCsrfToken();
  }
  return config;
});

// ---- Products ----
export const getProducts = (params = {}) => api.get('/products', { params }).then((r) => r.data);
export const getProductBySlug = (slug) => api.get(`/products/${slug}`).then((r) => r.data);
export const getCategorySummary = () => api.get('/products/categories/summary').then((r) => r.data);
// Distinct categories/brands/price-range/screen-sizes derived from the DB,
// used to populate the Filters sidebar instead of hard-coded option lists.
export const getProductFilters = () => api.get('/products/filters').then((r) => r.data);
// Category -> dynamic spec-field config (drives the Add/Edit Product form's
// "which inputs to show" logic; adding a new category server-side needs no
// frontend code change because this is fetched, not hard-coded).
export const getCategorySpecs = () => api.get('/products/category-specs').then((r) => r.data);

// ---- Inquiries (user details form -> WhatsApp) ----
export const submitInquiry = (payload) => api.post('/inquiries', payload).then((r) => r.data);

// ---- Auth (admin) ----
export const checkAdminExists = () => api.get('/auth/admin-exists').then((r) => r.data);
export const register = (payload) => api.post('/auth/register', payload).then((r) => r.data);
export const login = (payload) => api.post('/auth/login', payload).then((r) => r.data);
export const logout = () => api.post('/auth/logout').then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data);
export const updatePassword = (payload) => api.patch('/auth/update-password', payload).then((r) => r.data);
// Forgot password: step 1 verifies { email, recoveryCode } and returns a
// short-lived resetToken; step 2 spends that token to set a new password.
export const forgotPasswordVerify = (payload) => api.post('/auth/forgot-password/verify', payload).then((r) => r.data);
export const resetPassword = (payload) => api.post('/auth/forgot-password/reset', payload).then((r) => r.data);
export const regenerateRecoveryCode = (payload) => api.post('/auth/regenerate-recovery-code', payload).then((r) => r.data);

// ---- Admin: Products ----
export const getProductByIdAdmin = (id) => api.get(`/products/admin/${id}`).then((r) => r.data);
export const createProduct = (payload) => api.post('/products', payload).then((r) => r.data);
export const updateProduct = (id, payload) => api.patch(`/products/${id}`, payload).then((r) => r.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then((r) => r.data);

// ---- Admin: Cloudinary uploads ----
// `folder` must be one of 'products' | 'variants' | 'files' (validated again
// server-side — the frontend value is just a routing hint, never trusted).
export const uploadImage = (file, folder = 'products', onUploadProgress) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);
  return api
    .post('/uploads/image', formData, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress })
    .then((r) => r.data);
};

export const uploadImages = (files, folder = 'products', onUploadProgress) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('images', file));
  formData.append('folder', folder);
  return api
    .post('/uploads/images', formData, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress })
    .then((r) => r.data);
};

export const uploadProductFile = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  return api
    .post('/uploads/file', formData, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress })
    .then((r) => r.data);
};

export const deleteUploadedImage = (publicId, resourceType = 'image') =>
  api.delete('/uploads', { params: { publicId, resourceType } }).then((r) => r.data);

// ---- Services (public) ----
export const getServices = () => api.get('/services').then((r) => r.data);

// ---- Admin: Services ----
export const getAllServicesAdmin = () => api.get('/services/admin/all').then((r) => r.data);
export const getServiceById = (id) => api.get(`/services/${id}`).then((r) => r.data);
export const createService = (payload) => api.post('/services', payload).then((r) => r.data);
export const updateService = (id, payload) => api.patch(`/services/${id}`, payload).then((r) => r.data);
export const deleteService = (id) => api.delete(`/services/${id}`).then((r) => r.data);

// ---- About (public) ----
export const getAboutSections = () => api.get('/about').then((r) => r.data);

// ---- Admin: About ----
export const getAllAboutAdmin = () => api.get('/about/admin/all').then((r) => r.data);
export const getAboutSectionById = (id) => api.get(`/about/${id}`).then((r) => r.data);
export const createAboutSection = (payload) => api.post('/about', payload).then((r) => r.data);
export const updateAboutSection = (id, payload) => api.patch(`/about/${id}`, payload).then((r) => r.data);
export const deleteAboutSection = (id) => api.delete(`/about/${id}`).then((r) => r.data);

// ---- Contact (public) ----
export const getContactInfo = () => api.get('/contact').then((r) => r.data);

// ---- Admin: Contact ----
export const getAllContactAdmin = () => api.get('/contact/admin/all').then((r) => r.data);
export const getContactInfoById = (id) => api.get(`/contact/${id}`).then((r) => r.data);
export const createContactInfo = (payload) => api.post('/contact', payload).then((r) => r.data);
export const updateContactInfo = (id, payload) => api.patch(`/contact/${id}`, payload).then((r) => r.data);
export const deleteContactInfo = (id) => api.delete(`/contact/${id}`).then((r) => r.data);

// ---- Slider (public) ----
export const getSliders = () => api.get('/sliders').then((r) => r.data);

// ---- Admin: Slider ----
export const getAllSlidersAdmin = () => api.get('/sliders/admin/all').then((r) => r.data);
export const getSliderById = (id) => api.get(`/sliders/${id}`).then((r) => r.data);
export const createSlider = (payload) => api.post('/sliders', payload).then((r) => r.data);
export const updateSlider = (id, payload) => api.patch(`/sliders/${id}`, payload).then((r) => r.data);
export const deleteSlider = (id) => api.delete(`/sliders/${id}`).then((r) => r.data);

// ---- Admin: Attribute keys (reusable name registry for product/variant
// "Additional attributes" — see AttributeManager.jsx) ----
export const getAttributeKeys = () => api.get('/attribute-keys').then((r) => r.data);
export const createAttributeKey = (name) => api.post('/attribute-keys', { name }).then((r) => r.data);

export default api;
