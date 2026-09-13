import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router doesn't reset scroll position on navigation the way a
// traditional multi-page site does. Without this, clicking a link while
// scrolled down (e.g. a "Shop by Category" card on the home page) lands on
// the destination page still scrolled to the same spot, so the new content
// is invisible until the user scrolls back up — which reads as "the card
// isn't doing anything."
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search]);

  return null;
}
