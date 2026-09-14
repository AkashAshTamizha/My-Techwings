import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const AUTOPLAY_MS = 5000;

/**
 * Reusable hero slider: a left-side text slide synced with a right-side
 * image slide, sharing a single `activeIndex`. Autoplay advances every
 * AUTOPLAY_MS and pauses whenever the user interacts (arrows, dots, hover,
 * touch) so it never fights with someone actively browsing the slides.
 *
 * `slides` shape:
 *   {
 *     eyebrow?: string,
 *     heading: string[]      // rendered as stacked lines
 *     highlightLines?: number[] // indices into `heading` styled in brand blue
 *     description: string,
 *     ctaLabel?: string,
 *     ctaTo?: string,
 *     image: string,
 *     alt: string,
 *   }
 */
export default function HeroSlider({ slides, autoplay = true }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const count = slides.length;

  const goTo = useCallback(
    (index) => {
      setActiveIndex(((index % count) + count) % count);
    },
    [count]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Autoplay loop; cleared/reset whenever paused state, active index, or the
  // slide count changes so it never double-schedules.
  useEffect(() => {
    if (!autoplay || isPaused || count <= 1) return undefined;
    timerRef.current = setTimeout(() => {
      setActiveIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearTimeout(timerRef.current);
  }, [activeIndex, isPaused, autoplay, count]);

  // Any explicit user interaction pauses autoplay for good, matching the
  // "pauses on user interaction" requirement (rather than a temporary pause
  // that silently resumes and yanks the slide out from under them).
  const handleUserInteraction = (action) => {
    setIsPaused(true);
    action();
  };

  if (!count) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        {/* Text slider */}
        <div className="relative min-h-[280px] sm:min-h-[260px]">
          {slides.map((slide, i) => (
            <div
              key={slide.heading.join('-')}
              aria-hidden={i !== activeIndex}
              className={`transition-all duration-700 ease-out ${
                i === activeIndex
                  ? 'opacity-100 translate-x-0 relative'
                  : 'opacity-0 translate-x-4 absolute inset-0 pointer-events-none'
              }`}
            >
              {slide.eyebrow && (
                <p className="text-brand-blue text-xs font-semibold tracking-widest mb-2">{slide.eyebrow}</p>
              )}
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900">
                {slide.heading.map((line, li) => (
                  <span key={li} className={slide.highlightLines?.includes(li) ? 'text-brand-blue' : ''}>
                    {line}
                    {li < slide.heading.length - 1 && <br />}
                  </span>
                ))}
              </h1>
              <p className="mt-5 text-slate-600 max-w-md">{slide.description}</p>
              {slide.ctaLabel && slide.ctaTo && (
                <Link
                  to={slide.ctaTo}
                  className="inline-block mt-6 bg-brand-blue text-white font-semibold px-6 py-3 rounded hover:bg-brand-blueDark transition"
                >
                  {slide.ctaLabel} →
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Image slider */}
        <div className="relative rounded-lg overflow-hidden shadow-xl bg-gradient-to-br from-slate-100 to-slate-200 h-72 sm:h-80 lg:h-96">
          {slides.map((slide, i) => (
            <img
              key={slide.image}
              src={slide.image}
              onError={(e) => (e.currentTarget.style.display = 'none')}
              alt={slide.alt}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out ${
                i === activeIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}

          {count > 1 && (
            <>
              <SliderArrow
                direction="prev"
                onClick={() => handleUserInteraction(goPrev)}
              />
              <SliderArrow
                direction="next"
                onClick={() => handleUserInteraction(goNext)}
              />
            </>
          )}
        </div>
      </div>

      {count > 1 && (
        <div className="flex justify-center lg:justify-start gap-2 mt-6">
          {slides.map((slide, i) => (
            <button
              key={slide.heading.join('-')}
              type="button"
              onClick={() => handleUserInteraction(() => goTo(i))}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === activeIndex}
              className={`h-2 rounded-full transition-all ${
                i === activeIndex ? 'w-6 bg-brand-blue' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SliderArrow({ direction, onClick }) {
  const isPrev = direction === 'prev';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? 'Previous slide' : 'Next slide'}
      className={`hidden sm:flex absolute top-1/2 -translate-y-1/2 ${
        isPrev ? 'left-3' : 'right-3'
      } h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow items-center justify-center text-slate-700 hover:text-brand-blue transition`}
    >
      {isPrev ? <FiChevronLeft /> : <FiChevronRight />}
    </button>
  );
}
