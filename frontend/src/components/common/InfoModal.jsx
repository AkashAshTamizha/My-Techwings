import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

// Small, reusable "coming soon" style modal — used by the footer's Customer
// Service links (Track Order, Shipping & Delivery, Returns & Refunds,
// Warranty) which don't have real functionality/APIs behind them yet.
// Closes on the X button, clicking the backdrop, or Escape.
export default function InfoModal({ title, message, onClose }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-sm p-6 relative shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          <FiX size={20} />
        </button>

        <h2 id="info-modal-title" className="text-lg font-bold text-slate-900 pr-6">
          {title}
        </h2>
        <p className="text-sm text-slate-500 mt-2">{message}</p>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-6 bg-brand-blue text-white font-semibold py-2.5 rounded hover:bg-brand-blueDark transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
