import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { Loader } from '../../components/common/Loader';
import { getAllSlidersAdmin, deleteSlider } from '../../services/api';

export default function AdminSliders() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getAllSlidersAdmin()
      .then((data) => setSlides(data.slides))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const confirmDelete = async () => {
    try {
      await deleteSlider(pendingDelete._id);
      setSlides((list) => list.filter((s) => s._id !== pendingDelete._id));
    } catch (err) {
      setError('Failed to delete slide');
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Home Page Slider</h1>
        <Link
          to="/admin/sliders/new"
          className="flex items-center gap-2 bg-brand-blue text-white text-sm font-semibold px-4 py-2 rounded hover:bg-brand-blueDark"
        >
          <FiPlus /> Add Slide
        </Link>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Heading</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {slides.map((s) => (
                <tr key={s._id}>
                  <td className="px-4 py-3">
                    <img
                      src={s.image?.url}
                      alt={s.alt || ''}
                      className="h-12 w-20 object-cover rounded border border-slate-200 bg-slate-50"
                      onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 max-w-xs">
                    {s.heading?.map((line) => line.text).join(' ')}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{s.order}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {s.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link to={`/admin/sliders/${s._id}/edit`} className="text-brand-blue hover:text-brand-blueDark" aria-label="Edit">
                        <FiEdit2 />
                      </Link>
                      <button onClick={() => setPendingDelete(s)} className="text-red-600 hover:text-red-700" aria-label="Delete">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {slides.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                    No slides yet. Add one to populate the homepage slider.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete slide?"
          message={`This slide will be permanently removed from the homepage slider.`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </AdminLayout>
  );
}
