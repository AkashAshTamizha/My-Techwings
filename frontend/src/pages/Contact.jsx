import { useEffect, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import { Loader } from '../components/common/Loader';
import { getContactInfo } from '../services/api';

// Shown until the admin adds real entries via /admin/contact, so the page
// never looks empty/broken out of the box.
const fallbackItems = [
  { _id: 'addr', type: 'address', icon: 'FiMapPin', value: 'Chennai, Tamil Nadu', link: null },
  {
    _id: 'phone',
    type: 'whatsapp',
    icon: 'FiPhone',
    value: import.meta.env.VITE_WHATSAPP_DISPLAY || '+91 94457 54129',
    link: null,
  },
  { _id: 'email', type: 'email', icon: 'FiMail', value: 'support@jirehbyte.com', link: 'mailto:support@jirehbyte.com' },
];

const defaultIcon = { address: 'FiMapPin', phone: 'FiPhone', whatsapp: 'FiPhone', email: 'FiMail', hours: 'FiClock', social: 'FiShare2', other: 'FiInfo' };

function ContactRow({ item }) {
  const [copied, setCopied] = useState(false);
  const Icon = FiIcons[item.icon] || FiIcons[defaultIcon[item.type]] || FiIcons.FiInfo;

  const content = item.link ? (
    <a href={item.link} target={item.link.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="underline decoration-dotted">
      {item.value}
    </a>
  ) : item.type === 'whatsapp' || item.type === 'phone' ? (
    <button
      className="underline decoration-dotted"
      onClick={() => {
        navigator.clipboard?.writeText(item.value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {item.value}
    </button>
  ) : (
    <span>{item.value}</span>
  );

  return (
    <p className="flex items-center gap-2">
      <Icon className="shrink-0" /> {content} {copied && <span className="text-xs text-brand-blue">Copied!</span>}
    </p>
  );
}

export default function Contact() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContactInfo()
      .then((data) => setItems(data.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const rows = loading ? [] : items.length ? items : fallbackItems;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900">Contact Us</h1>
      <p className="text-slate-600 mt-4 max-w-xl">
        For product enquiries, open any product page and tap &quot;Need This Laptop&quot; — it opens WhatsApp with your
        details pre-filled. For everything else, reach us directly:
      </p>

      {loading ? (
        <Loader />
      ) : (
        <div className="mt-6 space-y-2 text-slate-700">
          {rows.map((item) => (
            <ContactRow key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
