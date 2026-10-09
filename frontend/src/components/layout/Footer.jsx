import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiFacebook,
  FiInstagram,
  FiYoutube,
  FiMonitor,
  FiMapPin,
  FiPhone,
  FiMail,
} from 'react-icons/fi';

import InfoModal from '../common/InfoModal';
import { getContactContent } from '../../services/api';
import { Loader } from '../common/Loader';

// Replace this with your actual WhatsApp group invitation link.
const WHATSAPP_GROUP_LINK =
  'https://chat.whatsapp.com/YOUR_GROUP_INVITE_CODE';

// Indian mobile number validation.
// Accepts 10-digit numbers and numbers prefixed with +91 or 91.
const isValidIndianPhone = (value) => {
  const digits = value.replace(/\D/g, '');

  const mobile =
    digits.length === 12 && digits.startsWith('91')
      ? digits.slice(2)
      : digits;

  return /^[6-9]\d{9}$/.test(mobile);
};

const SERVICE_INFO = {
  shipping: {
    title: 'Delivery',
    message:
      "Our full delivery details page is on the way. We're working on this feature.",
  },

  returns: {
    title: 'Returns & Refunds',
    message:
      "Our returns & refunds policy page is coming soon. We're working on this feature.",
  },

  warranty: {
    title: 'Warranty',
    message:
      "Warranty details will be available here shortly. We're working on this feature.",
  },

  refurbishedunit: {
    title: 'Refurbished Unit',
    message: [
      'Inside and outlook of the Refurbished Units: Slight scratches may be visible on the body of the unit.',
      'Testing Warranty: 1 month and Service Guarantee: 12 months Limited India Repair Service Warranty.',
      'All refurbished units are functional and are Quality Checked and Tested.',
      'Unit cannot be processed for DOA, replaced with a New Unit, provided with Cosmetic Changes, or supplied with a new packing box. Unit will be sold as is.',
      'Special Promo Offers and Warranty Extension Packages are not applicable for Refurbished Units.',
      'Warranty Extension Service is not applicable on these products.',
    ],
  },
};

const fallback = {
  heroHeading: 'Any question or remarks?',
  heroSubheading: 'Just write us a message!',
  getInTouchTitle: 'Get in Touch',
  getInTouchDescription: '',
  phoneLabel: 'PHONE',
  phoneValue: '',
  emailLabel: 'EMAIL',
  emailValue: '',
  mapImage: {},
};

export default function Footer() {
  const [activeInfo, setActiveInfo] = useState(null);
  const [contact, setContact] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getContactContent()
      .then((data) => {
        if (mounted) {
          setContact({
            ...fallback,
            ...(data?.contact || {}),
          });
        }
      })
      .catch(() => {
        if (mounted) {
          setContact(fallback);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <Loader />
      </div>
    );
  }

  return (
    <footer className="w-full bg-brand-navy text-slate-300">
      {/* WhatsApp group subscription */}
      <div className="w-full px-4 sm:px-6 py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10">
        <div>
          <h3 className="text-white text-xl font-bold">
            To subscribe or join a WhatsApp group or channel
          </h3>

          <p className="text-sm mt-1">
            Enter your mobile number and join us for the latest deals,
            new arrivals, and exclusive offers.
          </p>
        </div>

        <NewsletterForm />
      </div>

      {/* Footer content */}
      <div className="w-full px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
            <FiMonitor />
            My Tech Wings
          </div>

          <p className="text-slate-400 max-w-xs">
            Your one-stop destination for premium laptops and accessories.
            Quality, trust, and performance guaranteed.
          </p>

          <div className="flex gap-3 mt-4 text-lg">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-white"
            >
              <FiFacebook />
            </a>

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-white"
            >
              <FiInstagram />
            </a>

            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="hover:text-white"
            >
              <FiYoutube />
            </a>
          </div>
        </div>

        {/* Quick links */}
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

        {/* Customer service */}
        <div>
          <h4 className="text-white font-semibold mb-3">
            Customer Service
          </h4>

          <ul className="space-y-2 text-slate-400">
            <li>
              <button
                type="button"
                onClick={() => setActiveInfo('shipping')}
                className="hover:text-white text-left"
              >
                Delivery
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => setActiveInfo('returns')}
                className="hover:text-white text-left"
              >
                Returns &amp; Refunds
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => setActiveInfo('warranty')}
                className="hover:text-white text-left"
              >
                Warranty
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => setActiveInfo('refurbishedunit')}
                className="hover:text-white text-left"
              >
                Refurbished Unit
              </button>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <FooterColumn
          title="Shop By Category"
          items={[
            ['Refurbished Laptops', '/products?category=Refurbished'],
            ['CCTV devices', '/products?category=CCTV'],
            ['Printers', '/products?category=Printer'],
          ]}
        />

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-3">
            Contact Us
          </h4>

          <ul className="space-y-2 text-slate-400">
            <li className="flex items-center gap-2">
              <FiMapPin className="shrink-0" />
              Chennai, Tamil Nadu
            </li>

            <li className="flex items-center gap-2">
              <FiPhone className="shrink-0" />
              <span>{contact.phoneValue || 'Contact us for details'}</span>
            </li>

            <li className="flex items-center gap-2">
              <FiMail className="shrink-0" />
              <span>support@jirehbyte.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Payment methods and legal links */}
      <div className="w-full border-t border-white/10 py-4 px-4 sm:px-6 flex flex-col items-center gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>WE ACCEPT</span>

          <span className="bg-white text-blue-800 font-bold text-[10px] px-2 py-0.5 rounded">
            VISA
          </span>

          <span className="bg-white text-red-600 font-bold text-[10px] px-2 py-0.5 rounded">
            MC
          </span>

          <span className="bg-white text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded">
            Amex
          </span>
        </div>

        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} My Tech Wings. All Rights Reserved.
          </span>

          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>

            <Link to="/terms" className="hover:text-white">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>

      {/* Information modal */}
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

function NewsletterForm() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedPhone = phone.trim();

    if (!trimmedPhone) {
      setError('Please enter your phone number.');
      return;
    }

    if (!isValidIndianPhone(trimmedPhone)) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (
      !WHATSAPP_GROUP_LINK.includes('chat.whatsapp.com/') ||
      WHATSAPP_GROUP_LINK.includes('YOUR_GROUP_INVITE_CODE')
    ) {
      setError('WhatsApp group link is not configured yet.');
      return;
    }

    setError('');

    // The visitor must confirm joining inside WhatsApp.
    window.open(
      WHATSAPP_GROUP_LINK,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full lg:w-auto max-w-md"
    >
      <div className="flex w-full rounded overflow-hidden">
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={phone}
          onChange={(e) => {
            const value = e.target.value;

            // Allow digits, spaces, parentheses, hyphens and a leading +.
            if (/^\+?[\d\s()-]*$/.test(value)) {
              setPhone(value);
              setError('');
            }
          }}
          placeholder="Enter your phone number"
          aria-label="Phone number"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'whatsapp-phone-error' : undefined}
          className="flex-1 px-4 py-2.5 text-slate-900 text-sm outline-none min-w-0"
        />

        <button
          type="submit"
          className="bg-brand-blue text-white text-sm font-semibold px-5 shrink-0 hover:bg-brand-blueDark transition"
        >
          SUBSCRIBE
        </button>
      </div>

      {error && (
        <p
          id="whatsapp-phone-error"
          className="text-xs text-red-400 mt-1.5"
          role="alert"
        >
          {error}
        </p>
      )}
    </form>
  );
}