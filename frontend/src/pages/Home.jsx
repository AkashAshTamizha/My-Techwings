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
import { getProducts } from '../services/api';
import { SiApple, SiAcer, SiSamsung, SiHp, SiLenovo, SiDell } from 'react-icons/si';

const CATEGORY_META = [
  { key: 'Ultrabook', label: 'Ultrabooks', sub: 'Lightweight & Thin', img: 'https://res.cloudinary.com/dwaebmmgq/image/upload/v1789003829/ChatGPT_Image_Sep_10_2026_06_58_02_AM_s8jufc.png' },
  { key: 'Gaming', label: 'Gaming Laptops', sub: 'High Performance', img: 'https://res.cloudinary.com/dwaebmmgq/image/upload/v1789003827/ChatGPT_Image_Sep_10_2026_06_59_43_AM_cyswdx.png' },
  { key: 'Business', label: 'Business Laptops', sub: 'Power & Productivity', img: 'https://images.pexels.com/photos/6893890/pexels-photo-6893890.jpeg' },
  { key: 'Refurbished', label: 'Refurbished Laptops', sub: 'Certified Quality', img: 'https://images.pexels.com/photos/7190957/pexels-photo-7190957.jpeg' },
  { key: 'CCTV', label: 'Smart CCTV', sub: 'IoT Security', img: 'https://images.pexels.com/photos/5966513/pexels-photo-5966513.jpeg' },
  { key: 'Printer', label: 'Printers', sub: 'Home & Office', img: 'https://images.pexels.com/photos/11833899/pexels-photo-11833899.jpeg' },
];

export default function Home() {
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const categoryScrollRef = useRef(null);

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

  return (
    <>
      {/* Hero */}
      <section className="w-full bg-brand-bgHero">
        <div className="w-full px-4 sm:px-6 py-12 lg:py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900">
              Powerful Laptops.
              <br />
              <span className="text-brand-blue">Limitless</span>
              <br />
              <span className="text-brand-blue">Possibilities.</span>
            </h1>
            <p className="mt-5 text-slate-600 max-w-md">
              Are you looking for the best Laptop store in Chennai? If yes, then you&apos;re in the right place. We offer
              the best deals for Laptops in Chennai with exciting offers &amp; benefits.
            </p>
            <Link
              to="/products"
              className="inline-block mt-6 bg-brand-blue text-white font-semibold px-6 py-3 rounded hover:bg-brand-blueDark transition"
            >
              Shop Now →
            </Link>
          </div>
          <div className="rounded-lg overflow-hidden shadow-xl bg-gradient-to-br from-slate-100 to-slate-200 h-72 sm:h-80 lg:h-96">
            <img
              src="https://res.cloudinary.com/dwaebmmgq/image/upload/v1789003159/ChatGPT_Image_Sep_10_2026_06_46_37_AM_s08gic.png"
              onError={(e) => (e.currentTarget.style.display = 'none')}
              alt="Laptops on a desk"
              className="w-full h-full object-cover"
            />
          </div>
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
            {CATEGORY_META.map((c) => (
              <Link
                key={c.key}
                to={`/products?category=${c.key}`}
                className="group bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-brand-blue hover:shadow-md transition"
              >
                <div className="h-[150px] w-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                  <img
                    src={c.img}
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                    alt={c.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-3 text-center">
                  <p className="font-semibold text-sm text-slate-900">{c.label}</p>
                  <p className="text-xs text-slate-400">{c.sub}</p>
                </div>
              </Link>
            ))}
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
              <div className="bg-brand-navy rounded-2xl p-8 sm:p-10 lg:p-12 grid lg:grid-cols-2 gap-10 items-center overflow-hidden">
                <div >
                  <p className="text-brand-blue text-xs font-semibold tracking-widest">LIMITED TIME OFFER</p>
                  <h3 className="text-white text-3xl sm:text-4xl font-extrabold mt-2 leading-tight">
                    Best Deals on
                    <br />
                    Top <span className="text-brand-blue">Brands</span>
                  </h3>
                  <p className="text-slate-400 mt-3 max-w-sm">Grab exciting offers on premium laptops from leading brands.</p>
                  <Link
                    to="/products"
                    className="inline-block mt-5 bg-brand-blue text-white font-semibold px-5 py-2.5 rounded hover:bg-brand-blueDark transition"
                  >
                    View All Deals →
                  </Link>
                </div>
      
      <div className="w-full flex flex-col gap-y-2 sm:gap-y-2">
      
        {/* ================= TOP ROW ================= */}
        <div
          className="
            w-full
            grid
            grid-cols-[40%_15%_15%_15%_15%]
            items-center
          "
        >
          {/* Empty - 35% */}
          <div />
      
          {/* Apple - 15% */}
          <div
            title="Apple"
            className="w-full flex items-center justify-center"
          >
            <SiApple className="text-white text-4xl sm:text-6xl" />
          </div>
      
          {/* Acer - 20% */}
          <div
            title="Acer"
            className="w-full flex items-center justify-center"
          >
            <SiAcer className="text-[#83b81a] text-3xl sm:text-8xl" />
          </div>
      
          {/* Samsung - 25% */}
          <div
            title="Samsung"
            className="w-full flex items-center justify-center"
          >
            <div
              className="
    relative
    flex items-center justify-center
    w-[100px] h-[18px]
    sm:w-[150px] sm:h-[42px]
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
                  w-[62%]
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
          "
        >
           {/* Empty - 30% */}
          <div />
         {/* HP - 15% */}
          <div
            title="HP"
            className="w-full flex items-center justify-center"
          >
            <SiHp className="text-[#0096d6] text-4xl sm:text-6xl" />
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
            <SiDell className="text-[#0096d6] text-5xl sm:text-7xl" />
          </div>
      
          {/* Empty - 15% */}
          <div />
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