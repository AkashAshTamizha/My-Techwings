import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { Loader } from '../../components/common/Loader';
import ImageUploader, { genId } from '../../components/admin/ImageUploader';
import AttributeManager from '../../components/admin/AttributeManager';
import VariantManager, { makeEmptyVariant } from '../../components/admin/VariantManager';
import { createProduct, updateProduct, getProductByIdAdmin } from '../../services/api';

const CATEGORIES = ['Ultrabook', 'Gaming', 'Business', 'Refurbished', 'CCTV', 'Printer'];

const emptyForm = {
  name: '',
  slug: '',
  sku: '',
  brand: '',
  category: 'Ultrabook',
  tag: '',
  price: '',
  compareAtPrice: '',
  screenSize: '',
  stock: 0,
  description: '',
  images: [],
  attributes: [],
  variants: [],
  specs: { processor: '', ram: '', storage: '', display: '' },
};

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// Attach a stable client-side `_key` to every image so ImageUploader can
// track it through uploads/reorders. Accepts the server's saved shape.
const withImageKeys = (images = []) => images.map((img) => ({ _key: genId(), ...img }));

// The backend still stores a product's extra specs as { name, values: [...] }
// (an array of values), but the admin UI now only ever needs a single value
// per row, so we flatten values[0] into a plain `value` string for editing
// and re-wrap it into an array on save (see cleanAttributes below).
const withAttributeKeys = (attributes = []) =>
  attributes.map((a) => ({
    _key: genId(),
    name: a.name || '',
    value: (a.values && a.values[0]) || '',
  }));

const withVariantAttributeKeys = (attributes = []) =>
  attributes.map((a) => ({ _key: genId(), name: a.name || '', value: a.value || '' }));

const withVariantKeys = (variants = []) =>
  variants.map((v) => ({
    ...makeEmptyVariant(),
    ...v,
    attributes: withVariantAttributeKeys(v.attributes),
    price: v.price ?? '',
    compareAtPrice: v.compareAtPrice ?? '',
    stock: v.stock ?? 0,
    images: withImageKeys(v.images),
  }));

// Strips local-only UI fields (_key, previewUrl, uploading, progress, error)
// before the images/variants are sent to the API, and drops any image that
// never finished uploading (no publicId yet).
const cleanImages = (images = []) =>
  images
    .filter((img) => img.publicId && img.url)
    .map(({ url, publicId, width, height, format, bytes, isPrimary }) => ({
      url,
      publicId,
      width,
      height,
      format,
      bytes,
      isPrimary: Boolean(isPrimary),
    }));

// Strips local-only UI fields from the extra-spec rows before saving, drops
// any row the admin left with no name or no value, and re-wraps the single
// edited value into the `values` array the backend schema expects.
const cleanAttributes = (attributes = []) =>
  attributes
    .filter((a) => a.name.trim() && a.value.trim())
    .map(({ name, value }) => ({
      name: name.trim(),
      values: [value.trim()],
      useForVariants: false,
    }));

const cleanVariantAttributes = (attributes = []) =>
  (attributes || [])
    .filter((a) => a.name.trim() && a.value.trim())
    .map(({ name, value }) => ({ name: name.trim(), value: value.trim() }));

