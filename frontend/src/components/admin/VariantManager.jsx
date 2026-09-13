import { FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useState } from 'react';
import ImageUploader, { genId } from './ImageUploader';
import AttributeManager from './AttributeManager';

export function makeEmptyVariant() {
  return {
    _key: genId(),
    attributes: [],
    sku: '',
    price: '',
    compareAtPrice: '',
    stock: 0,
    images: [],
    isActive: true,
  };
}

function attrsLabel(attrs = []) {
  return attrs
    .filter((a) => a.name && a.value)
    .map((a) => `${a.name}: ${a.value}`)
    .join(' / ');
}

/**
 * Manually-managed product variants — each one is fully independent, with
 * its own SKU, price, compare-at price, stock, active flag, images, and its
 * own free-form attribute rows (Color, Storage, or anything else). There is
 * no shared attribute list to generate combinations from; every variant is
 * added and configured on its own.
 *
 * Every update is keyed on the variant's own stable `_key` — never on array
 * index — so editing one variant can never bleed into another.
 */
export default function VariantManager({ variants = [], onChange }) {
  const [openKey, setOpenKey] = useState(null);

  const updateVariant = (key, field, value) => {
    onChange(variants.map((v) => (v._key === key ? { ...v, [field]: value } : v)));
  };

  const updateVariantImages = (key, newImages) => updateVariant(key, 'images', newImages);
  const updateVariantAttributes = (key, newAttributes) => updateVariant(key, 'attributes', newAttributes);

  const addVariant = () => {
    const v = makeEmptyVariant();
    onChange([...variants, v]);
    setOpenKey(v._key);
  };

  const removeVariant = (key) => {
    onChange(variants.filter((v) => v._key !== key));
    if (openKey === key) setOpenKey(null);
  };

  // Duplicate SKU / attribute-combo detection, purely for inline UX feedback
  // — the backend re-validates this independently as the source of truth.
  const skuCounts = {};
  const comboCounts = {};
  variants.forEach((v) => {
    const sku = (v.sku || '').trim().toUpperCase();
    const combo = attrsLabel(v.attributes).toLowerCase();
    if (sku) skuCounts[sku] = (skuCounts[sku] || 0) + 1;
    if (combo) comboCounts[combo] = (comboCounts[combo] || 0) + 1;
  });

  return (
    <div className="space-y-3">
      {variants.length === 0 && (
        <p className="text-sm text-slate-400 border border-dashed border-slate-200 rounded p-4 text-center">
          No variants yet. Click "Add Variant" to create one — give it its own attributes (e.g. Color: Black),
          SKU, price and stock.
        </p>
      )}

      {variants.map((variant, idx) => {
        const isOpen = openKey === variant._key;
        const sku = (variant.sku || '').trim().toUpperCase();
        const combo = attrsLabel(variant.attributes).toLowerCase();
        const duplicateSku = sku && skuCounts[sku] > 1;
        const duplicateCombo = combo && comboCounts[combo] > 1;
        const label = attrsLabel(variant.attributes) || '(no attributes set)';

        return (
          <div key={variant._key} className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenKey(isOpen ? null : variant._key)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 text-left"
            >
              <span className="text-sm font-medium text-slate-700">
                Variant {idx + 1} — {label}
                {variant.sku ? ` (${variant.sku})` : ''}
              </span>
              {isOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            {isOpen && (
              <div className="p-4 space-y-4">
                <div>
                  <span className="block text-sm text-slate-600 mb-1">Attributes</span>
                  <AttributeManager
                    attributes={variant.attributes.length ? variant.attributes : []}
                    onChange={(attrs) => updateVariantAttributes(variant._key, attrs)}
                  />
                  {duplicateCombo && (
                    <p className="text-xs text-red-600 mt-1">
                      Another variant already uses this exact attribute combination.
                    </p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <VField label="SKU" error={duplicateSku ? 'Duplicate SKU in this product' : null}>
                    <input
                      value={variant.sku}
                      onChange={(e) => updateVariant(variant._key, 'sku', e.target.value)}
                      className="input"
                      placeholder="e.g. LAPTOP-I7-16-512"
                      required
                    />
                  </VField>
                  <VField label="Price (Rs)">
                    <input
                      type="number"
                      min="0"
                      value={variant.price}
                      onChange={(e) => updateVariant(variant._key, 'price', e.target.value)}
                      className="input"
                      required
                    />
                  </VField>
                  <VField label="Compare-at price (optional)">
                    <input
                      type="number"
                      min="0"
                      value={variant.compareAtPrice}
                      onChange={(e) => updateVariant(variant._key, 'compareAtPrice', e.target.value)}
                      className="input"
                    />
                  </VField>
                  <VField label="Stock quantity">
                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) => updateVariant(variant._key, 'stock', e.target.value)}
                      className="input"
                      required
                    />
                  </VField>
                  <VField label="Active">
                    <select
                      value={variant.isActive ? 'yes' : 'no'}
                      onChange={(e) => updateVariant(variant._key, 'isActive', e.target.value === 'yes')}
                      className="input"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </VField>
                </div>

                <ImageUploader
                  images={variant.images}
                  onChange={(imgs) => updateVariantImages(variant._key, imgs)}
                  folder="variants"
                  maxFiles={6}
                  label="Variant images"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeVariant(variant._key)}
                    className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
                  >
                    <FiTrash2 /> Remove variant
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addVariant}
        className="flex items-center gap-2 text-sm font-semibold text-brand-blue border border-brand-blue rounded px-4 py-2 hover:bg-brand-bgHero"
      >
        <FiPlus /> Add Variant
      </button>
    </div>
  );
}

function VField({ label, children, error }) {
  return (
    <label className="block text-sm">
      <span className="block text-slate-600 mb-1">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  );
}
