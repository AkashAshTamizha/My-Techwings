import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPasswordVerify, resetPassword } from '../../services/api';

const STEPS = { VERIFY: 1, RESET: 2, DONE: 3 };

export default function AdminForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.VERIFY);
  const [form, setForm] = useState({ email: '', recoveryCode: '', newPassword: '', confirmPassword: '' });
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await forgotPasswordVerify({ email: form.email, recoveryCode: form.recoveryCode });
      setResetToken(data.resetToken);
      setStep(STEPS.RESET);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not verify those details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({ token: resetToken, newPassword: form.newPassword });
      setStep(STEPS.DONE);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset your password. Please start over.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bgSoft px-4 py-10">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sm:p-8 w-full max-w-sm">
        {step === STEPS.VERIFY && (
          <form onSubmit={handleVerify}>
            <h1 className="text-xl font-bold text-slate-900">Reset Password</h1>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              Enter your admin email and the recovery code you saved when the account was created.
            </p>

            <label className="block text-sm mb-3">
              <span className="block text-slate-600 mb-1">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={update('email')}
                className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-brand-blue"
              />
            </label>

            <label className="block text-sm mb-4">
              <span className="block text-slate-600 mb-1">Recovery code</span>
              <input
                type="text"
                required
                value={form.recoveryCode}
                onChange={update('recoveryCode')}
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                className="w-full border border-slate-200 rounded px-3 py-2 text-sm font-mono outline-none focus:border-brand-blue"
              />
            </label>

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-blue text-white font-semibold py-2.5 rounded hover:bg-brand-blueDark disabled:opacity-60"
            >
              {submitting ? 'Verifying…' : 'Verify'}
            </button>
          </form>
        )}

        {step === STEPS.RESET && (
          <form onSubmit={handleReset}>
            <h1 className="text-xl font-bold text-slate-900">Set a new password</h1>
            <p className="text-sm text-slate-500 mt-1 mb-6">Identity verified. Choose a new password below.</p>

            <label className="block text-sm mb-1">
              <span className="block text-slate-600 mb-1">New password</span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={form.newPassword}
                onChange={update('newPassword')}
                className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-brand-blue"
              />
            </label>
            <p className="text-xs text-slate-400 mt-1 mb-3">
              At least 8 characters, with an uppercase letter, lowercase letter, number, and symbol.
            </p>

            <label className="block text-sm mb-4">
              <span className="block text-slate-600 mb-1">Confirm new password</span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
                className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-brand-blue"
              />
            </label>

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-blue text-white font-semibold py-2.5 rounded hover:bg-brand-blueDark disabled:opacity-60"
            >
              {submitting ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        )}

        {step === STEPS.DONE && (
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-900 mb-2">Password updated</h1>
            <p className="text-sm text-slate-500 mb-6">
              Your password has been reset successfully. Please log in with your new password.
            </p>
            <button
              type="button"
              onClick={() => navigate('/admin/login', { replace: true })}
              className="w-full bg-brand-blue text-white font-semibold py-2.5 rounded hover:bg-brand-blueDark"
            >
              Go to login
            </button>
          </div>
        )}

        {step !== STEPS.DONE && (
          <p className="text-center text-sm text-slate-500 mt-4">
            <Link to="/admin/login" className="text-brand-blue hover:underline">
              Back to login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
