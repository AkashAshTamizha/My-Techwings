import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Loader } from '../../components/common/Loader';
import SingleImageField from './SingleImageField';
import { getAboutContentAdmin, updateAboutContent } from '../../services/api';

const emptyForm = {
  heroHeading: '',
  storyTitle: '',
  storyDescription: '',
  storyImage: {},
  repairTitle: '',
  repairDescription: '',
  repairServicesList: '',
  repairImage: {},
  enquiryButtonText: '',
  enquiryButtonLink: '',
};

// The About page's layout (hero / "Story about us" / "What We Repair") is
// fixed on the frontend, so there's nothing to add or delete here — just
// one form for the single content document behind that layout.
export default function AdminAbout() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getAboutContentAdmin()
      .then((data) => setForm({ ...emptyForm, ...data.about }))
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
      const data = await updateAboutContent(form);
      setForm({ ...emptyForm, ...data.about });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save About page content');
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
      <h1 className="text-xl font-bold text-slate-900 mb-6">About Page</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Hero */}
        <section className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Hero heading</h2>
          <Field label="Heading (wrap text in ** ** to highlight it in blue, e.g. Over **5+** Years)">
            <textarea value={form.heroHeading} onChange={update('heroHeading')} className="input h-20 resize-none" />
          </Field>
        </section>

        {/* Story about us */}
        <section className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Story about us</h2>
          <Field label="Title">
            <input value={form.storyTitle} onChange={update('storyTitle')} className="input" />
          </Field>
          <Field label="Description">
            <textarea value={form.storyDescription} onChange={update('storyDescription')} className="input h-32 resize-none" />
          </Field>
          <SingleImageField label="Story image" value={form.storyImage} onChange={updateImage('storyImage')} folder="content" />
        </section>

        {/* What We Repair */}
        <section className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">What We Repair</h2>
          <Field label="Title">
            <input value={form.repairTitle} onChange={update('repairTitle')} className="input" />
          </Field>
          <Field label="Description">
            <textarea value={form.repairDescription} onChange={update('repairDescription')} className="input h-24 resize-none" />
          </Field>
          <Field label="Repair services list (separate each item with a | )">
            <textarea
              value={form.repairServicesList}
              onChange={update('repairServicesList')}
              className="input h-24 resize-none"
              placeholder="Screen Replacement | Keyboard Replacement | SSD & RAM Upgrade"
            />
          </Field>
          <SingleImageField label="Repair image" value={form.repairImage} onChange={updateImage('repairImage')} folder="content" />

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Enquiry button text">
              <input value={form.enquiryButtonText} onChange={update('enquiryButtonText')} className="input" />
            </Field>
            <Field label="Enquiry button link">
              <input value={form.enquiryButtonLink} onChange={update('enquiryButtonLink')} className="input" placeholder="/contact" />
            </Field>
          </div>
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
