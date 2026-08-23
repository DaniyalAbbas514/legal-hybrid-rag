import React, { useEffect, useRef, useState } from 'react';
import Reveal from './Reveal';

const DURATION = 1400;
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Skip the animation entirely when motion is reduced or the observer is
// unavailable — the final value is then rendered from the very first paint.
const shouldSkipCount = () => prefersReducedMotion() || typeof IntersectionObserver === 'undefined';

/**
 * Counts up to `value` the first time it scrolls into view.
 * Falls back to the final value immediately when motion is reduced or
 * IntersectionObserver is unavailable, so the number is never withheld.
 */
const CountUp = ({ value, decimals = 0, suffix = '', className = '' }) => {
  const ref = useRef(null);
  const [display, setDisplay] = useState(() => (shouldSkipCount() ? value : 0));

  useEffect(() => {
    const node = ref.current;
    if (!node || shouldSkipCount()) return undefined;

    let frame = 0;
    let start = 0;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / DURATION, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            frame = requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {/* The full value is always in the accessible name, mid-count included */}
      <span aria-hidden="true">
        {formatted}
        {suffix}
      </span>
      <span className="sr-only">
        {value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        {suffix}
      </span>
    </span>
  );
};

const StatsSection = () => {
  return (
    <section className="w-full max-w-[1216px] mx-auto px-5 sm:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-3">
        {/* Stat 1 - Active Practitioners */}
        <Reveal className="min-h-[220px] sm:min-h-[256px] bg-[#EDEEF0] flex flex-col justify-between gap-8 p-8 sm:p-10 lift hover:shadow-[0_24px_48px_-28px_rgba(13,28,50,0.4)]">
          <div>
            <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '18px' }} aria-hidden="true">
              groups
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <CountUp
              value={12400}
              suffix="+"
              className="font-headline font-normal text-[clamp(2.25rem,5vw,3rem)] leading-none tracking-[-0.05em] text-[#191C1E]"
            />
            <span className="font-body text-[10px] sm:text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">
              Active Practitioners
            </span>
          </div>
        </Reveal>

        {/* Stat 2 - Queries Processed */}
        <Reveal
          delay={110}
          className="min-h-[220px] sm:min-h-[256px] bg-[#0D1C32] flex flex-col justify-between gap-8 p-8 sm:p-10 lift hover:shadow-[0_24px_48px_-24px_rgba(13,28,50,0.6)]"
        >
          <div>
            <span className="material-symbols-outlined text-[#FFDEA5]" style={{ fontSize: '30px' }} aria-hidden="true">
              bolt
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <CountUp
              value={2.8}
              decimals={1}
              suffix="M"
              className="font-headline font-normal text-[clamp(2.25rem,5vw,3rem)] leading-none tracking-[-0.05em] text-white"
            />
            <span className="font-body text-[10px] sm:text-xs leading-4 tracking-[1.2px] uppercase text-[#76849F]">
              Queries Processed
            </span>
          </div>
        </Reveal>

        {/* Stat 3 - Citation Accuracy */}
        <Reveal
          delay={220}
          className="min-h-[220px] sm:min-h-[256px] bg-[#EDEEF0] flex flex-col justify-between gap-8 p-8 sm:p-10 lift hover:shadow-[0_24px_48px_-28px_rgba(13,28,50,0.4)]"
        >
          <div>
            <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '28.5px' }} aria-hidden="true">
              gavel
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <CountUp
              value={99.8}
              decimals={1}
              suffix="%"
              className="font-headline font-normal text-[clamp(2.25rem,5vw,3rem)] leading-none tracking-[-0.05em] text-[#191C1E]"
            />
            <span className="font-body text-[10px] sm:text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">
              Citation Accuracy
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default StatsSection;
