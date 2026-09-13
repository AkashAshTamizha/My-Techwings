import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiSearch, FiMenu, FiChevronDown, FiX } from 'react-icons/fi';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/service', label: 'Service' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' },
];

// `value` must match the Product model's `category` enum exactly
// (backend does an exact-match filter), while `label` is the
// friendly text shown in the dropdown.
const categories = [
  { value: 'Ultrabook', label: 'Ultrabooks' },
  { value: 'Gaming', label: 'Gaming Laptops' },
  { value: 'Business', label: 'Business Laptops' },
  { value: 'Refurbished', label: 'Refurbished Laptops' },
  { value: 'CCTV', label: 'Smart CCTV' },
  { value: 'Printer', label: 'Printers' },
];

export default function Header() {
  const [query, setQuery] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(query)}`);
    setCategoryOpen(false);
    setMobileMenuOpen(false);
  };

  const closeMenus = () => {
    setCategoryOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40 w-full">
      {/* Top row: logo + search + mobile menu button */}
      <div className="w-full flex items-center gap-3 sm:gap-6 px-4 sm:px-8 py-3 sm:py-4">
        <Link to="/" className="flex items-center gap-2 shrink-0" onClick={closeMenus}>
          <span className="w-9 h-9 rounded-md bg-white-900 flex items-center justify-center shrink-0">
<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">

  <path 
    d="M4 15V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9" 
    stroke="currentColor" 
    stroke-width="2.5" 
    stroke-linecap="round" 
    stroke-linejoin="round" 
  />
  

  <path 
    d="M3 18h18a1.5 1.5 0 0 1 1.5 1.5v0a1.5 1.5 0 0 1-1.5 1.5H3a1.5 1.5 0 0 1-1.5-1.5v0A1.5 1.5 0 0 1 3 18z" 
    fill="currentColor" 
    stroke="none" 
  />
</svg>
          </span>
          <span className="leading-tight">
            <span className="block font-bold text-base sm:text-lg text-slate-900">My Tech Wings</span>
            <span className="block text-[10px] tracking-wide text-slate-400">TECH SOLUTIONS</span>
          </span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 hidden md:flex justify-end">
          <div className="flex w-full max-w-xl rounded-md overflow-hidden border border-slate-200 focus-within:border-brand-blue">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search laptops, brands, categories..."
              className="flex-1 px-4 py-2.5 text-sm outline-none min-w-0"
              aria-label="Search products"
            />
            <button
              type="submit"
              className="bg-brand-blue px-4 flex items-center justify-center text-white hover:opacity-90 transition shrink-0"
              aria-label="Search"
            >
              <FiSearch />
            </button>
          </div>
        </form>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
          className="md:hidden ml-auto shrink-0 h-9 w-9 flex items-center justify-center rounded border border-slate-200 text-slate-700"
        >
          {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* Bottom row: category + nav (desktop) */}
      <div className="border-t border-slate-100 relative w-full hidden md:block">
        <div className="w-full flex items-center gap-6 px-4 sm:px-8 h-12">
          <button
            onClick={() => setCategoryOpen((v) => !v)}
            className="flex items-center gap-2 bg-brand-navy text-white text-xs font-semibold tracking-wide px-4 h-9 rounded whitespace-nowrap"
          >
            <FiMenu /> SHOP BY CATEGORY
            <FiChevronDown className={`transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setCategoryOpen(false)}
                className={({ isActive }) =>
                  `pb-3 -mb-px border-b-2 transition-colors ${
                    isActive ? 'text-brand-blue border-brand-blue font-semibold' : 'border-transparent hover:text-slate-900'
                  }`
                }
                end={link.to === '/'}
              >
                {link.label.toUpperCase()}
              </NavLink>
            ))}
          </nav>
        </div>

        {categoryOpen && (
          <div className="absolute left-0 right-0 top-full bg-white border-t border-slate-100 shadow-lg z-50 w-full">
            <div className="w-full flex flex-wrap items-center gap-3 px-4 sm:px-8 py-3">
              {categories.map((c) => (
                <Link
                  key={c.value}
                  to={`/products?category=${encodeURIComponent(c.value)}`}
                  onClick={() => setCategoryOpen(false)}
                  className="text-sm px-3 py-1.5 rounded border border-slate-200 hover:border-brand-blue hover:text-brand-blue transition-colors"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 w-full bg-white max-h-[calc(100vh-56px)] overflow-y-auto">
          <form onSubmit={handleSearch} className="px-4 py-3">
            <div className="flex w-full rounded-md overflow-hidden border border-slate-200 focus-within:border-brand-blue">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search laptops, brands..."
                className="flex-1 px-3 py-2.5 text-sm outline-none min-w-0"
                aria-label="Search products"
              />
              <button
                type="submit"
                className="bg-brand-blue px-4 flex items-center justify-center text-white shrink-0"
                aria-label="Search"
              >
                <FiSearch />
              </button>
            </div>
          </form>

          <nav className="flex flex-col px-4 pb-2 text-sm font-medium text-slate-700">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMenus}
                className={({ isActive }) =>
                  `py-3 border-b border-slate-100 ${isActive ? 'text-brand-blue font-semibold' : ''}`
                }
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="px-4 pb-4 pt-2">
            <p className="text-xs font-semibold tracking-wide text-slate-400 mb-2">SHOP BY CATEGORY</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link
                  key={c.value}
                  to={`/products?category=${encodeURIComponent(c.value)}`}
                  onClick={closeMenus}
                  className="text-sm px-3 py-1.5 rounded border border-slate-200 hover:border-brand-blue hover:text-brand-blue transition-colors"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
