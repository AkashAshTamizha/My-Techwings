import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiTruck,
  FiRotateCcw,
  FiLock,
  FiTag,
  FiHeadphones,
  FiRepeat,
  FiShield,
  FiChevronRight,
} from 'react-icons/fi';
import { FaApple } from 'react-icons/fa';
import ProductGrid from '../components/product/ProductGrid';
import HeroSlider from '../components/home/HeroSlider';
import useCategoryAvailability from '../hooks/useCategoryAvailability';
import { getProducts, getSliders } from '../services/api';
import { SiApple, SiAcer, SiSamsung, SiHp, SiLenovo, SiDell, SiToshiba } from 'react-icons/si';

const CATEGORY_META = [
  { key: 'Ultrabook', label: 'Ultrabooks', sub: 'Lightweight & Thin', img: 'https://res.cloudinary.com/dwaebmmgq/image/upload/v1789003829/ChatGPT_Image_Sep_10_2026_06_58_02_AM_s8jufc.png' },
  { key: 'Gaming', label: 'Gaming Laptops', sub: 'High Performance', img: 'https://res.cloudinary.com/dwaebmmgq/image/upload/v1789003827/ChatGPT_Image_Sep_10_2026_06_59_43_AM_cyswdx.png' },
  { key: 'Business', label: 'Business Laptops', sub: 'Power & Productivity', img: 'https://images.pexels.com/photos/6893890/pexels-photo-6893890.jpeg' },
  { key: 'Refurbished', label: 'Refurbished Laptops', sub: 'Certified Quality', img: 'https://images.pexels.com/photos/7190957/pexels-photo-7190957.jpeg' },
  { key: 'CCTV', label: 'Smart CCTV', sub: 'IoT Security', img: 'https://images.pexels.com/photos/5966513/pexels-photo-5966513.jpeg' },
  { key: 'Printer', label: 'Printers', sub: 'Home & Office', img: 'https://images.pexels.com/photos/11833899/pexels-photo-11833899.jpeg' },
];

// Maps a Slider document from the API into the shape HeroSlider expects
// (heading as an array of line strings + a separate list of which line
// indices should be highlighted), so the admin-managed content drives the
// exact same markup the old hardcoded heroSlides.js used to.
function toHeroSlide(slide) {
  return {
    eyebrow: slide.eyebrow || undefined,
    heading: slide.heading.map((line) => line.text),
    highlightLines: slide.heading.reduce((acc, line, i) => (line.highlighted ? [...acc, i] : acc), []),
    description: slide.description,
    ctaLabel: slide.ctaLabel || undefined,
    ctaTo: slide.ctaTo || undefined,
    image: slide.image?.url,
    alt: slide.alt,
  };
}

