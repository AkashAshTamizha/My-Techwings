import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { Loader } from '../../components/common/Loader';
import { getProducts, deleteProduct } from '../../services/api';
import { formatINR } from '../../utils/format';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getProducts({ limit: 50, sort: 'newest' })
      .then((data) => setProducts(data.items))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const confirmDelete = async () => {
    try {
      await deleteProduct(pendingDelete._id);
      setProducts((list) => list.filter((p) => p._id !== pendingDelete._id));
    } catch (err) {
      setError('Failed to delete product');
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Products</h1>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 bg-brand-blue text-white text-sm font-semibold px-4 py-2 rounded hover:bg-brand-blueDark"
        >
          <FiPlus /> Add Product
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
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3">{p.brand}</td>
                  <td className="px-4 py-3">{formatINR(p.price)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link to={`/admin/products/${p._id}/edit`} className="text-brand-blue hover:text-brand-blueDark" aria-label="Edit">
                        <FiEdit2 />
                      </Link>
                      <button onClick={() => setPendingDelete(p)} className="text-red-600 hover:text-red-700" aria-label="Delete">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete product?"
          message={`"${pendingDelete.name}" will be deactivated and hidden from the store.`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </AdminLayout>
  );
}
