import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { submitInquiry } from '../../services/api';

const initialForm = { name: '', phone: '', email: '', city: '', message: '' };

export default function InquiryModal({ product, variant, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | error

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) next.phone = 'Enter a valid phone number';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');
    try {
      // variantId (keyed by the variant's own stable _id, never an index) is
      // sent so the store's WhatsApp message and saved lead reflect the exact
      // attributes/SKU the customer picked, not just the base product.
      const { whatsappUrl } = await submitInquiry({ productId: product._id, variantId: variant?._id, ...form });
      // Hand off to the customer's own WhatsApp client, pre-filled —
      // no WhatsApp Business API integration needed on our side.
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      onClose();
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
          <FiX size={20} />
        </button>

        <h2 className="text-lg font-bold text-slate-900">Need This Laptop?</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          Share your details and we&apos;ll open WhatsApp with your enquiry pre-filled for {product.name}
          {variant?.attributes?.length ? ` (${variant.attributes.map((a) => a.value).join(' / ')})` : ''}.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          <Field label="Full name" error={errors.name}>
            <input value={form.name} onChange={update('name')} className="input" placeholder="Your name" />
          </Field>
          <Field label="Phone number" error={errors.phone}>
            <input value={form.phone} onChange={update('phone')} className="input" placeholder="98765 43210" />
          </Field>
          <Field label="Email (optional)" error={errors.email}>
            <input value={form.email} onChange={update('email')} type="email" className="input" placeholder="you@example.com" />
          </Field>
          <Field label="City (optional)">
            <input value={form.city} onChange={update('city')} className="input" placeholder="Chennai" />
          </Field>
          <Field label="Message (optional)">
            <textarea value={form.message} onChange={update('message')} className="input h-20 resize-none" placeholder="Any specific questions?" />
          </Field>

          {status === 'error' && (
            <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-brand-blue text-white font-semibold py-2.5 rounded hover:bg-brand-blueDark disabled:opacity-60"
          >
            {status === 'submitting' ? 'Sending…' : 'Continue on WhatsApp'}
          </button>
        </form>
      </div>

      <style>{`.input { width: 100%; border: 1px solid #E2E8F0; border-radius: 6px; padding: 8px 12px; font-size: 14px; outline: none; } .input:focus { border-color: #2563EB; }`}</style>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block text-sm">
      <span className="block text-slate-600 mb-1">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  );
}
