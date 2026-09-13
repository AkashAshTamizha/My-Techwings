import { useEffect, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import { Loader } from '../components/common/Loader';
import { getAboutSections } from '../services/api';

// Shown until the admin adds real content via /admin/about, so the page
// never looks empty/broken out of the box.
const fallbackSections = [
  {
    _id: 'fallback',
    heading: 'About My Tech Wings',
    body:
      "My Tech Wings is Chennai's trusted destination for laptops, refurbished machines, CCTV systems, and printers. " +
      'We partner directly with leading brands to bring genuine products, competitive pricing, and dependable ' +
      'after-sales support to every customer.',
    icon: null,
  },
];

export default function About() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAboutSections()
      .then((data) => setSections(data.sections))
      .catch(() => setSections([]))
      .finally(() => setLoading(false));
  }, []);

  const items = loading ? [] : sections.length ? sections : fallbackSections;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900">About My Tech Wings</h1>

      {loading ? (
        <Loader />
      ) : (
        <div className="mt-8 space-y-10 max-w-2xl">
          {items.map((s) => {
            const Icon = s.icon && FiIcons[s.icon];
            return (
              <div key={s._id} className="flex gap-4">
                {Icon && (
                  <span className="text-brand-blue text-2xl shrink-0">
                    <Icon />
                  </span>
                )}
                <div>
                  {items.length > 1 || s.heading !== 'About My Tech Wings' ? (
                    <h2 className="text-lg font-semibold text-slate-900">{s.heading}</h2>
                  ) : null}
                  <p className="text-slate-600 mt-1 whitespace-pre-line">{s.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
