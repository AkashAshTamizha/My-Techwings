import { FiStar } from 'react-icons/fi';

export default function StarRating({ rating = 0, reviewCount }) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-1 text-sm">
      <div className="flex text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <FiStar key={i} className={i < full ? 'fill-amber-400' : 'text-slate-300'} />
        ))}
      </div>
      {typeof reviewCount === 'number' && <span className="text-slate-400">({reviewCount})</span>}
    </div>
  );
}
