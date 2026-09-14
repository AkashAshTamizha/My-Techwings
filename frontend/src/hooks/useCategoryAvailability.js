import { useEffect, useState } from 'react';
import { getCategorySummary } from '../services/api';

// Drives the "Shop By Category" Coming Soon behaviour: fetches the real
// per-category product counts once, then exposes a simple `isAvailable(key)`
// check. Categories are treated as available (not blurred) until the summary
// has loaded, so populated categories never flash a "Coming Soon" state —
// only categories confirmed to have zero active products get the overlay.
export default function useCategoryAvailability() {
  const [counts, setCounts] = useState(null); // null while loading
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCategorySummary()
      .then((data) => {
        if (cancelled) return;
        const map = {};
        (data.categories || []).forEach((c) => {
          map[c._id] = c.count;
        });
        setCounts(map);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // While loading (counts === null) or if the summary request failed,
  // default to "available" so we never wrongly hide/blur a real category —
  // worst case a genuinely empty category briefly looks normal.
  const isAvailable = (categoryKey) => {
    if (!counts || error) return true;
    return (counts[categoryKey] || 0) > 0;
  };

  return { isAvailable, loading: counts === null && !error };
}
