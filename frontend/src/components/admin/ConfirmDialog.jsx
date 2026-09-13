export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'Delete' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="alertdialog" aria-modal="true">
      <div className="bg-white rounded-lg w-full max-w-sm p-6">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-2">{message}</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded border border-slate-200 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
