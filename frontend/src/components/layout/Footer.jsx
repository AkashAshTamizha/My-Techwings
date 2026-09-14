import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiYoutube, FiMonitor, FiMapPin, FiPhone, FiMail, FiCheck } from 'react-icons/fi';
import InfoModal from '../common/InfoModal';

// Placeholder copy for Customer Service links that don't have real
// functionality/APIs behind them yet. Clicking one opens InfoModal instead
// of navigating anywhere or calling an API — purely a temporary UI.
const SERVICE_INFO = {
  track: {
    title: 'Track Your Order',
    message: "Order tracking will be available soon. We're working on this feature — thanks for your patience!",
  },
  shipping: {
    title: 'Shipping & Delivery',
    message: "Our full shipping & delivery details page is on the way. We're working on this feature.",
  },
  returns: {
    title: 'Returns & Refunds',
    message: "Our returns & refunds policy page is coming soon. We're working on this feature.",
  },
  warranty: {
    title: 'Warranty',
    message: "Warranty details will be available here shortly. We're working on this feature.",
  },
};

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function Footer() {
  const [activeInfo, setActiveInfo] = useState(null); // one of SERVICE_INFO keys | null

  return (
    <footer className="w-full bg-brand-navy text-slate-300">
      <div className="w-full px-4 sm:px-6 py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10">
        <div>
          <h3 className="text-white text-xl font-bold">Subscribe to Our Newsletter</h3>
          <p className="text-sm mt-1">Get the latest deals, new arrivals, and exclusive offers.</p>
        </div>
        <NewsletterForm />
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

        <div>
          <h4 className="text-white font-semibold mb-3">Customer Service</h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <button type="button" onClick={() => setActiveInfo('track')} className="hover:text-white text-left">
                Track Order
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setActiveInfo('shipping')} className="hover:text-white text-left">
                Shipping &amp; Delivery
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setActiveInfo('returns')} className="hover:text-white text-left">
                Returns &amp; Refunds
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setActiveInfo('warranty')} className="hover:text-white text-left">
                Warranty
              </button>
            </li>
            <li>
              <Link to="/faqs" className="hover:text-white">
                FAQs
              </Link>
            </li>
            <li>
              <Link to="/help" className="hover:text-white">
                Help Center
              </Link>
            </li>
          </ul>
        </div>

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

      {activeInfo && (
        <InfoModal
          title={SERVICE_INFO[activeInfo].title}
          message={SERVICE_INFO[activeInfo].message}
          onClose={() => setActiveInfo(null)}
        />
      )}
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

// The subscribe button previously did nothing (onSubmit just called
// preventDefault with no handler). There's no newsletter API on the backend
// yet, so this validates the email and gives real inline feedback
// (submitting / success / error) instead of silently swallowing the click.
// Swap the body of handleSubmit for a real API call once a
// POST /newsletter/subscribe endpoint exists.
function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!EMAIL_RE.test(trimmed)) {
      setStatus('error');
      setError('Enter a valid email address.');
      return;
    }

    setStatus('submitting');
    setError('');
    try {
      // TODO: replace with a real call once a newsletter endpoint exists,
      // e.g. await subscribeToNewsletter({ email: trimmed });
      await new Promise((resolve) => setTimeout(resolve, 600));
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setError('Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 w-full lg:w-auto max-w-md bg-white/10 text-white rounded px-4 py-2.5 text-sm">
        <FiCheck className="text-brand-blue shrink-0" />
        <span>Thanks for subscribing! Watch your inbox for our latest deals.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full lg:w-auto max-w-md">
      <div className="flex w-full rounded overflow-hidden">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          placeholder="Enter your email address"
          aria-label="Email address"
          aria-invalid={status === 'error'}
          className="flex-1 px-4 py-2.5 text-slate-900 text-sm outline-none min-w-0"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="bg-brand-blue text-white text-sm font-semibold px-5 shrink-0 hover:bg-brand-blueDark transition disabled:opacity-60"
        >
          {status === 'submitting' ? 'SUBSCRIBING…' : 'SUBSCRIBE'}
        </button>
      </div>
      {status === 'error' && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
    </form>
  );
}
