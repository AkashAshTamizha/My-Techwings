import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader } from '../components/common/Loader';
import { getServiceContent, getServiceCards } from '../services/api';

// Fixed layout, matching the reference design 1:1 — the hero, warranty
// promise and "how we work" copy come from the admin-editable Service
// content (see /admin/service), and the step cards below come from the
// admin-editable Service Cards list (see /admin/service-cards).
const fallbackContent = {
  heroHeading: '',
  heroDescription: '',
  enquiryButtonText: 'Laptop Enquiry Form',
  enquiryButtonLink: '/contact',
  warrantyTitle: 'Warranty Protection Promise:',
  warrantyDescription: '',
  warrantyImage: {},
  howWeWorkTitle: 'How We work',
  howWeWorkDescription: '',
  howWeWorkImage: {},
};

export default function Service() {
  const [content, setContent] = useState(fallbackContent);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getServiceContent(), getServiceCards()])
      .then(([contentData, cardsData]) => {
        setContent({ ...fallbackContent, ...contentData.content });
        setCards(cardsData.cards || []);
      })
      .catch(() => {
        setContent(fallbackContent);
        setCards([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-bgHero py-16 px-4 sm:px-6 text-center">
        <h1 className="max-w-3xl mx-auto text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-snug whitespace-pre-line">
          {content.heroHeading}
        </h1>
        <p className="max-w-2xl mx-auto text-slate-600 mt-4 whitespace-pre-line">{content.heroDescription}</p>
        {content.enquiryButtonText && (
          <Link
            to={content.enquiryButtonLink || '/contact'}
            className="inline-block mt-6 bg-brand-blue text-white font-semibold px-6 py-3 rounded hover:bg-brand-blueDark"
          >
            {content.enquiryButtonText}
          </Link>
        )}
      </section>

      {/* Warranty Protection Promise */}
      <section className="bg-brand-bgSoft py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-28 h-28 shrink-0 rounded overflow-hidden bg-slate-200">
            {content.warrantyImage?.url && (
              <img src={content.warrantyImage.url} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{content.warrantyTitle}</h2>
            <p className="text-slate-600 whitespace-pre-line leading-relaxed">{content.warrantyDescription}</p>
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="bg-brand-bgHero py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-10">
          {content.howWeWorkImage?.url && (
            <img
              src={content.howWeWorkImage.url}
              alt=""
              className="w-20 h-20 object-cover rounded-full mx-auto mb-4"
            />
          )}
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">{content.howWeWorkTitle}</h2>
          <p className="text-slate-600">{content.howWeWorkDescription}</p>
        </div>

        {cards.length > 0 && (
          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {cards.map((card) => (
              <div key={card._id} className="relative">
                <div className="h-52 rounded-lg overflow-hidden bg-slate-200">
                  {card.image?.url && <img src={card.image.url} alt={card.title || ''} className="w-full h-full object-cover" />}
                </div>
                <div className="bg-white rounded-md shadow-md p-4 mx-4 -mt-8 relative text-sm text-slate-700">
                  {card.title && <p className="font-semibold text-slate-900 mb-1">{card.title}</p>}
                  <p>{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}