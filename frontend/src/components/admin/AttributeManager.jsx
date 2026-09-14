import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { useCallback, useEffect, useState } from 'react';
import { genId } from './ImageUploader';
import { getAttributeKeys, createAttributeKey } from '../../services/api';

export function makeEmptyAttribute() {
  return { _key: genId(), name: '', value: '' };
}

/**
 * A simple list of free-form name/value rows — e.g. Color: Black,
 * Weight: 1.2 Kg. Used for a product's extra specs, and reused per-variant
 * so each variant can carry its own attributes (Color, Storage, etc.).
 *
 * The pool of attribute *names* offered in the dropdown is fetched from the
 * backend's attribute-key registry (see /api/v1/attribute-keys) instead of
 * being hard-coded — admins can pick any name used anywhere before, or type
 * a brand-new one via "Custom…", which gets saved to that registry so it
 * shows up as a suggestion everywhere else afterwards too.
 *
 * Every row is keyed on its own stable `_key`, never on array index, so
 * removing or editing one row can never bleed into another.
 */
export default function AttributeManager({ attributes = [], onChange }) {
  const [keys, setKeys] = useState([]);
  const [keysLoaded, setKeysLoaded] = useState(false);
  const [savingName, setSavingName] = useState(null);
  // Rows the admin has explicitly switched to "Custom…" mode, tracked by
  // their stable _key. This has to be separate from "does this row have a
  // name" — right after picking "Custom…" the name is still blank (nothing
  // typed yet), so deriving custom-mode purely from a non-empty name meant
  // the free-text box never appeared and "Custom…" looked broken.
  const [customKeys, setCustomKeys] = useState(() => new Set());
  // The "Custom Attribute" popup. `rowKey` identifies which row's dropdown
  // opened it, so Save knows where to put the new name; it's null when the
  // popup is closed. Kept separate from the row itself so cancelling never
  // touches the row's existing value.
  const [customModal, setCustomModal] = useState(null); // { rowKey } | null
  const [customModalValue, setCustomModalValue] = useState('');
  const [customModalError, setCustomModalError] = useState('');
  const [customModalSaving, setCustomModalSaving] = useState(false);

  const fetchKeys = useCallback(() => {
    return getAttributeKeys()
      .then((data) => setKeys((data.attributeKeys || []).map((k) => k.name)))
      .catch(() => {
        /* keep whatever we last had — the row still works with a typed name */
      })
      .finally(() => setKeysLoaded(true));
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  // Persists a brand-new attribute name to the shared registry so it's
  // available as a suggestion for every product/variant going forward.
  // No-ops if the name (case-insensitively) already exists — the backend
  // also guards against this, but checking locally first avoids a
  // pointless request on every field's blur.
  const persistCustomName = async (rawName) => {
    const trimmed = rawName.trim();
    if (!trimmed) return;
    if (keys.some((k) => k.toLowerCase() === trimmed.toLowerCase())) return;

    setSavingName(trimmed);
    try {
      await createAttributeKey(trimmed);
      await fetchKeys();
    } catch {
      /* saving the shared key is best-effort; the typed value is still used locally */
    } finally {
      setSavingName(null);
    }
  };

  const exitCustomMode = (key) =>
    setCustomKeys((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });

  const usedNames = new Set(attributes.map((a) => a.name.trim().toLowerCase()).filter(Boolean));
  const availableSuggestions = keys.filter((s) => !usedNames.has(s.toLowerCase()));

  const nameCounts = {};
  attributes.forEach((a) => {
    const key = a.name.trim().toLowerCase();
    if (key) nameCounts[key] = (nameCounts[key] || 0) + 1;
  });

  const updateRow = (key, patch) => onChange(attributes.map((a) => (a._key === key ? { ...a, ...patch } : a)));
  const addRow = (presetName = '') => onChange([...attributes, { ...makeEmptyAttribute(), name: presetName }]);
  const removeRow = (key) => {
    onChange(attributes.filter((a) => a._key !== key));
    exitCustomMode(key);
  };

  const openCustomModal = (rowKey) => {
    setCustomModal({ rowKey });
    setCustomModalValue('');
    setCustomModalError('');
  };

  const closeCustomModal = () => {
    setCustomModal(null);
    setCustomModalValue('');
    setCustomModalError('');
    setCustomModalSaving(false);
  };

  // Case-insensitive duplicate check against both the shared registry and
  // any name already used elsewhere on this product/variant, so "Size",
  // "size", and "SIZE" are all treated as the same attribute.
  const isDuplicateName = (trimmed, rowKey) => {
    const lower = trimmed.toLowerCase();
    if (keys.some((k) => k.toLowerCase() === lower)) return true;
    return attributes.some((a) => a._key !== rowKey && a.name.trim().toLowerCase() === lower);
  };

  const saveCustomAttribute = async () => {
    const trimmed = customModalValue.trim();
    if (!trimmed) {
      setCustomModalError('Please enter an attribute name.');
      return;
    }
    if (isDuplicateName(trimmed, customModal.rowKey)) {
      setCustomModalError('This attribute already exists');
      return;
    }

    setCustomModalSaving(true);
    setCustomModalError('');
    try {
      await createAttributeKey(trimmed);
      await fetchKeys();
      updateRow(customModal.rowKey, { name: trimmed });
      exitCustomMode(customModal.rowKey);
      closeCustomModal();
    } catch (err) {
      setCustomModalError(err?.response?.data?.message || 'Could not save this attribute. Please try again.');
      setCustomModalSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      {attributes.map((row) => {
        const nameKey = row.name.trim().toLowerCase();
        const duplicate = nameKey && nameCounts[nameKey] > 1;
        const isKnownSuggestion = keys.some((s) => s.toLowerCase() === nameKey);
        const inCustomMode = customKeys.has(row._key);
        // Show the free-text name input whenever the row is in explicit
        // "Custom…" mode, or the current name isn't one of the dropdown's
        // own options (e.g. loaded from a saved product whose attribute
        // name isn't in the registry anymore) — i.e. it was typed, not picked.
        const showCustomInput = inCustomMode || (row.name !== '' && !isKnownSuggestion);

        const commitCustomName = (raw) => {
          const trimmed = raw.trim();
          if (trimmed && keys.some((k) => k.toLowerCase() === trimmed.toLowerCase())) {
            exitCustomMode(row._key);
          }
          persistCustomName(raw);
        };

        return (
          <div key={row._key} className="w-full
      grid
      sm:grid-cols-[40%_40%_5%]
      
gap-4 mt-2
      items-center">
            <select
              value={isKnownSuggestion ? row.name : inCustomMode || row.name ? '__custom__' : ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '__custom__') {
                  openCustomModal(row._key);
                } else {
                  exitCustomMode(row._key);
                  updateRow(row._key, { name: value });
                }
              }}
              className="input w-40 shrink-0"
            >
              <option value="">{keysLoaded ? 'Select…' : 'Loading…'}</option>
              {row.name && !isKnownSuggestion && <option value="__custom__">Custom: {row.name}</option>}
              {(isKnownSuggestion ? [row.name, ...availableSuggestions] : availableSuggestions).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value="__custom__">Custom…</option>
            </select>

            {showCustomInput && (
              <input
                placeholder="Attribute name — press Enter to save"
                value={row.name}
                onChange={(e) => updateRow(row._key, { name: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return;
                  // Prevent Enter from submitting the surrounding Add
                  // Product / Variant form — it should only save this key.
                  e.preventDefault();
                  commitCustomName(e.target.value);
                  e.target.blur();
                }}
                onBlur={(e) => commitCustomName(e.target.value)}
                className="input flex-1"
              />
            )}

            <input
              placeholder="Value (e.g. Blue, 128GB)"
              value={row.value}
              onChange={(e) => updateRow(row._key, { value: e.target.value })}
              className="input flex-1"
            />

            <button
              type="button"
              onClick={() => removeRow(row._key)}
              aria-label="Remove attribute"
              className="shrink-0 h-9 w-9 flex items-center justify-center text-slate-300 hover:text-red-600"
            >
              <FiTrash2 size={15} />
            </button>

            {duplicate && <span className="self-center text-xs text-red-600 shrink-0">Duplicate name</span>}
            {savingName && savingName.toLowerCase() === nameKey && (
              <span className="self-center text-xs text-slate-400 shrink-0">Saving new attribute…</span>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => addRow(availableSuggestions[0] || '')}
        className="flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:text-brand-blueDark"
      >
        <FiPlus size={12} /> Add attribute
      </button>

      {availableSuggestions.length > 0 && (
        <p className="text-xs text-slate-400">Suggested: {availableSuggestions.join(', ')}</p>
      )}

      {customModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <h3 className="font-bold text-slate-900">Custom Attribute</h3>
            <p className="text-sm text-slate-500 mt-1">Enter a name for the new attribute, e.g. "Size".</p>

            <input
              autoFocus
              value={customModalValue}
              onChange={(e) => {
                setCustomModalValue(e.target.value);
                if (customModalError) setCustomModalError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  saveCustomAttribute();
                }
              }}
              placeholder="Attribute name"
              className="input w-full mt-4"
            />
            {customModalError && <p className="text-xs text-red-600 mt-1.5">{customModalError}</p>}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={closeCustomModal}
                className="px-4 py-2 text-sm rounded border border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveCustomAttribute}
                disabled={customModalSaving}
                className="px-4 py-2 text-sm rounded bg-brand-blue text-white hover:bg-brand-blueDark disabled:opacity-60"
              >
                {customModalSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}