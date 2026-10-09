import { Link } from 'react-router-dom';
import warrantyBadge from './assets/service/warranty-badge.jpg';
import inspectionImg from './assets/service/inspection.jpg';
import approvalImg from './assets/service/approval.jpg';
import repairImg from './assets/service/repair.jpg';
import testingImg from './assets/service/testing.jpg';
import pickupImg from './assets/service/pickup.jpg';

const steps = [
  {
    image: 'https://res.cloudinary.com/dxpifhzni/image/upload/v1790529225/mytechwings/content/yqamwgdepw3nvwhfvebk.png',
    caption:
      "Every device gets a thorough inspection before anything else. We tell you exactly what's wrong and what it will take to fix it — before a single screw is turned.",
  },
  {
    image: 'https://res.cloudinary.com/dxpifhzni/image/upload/v1790529026/mytechwings/content/cq09gpb60lqbrhfswdje.png',
    caption:
      "We only proceed once you've reviewed the estimate and given us the green light. Your device, your decision.",
  },
  {
    image: 'https://res.cloudinary.com/dxpifhzni/image/upload/v1790529413/mytechwings/content/r6c9jftqrymxhjdhnonl.png',
    caption:
      'Work begins the moment you say yes. We keep things moving and make sure your repair stays on track from start to finish.',
  },
];

const finalSteps = [
  {
    image: 'https://res.cloudinary.com/dxpifhzni/image/upload/v1790529601/mytechwings/content/xyok7gxvhg2pgw32dmdm.png',
    title: 'Quality Testing',
    caption: 'All components tested and verified to be working properly',
  },
  {
    image: 'https://res.cloudinary.com/dxpifhzni/image/upload/v1791486061/ChatGPT_Image_Sep_27_2026_09_51_22_PM_1_pnq9lc.png',
    caption:
      'Same-day or next-day pickup for most common issues. Tested, verified, and ready to perform — just the way it should have been all along.',
  },
];

function StepCard({ image, title, caption }) {
  return (
    <div className="relative">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-sm bg-slate-200">
        <img src={image} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="relative -mt-16 mx-4 rounded bg-[#F6F7FB] px-5 py-4 shadow-md">
        {title && <p className="font-semibold text-slate-800 text-center">{title}</p>}
        <p className="text-[15px] leading-relaxed text-slate-600 text-center">{caption}</p>
      </div>
    </div>
  );
}

export default function Service() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-[#ECF2FE] px-4 sm:px-6 py-14 sm:py-16 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-[22px] sm:text-[28px] md:text-[32px] font-bold leading-tight text-[#0B1220]">
            Your Laptop Deserves Better Than a Guess.
            <br />
            Slow laptop? Cracked screen?
            <br />
            Battery draining fast? Whatever the issue
          </h1>
          <div className="mt-5 space-y-1 text-[15px] text-slate-600 max-w-2xl mx-auto">
            <p>we take a good look first, explain what&apos;s needed, and fix it carefully.</p>
            <p>Jireh Byte Tech Solutions is Chennai&apos;s dedicated laptop service center in Chennai.</p>
            <p>Drop it off and walk out with a laptop that works. We work on every major brand — no exceptions</p>
          </div>
          <Link
            to="/products"
            className="inline-block mt-7 rounded bg-[#0064FC] px-7 py-3 text-sm font-semibold text-white hover:bg-[#0052D4] transition-colors"
          >
            Laptop Enquiry Form
          </Link>
        </div>
      </section>

      {/* Warranty Protection Promise */}
      <section className="bg-[#F9FAFC] px-4 sm:px-6 py-14 sm:py-16">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
          <img
            src='https://res.cloudinary.com/dwaebmmgq/image/upload/v1790264371/warranty-badge_qwzzzu.jpg'
            alt="Warranty protection badge"
            className="w-28 h-32 sm:w-32 sm:h-36 object-cover rounded-sm shrink-0"
          />
          <div className="text-center sm:text-left">
            <h2 className="text-[24px] sm:text-[28px] font-bold text-[#0B1220]">Warranty Protection Promise:</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600 max-w-xl">
              We never open laptops still under brand warranty. Out-of-warranty devices are assessed transparently —
              and serviced only with your go-ahead. Most common repairs resolved same-day or next-day — subject to
              part availability.
            </p>
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="bg-[#ECF2FE] px-4 sm:px-6 py-14 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center">
            <h2 className="text-[26px] sm:text-[30px] font-bold text-[#0B1220]">How We work</h2>
            <p className="mt-3 text-[15px] text-slate-600 max-w-2xl mx-auto">
              We assess first, then quote — so you know exactly what you&apos;re paying for and why, before any work
              begins.
            </p>
          </div>

          <div className="mt-10 grid sm:grid-cols-3 gap-5 sm:gap-4">
            {steps.map((step, i) => (
              <StepCard key={i} {...step} />
            ))}
          </div>

          <div className="mt-16 sm:mt-24 grid sm:grid-cols-2 gap-16 sm:gap-24 max-w-2xl mx-auto">
            {finalSteps.map((step, i) => (
              <StepCard key={i} {...step} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
