import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { Loader } from '../../components/common/Loader';
import { getAllContactAdmin, deleteContactInfo } from '../../services/api';

export default function AdminContact() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getAllContactAdmin()
      .then((data) => setItems(data.items))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const confirmDelete = async () => {
    try {
      await deleteContactInfo(pendingDelete._id);
      setItems((list) => list.filter((i) => i._id !== pendingDelete._id));
    } catch (err) {
      setError('Failed to delete contact info');
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Contact Info</h1>
        <Link
          to="/admin/contact/new"
          className="flex items-center gap-2 bg-brand-blue text-white text-sm font-semibold px-4 py-2 rounded hover:bg-brand-blueDark"
        >
          <FiPlus /> Add Contact Info
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
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((i) => (
                <tr key={i._id}>
                  <td className="px-4 py-3 capitalize text-slate-500">{i.type}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{i.label}</td>
                  <td className="px-4 py-3 text-slate-500">{i.value}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${i.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {i.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link to={`/admin/contact/${i._id}/edit`} className="text-brand-blue hover:text-brand-blueDark" aria-label="Edit">
                        <FiEdit2 />
                      </Link>
                      <button onClick={() => setPendingDelete(i)} className="text-red-600 hover:text-red-700" aria-label="Delete">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                    No contact info yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete contact info?"
          message={`"${pendingDelete.label}" will be permanently removed.`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </AdminLayout>
  );
}
