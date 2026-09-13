import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Builds a compact page list with ellipses, e.g. [1,2,3,'…',9] or
// [1,'…',5,6,7,'…',12], always keeping the current page in view.
function buildPageList(page, pages) {
  const siblings = 1;
  const totalVisible = siblings * 2 + 5; // first, last, current, 2 siblings, 2 ellipses

  if (pages <= totalVisible) {
    return Array.from({ length: pages }, (_, i) => i + 1);
  }

  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, pages);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < pages - 1;

  const items = [1];
  if (showLeftEllipsis) items.push('…');
  for (let i = left === 1 ? 2 : left; i <= (right === pages ? pages - 1 : right); i++) {
    if (i > 1 && i < pages) items.push(i);
  }
  if (showRightEllipsis) items.push('…');
  items.push(pages);

  return items;
}

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  const items = buildPageList(page, pages);

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-10 flex-wrap">
      <PageBtn onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1} aria-label="Previous page">
        <FiChevronLeft />
      </PageBtn>
      {items.map((item, i) =>
        item === '…' ? (
          <span key={`ellipsis-${i}`} className="px-1.5 sm:px-2 text-slate-400 select-none">
            …
          </span>
        ) : (
          <PageBtn key={item} active={item === page} onClick={() => onChange(item)} aria-label={`Page ${item}`}>
            {item}
          </PageBtn>
        )
      )}
      <PageBtn onClick={() => onChange(Math.min(pages, page + 1))} disabled={page === pages} aria-label="Next page">
        <FiChevronRight />
      </PageBtn>
    </div>
  );
}

function PageBtn({ children, active, disabled, onClick, ...rest }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      {...rest}
      className={`h-9 w-9 rounded-md border text-sm font-medium flex items-center justify-center shrink-0
        ${active ? 'bg-brand-blue text-white border-brand-blue' : 'border-slate-200 text-slate-600 hover:border-brand-blue'}
        disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}
