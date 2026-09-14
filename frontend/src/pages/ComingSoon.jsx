import { Link, useParams } from 'react-router-dom';
import { FiClock, FiArrowLeft } from 'react-icons/fi';

// Friendly display labels for known category keys. Falls back to the raw
// param (title-cased) for anything not in this list, so the page never
// shows a raw slug like "cctv" to the visitor.
const CATEGORY_LABELS = {
  Ultrabook: 'Ultrabooks',
  Gaming: 'Gaming Laptops',
  Business: 'Business Laptops',
  Refurbished: 'Refurbished Laptops',
  CCTV: 'Smart CCTV',
  Printer: 'Printers',
};

function prettify(key = '') {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export default function ComingSoon() {
  const { category } = useParams();
  const label = CATEGORY_LABELS[category] || prettify(category);

  return (
    <div className="w-full px-4 sm:px-6 py-24">
      <div className="max-w-lg mx-auto text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-brand-bgHero flex items-center justify-center text-brand-blue text-2xl">
          <FiClock />
        </div>
        <p className="mt-6 text-xs font-semibold tracking-widest text-brand-blue">{label.toUpperCase()}</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">Upcoming Products</h1>
        <p className="mt-3 text-slate-500">
          This category is coming soon. We&apos;re putting the finishing touches on our {label} lineup —
          check back shortly.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 mt-8 bg-brand-blue text-white font-semibold px-6 py-3 rounded hover:bg-brand-blueDark transition"
        >
          <FiArrowLeft /> Browse Available Products
        </Link>
      </div>
    </div>
  );
}
