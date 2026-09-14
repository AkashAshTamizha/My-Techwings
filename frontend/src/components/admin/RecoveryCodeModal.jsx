import { useState } from 'react';
import { FiAlertTriangle, FiCheck, FiCopy } from 'react-icons/fi';

// Shown exactly once, right after a recovery code is generated (on
// registration, or when an admin regenerates it from Settings). The code
// itself is never retrievable again afterwards — only its hash is stored —
// so this requires an explicit acknowledgement before the admin can move on.
export default function RecoveryCodeModal({ recoveryCode, onAcknowledge }) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable (older browser, insecure context).
      // The code is still visible and select-all, so it can be copied by hand.
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-10">
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6 sm:p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 text-amber-600 mb-2">
          <FiAlertTriangle className="shrink-0" size={18} />
          <h2 className="font-bold text-slate-900">Save your recovery code</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          If you ever forget your password, this code is the only way to reset it. Store it
          somewhere safe — it will not be shown again.
        </p>

        <div className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded px-3 py-2.5 mb-4">
          <code className="text-sm font-mono text-slate-800 break-all select-all">{recoveryCode}</code>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 text-slate-500 hover:text-brand-blue"
            aria-label="Copy recovery code"
          >
            {copied ? <FiCheck /> : <FiCopy />}
          </button>
        </div>
        {copied && <p className="text-xs text-green-600 -mt-3 mb-4">Copied to clipboard.</p>}

        <label className="flex items-start gap-2 text-sm text-slate-600 mb-4">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5"
          />
          <span>I&apos;ve saved this recovery code somewhere safe.</span>
        </label>

        <button
          type="button"
          disabled={!confirmed}
          onClick={onAcknowledge}
          className="w-full bg-brand-blue text-white font-semibold py-2.5 rounded hover:bg-brand-blueDark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
