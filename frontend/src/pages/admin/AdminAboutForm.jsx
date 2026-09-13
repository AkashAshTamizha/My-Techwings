import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { Loader } from '../../components/common/Loader';
import { getAboutSectionById, createAboutSection, updateAboutSection } from '../../services/api';

const emptyForm = { heading: '', body: '', icon: '', order: 0, isActive: true };

export default function AdminAboutForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    getAboutSectionById(id)
      .then((data) => setForm({ ...emptyForm, ...data.section }))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const update = (field) => (e) => {
    const value = field === 'isActive' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = { ...form, order: Number(form.order) || 0 };

    try {
      if (isEdit) {
        await updateAboutSection(id, payload);
      } else {
        await createAboutSection(payload);
      }
      navigate('/admin/about');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save section');
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
      <h1 className="text-xl font-bold text-slate-900 mb-6">{isEdit ? 'Edit Section' : 'Add Section'}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-6 max-w-2xl space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Heading">
            <input required value={form.heading} onChange={update('heading')} className="input" placeholder="Our Story" />
          </Field>
          <Field label="Icon (react-icons/fi name, optional)">
            <input value={form.icon} onChange={update('icon')} className="input" placeholder="FiHeart" />
          </Field>
          <Field label="Display order">
            <input type="number" value={form.order} onChange={update('order')} className="input" />
          </Field>
          <label className="flex items-center gap-2 text-sm mt-6">
            <input type="checkbox" checked={form.isActive} onChange={update('isActive')} className="accent-brand-blue" />
            Visible on the About page
          </label>
        </div>

        <Field label="Body">
          <textarea required value={form.body} onChange={update('body')} className="input h-32 resize-none" />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-blue text-white font-semibold px-6 py-2.5 rounded hover:bg-brand-blueDark disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Section'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/about')}
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

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="block text-slate-600 mb-1">{label}</span>
      {children}
    </label>
  );
}
