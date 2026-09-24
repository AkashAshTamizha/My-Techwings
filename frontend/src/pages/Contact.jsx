import { FiPhone, FiMail } from 'react-icons/fi';

const PHONE_DISPLAY = '+91 94457 54129';
const PHONE_TEL = '+919445754129';
const EMAIL = 'support@jirehbyte.com';
const MAP_QUERY = 'Chennai, Tamil Nadu, India';

export default function Contact() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-[#ECF2FE] px-4 sm:px-6 py-14 sm:py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-[22px] sm:text-[28px] md:text-[32px] font-bold leading-tight text-[#0B1220]">
            Any question or remarks?
            <br />
            Just write us a message!
          </h1>
        </div>
      </section>

      {/* Get in Touch */}
      <section className="bg-[#F9FAFC] px-4 sm:px-6 py-14 sm:py-16">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-8 sm:gap-10 items-center">
          <div>
            <h2 className="text-[26px] sm:text-[30px] font-bold text-[#0B1220]">Get in Touch</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600 max-w-md">
              Call, WhatsApp, Email, or walk in — We are Available 12 hours a day, 7 days a week. Drop us a message
              and we will get back to you as soon as possible.
            </p>

            <div className="mt-7 flex flex-wrap gap-x-10 gap-y-5">
              <div className="flex items-center gap-3">
                <span className="text-slate-700 text-xl shrink-0">
                  <FiPhone />
                </span>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-slate-500">PHONE</p>
                  <a href={`tel:${PHONE_TEL}`} className="text-[#0064FC] hover:underline">
                    {PHONE_DISPLAY}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-700 text-xl shrink-0">
                  <FiMail />
                </span>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-slate-500">EMAIL</p>
                  <a href={`mailto:${EMAIL}`} className="text-[#0064FC] hover:underline">
                    {EMAIL}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="aspect-[4/3] w-full overflow-hidden rounded-sm shadow-sm">
            <iframe
              title="Jireh Byte location map"
              src={`https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
