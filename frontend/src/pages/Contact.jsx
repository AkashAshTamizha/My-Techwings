import { useEffect, useState } from 'react';
import { FiPhone, FiMail } from 'react-icons/fi';
import { Loader } from '../components/common/Loader';
import { getContactContent } from '../services/api';

// Fixed layout, matching the reference design 1:1 — every piece of text
// and the map image come from the admin-editable Contact content (see
// /admin/contact).
const fallback = {
  heroHeading: 'Any question or remarks?',
  heroSubheading: 'Just write us a message!',
  getInTouchTitle: 'Get in Touch',
  getInTouchDescription: 'Call, WhatsApp, Email, or walk in - We are Available 12 hours a day, 7 days a week. Drop us a message and we will get back to you as soon as possible.',
  phoneLabel: 'PHONE',
  phoneValue: '',
  emailLabel: 'EMAIL',
  emailValue: '',
  mapImage: {},
};

export default function Contact() {
  const [contact, setContact] = useState(fallback);

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-bgHero py-16 px-4 sm:px-6 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">{contact.heroHeading}</h1>
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mt-1">{contact.heroSubheading}</p>
      </section>

      {/* Get in Touch */}
      <section className="bg-brand-bgSoft py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">{contact.getInTouchTitle}</h2>
            <p className="text-slate-600 leading-relaxed mb-8">{contact.getInTouchDescription}</p>

            <div className="flex flex-wrap gap-10">
              <div>
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold tracking-wide mb-1">
                  <FiPhone /> {contact.phoneLabel}
                </div>
                <a href={`tel:${contact.phoneValue}`} className="text-brand-blue font-medium">
                  {contact.phoneValue}
                </a>
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold tracking-wide mb-1">
                  <FiMail /> {contact.emailLabel}
                </div>
                <a href={`mailto:${contact.emailValue}`} className="text-brand-blue font-medium">
                  {contact.emailValue}
                </a>
              </div>
            </div>
          </div>


<div className="rounded-lg overflow-hidden bg-slate-200 aspect-[4/3]">
  <iframe
    title="Our Business Location"
    src="https://maps.google.com/maps?q=Chennai%2C%20Tamil%20Nadu%2C%20India&t=&z=15&ie=UTF8&iwloc=&output=embed"
    className="w-full h-full border-0"
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    allowFullScreen
  />
</div>
        </div>
      </section>
    </div>
  );
}
