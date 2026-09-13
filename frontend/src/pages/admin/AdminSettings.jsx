import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { updatePassword } from '../../services/api';

export default function AdminSettings() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    setSaving(true);
    try {
      await updatePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold text-slate-900 mb-6">Settings</h1>

      <div className="bg-white rounded-lg border border-slate-200 p-6 max-w-md">
        <h2 className="font-semibold text-slate-900 mb-1">Change Password</h2>
        <p className="text-sm text-slate-500 mb-4">
          Update the password for your admin account. You&apos;ll stay signed in afterwards.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Current password">
            <input
              type="password"
              required
              value={form.currentPassword}
              onChange={update('currentPassword')}
              className="input"
              autoComplete="current-password"
            />
          </Field>
          <Field label="New password">
            <input
              type="password"
              required
              minLength={8}
              value={form.newPassword}
              onChange={update('newPassword')}
              className="input"
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm new password">
            <input
              type="password"
              required
              minLength={8}
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              className="input"
              autoComplete="new-password"
            />
          </Field>

          <p className="text-xs text-slate-400">
            At least 8 characters, with an uppercase letter, lowercase letter, number, and symbol.
          </p>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">Password updated.</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-brand-blue text-white font-semibold px-6 py-2.5 rounded hover:bg-brand-blueDark disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Update Password'}
          </button>
        </form>
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
