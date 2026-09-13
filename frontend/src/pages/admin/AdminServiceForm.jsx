import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { Loader } from '../../components/common/Loader';
import { getServiceById, createService, updateService } from '../../services/api';

const emptyForm = { title: '', slug: '', description: '', icon: 'FiTool', price: '', order: 0, isActive: true };

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export default function AdminServiceForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    getServiceById(id)
      .then((data) => setForm({ ...emptyForm, ...data.service }))
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

    const payload = { ...form, slug: form.slug || slugify(form.title), order: Number(form.order) || 0 };

    try {
      if (isEdit) {
        await updateService(id, payload);
      } else {
        await createService(payload);
      }
      navigate('/admin/services');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save service');
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
      <h1 className="text-xl font-bold text-slate-900 mb-6">{isEdit ? 'Edit Service' : 'Add Service'}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-6 max-w-2xl space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Title">
            <input required value={form.title} onChange={update('title')} className="input" />
          </Field>
          <Field label="Slug (auto-generated if left blank)">
            <input value={form.slug} onChange={update('slug')} className="input" placeholder="auto from title" />
          </Field>
          <Field label="Price / pricing note">
            <input value={form.price} onChange={update('price')} className="input" placeholder="Starting at Rs 499" />
          </Field>
          <Field label="Icon (react-icons/fi name)">
            <input value={form.icon} onChange={update('icon')} className="input" placeholder="FiTool" />
          </Field>
          <Field label="Display order">
            <input type="number" value={form.order} onChange={update('order')} className="input" />
          </Field>
          <label className="flex items-center gap-2 text-sm mt-6">
            <input type="checkbox" checked={form.isActive} onChange={update('isActive')} className="accent-brand-blue" />
            Visible on the Service page
          </label>
        </div>

        <Field label="Description">
          <textarea required value={form.description} onChange={update('description')} className="input h-24 resize-none" />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-blue text-white font-semibold px-6 py-2.5 rounded hover:bg-brand-blueDark disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Service'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/services')}
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
