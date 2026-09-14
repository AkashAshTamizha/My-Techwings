import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiCpu, FiHardDrive, FiMonitor as FiDisplay, FiDatabase, FiTag } from 'react-icons/fi';
import StarRating from '../components/common/StarRating';
import { Loader } from '../components/common/Loader';
import ProductCard from '../components/product/ProductCard';
import VariantSelector from '../components/product/VariantSelector';
import InquiryModal from '../components/product/InquiryModal';
import { getProductBySlug } from '../services/api';
import { formatINR, getImageUrl } from '../utils/format';

// Small cosmetic lookup for a few well-known spec keys; anything else (new
// categories' fields) just falls back to a generic tag icon. Purely visual —
// which fields actually render is driven entirely by the `specFields` the
// API returns for the product's category (see categorySpecs.js on the
// backend), not by this map.
const SPEC_ICONS = {
  processor: <FiCpu />,
  ram: <FiDatabase />,
  storage: <FiHardDrive />,
  display: <FiDisplay />,
};

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [specFields, setSpecFields] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [failedImages, setFailedImages] = useState(() => new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setProduct(null);
    setRelated([]);
    setSpecFields([]);
    setSelectedVariantId(null);
    setActiveImage(0);
    setFailedImages(new Set());

    let cancelled = false;

    getProductBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        const fetchedProduct = data.product;
        setProduct(fetchedProduct);
        setRelated(data.related || []);
        setSpecFields(data.specFields || []);
        const firstActiveVariant = (fetchedProduct.variants || []).find((v) => v.isActive !== false);
        setSelectedVariantId(firstActiveVariant?._id ?? null);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const selectedVariant = useMemo(
    () => (product?.variants || []).find((v) => v._id === selectedVariantId) || null,
    [product, selectedVariantId]
  );

  if (loading) return <Loader />;

  if (notFound || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="text-xl font-bold">Product not found</h1>
        <p className="text-slate-500 mt-2">It may have been removed or the link is incorrect.</p>
        <Link to="/products" className="text-brand-blue font-semibold mt-4 inline-block">
          Browse all products →
        </Link>
      </div>
    );
  }

  const galleryImages = selectedVariant?.images?.length ? selectedVariant.images : product.images;
  const images = galleryImages?.length
    ? galleryImages.map((img) => {
        const url = getImageUrl(img);
        return url && !failedImages.has(url) ? url : null;
      })
    : [null];

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayCompareAtPrice = selectedVariant ? selectedVariant.compareAtPrice : product.compareAtPrice;
  const displayStock = selectedVariant ? selectedVariant.stock : product.stock;
  const outOfStock = displayStock != null && displayStock <= 0;

  // Admin-defined custom fields (see AttributeManager) that are purely
  // informational — e.g. Weight, Material. Fields marked "use for variants"
  // are deliberately excluded here since their value is already shown via
  // the interactive VariantSelector above; showing them again as a static
  // spec card would just repeat (and could contradict) the selected variant.
  const extraSpecs = (product.attributes || []).filter(
    (a) => a.useForVariants !== true && a.values?.length > 0
  );

  const handleSelectVariant = (variantId) => {
    setSelectedVariantId(variantId);
    setActiveImage(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav className="text-sm text-slate-500 mb-6">
        <Link to="/">Home</Link> <span className="mx-1">›</span>
        <Link to={`/products?category=${product.category}`}>{product.category}</Link> <span className="mx-1">›</span>
        <span className="text-slate-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[2fr_3fr] gap-10">
        {/* Gallery */}
        <div>
          <div className="aspect-square w-full bg-white border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
            {images[activeImage] ? (
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={() => setFailedImages((prev) => new Set(prev).add(images[activeImage]))}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200" />
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-4">
              {images.map((img, i) => (
                <button
                  key={galleryImages?.[i]?.publicId || img || i}
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-square w-full rounded-lg border-2 bg-white overflow-hidden ${
                    activeImage === i ? 'border-brand-blue' : 'border-slate-200'
                  }`}
                >
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={() => setFailedImages((prev) => new Set(prev).add(img))}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="max-w-xl">
          {product.tag && (
            <span className="inline-block bg-brand-blue text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-3">
              {product.tag}
            </span>
          )}
          <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
          {product.rating > 0 && (
            <div className="mt-2">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} />
            </div>
          )}
          <p className="text-2xl font-bold text-slate-900 mt-4">
            {formatINR(displayPrice)}
            {displayCompareAtPrice > displayPrice && (
              <span className="text-sm font-normal text-slate-400 line-through ml-2">
                {formatINR(displayCompareAtPrice)}
              </span>
            )}
          </p>

          <VariantSelector
            variants={product.variants || []}
            selectedVariantId={selectedVariantId}
            onSelect={handleSelectVariant}
          />

          <div className="grid grid-cols-2 gap-3 mt-6">
            {/* Only the spec fields defined for this product's category are
                shown (Laptop shows Processor/RAM/..., Printer shows Print
                Type/Speed/..., etc.) — see the `specFields` the API returns. */}
            {specFields.map((field) => (
              <SpecCard
                key={field.key}
                icon={SPEC_ICONS[field.key] || <FiTag />}
                label={field.label}
                value={product.specs?.[field.key]}
              />
            ))}
            {extraSpecs.map((field) => (
              <SpecCard key={field.name} icon={<FiTag />} label={field.name} value={field.values.join(', ')} />
            ))}
          </div>

          {product.description && <p className="text-slate-600 mt-6 leading-relaxed">{product.description}</p>}

          <button
            onClick={() => setModalOpen(true)}
            disabled={outOfStock}
            className="mt-8 bg-brand-blue text-white font-semibold px-8 py-3 rounded hover:bg-brand-blueDark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {outOfStock ? 'Out of Stock' : 'Need This Product'}
          </button>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Customers Also Viewed</h2>
          <div className="flex flex-wrap gap-4 sm:gap-6">
            {related.map((p) => (
              <div key={p._id || p.slug} className="w-full sm:w-[260px]">
                <ProductCard product={p} variant="related" />
              </div>
            ))}
          </div>
        </div>
      )}

      {modalOpen && (
        <InquiryModal product={product} variant={selectedVariant} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}

function SpecCard({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="border border-slate-200 rounded-lg p-3 flex items-center gap-3">
      <span className="text-brand-blue">{icon}</span>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}