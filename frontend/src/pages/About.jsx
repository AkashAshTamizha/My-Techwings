import { Link } from 'react-router-dom';
import storyImg from './assets/about/story-about-us.jpg';
import repairImg from './assets/about/what-we-repair.jpg';

const repairList = [
  'Internal Board Repair',
  'Screen Replacement',
  'Keyboard Replacement',
  'SSD & RAM Upgrade',
  'Blue Screen Fix Adapter & DC Jack',
  'Hinge & Panel Rework',
  'Physical Damage Rework',
  'Data Recovery',
  'Wi-Fi & Network Fix',
  'USB & Port Repair',
  'Camera Issue Fix',
  'Speaker & Audio Fix',
  'Password Unlocking',
  'Linux / Windows Install',
  'Charging Circuit Repair and etc..',
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-[#ECF2FE] px-4 sm:px-6 py-14 sm:py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-[22px] sm:text-[28px] md:text-[32px] font-bold leading-tight text-[#0B1220]">
            Bringing over <span className="text-[#0064FC]">5+</span> Years of Trusted experience to
            <br className="hidden sm:block" /> Chennai for the past <span className="text-[#0064FC]">3+</span> Years.
          </h1>
        </div>
      </section>

      {/* Story about us */}
      <section className="bg-[#F9FAFC] px-4 sm:px-6 py-14 sm:py-16">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-8 sm:gap-10 items-center">
          <div>
            <h2 className="text-[26px] sm:text-[30px] font-bold text-[#0B1220]">Story about us</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600 max-w-md">
              Jireh Byte Tech Solutions started as a small laptop repair counter in Chennai and has grown into a
              trusted, one-stop shop for laptops, refurbished machines, CCTV systems, and printers. For over 5 years
              we&apos;ve combined hands-on repair expertise with honest advice, and for the last 3+ years we&apos;ve
              brought that same care to every customer who walks through our doors here in Chennai. We partner
              directly with leading brands to bring genuine products, fair pricing, and dependable after-sales
              support — because a laptop that just works is what keeps our customers coming back.
            </p>
          </div>
          <div className="aspect-[4/3] w-full overflow-hidden rounded-sm">
            <img src={storyImg} alt="Our team at Jireh Byte" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* What We Repair */}
      <section className="bg-[#F9FAFC] px-4 sm:px-6 pb-14 sm:pb-16">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-8 sm:gap-10 items-center">
          <div>
            <h2 className="text-[26px] sm:text-[30px] font-bold text-[#0B1220]">What We Repair</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600 max-w-md">
              Complete laptop service, under one roof. From a cracked screen to a dead motherboard — every laptop
              repair, upgrade and maintenance service you need.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600 max-w-md">
              {repairList.join(' | ')}
            </p>
            <Link
              to="/contact"
              className="inline-block mt-6 rounded bg-[#0064FC] px-7 py-3 text-sm font-semibold text-white hover:bg-[#0052D4] transition-colors"
            >
              Service Enquiry Form
            </Link>
          </div>
          <div className="aspect-[4/3] w-full overflow-hidden rounded-sm">
            <img src={repairImg} alt="Laptop motherboard repair" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>
    </div>
  );
}