const cleanVariants = (variants = []) =>
  variants.map(({ attributes, sku, price, compareAtPrice, stock, isActive, images }) => ({
    attributes: cleanVariantAttributes(attributes),
    sku: sku.trim().toUpperCase(),
    price: Number(price) || 0,
    compareAtPrice: compareAtPrice !== '' && compareAtPrice != null ? Number(compareAtPrice) : undefined,
    stock: Number(stock) || 0,
    isActive: isActive !== false,
    images: cleanImages(images),
  }));

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    getProductByIdAdmin(id)
      .then((data) => {
        const product = data.product;
        setForm({
          ...emptyForm,
          ...product,
          sku: product.sku || '',
          images: withImageKeys(product.images),
          attributes: withAttributeKeys(product.attributes),
          variants: withVariantKeys(product.variants),
          specs: { ...emptyForm.specs, ...product.specs },
        });
      })
      .catch(() => setError('Failed to load product'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const updateSpec = (field) => (e) => setForm((f) => ({ ...f, specs: { ...f.specs, [field]: e.target.value } }));

  const validate = () => {
    if (form.images.some((img) => img.uploading)) return 'Please wait for all product images to finish uploading.';
    if (form.images.some((img) => img.error)) return 'Remove or retry the failed product image before saving.';

    const specNames = form.attributes.map((a) => a.name.trim().toLowerCase()).filter(Boolean);
    if (new Set(specNames).size !== specNames.length) return 'Attribute names must be unique.';
    if (form.attributes.some((a) => a.name.trim() && !a.value.trim())) {
      return `Attribute "${form.attributes.find((a) => a.name.trim() && !a.value.trim()).name}" needs a value.`;
    }

    for (const v of form.variants) {
      if (!v.sku.trim()) return 'Every variant needs a SKU.';
      if (v.price === '' || Number(v.price) < 0) return `Variant ${v.sku || ''} needs a valid price.`;
      if (v.compareAtPrice !== '' && Number(v.compareAtPrice) < 0) {
        return `Variant ${v.sku || ''} has an invalid compare-at price.`;
      }
      const variantAttrNames = v.attributes.map((a) => a.name.trim().toLowerCase()).filter(Boolean);
      if (new Set(variantAttrNames).size !== variantAttrNames.length) {
        return `Variant ${v.sku || ''} has duplicate attribute names.`;
      }
      if (v.images.some((img) => img.uploading)) return 'Please wait for all variant images to finish uploading.';
      if (v.images.some((img) => img.error)) return 'Remove or retry the failed variant image before saving.';
    }

    const skus = form.variants.map((v) => v.sku.trim().toUpperCase());
    if (new Set(skus).size !== skus.length) return 'Variant SKUs must be unique.';

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
      sku: form.sku.trim() || undefined,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      stock: Number(form.stock) || 0,
      tag: form.tag || null,
      images: cleanImages(form.images),
      attributes: cleanAttributes(form.attributes),
      variants: cleanVariants(form.variants),
    };

    try {
      if (isEdit) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loader />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold text-slate-900 mb-6">{isEdit ? 'Edit Product' : 'Add Product'}</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* ---------- Product Information ---------- */}
        <Section title="Product Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name">
              <input required value={form.name} onChange={update('name')} className="input" />
            </Field>
            <Field label="Slug (auto-generated if left blank)">
              <input value={form.slug} onChange={update('slug')} className="input" placeholder="auto from name" />
            </Field>
            <Field label="SKU (optional if this product only sells through variants)">
              <input value={form.sku} onChange={update('sku')} className="input" placeholder="e.g. LAPTOP-DELL-XPS13" />
            </Field>
            <Field label="Brand">
              <input required value={form.brand} onChange={update('brand')} className="input" />
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={update('category')} className="input">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tag (optional)">
              <select value={form.tag || ''} onChange={update('tag')} className="input">
                <option value="">None</option>
                <option value="NEW">NEW</option>
                <option value="Refurbished">Refurbished</option>
                <option value="Price Drop">Price Drop</option>
              </select>
            </Field>
            <Field label="Screen size">
              <input value={form.screenSize} onChange={update('screenSize')} className="input" placeholder='13"-14"' />
            </Field>
          </div>

          <Field label="Description">
            <textarea value={form.description} onChange={update('description')} className="input h-24 resize-none" />
          </Field>

          {/* ---------- Specs (fixed fields + free-form attributes) ---------- */}
          <fieldset className="border border-slate-200 rounded p-4">
            <legend className="text-sm font-semibold px-1">Specs</legend>
            <div className="grid sm:grid-cols-2 gap-4 mt-2">
              <Field label="Processor">
                <input value={form.specs.processor} onChange={updateSpec('processor')} className="input" />
              </Field>
              <Field label="RAM">
                <input value={form.specs.ram} onChange={updateSpec('ram')} className="input" />
              </Field>
              <Field label="Storage">
                <input value={form.specs.storage} onChange={updateSpec('storage')} className="input" />
              </Field>
              <Field label="Display">
                <input value={form.specs.display} onChange={updateSpec('display')} className="input" />
              </Field>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="block text-sm font-medium text-slate-700 mb-1">Additional attributes</span>
              <p className="text-xs text-slate-500 mb-2">
                Anything not covered above — Weight, Color, Warranty, Ports, or anything else this product needs.
              </p>
              <AttributeManager
                attributes={form.attributes}
                onChange={(attributes) => setForm((f) => ({ ...f, attributes }))}
              />
            </div>
          </fieldset>
        </Section>

        {/* ---------- Product Images ---------- */}
        <Section title="Product Images">
          <p className="text-xs text-slate-500 -mt-2 mb-1">
            Upload one or more images. Hover an image to reorder, set it as primary, or remove it.
          </p>
          <ImageUploader
            images={form.images}
            onChange={(images) => setForm((f) => ({ ...f, images }))}
            folder="products"
            maxFiles={8}
            label="Product images"
          />
        </Section>

        {/* ---------- Variants ---------- */}
        <Section title="Variants">
          <p className="text-xs text-slate-500 -mt-2 mb-1">
            Optional. Add a variant for each purchasable version of this product — each one keeps its own
            attributes, SKU, price, compare-at price, stock and images, completely independent of the others.
          </p>
          <VariantManager
            variants={form.variants}
            onChange={(variants) => setForm((f) => ({ ...f, variants }))}
          />
        </Section>

        {/* ---------- Inventory ---------- */}
        <Section title="Inventory">
          <Field label={form.variants.length > 0 ? 'Base stock (used if a variant has no stock override)' : 'Stock'}>
            <input type="number" min="0" value={form.stock} onChange={update('stock')} className="input" />
          </Field>
        </Section>

        {/* ---------- Pricing ---------- */}
        <Section title="Pricing">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Price (Rs)">
              <input required type="number" min="0" value={form.price} onChange={update('price')} className="input" />
            </Field>
            <Field label="Compare-at price (optional)">
              <input type="number" min="0" value={form.compareAtPrice} onChange={update('compareAtPrice')} className="input" />
            </Field>
          </div>
        </Section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-blue text-white font-semibold px-6 py-2.5 rounded hover:bg-brand-blueDark disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2.5 rounded border border-slate-200 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>

      <style>{`.input { width: 100%; border: 1px solid #E2E8F0; border-radius: 6px; padding: 8px 12px; font-size: 14px; outline: none; } .input:focus { border-color: #2563EB; }`}</style>
    </AdminLayout>
  );
}

function Section({ title, children }) {
  return (
    <section className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="block text-slate-600 mb-1">{label}</span>
      {children}
    </label>
  );
}
