import ProductCard from './ProductCard';
import { ProductCardSkeleton } from '../common/Loader';

export default function ProductGrid({ products, loading }) {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 260px))',
    gap: '1.5rem',
  };

  if (loading) {
    return (
      <div style={gridStyle}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-lg font-medium">No products match your filters</p>
        <p className="text-sm mt-1">Try adjusting or clearing a filter to see more results.</p>
      </div>
    );
  }

  return (
    <div style={gridStyle}>
      {products.map((p) => (
        <ProductCard key={p._id || p.slug} product={p} />
      ))}
    </div>
  );
}