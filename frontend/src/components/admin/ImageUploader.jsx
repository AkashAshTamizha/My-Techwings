import { useRef } from 'react';
import { FiUpload, FiX, FiStar, FiArrowLeft, FiArrowRight, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { uploadImage, deleteUploadedImage } from '../../services/api';

let idCounter = 0;
export function genId() {
  idCounter += 1;
  return `img-${Date.now()}-${idCounter}`;
}

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
 * Reusable Cloudinary image manager. Fully controlled: the parent owns the
 * `images` array and receives every change via `onChange`. Each entry looks
 * like:
 *   { _key, url, publicId, isPrimary, uploading, progress, error, file }
 *
 * Used for BOTH the product-level gallery and each variant's own image set —
 * the `folder` prop just tells the backend which Cloudinary sub-folder to
 * file the asset under.
 */
export default function ImageUploader({ images = [], onChange, folder = 'products', maxFiles = 10, label = 'Images' }) {





  const inputRef = useRef(null);

  // Always reflects the latest `images` prop, so async callbacks (upload
  // success/failure, which fire well after re-renders have happened) never
  // clobber state with a stale snapshot.
  const imagesRef = useRef(images);
  imagesRef.current = images;

  const setImages = (updater) => {
    const next = typeof updater === 'function' ? updater(imagesRef.current) : updater;
    imagesRef.current = next;
    onChange(next);
  };




  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    if (images.length + files.length > maxFiles) {
      setImages((prev) => [
        ...prev,
        { _key: genId(), error: `You can upload at most ${maxFiles} images here`, uploading: false },
      ]);
      return;
    }

    files.forEach((file) => {
      const validationError = validateFile(file);
      const key = genId();
      const previewUrl = URL.createObjectURL(file);

      setImages((prev) => [
        ...prev,
        {
          _key: key,
          previewUrl,
          uploading: !validationError,
          progress: 0,
          error: validationError || null,
        },
      ]);

      if (validationError) return;

      uploadImage(file, folder, (evt) => {
        if (!evt.total) return;
        const progress = Math.round((evt.loaded / evt.total) * 100);
        setImages((prev) => prev.map((img) => (img._key === key ? { ...img, progress } : img)));
      })
        .then(({ image }) => {
          setImages((prev) =>
            prev.map((img) =>
              img._key === key
                ? {
                    _key: key,
                    ...image,
                    isPrimary: prev.every((p) => !p.isPrimary), // first successful upload becomes primary by default
                    uploading: false,
                    error: null,
                  }
                : img
            )
          );
        })
        .catch((err) => {
          setImages((prev) =>
            prev.map((img) =>
              img._key === key
                ? { ...img, uploading: false, error: err.response?.data?.message || 'Upload failed' }
                : img
            )
          );
        });
    });
  };

  const retry = (key) => {
    // Retrying just clears the error so the user can pick the file again —
    // we don't hold onto raw File objects in state.
    setImages((prev) => prev.filter((img) => img._key !== key));
  };

  const remove = async (key) => {
    const target = images.find((img) => img._key === key);
    setImages((prev) => {
      const next = prev.filter((img) => img._key !== key);
      // If we just removed the primary image, promote the new first image.
      if (target?.isPrimary && next.length > 0 && !next.some((i) => i.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
    if (target?.publicId) {
      try {
        await deleteUploadedImage(target.publicId);
      } catch {
        // Best-effort cleanup; the image is already gone from the form either way.
      }
    }
  };

  const setPrimary = (key) => {
    setImages((prev) => prev.map((img) => ({ ...img, isPrimary: img._key === key })));
  };

  const move = (key, direction) => {
    setImages((prev) => {
      const idx = prev.findIndex((img) => img._key === key);
      const swapWith = idx + direction;
      if (idx === -1 || swapWith < 0 || swapWith >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-xs text-slate-400">
          {images.filter((i) => i.publicId).length}/{maxFiles} uploaded
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <div
            key={img._key}
            className={`relative aspect-square rounded border bg-slate-50 overflow-hidden group ${
              img.isPrimary ? 'border-brand-blue ring-2 ring-brand-blue/40' : 'border-slate-200'
            }`}
          >
            {img.url || img.previewUrl ? (
              <img
                src={img.url || img.previewUrl}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            {!(img.url || img.previewUrl) && (
              <div className="w-full h-full flex items-center justify-center text-red-400">
                <FiAlertCircle size={20} />
              </div>
            )}
            {(img.url || img.previewUrl) && (
              <div className="hidden absolute inset-0 w-full h-full flex items-center justify-center text-red-400 bg-slate-50">
                <FiAlertCircle size={20} />
              </div>
            )}

            {img.uploading && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-xs gap-1">
                <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{img.progress || 0}%</span>
              </div>
            )}

            {img.error && (
              <div className="absolute inset-0 bg-red-600/90 flex flex-col items-center justify-center text-white text-[10px] p-1 text-center gap-1">
                <FiAlertCircle />
                <span className="line-clamp-2">{img.error}</span>
                <button type="button" onClick={() => retry(img._key)} className="underline flex items-center gap-1">
                  <FiRefreshCw size={10} /> Remove
                </button>
              </div>
            )}

            {!img.uploading && !img.error && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-between p-1 opacity-0 group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => move(img._key, -1)}
                    className="bg-white/90 rounded p-1 disabled:opacity-30"
                    aria-label="Move left"
                  >
                    <FiArrowLeft size={12} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={() => move(img._key, 1)}
                    className="bg-white/90 rounded p-1 disabled:opacity-30"
                    aria-label="Move right"
                  >
                    <FiArrowRight size={12} />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setPrimary(img._key)}
                    className={`rounded p-1 ${img.isPrimary ? 'bg-brand-blue text-white' : 'bg-white/90 text-slate-700'}`}
                    aria-label="Set as primary image"
                    title="Set as primary image"
                  >
                    <FiStar size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(img._key)}
                    className="bg-white/90 rounded p-1 text-red-600"
                    aria-label="Remove image"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              </div>
            )}

            {img.isPrimary && !img.uploading && !img.error && (
              <span className="absolute top-1 left-1 bg-brand-blue text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                Primary
              </span>
            )}
          </div>
        ))}

        {images.length < maxFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded border-2 border-dashed border-slate-300 text-slate-400 hover:border-brand-blue hover:text-brand-blue flex flex-col items-center justify-center gap-1 text-xs"
          >
            <FiUpload size={18} />
            Upload
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}