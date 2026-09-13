import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { genId } from './ImageUploader';

// Just a starting menu of common spec names — admins can still type anything
// via "Custom…", so this is a convenience, not a restriction.
export const ATTRIBUTE_SUGGESTIONS = ['Color', 'Weight', 'Material', 'Warranty', 'Battery Life', 'Ports', 'Graphics Card', 'Operating System'];

export function makeEmptyAttribute() {
  return { _key: genId(), name: '', value: '' };
}

/**
 * A simple list of free-form name/value rows — e.g. Color: Black,
 * Weight: 1.2 Kg. Used for a product's extra specs, and reused per-variant
 * so each variant can carry its own attributes (Color, Storage, etc.).
 *
 * Every row is keyed on its own stable `_key`, never on array index, so
 * removing or editing one row can never bleed into another.
 */
export default function AttributeManager({ attributes = [], onChange, suggestions = ATTRIBUTE_SUGGESTIONS }) {
  const usedNames = new Set(attributes.map((a) => a.name.trim().toLowerCase()).filter(Boolean));
  const availableSuggestions = suggestions.filter((s) => !usedNames.has(s.toLowerCase()));

  const nameCounts = {};
  attributes.forEach((a) => {
    const key = a.name.trim().toLowerCase();
    if (key) nameCounts[key] = (nameCounts[key] || 0) + 1;
  });

  const updateRow = (key, patch) => onChange(attributes.map((a) => (a._key === key ? { ...a, ...patch } : a)));
  const addRow = (presetName = '') => onChange([...attributes, { ...makeEmptyAttribute(), name: presetName }]);
  const removeRow = (key) => onChange(attributes.filter((a) => a._key !== key));

  return (
    <div className="space-y-2">
      {attributes.map((row) => {
        const nameKey = row.name.trim().toLowerCase();
        const duplicate = nameKey && nameCounts[nameKey] > 1;
        const isKnownSuggestion = suggestions.some((s) => s.toLowerCase() === nameKey);
        // Show the free-text name input whenever the current name isn't one
        // of the dropdown's own options (i.e. it was typed in, not picked).
        const showCustomInput = row.name !== '' && !isKnownSuggestion;

        return (
          <div key={row._key} className="w-full
      grid
      sm:grid-cols-[40%_40%_5%]
      
gap-4 mt-2
      items-center">
            <select
              value={isKnownSuggestion ? row.name : row.name ? '__custom__' : ''}
              onChange={(e) => {
                const value = e.target.value;
                updateRow(row._key, { name: value === '__custom__' ? '' : value });
              }}
              className="input w-40 shrink-0"
            >
              <option value="">Select…</option>
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
                placeholder="Attribute name"
                value={row.name}
                onChange={(e) => updateRow(row._key, { name: e.target.value })}
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
    </div>
  );
}
