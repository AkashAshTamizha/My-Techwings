import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || '/admin/products', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bgSoft px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-slate-900">Admin Login</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">Manage products and services</p>

        <label className="block text-sm mb-3">
          <span className="block text-slate-600 mb-1">Email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-brand-blue"
          />
        </label>

        <label className="block text-sm mb-4">
          <span className="block text-slate-600 mb-1">Password</span>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-brand-blue"
          />
        </label>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-blue text-white font-semibold py-2.5 rounded hover:bg-brand-blueDark disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
