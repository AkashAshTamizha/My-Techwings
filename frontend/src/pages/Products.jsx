import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSliders } from 'react-icons/fi';
import Filters from '../components/product/Filters';
import ProductGrid from '../components/product/ProductGrid';
import Pagination from '../components/product/Pagination';
import { getProducts } from '../services/api';

// Pagination happens entirely in the browser: the full filtered/sorted
// result set is fetched once per filter change, then sliced into 10-item
// pages client-side. This keeps prev/next instant (no round-trip per page)
// at the catalog sizes this store deals in.
const PAGE_SIZE = 10;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = Object.fromEntries(searchParams.entries());
  const page = Math.max(1, Number(filters.page) || 1);

  // Everything except `page` is a server-side filter/sort param. `page` is
  // handled entirely client-side below, so it's excluded from the query
  // that decides when to re-fetch.
  // eslint-disable-next-line no-unused-vars
  const { page: _page, ...serverFilters } = filters;
  const serverFiltersKey = JSON.stringify(serverFilters);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    // Ask the API for every matching product in one page (well above any
    // realistic catalog size here) so pagination can happen client-side.
    getProducts({ ...serverFilters, page: 1, limit: 1000 })
      .then((data) => setAllItems(data.items || []))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverFiltersKey]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalPages = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => allItems.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [allItems, safePage]
  );

  // Changing a filter or sort should always jump back to page 1 — otherwise
  // switching category/sort while on page 2+ can request a page that no
  // longer exists for the new result set and silently come back empty,
  // which looks like the filter is broken.
  const updateFilters = (next, { resetPage = true } = {}) => {
    const merged = { ...next };
    if (resetPage) delete merged.page;
    const clean = Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== undefined && v !== ''));
    setSearchParams(clean);
  };

  const goToPage = (p) => updateFilters({ ...filters, page: p }, { resetPage: false });

  const resetFilters = () => setSearchParams({});

  const activeFilterCount = Object.keys(filters).filter((k) => !['sort', 'page', 'search'].includes(k)).length;

  return (
    <div className="w-full px-4 sm:px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <Filters
          filters={filters}
          onChange={updateFilters}
          onReset={resetFilters}
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              {filters.onSale === 'true' ? 'Today’s Deals' : 'Laptops'}
            </h1>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 border border-slate-200 rounded px-3 py-1.5 text-sm font-medium text-slate-700 relative"
              >
                <FiSliders /> Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-brand-blue text-white text-[10px] flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <label className="text-sm text-slate-600 items-center gap-2 hidden sm:flex">
                Sort by:
                <select
                  value={filters.sort || 'recommended'}
                  onChange={(e) => updateFilters({ ...filters, sort: e.target.value })}
                  className="border border-slate-200 rounded px-3 py-1.5 text-sm"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest</option>
                </select>
              </label>
            </div>
          </div>

          <label className="text-sm text-slate-600 flex items-center gap-2 mb-4 sm:hidden">
            Sort by:
            <select
              value={filters.sort || 'recommended'}
              onChange={(e) => updateFilters({ ...filters, sort: e.target.value })}
              className="flex-1 border border-slate-200 rounded px-3 py-1.5 text-sm"
            >
              <option value="recommended">Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
          </label>

          <ProductGrid products={pageItems} loading={loading} columns="sm:grid-cols-2 lg:grid-cols-3" />

          <Pagination page={safePage} pages={totalPages} onChange={goToPage} />
        </div>
      </div>
    </div>
  );
}
