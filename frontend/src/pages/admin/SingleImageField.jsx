import { useRef, useState } from 'react';
import { FiUpload, FiX, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { uploadImage, deleteUploadedImage } from '../../services/api';

const MAX_IMAGE_MB = 5;

function validateFile(file) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.type)) {
    return `${file.name}: unsupported file type (use JPEG, PNG, WEBP or GIF)`;
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    return `${file.name}: file is larger than ${MAX_IMAGE_MB}MB`;
  }
  return null;
}

/**
 * A single-image counterpart to ImageUploader.jsx, for the one-off image
 * fields on the singleton content pages (About/Service/Contact admin
 * forms) — e.g. "Story about us" image, warranty badge, map image. Fully
 * controlled: the parent owns `value` ({ url, publicId } or {}) and
 * receives every change via `onChange`.
 */
export default function SingleImageField({ value, onChange, folder = 'content', label = 'Image' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const currentUrl = value?.url || previewUrl;

  const handleFile = (file) => {
    if (!file) return;
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    setProgress(0);

    uploadImage(file, folder, (evt) => {
      if (!evt.total) return;
      setProgress(Math.round((evt.loaded / evt.total) * 100));
    })
      .then(({ image }) => {
        onChange({ url: image.url, publicId: image.publicId });
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Upload failed');
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const remove = async () => {
    const publicId = value?.publicId;
    setPreviewUrl('');
    onChange({ url: '', publicId: '' });
    if (publicId) {
      try {
        await deleteUploadedImage(publicId);
      } catch {
        // Best-effort cleanup; the field is already cleared either way.
      }
    }
  };

  return (
    <div>
      <span className="block text-sm text-slate-600 mb-1">{label}</span>

      <div className="relative w-full max-w-xs aspect-video rounded border border-slate-200 bg-slate-50 overflow-hidden">
        {currentUrl ? (
          <img src={currentUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center gap-1 text-xs text-slate-400 hover:border-brand-blue hover:text-brand-blue"
          >
            <FiUpload size={18} />
            Upload image
          </button>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-xs gap-1">
            <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{progress}%</span>
          </div>
        )}

        {currentUrl && !uploading && (
          <div className="absolute top-1 right-1 flex gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white/90 rounded p-1 text-slate-700"
              aria-label="Replace image"
              title="Replace image"
            >
              <FiRefreshCw size={12} />
            </button>
            <button
              type="button"
              onClick={remove}
              className="bg-white/90 rounded p-1 text-red-600"
              aria-label="Remove image"
              title="Remove image"
            >
              <FiX size={12} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <FiAlertCircle size={12} /> {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
