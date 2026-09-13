import { useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../common/StarRating';
import { formatINR, getPrimaryImageUrl } from '../../utils/format';

const tagStyles = {
  NEW: 'bg-blue-600 text-white',
  Refurbished: 'bg-red-600 text-white',
  'Price Drop': 'bg-amber-400 text-slate-900',
};

export default function ProductCard({ product, variant = 'grid' }) {
  const image = getPrimaryImageUrl(product.images);
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = image && !imgFailed;
  const isRelated = variant === 'related';

  // Supports either a single `tag` (current data model) or a future
  // `tags` array, so multiple badges (e.g. "Price Drop" + "Refurbished")
  // can be shown together without a breaking change.
  const tags = product.tags?.length ? product.tags : product.tag ? [product.tag] : [];

  const specChips = [product.screenSize, product.specs?.ram, product.specs?.storage].filter(Boolean);

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block outline-none border border-slate-200 rounded-xl overflow-hidden bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div
        className={`relative aspect-[4/3] flex items-center justify-center overflow-hidden ${
          isRelated ? 'bg-white' : 'bg-gradient-to-br from-slate-50 to-blue-50'
        }`}
      >
        {tags.length > 0 && (
          <div className="absolute top-2 right-2 left-2 flex flex-wrap justify-end gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm ${
                  tagStyles[t] || 'bg-slate-800 text-white'
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        )}
        {showImage ? (
          <img
            src={image}
            alt={product.name}
            className={`w-full h-full transition-transform ${
              isRelated ? 'object-contain p-4' : 'object-contain p-6 group-hover:scale-105'
            }`}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200" />
        )}
      </div>

      <div className="p-4">
        {product.category && (
          <p className={`text-[11px] font-medium text-slate-400 mb-1 tracking-wide ${isRelated ? '' : 'uppercase'}`}>
            {product.category}
          </p>
        )}
        <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2">{product.name}</h3>

        {product.rating > 0 && (
          <div className="mt-1.5">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          </div>
        )}

        {specChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {specChips.map((spec) => (
              <span key={spec} className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                {spec}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className={`font-bold text-lg ${isRelated ? 'text-brand-blue' : 'text-slate-900'}`}>
            {formatINR(product.price)}
          </p>
          {product.compareAtPrice > product.price && (
            <p className="text-xs text-slate-400 line-through mt-0.5">{formatINR(product.compareAtPrice)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
