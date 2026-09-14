import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import ImageUploader, { genId } from '../../components/admin/ImageUploader';
import { Loader } from '../../components/common/Loader';
import { getSliderById, createSlider, updateSlider } from '../../services/api';

const emptyForm = {
  eyebrow: '',
  heading: [{ text: '', highlighted: false }],
  description: '',
  ctaLabel: '',
  ctaTo: '',
  alt: '',
  order: 0,
  isActive: true,
};

const MAX_HEADING_LINES = 4;

export default function AdminSliderForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  // ImageUploader is a controlled multi-image component; a slide only ever
  // holds one image, so it's driven here as a single-item array and the
  // form only ever reads/writes `images[0]`.
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    getSliderById(id)
      .then((data) => {
        const { image, ...rest } = data.slide;
        setForm({ ...emptyForm, ...rest });
        if (image?.url) {
          setImages([{ _key: genId(), url: image.url, publicId: image.publicId, isPrimary: true }]);
        }
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const update = (field) => (e) => {
    const value = field === 'isActive' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const updateHeadingLine = (idx, field) => (e) => {
    const value = field === 'highlighted' ? e.target.checked : e.target.value;
    setForm((f) => ({
      ...f,
      heading: f.heading.map((line, i) => (i === idx ? { ...line, [field]: value } : line)),
    }));
  };

  const addHeadingLine = () => {
    setForm((f) => ({ ...f, heading: [...f.heading, { text: '', highlighted: false }] }));
  };

  const removeHeadingLine = (idx) => {
    setForm((f) => ({ ...f, heading: f.heading.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const activeImage = images[0];
    if (!activeImage?.url || !activeImage?.publicId) {
      setError('Please upload a slide image');
      return;
    }
    if (form.heading.some((line) => !line.text.trim())) {
      setError('Every heading line needs text (remove empty lines)');
      return;
    }

    setSaving(true);

    const payload = {
      ...form,
      heading: form.heading.map((line) => ({ text: line.text.trim(), highlighted: Boolean(line.highlighted) })),
      order: Number(form.order) || 0,
      image: { url: activeImage.url, publicId: activeImage.publicId },
    };

    try {
      if (isEdit) {
        await updateSlider(id, payload);
      } else {
        await createSlider(payload);
      }
      navigate('/admin/sliders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save slide');
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

  const previewImage = images[0]?.url || images[0]?.previewUrl;

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold text-slate-900 mb-6">{isEdit ? 'Edit Slide' : 'Add Slide'}</h1>

      <div className="grid lg:grid-cols-[1fr,380px] gap-6 items-start">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
          <Field label="Eyebrow label (optional)">
            <input value={form.eyebrow} onChange={update('eyebrow')} className="input" placeholder="LIMITED TIME" />
          </Field>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="block text-sm text-slate-600">Heading lines</span>
              {form.heading.length < MAX_HEADING_LINES && (
                <button
                  type="button"
                  onClick={addHeadingLine}
                  className="flex items-center gap-1 text-xs font-semibold text-brand-blue hover:text-brand-blueDark"
                >
                  <FiPlus size={14} /> Add line
                </button>
              )}
            </div>
            <div className="space-y-2">
              {form.heading.map((line, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    required
                    value={line.text}
                    onChange={updateHeadingLine(idx, 'text')}
                    className="input flex-1"
                    placeholder={`Line ${idx + 1}`}
                  />
                  <label className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={Boolean(line.highlighted)}
                      onChange={updateHeadingLine(idx, 'highlighted')}
                      className="accent-brand-blue"
                    />
                    Highlight
                  </label>
                  {form.heading.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHeadingLine(idx)}
                      className="text-red-500 hover:text-red-600"
                      aria-label="Remove line"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Field label="Description">
            <textarea required value={form.description} onChange={update('description')} className="input h-24 resize-none" />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Button label (optional)">
              <input value={form.ctaLabel} onChange={update('ctaLabel')} className="input" placeholder="Shop Now" />
            </Field>
            <Field label="Button link (optional)">
              <input value={form.ctaTo} onChange={update('ctaTo')} className="input" placeholder="/products" />
            </Field>
          </div>

          <div>
            <span className="block text-sm text-slate-600 mb-2">Slide image</span>
            <ImageUploader images={images} onChange={setImages} folder="slider" maxFiles={1} label="Slide image" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Image alt text (optional)">
              <input value={form.alt} onChange={update('alt')} className="input" placeholder="Laptops on a desk" />
            </Field>
            <Field label="Display order">
              <input type="number" value={form.order} onChange={update('order')} className="input" />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={update('isActive')} className="accent-brand-blue" />
            Visible on the homepage slider
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-blue text-white font-semibold px-6 py-2.5 rounded hover:bg-brand-blueDark disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Slide'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/sliders')}
              className="px-6 py-2.5 rounded border border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Live preview — mirrors the public HeroSlider's single-slide markup */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 sticky top-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Preview</p>
          <div className="rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 h-40 mb-4">
            {previewImage ? (
              <img src={previewImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No image yet</div>
            )}
          </div>
          {form.eyebrow && <p className="text-brand-blue text-[10px] font-semibold tracking-widest mb-1">{form.eyebrow}</p>}
          <h2 className="text-xl font-extrabold leading-snug text-slate-900">
            {form.heading.map((line, i) => (
              <span key={i} className={line.highlighted ? 'text-brand-blue' : ''}>
                {line.text || `Line ${i + 1}`}
                {i < form.heading.length - 1 && <br />}
              </span>
            ))}
          </h2>
          <p className="mt-3 text-sm text-slate-600">{form.description || 'Slide description preview…'}</p>
          {form.ctaLabel && (
            <span className="inline-block mt-4 bg-brand-blue text-white text-xs font-semibold px-4 py-2 rounded">
              {form.ctaLabel} →
            </span>
          )}
        </div>
      </div>

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
