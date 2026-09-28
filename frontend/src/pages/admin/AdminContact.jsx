import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Loader } from '../../components/common/Loader';
import SingleImageField from './SingleImageField';
import { getContactContentAdmin, updateContactContent } from '../../services/api';

const emptyForm = {
  heroHeading: '',
  heroSubheading: '',
  getInTouchTitle: '',
  getInTouchDescription: '',
  phoneLabel: '',
  phoneValue: '',
  emailLabel: '',
  emailValue: '',
  mapImage: {},
};

// The Contact page's layout (hero / "Get in Touch" / phone / email / map)
// is fixed on the frontend, so this is a single form for the one content
// document behind that layout — no list, no add/delete.
export default function AdminContact() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getContactContentAdmin()
      .then((data) => setForm({ ...emptyForm, ...data.contact }))
      .finally(() => setLoading(false));
  }, []);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setSaved(false);
  };

  const updateImage = (field) => (image) => {
    setForm((f) => ({ ...f, [field]: image }));
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const data = await updateContactContent(form);
      setForm({ ...emptyForm, ...data.contact });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save Contact page content');
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
      <h1 className="text-xl font-bold text-slate-900 mb-6">Contact Page</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Hero */}
        <section className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Hero</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Heading">
              <input value={form.heroHeading} onChange={update('heroHeading')} className="input" />
            </Field>
            <Field label="Subheading">
              <input value={form.heroSubheading} onChange={update('heroSubheading')} className="input" />
            </Field>
          </div>
        </section>

        {/* Get in Touch */}
        <section className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Get in Touch</h2>
          <Field label="Title">
            <input value={form.getInTouchTitle} onChange={update('getInTouchTitle')} className="input" />
          </Field>
          <Field label="Description">
            <textarea value={form.getInTouchDescription} onChange={update('getInTouchDescription')} className="input h-24 resize-none" />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Phone label">
              <input value={form.phoneLabel} onChange={update('phoneLabel')} className="input" />
            </Field>
            <Field label="Phone number">
              <input value={form.phoneValue} onChange={update('phoneValue')} className="input" />
            </Field>
            <Field label="Email label">
              <input value={form.emailLabel} onChange={update('emailLabel')} className="input" />
            </Field>
            <Field label="Email address">
              <input value={form.emailValue} onChange={update('emailValue')} className="input" type="email" />
            </Field>
          </div>

          <SingleImageField label="Location / map image" value={form.mapImage} onChange={updateImage('mapImage')} folder="content" />
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-600">Saved.</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-brand-blue text-white font-semibold px-6 py-2.5 rounded hover:bg-brand-blueDark disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <style>{`.input { width: 100%; border: 1px solid #E2E8F0; border-radius: 6px; padding: 8px 12px; font-size: 14px; outline: none; } .input:focus { border-color: #2563EB; }`}</style>
    </AdminLayout>
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
