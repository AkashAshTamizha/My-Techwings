import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader } from '../components/common/Loader';
import { getAboutContent } from '../services/api';

// Fixed layout, matching the reference design 1:1 — every piece of text
// and both images come from the admin-editable About content (see
// /admin/about). Shown until that request resolves so the page never
// flashes with schema defaults it doesn't actually have yet.
const fallback = {
  heroHeading: 'Bringing over 5+ Years of Trusted experience to Chennai for the past 3+ Years.',
  storyTitle: 'Story about us',
  storyDescription: "Hipster ipsum tattooed brunch I'm baby. Pop-up belly tousled mustache chambray kinfolk jomo dsa neutra. Piz pop-up vegan meditation charcoal pork. Quinoa cray tattooed green activated skateboard listicle franzen axe. Church-key xoxo austin big af. Vexillologist polaroid haven't",
  storyImage: {url:'https://res.cloudinary.com/dxpifhzni/image/upload/v1790299448/mytechwings/content/bslcwqmhf6j51huduib7.jpg'},
  repairTitle: 'What We Repair',
  repairDescription: "Complete laptop service, under one roof. From a cracked. screen to a dead motherboard every laptop repair, upgrade and maintenance service you need.",
  repairServicesList: `Internal Board Repair | Screen Replacement | Keyboard
Replacement | SSD & RAM Upgrade | Blue Screen Fix Adapter &
DC Jack | Hinge & Panel Rework |
Physical Damage Rework | Data
Recovery | Wi-Fi & Network Fix | USB & Port Repair
Camera Issue Fix | Speaker & Audio Fix | Password Unlocking |
Linux/Windows Install |
Charging Circuit Repair and etc...`,
  repairImage: {url:'https://res.cloudinary.com/dxpifhzni/image/upload/v1790299454/mytechwings/content/zf1y5l5swdmdbgu0ghjl.jpg'},
  enquiryButtonText: 'Service Enquiry Form',
  enquiryButtonLink: '/service',
};



// Renders "Bringing over **5+** Years..." with the **wrapped** portions in
// the brand blue, mirroring the reference design's highlighted "5+" / "3+".
// function renderHighlighted(text) {
//   // Define keywords you want highlighted
//   const keywords = ["experience", "Chennai"];

//   // Regex: matches either keywords OR numbers with a plus sign (e.g. 5+, 10+, 4+)
//   const regex = new RegExp(`(${keywords.join("|")}|\\d+\\+)`, "gi");

//   // Split text into parts
//   const parts = String(text || "").split(regex);

//   return parts.map((part, i) => {
//     // Check if part is a keyword or a number+ pattern
//     const isKeyword = keywords.some(word => word.toLowerCase() === part.toLowerCase());
//     const isNumberPlus = /^\d+\+$/.test(part);

//     if (isKeyword || isNumberPlus) {
//       return (
//         <span key={i} className="text-brand-blue">
//           {part}
//         </span>
//       );
//     }
//     return <span key={i}>{part}</span>;
//   });
// }

function renderHighlighted(text) {
  const regex = /(\d+\+)/g;

  const parts = String(text || "").split(regex);

  return parts.map((part, i) => {
    const isNumberPlus = /^\d+\+$/.test(part);

    return (
      <span
        key={i}
        className={isNumberPlus ? "text-brand-blue" : ""}
      >
        {part}
      </span>
    );
  });
}



export default function About() {
  const [about, setAbout] = useState(fallback);
  const [loading, setLoading] = useState(true);





  // useEffect(() => {
  //   getAboutContent()
  //     .then((data) => setAbout({ ...fallback, ...data.about }))
  //     .catch(() => setAbout(fallback))
  //     .finally(() => setLoading(false));
  // }, []);

  // if (loading) {
  //   return (
  //     <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
  //       <Loader />
  //     </div>
  //   );
  // }

  const repairItems = about.repairServicesList
    ? about.repairServicesList.split('|').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-bgHero py-16 px-4 sm:px-6">
        <h1 className="max-w-4xl mx-auto text-center text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-snug">
          {renderHighlighted(about.heroHeading)}
        </h1>
      </section>

      {/* Story about us */}
      <section className="bg-brand-bgSoft py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">{about.storyTitle}</h2>
            <p className="text-slate-600 whitespace-pre-line leading-relaxed">{about.storyDescription}</p>
          </div>
          <div className="rounded-lg max-w-[400px] overflow-hidden bg-slate-200 aspect-[4/3]">
            {about.storyImage?.url && (
            <img
  src={about.storyImage.url}
  alt={about.storyTitle}
  className="w-full max-w-[400px] aspect-square object-cover rounded-lg"
/>
            )}
          </div>
        </div>
      </section>

      {/* What We Repair */}
      <section className="bg-brand-bgSoft pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">{about.repairTitle}</h2>
            <p className="text-slate-600 leading-relaxed">{about.repairDescription}</p>

            {repairItems.length > 0 && (
              <p className="text-slate-600 leading-relaxed mt-4">{repairItems.join(' | ')}</p>
            )}

            {about.enquiryButtonText && (
              <Link
                to={about.enquiryButtonLink || '/contact'}
                className="inline-block mt-6 bg-brand-blue text-white font-semibold px-6 py-3 rounded hover:bg-brand-blueDark"
              >
                {about.enquiryButtonText}
              </Link>
            )}
          </div>
          <div className="rounded-lg overflow-hidden max-w-[400px] bg-slate-200 aspect-[4/3]">
            {about.repairImage?.url && (
              <img src={about.repairImage.url} alt={about.repairTitle}  className="w-full max-w-[400px] aspect-square object-cover rounded-lg" />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
