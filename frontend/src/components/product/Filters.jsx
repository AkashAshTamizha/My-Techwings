import { useEffect, useState } from 'react';
import { FiChevronUp, FiChevronDown, FiTag, FiCreditCard, FiMonitor, FiImage, FiCpu, FiX } from 'react-icons/fi';
import { getProductFilters } from '../../services/api';

// Splits the catalog's actual [min, max] price into three round-numbered
// brackets, mirroring the old hard-coded "Under / mid / Over" shape but
// driven entirely by real data.
function buildPriceRanges(min, max) {
  if (min == null || max == null || max <= min) return [];
  const round = (n) => Math.max(0, Math.round(n / 1000) * 1000);
  const step = (max - min) / 3;
  const b1 = round(min + step);
  const b2 = round(min + step * 2);
  const fmt = (n) => `Rs.${n.toLocaleString('en-IN')}`;
  return [
    { label: `Under ${fmt(b1)}`, min: 0, max: b1 },
    { label: `${fmt(b1 + 1)} - ${fmt(b2)}`, min: b1 + 1, max: b2 },
    { label: `Over ${fmt(b2)}`, min: b2 + 1, max: '' },
  ];
}

export default function Filters({ filters, onChange, onReset, open = false, onClose = () => {} }) {
  const [meta, setMeta] = useState(null);
  const [metaLoading, setMetaLoading] = useState(true);

  // Categories, brands, screen sizes, processors and the price-range
  // brackets are all derived from what's actually in the catalog, fetched
  // once on mount — nothing here is hard-coded.
  useEffect(() => {
    getProductFilters()
      .then((data) => setMeta(data.filters))
      .catch(() => setMeta({ categories: [], brands: [], screenSizes: [], processors: [], priceRange: {} }))
      .finally(() => setMetaLoading(false));
  }, []);

  const categories = meta?.categories || [];
  const brands = meta?.brands || [];
  const screenSizes = meta?.screenSizes || [];
  const processors = meta?.processors || [];
  const priceRanges = buildPriceRanges(meta?.priceRange?.min, meta?.priceRange?.max);

  const toggleBrand = (brand) => {
    const current = filters.brand ? filters.brand.split(',') : [];
    const next = current.includes(brand) ? current.filter((b) => b !== brand) : [...current, brand];
    onChange({ ...filters, brand: next.join(',') || undefined });
  };

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`bg-white fixed inset-y-0 left-0 z-50 w-[85vw] max-w-xs overflow-y-auto p-5 transform transition-transform duration-200 shrink-0 space-y-5
          lg:static lg:z-auto lg:w-64 lg:max-w-none lg:p-0 lg:overflow-visible lg:transform-none lg:translate-x-0
          ${open ? 'translate-x-0 shadow-xl' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-slate-900">Filters</h2>
            <p className="text-xs text-slate-400">Refine your search</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="lg:hidden h-8 w-8 flex items-center justify-center rounded border border-slate-200 text-slate-500"
          >
            <FiX />
          </button>
        </div>

        <FilterSection title="Category" icon={<FiTag />} defaultOpen active>
          {metaLoading ? (
            <FilterSkeleton />
          ) : categories.length === 0 ? (
            <p className="text-xs text-slate-400">No categories yet</p>
          ) : (
            categories.map((c) => (
              <RadioRow
                key={c}
                label={c}
                checked={filters.category === c}
                onChange={() => onChange({ ...filters, category: filters.category === c ? undefined : c })}
              />
            ))
          )}
        </FilterSection>

        <FilterSection title="Price Range" icon={<FiCreditCard />} defaultOpen>
          {metaLoading ? (
            <FilterSkeleton />
          ) : priceRanges.length === 0 ? (
            <p className="text-xs text-slate-400">No products yet</p>
          ) : (
            priceRanges.map((r) => (
              <RadioRow
                key={r.label}
                label={r.label}
                checked={String(filters.minPrice) === String(r.min) && String(filters.maxPrice) === String(r.max)}
                onChange={() => onChange({ ...filters, minPrice: r.min, maxPrice: r.max })}
              />
            ))
          )}
        </FilterSection>

        <FilterSection title="Brand" icon={<FiMonitor />} defaultOpen>
          {metaLoading ? (
            <FilterSkeleton />
          ) : brands.length === 0 ? (
            <p className="text-xs text-slate-400">No brands yet</p>
          ) : (
            brands.map((b) => (
              <CheckRow key={b} label={b} checked={(filters.brand || '').split(',').includes(b)} onChange={() => toggleBrand(b)} />
            ))
          )}
        </FilterSection>

        <FilterSection title="Screen Size" icon={<FiImage />} defaultOpen>
          {metaLoading ? (
            <FilterSkeleton />
          ) : screenSizes.length === 0 ? (
            <p className="text-xs text-slate-400">No screen sizes yet</p>
          ) : (
            screenSizes.map((s) => (
              <RadioRow
                key={s}
                label={s}
                checked={filters.screenSize === s}
                onChange={() => onChange({ ...filters, screenSize: filters.screenSize === s ? undefined : s })}
              />
            ))
          )}
        </FilterSection>

        <FilterSection title="Processor" icon={<FiCpu />} defaultOpen>
          {metaLoading ? (
            <FilterSkeleton />
          ) : processors.length === 0 ? (
            <p className="text-xs text-slate-400">No processors yet</p>
          ) : (
            processors.map((p) => (
              <RadioRow
                key={p}
                label={p}
                checked={filters.processor === p}
                onChange={() => onChange({ ...filters, processor: filters.processor === p ? undefined : p })}
              />
            ))
          )}
        </FilterSection>

        <button
          onClick={onReset}
          className="w-full border border-slate-300 rounded py-2 text-sm font-medium hover:bg-slate-50"
        >
          Reset All
        </button>

        <button
          onClick={onClose}
          className="lg:hidden w-full bg-brand-blue text-white rounded py-2.5 text-sm font-semibold"
        >
          Show Results
        </button>
      </aside>
    </>
  );
}

function FilterSection({ title, icon, children, defaultOpen = true, active = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-100 pb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 mb-3 px-2 py-1.5 rounded ${
          active ? 'bg-blue-50 text-brand-blue' : 'text-slate-900'
        }`}
      >
        <span className="flex items-center gap-2 font-semibold text-sm">
          <span className={active ? 'text-brand-blue' : 'text-slate-400'}>{icon}</span>
          {title}
        </span>
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {open && <div className="space-y-2 px-2">{children}</div>}
    </div>
  );
}

function RadioRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
      <input type="radio" checked={checked} onChange={onChange} className="accent-brand-blue" readOnly />
      {label}
    </label>
  );
}

function FilterSkeleton() {
  return (
    <div className="space-y-2 animate-pulse" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-3.5 w-24 bg-slate-100 rounded" />
      ))}
    </div>
  );
}

function CheckRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-brand-blue" readOnly />
      {label}
    </label>
  );
}
