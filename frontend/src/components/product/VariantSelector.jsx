/**
 * Renders one picker per variant attribute (Processor, RAM, Color, Weight —
 * whatever the admin defined for this product) and reports the currently
 * selected variant back to the parent.
 *
 * Every lookup here is by stable id (`variant._id`) or by the variant's own
 * `attributes` values — never by array index — so switching between
 * variants (or between products) can never leak one variant's data (price,
 * stock, SKU, images) onto another.
 */
export default function VariantSelector({ variants = [], selectedVariantId, onSelect }) {
  const activeVariants = variants.filter((v) => v.isActive !== false);
  if (activeVariants.length === 0) return null;

  const selected = activeVariants.find((v) => v._id === selectedVariantId) || null;

  const getAttrValue = (variant, name) => variant.attributes?.find((a) => a.name === name)?.value;

  // Attribute names, in the order the admin defined them (taken from every
  // variant, since a product's variants all share the same set of names).
  const attrNames = [...new Set(activeVariants.flatMap((v) => (v.attributes || []).map((a) => a.name)))];

  const selectedAttrs = {};
  attrNames.forEach((name) => {
    selectedAttrs[name] = selected ? getAttrValue(selected, name) : undefined;
  });

  const handlePick = (name, value) => {
    const nextAttrs = { ...selectedAttrs, [name]: value };
    // Prefer a variant matching every currently-chosen attribute...
    let match = activeVariants.find((v) =>
      attrNames.every((n) => !nextAttrs[n] || getAttrValue(v, n) === nextAttrs[n])
    );
    // ...but if that exact combination doesn't exist, fall back to any
    // variant offering the value that was just clicked, so the click always
    // does something instead of silently failing.
    if (!match) match = activeVariants.find((v) => getAttrValue(v, name) === value);
    if (match) onSelect(match._id);
  };

  return (
    <div className="mt-4 space-y-3">
      {attrNames.map((name) => {
        const values = [...new Set(activeVariants.map((v) => getAttrValue(v, name)).filter(Boolean))];
        return (
          <div key={name}>
            <p className="text-xs font-semibold text-slate-500 mb-1.5">
              {name}
              {selectedAttrs[name] ? `: ${selectedAttrs[name]}` : ''}
            </p>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                // Only disable a value if it can't combine with everything
                // else already chosen (every OTHER attribute) — the
                // attribute being clicked itself is always eligible.
                const available = activeVariants.some(
                  (v) =>
                    getAttrValue(v, name) === value &&
                    attrNames.every((n) => n === name || !selectedAttrs[n] || getAttrValue(v, n) === selectedAttrs[n])
                );
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={!available}
                    onClick={() => handlePick(name, value)}
                    className={`px-3 py-1.5 text-sm rounded border disabled:opacity-40 disabled:cursor-not-allowed ${
                      selectedAttrs[name] === value
                        ? 'border-brand-blue bg-brand-blue text-white'
                        : 'border-slate-200 text-slate-700 hover:border-brand-blue'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {selected && (
        <p className="text-xs text-slate-400">
          SKU: {selected.sku} {selected.stock > 0 ? `• ${selected.stock} in stock` : '• Out of stock'}
        </p>
      )}
    </div>
  );
}
