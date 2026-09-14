import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { checkAdminExists } from '../../services/api';
import { Loader } from '../../components/common/Loader';
import RecoveryCodeModal from '../../components/admin/RecoveryCodeModal';

export default function AdminLogin() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Whether an admin account already exists, determined once on mount.
  // While unknown we show a loader rather than guessing, so we never
  // briefly flash the wrong form.
  const [adminExists, setAdminExists] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Set once registration succeeds; shows the one-time recovery code before
  // letting the new admin into the dashboard.
  const [recoveryCode, setRecoveryCode] = useState(null);

  useEffect(() => {
    let active = true;
    checkAdminExists()
      .then((data) => {
        if (active) setAdminExists(Boolean(data.exists));
      })
      .catch(() => {
        // Fail safe: if we can't confirm, assume an admin exists so we
        // never accidentally expose a registration form when one shouldn't
        // be available.
        if (active) setAdminExists(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const goToDashboard = () => {
    navigate(location.state?.from?.pathname || '/admin/products', { replace: true });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      goToDashboard();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setSubmitting(true);
    try {
      const data = await register({ name: form.name, email: form.email, password: form.password });
      // Hold on the recovery-code screen; navigation happens once acknowledged.
      setRecoveryCode(data.recoveryCode);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (adminExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bgSoft px-4">
        <Loader />
      </div>
    );
  }

  if (recoveryCode) {
    return <RecoveryCodeModal recoveryCode={recoveryCode} onAcknowledge={goToDashboard} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bgSoft px-4 py-10">
      <form
        onSubmit={adminExists ? handleLoginSubmit : handleRegisterSubmit}
        className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sm:p-8 w-full max-w-sm"
      >
        <h1 className="text-xl font-bold text-slate-900">{adminExists ? 'Admin Login' : 'Create Admin Account'}</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          {adminExists ? 'Manage products and services' : 'Set up the first admin account for this store'}
        </p>

        {!adminExists && (
          <label className="block text-sm mb-3">
            <span className="block text-slate-600 mb-1">Name</span>
            <input
              type="text"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </label>
        )}

        <label className="block text-sm mb-3">
          <span className="block text-slate-600 mb-1">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-brand-blue"
          />
        </label>

        <label className="block text-sm mb-1">
          <span className="block text-slate-600 mb-1">Password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete={adminExists ? 'current-password' : 'new-password'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-brand-blue"
          />
        </label>

        {!adminExists && (
          <>
            <p className="text-xs text-slate-400 mt-1 mb-3">
              At least 8 characters, with an uppercase letter, lowercase letter, number, and symbol.
            </p>
            <label className="block text-sm mb-4">
              <span className="block text-slate-600 mb-1">Confirm password</span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-brand-blue"
              />
            </label>
          </>
        )}

        {adminExists && <div className="mb-4" />}

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-blue text-white font-semibold py-2.5 rounded hover:bg-brand-blueDark disabled:opacity-60"
        >
          {submitting
            ? adminExists
              ? 'Signing in…'
              : 'Creating account…'
            : adminExists
              ? 'Sign in'
              : 'Create account'}
        </button>

        {adminExists && (
          <p className="text-center text-sm text-slate-500 mt-4">
            <Link to="/admin/forgot-password" className="text-brand-blue hover:underline">
              Forgot password?
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}