export default function Home() {
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState([]);
  const categoryScrollRef = useRef(null);
  const { isAvailable } = useCategoryAvailability();

  const scrollCategories = () => {
    const el = categoryScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: 240, behavior: 'smooth' });
  };

  useEffect(() => {
    getProducts({ sort: 'recommended', limit: 5 })
      .then((data) => setPopular(data.items))
      .finally(() => setLoading(false));
  }, []);

  // Slides are fetched fresh on every Home mount (no client cache) so an
  // admin update in Slider Management shows up immediately on next visit.
  useEffect(() => {
    getSliders()
      .then((data) => setSlides((data.slides || []).map(toHeroSlide)))
      .catch(() => setSlides([]));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="w-full bg-brand-bgHero">
        <div className="w-full px-4 sm:px-6 py-12 lg:py-16">
          {slides.length > 0 && <HeroSlider slides={slides} />}
        </div>

        <div className="w-full border-t border-white/40 bg-brand-bgHero">
          <div className="w-full px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <TrustBadge icon={<FiTag />} title="100%" sub="Authentic Products" />
            <TrustBadge icon={<FiTruck />} title="Free Shipping" sub="On orders over Rs.10,000" />
            <TrustBadge icon={<FiRotateCcw />} title="Easy Returns" sub="30-Day Return" />
            <TrustBadge icon={<FiLock />} title="Secure Payment" sub="100% Safe & Secure" />
          </div>
        </div>
      </section>

      {/* Shop by category */}
      <section className="w-full px-4 sm:px-6 py-14">
        <h2 className="text-center text-2xl font-bold text-slate-900">Shop By Category</h2>
        <div className="mx-auto mt-2 mb-8 h-1 w-16 bg-brand-blue rounded" />
        <div className="relative">
          <div
            ref={categoryScrollRef}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:overflow-visible overflow-x-auto scroll-smooth"
          >
            {CATEGORY_META.map((c) => {
              const available = isAvailable(c.key);
              return (
                <Link
                  key={c.key}
                  to={available ? `/products?category=${c.key}` : `/coming-soon/${c.key}`}
                  className={`group relative bg-white border border-slate-200 rounded-lg overflow-hidden transition ${
                    available ? 'hover:border-brand-blue hover:shadow-md' : ''
                  }`}
                >
                  <div className="h-[150px] w-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    <img
                      src={c.img}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                      alt={c.label}
                      className={`w-full h-full object-cover transition-transform ${
                        available ? 'group-hover:scale-105' : 'scale-105 blur-[1.5px] brightness-90'
                      }`}
                    />
                  </div>
                  <div className="p-3 text-center">
                    <p className="font-semibold text-sm text-slate-900">{c.label}</p>
                    <p className="text-xs text-slate-400">{c.sub}</p>
                  </div>

                  {!available && (
                    <>
                      <div className="absolute inset-0 bg-white/40" aria-hidden="true" />
                      <span className="absolute top-2 right-2 bg-brand-navy text-white text-[10px] font-bold tracking-wider px-2 py-1 rounded">
                        COMING SOON
                      </span>
                    </>
                  )}
                </Link>
              );
            })}
          </div>
          <button
            type="button"
            onClick={scrollCategories}
            aria-label="Show more categories"
            className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 h-9 w-9 rounded-full bg-white border border-slate-200 shadow items-center justify-center text-slate-600 hover:text-brand-blue hover:border-brand-blue z-10"
          >
            <FiChevronRight />
          </button>
        </div>
      </section>

        {/* Brands banner */}
   <section className="w-full px-4 sm:px-6 pb-14">
              <div className="bg-brand-navy rounded-2xl p-8 sm:p-10 lg:p-12 grid lg:grid-cols-2 items-center overflow-hidden">
                <div >
                  <p className="text-brand-blue text-xs font-semibold tracking-widest">LIMITED TIME OFFER</p>
                  <h3 className="text-white text-3xl sm:text-4xl font-extrabold mt-2 leading-tight">
                    Best Deals on
                    <br />
                    Top <span className="text-brand-blue">Brands</span>
                  </h3>
                  <p className="text-slate-400 mt-3 max-w-sm">Grab exciting offers on premium laptops from leading brands.</p>
                  <Link
                    to="/products?onSale=true&sort=price_asc"
                    className="inline-block mt-5 bg-brand-blue text-white font-semibold px-5 py-2.5 rounded hover:bg-brand-blueDark transition"
                  >
                    View All Deals →
                  </Link>
                </div>
      
      <div className="w-full flex flex-col gap-y-0">
      
        {/* ================= TOP ROW ================= */}
        <div
          className="
            w-full
            grid
            grid-cols-[39%_14%_16%_16%_16%]
            items-center
             h-21 sm:h-13
          "
        >
          {/* Empty - 35% */}
          <div />
      
          {/* Apple - 15% */}
          <div
            title="Apple"
            className="w-full flex items-center justify-center"
          >
            <SiApple className="text-white text-4xl sm:text-8xl" />
          </div>
      
          {/* Acer - 20% */}
          <div
            title="Acer"
            className="w-full flex items-center justify-center"
          >
            <SiAcer className="text-[#83b81a] text-3xl sm:text-9xl" />
          </div>
      
          {/* Samsung - 25% */}
          <div
            title="Samsung"
            className="w-full flex items-button justify-button"
          >
            <div
              className="
    relative
    flex items-center justify-center
    w-[100px] h-[18px]
    sm:w-[159px] sm:h-[52px]
    rounded-[50%]
    bg-[#1074C4]
    -rotate-[6deg]
    shadow-md
  "
            >
              <SiSamsung
                className="
                  relative
                  z-10
                  block
                  w-[78%]
                  h-auto
                  rotate-[6deg]
                "
                style={{ color: "#ffffff" }}
              />
            </div>
          </div>
       {/* Samsung - 5% */}
          <div />
        </div>
      
      
        {/* ================= BOTTOM ROW ================= */}
        <div
          className="
            w-full
            grid
            grid-cols-[35%_15%_15%_15%_20%]
            items-center
            h-25 sm:h-25
          "
        >
           {/* Empty - 30% */}
          <div />
         {/* HP - 15% */}
          <div
            title="HP"
            className="w-full flex items-center justify-center"
          >
            <SiHp className="text-[#0096d6] text-4xl sm:text-8xl" />
          </div>
      
          {/* Lenovo - 25% */}
          <div
            title="Lenovo"
            className="w-full flex items-center justify-center"
          >
            <SiLenovo className="text-[#e2231a] text-4xl sm:text-9xl" />
          </div>
      
          {/* Dell - 15% */}
          <div
            title="Dell"
            className="w-full flex items-center justify-center"
          >
            <SiDell className="text-[#0096d6] text-5xl sm:text-8xl" />
          </div>
      
          {/* Empty - 15% */}
          <div   title="Toshiba"
            className="w-full flex items-center justify-center" >

                   <div
              className="
    relative
    flex items-center justify-center
    w-[100px] h-[18px]
    sm:w-[150px] sm:h-[52px]
    rounded-[5%]
     bg-[#e2231a]
   
    shadow-md
  "
            >
          <SiToshiba className="text-[#ffffff] text-5xl sm:text-8xl" />
          </div>
          </div>
        </div>
      
      </div>
      
      
      
              </div>
            </section>

      {/* Popular laptops */}
      <section className="w-full px-4 sm:px-6 pb-14">
        <div className="w-full flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Popular Laptops</h2>
          <Link to="/products" className="text-brand-blue text-sm font-semibold">
            View All Products →
          </Link>
        </div>
        <ProductGrid products={popular} loading={loading} columns="sm:grid-cols-3 lg:grid-cols-5" />
      </section>

      {/* Why choose us */}
      <section className="bg-brand-bgSoft py-14">
        <div className="w-full px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900 mb-10">Why Choose My Tech Wings?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <WhyItem icon={<FiTag />} title="Best Price Guarantee" desc="We offer the best prices on top brands." />
            <WhyItem icon={<FiHeadphones />} title="Expert Support" desc="Get help from our product specialists anytime." />
            <WhyItem icon={<FiRepeat />} title="Hassle-Free Returns" desc="30-day easy returns for peace of mind." />
            <WhyItem icon={<FiShield />} title="Extended Warranty" desc="Premium protection for your laptop." />
          </div>
        </div>
      </section>
    </>
  );
}

function TrustBadge({ icon, title, sub }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-brand-blue text-xl">{icon}</span>
      <div>
        <p className="font-semibold text-sm text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{sub}</p>
      </div>
    </div>
  );
}

function WhyItem({ icon, title, desc }) {
  return (
    <div className="flex gap-3">
      <span className="text-brand-blue text-xl mt-0.5">{icon}</span>
      <div>
        <p className="font-semibold text-sm text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-1">{desc}</p>
      </div>
    </div>
  );
}






