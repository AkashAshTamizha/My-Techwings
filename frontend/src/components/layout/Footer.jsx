import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiYoutube, FiMonitor, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="w-full bg-brand-navy text-slate-300">
      <div className="w-full px-4 sm:px-6 py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10">
        <div>
          <h3 className="text-white text-xl font-bold">Subscribe to Our Newsletter</h3>
          <p className="text-sm mt-1">Get the latest deals, new arrivals, and exclusive offers.</p>
        </div>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex w-full lg:w-auto max-w-md rounded overflow-hidden"
        >
          <input
            type="email"
            required
            placeholder="Enter your email address"
            className="flex-1 px-4 py-2.5 text-slate-900 text-sm outline-none"
          />
          <button type="submit" className="bg-brand-blue text-white text-sm font-semibold px-5">
            SUBSCRIBE
          </button>
        </form>
      </div>

      <div className="w-full px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
            <FiMonitor /> Jireh Byte
          </div>
          <p className="text-slate-400 max-w-xs">
            Your one-stop destination for premium laptops and accessories. Quality, trust, and performance guaranteed.
          </p>
          <div className="flex gap-3 mt-4 text-lg">
            <FiFacebook /> <FiInstagram /> <FiYoutube />
          </div>
        </div>

        <FooterColumn
          title="Quick Links"
          items={[
            ['Home', '/'],
            ['Products', '/products'],
            ['Service', '/service'],
            ['About Us', '/about'],
            ['Contact Us', '/contact'],
          ]}
        />
        <FooterColumn
          title="Customer Service"
          items={[
            ['Track Order', '/track-order'],
            ['Shipping & Delivery', '/shipping'],
            ['Returns & Refunds', '/returns'],
            ['Warranty', '/warranty'],
            ['FAQs', '/faqs'],
            ['Help Center', '/help'],
          ]}
        />
        <FooterColumn
          title="Shop By Category"
          items={[
            ['New Laptops', '/products?category=New'],
            ['Refurbished Laptops', '/products?category=Refurbished'],
            ['CCTV devices', '/products?category=CCTV'],
            ['Printers', '/products?category=Printer'],
          ]}
        />
        <div>
          <h4 className="text-white font-semibold mb-3">Contact Us</h4>
          <ul className="space-y-2 text-slate-400">
            <li className="flex items-center gap-2"><FiMapPin /> Chennai, Tamil Nadu</li>
            <li className="flex items-center gap-2"><FiPhone /> +91 94457 54129</li>
            <li className="flex items-center gap-2"><FiMail /> support@jirehbyte.com</li>
          </ul>
        </div>
      </div>

      <div className="w-full border-t border-white/10 py-4 px-4 sm:px-6 flex flex-col items-center gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>WE ACCEPT</span>
          <span className="bg-white text-blue-800 font-bold text-[10px] px-2 py-0.5 rounded">VISA</span>
          <span className="bg-white text-red-600 font-bold text-[10px] px-2 py-0.5 rounded">MC</span>
          <span className="bg-white text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded">Amex</span>
        </div>
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Jireh Byte. All Rights Reserved.</span>
          <div className="flex gap-4">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }) {
  return (
    <div>
      <h4 className="text-white font-semibold mb-3">{title}</h4>
      <ul className="space-y-2 text-slate-400">
        {items.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
