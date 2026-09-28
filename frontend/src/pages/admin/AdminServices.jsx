import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { Loader } from '../../components/common/Loader';
import SingleImageField from './SingleImageField';
import {
  getServiceContentAdmin,
  updateServiceContent,
  replaceHowWeWorkIntro,
  deleteHowWeWorkIntro,
} from '../../services/api';

const emptyForm = {
  heroHeading: '',
  heroDescription: '',
  enquiryButtonText: '',
  enquiryButtonLink: '',
  warrantyTitle: '',
  warrantyDescription: '',
  warrantyImage: {},
  howWeWorkTitle: '',
  howWeWorkDescription: '',
  howWeWorkImage: {},
};

// The Service page's fixed hero / warranty-promise / "how we work" intro
// copy lives here as a single content document. The repeatable step cards
// underneath that intro are managed separately — see /admin/service-cards.
export default function AdminService() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // The "How We Work" intro has its own create/replace/reset endpoints
  // (POST, PUT, DELETE on /services/content/how-we-work) so it can be
  // saved or reset independently of the hero/warranty copy above.
  const [howWeWorkSaving, setHowWeWorkSaving] = useState(false);
  const [howWeWorkError, setHowWeWorkError] = useState('');
  const [howWeWorkSaved, setHowWeWorkSaved] = useState(false);

  useEffect(() => {
    getServiceContentAdmin()
      .then((data) => setForm({ ...emptyForm, ...data.content }))
      .finally(() => setLoading(false));
  }, []);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setSaved(false);
    setHowWeWorkSaved(false);
  };

  const updateImage = (field) => (image) => {
    setForm((f) => ({ ...f, [field]: image }));
    setSaved(false);
    setHowWeWorkSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const data = await updateServiceContent(form);
      setForm({ ...emptyForm, ...data.content });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save Service page content');
    } finally {
      setSaving(false);
    }
  };

  // PUT — fully replaces just the "how we work" intro (title, description,
  // image) with whatever is currently in the form, independent of hero/warranty.
  const saveHowWeWorkSection = async () => {
    setHowWeWorkSaving(true);
    setHowWeWorkError('');
    setHowWeWorkSaved(false);

    try {
      const data = await replaceHowWeWorkIntro({
        howWeWorkTitle: form.howWeWorkTitle,
        howWeWorkDescription: form.howWeWorkDescription,
        howWeWorkImage: form.howWeWorkImage,
      });
      setForm((f) => ({ ...f, ...data.content }));
      setHowWeWorkSaved(true);
    } catch (err) {
      setHowWeWorkError(err.response?.data?.message || 'Failed to save this section');
    } finally {
      setHowWeWorkSaving(false);
    }
  };

  // DELETE — clears the "how we work" intro back to its default title,
  // description and (empty) image, without touching hero/warranty content.
  const resetHowWeWorkSection = async () => {
    setHowWeWorkSaving(true);
    setHowWeWorkError('');
    setHowWeWorkSaved(false);

    try {
      const data = await deleteHowWeWorkIntro();
      setForm((f) => ({ ...f, ...data.content }));
      setHowWeWorkSaved(true);
    } catch (err) {
      setHowWeWorkError(err.response?.data?.message || 'Failed to reset this section');
    } finally {
      setHowWeWorkSaving(false);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Service Page</h1>
        <Link to="/admin/service-cards" className="text-sm font-semibold text-brand-blue hover:text-brand-blueDark">
          Manage &quot;How We Work&quot; cards →
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Hero */}
        <section className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Hero</h2>
          <Field label="Heading (one line per row)">
            <textarea value={form.heroHeading} onChange={update('heroHeading')} className="input h-24 resize-none" />
          </Field>
          <Field label="Description (one line per row)">
            <textarea value={form.heroDescription} onChange={update('heroDescription')} className="input h-24 resize-none" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Enquiry button text">
              <input value={form.enquiryButtonText} onChange={update('enquiryButtonText')} className="input" />
            </Field>
            <Field label="Enquiry button link">
              <input value={form.enquiryButtonLink} onChange={update('enquiryButtonLink')} className="input" placeholder="/contact" />
            </Field>
          </div>
        </section>

        {/* Warranty Protection Promise */}
        <section className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Warranty Protection Promise</h2>
          <Field label="Title">
            <input value={form.warrantyTitle} onChange={update('warrantyTitle')} className="input" />
          </Field>
          <Field label="Description">
            <textarea value={form.warrantyDescription} onChange={update('warrantyDescription')} className="input h-24 resize-none" />
          </Field>
          <SingleImageField label="Badge image" value={form.warrantyImage} onChange={updateImage('warrantyImage')} folder="content" />
        </section>

        {/* How We Work intro */}
        <section className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">How We Work (intro)</h2>
          <Field label="Title">
            <input value={form.howWeWorkTitle} onChange={update('howWeWorkTitle')} className="input" />
          </Field>
          <Field label="Description">
            <textarea value={form.howWeWorkDescription} onChange={update('howWeWorkDescription')} className="input h-20 resize-none" />
          </Field>
          <SingleImageField
            label="Intro image (optional)"
            value={form.howWeWorkImage}
            onChange={updateImage('howWeWorkImage')}
            folder="content"
          />

          {howWeWorkError && <p className="text-sm text-red-600">{howWeWorkError}</p>}
          {howWeWorkSaved && <p className="text-sm text-green-600">Section saved.</p>}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              to="/admin/service-cards/new"
              className="bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-slate-800"
            >
              + Add New Work Card
            </Link>
            <button
              type="button"
              onClick={saveHowWeWorkSection}
              disabled={howWeWorkSaving}
              className="bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-slate-800 disabled:opacity-60"
            >
              {howWeWorkSaving ? 'Saving…' : 'Save this section'}
            </button>
            <button
              type="button"
              onClick={resetHowWeWorkSection}
              disabled={howWeWorkSaving}
              className="text-sm font-semibold text-red-600 px-4 py-2 rounded border border-red-200 hover:bg-red-50 disabled:opacity-60"
            >
              Reset to default
            </button>
            <span className="text-xs text-slate-400">
              Saves or resets just this section — the overall &quot;Save Changes&quot; button below also includes it.
            </span>
          </div>

          <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
            The step cards shown below this intro are managed on the{' '}
            <Link to="/admin/service-cards" className="text-brand-blue underline">
              Service Cards
            </Link>{' '}
            page.
          </p>
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





























