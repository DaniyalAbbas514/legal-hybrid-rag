import React from 'react';
import Reveal from './Reveal';

const PricingSection = () => {
  return (
    <section className="py-20 md:py-28 lg:py-32 px-5 sm:px-8 bg-[#EDEEF0]">
      <div className="max-w-[1280px] mx-auto flex flex-col items-center">
        {/* Badge */}
        <Reveal className="inline-block px-4 py-1 border border-[rgba(13,28,50,0.2)] rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-[2.4px] text-[#44474D] mb-8">
          Institutional Access
        </Reveal>

        {/* Heading */}
        <Reveal
          as="h2"
          delay={90}
          className="font-headline font-bold text-[clamp(2rem,6vw,3.75rem)] leading-[1.05] tracking-[-0.05em] text-[#191C1E] text-center mb-8 text-balance"
        >
          Elevate your practice to
          <br className="hidden sm:block" /> the sovereign level.
        </Reveal>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-left max-w-[1152px] w-full mt-4">
          {/* Individual Tier */}
          <Reveal
            delay={60}
            className="group bg-white p-8 sm:p-10 rounded-2xl flex flex-col shadow-sm border border-transparent lift hover:border-[rgba(233,193,118,0.6)] hover:shadow-[0_28px_56px_-28px_rgba(13,28,50,0.35)]"
          >
            <h4 className="text-sm font-bold uppercase tracking-[1.4px] text-[#94A3B8] mb-2">Individual</h4>
            <div className="mb-6 flex items-end gap-2">
              <span className="text-4xl font-bold text-[#191C1E] leading-none">$10</span>
              <span className="text-sm text-[#94A3B8] font-normal pb-0.5">/mo</span>
            </div>
            <ul className="space-y-4 text-sm text-[#44474D] mb-10 flex-grow">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#E9C176] text-sm" aria-hidden="true">check</span>
                50 AI Research Sessions
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#E9C176] text-sm" aria-hidden="true">check</span>
                Global Case Access
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#E9C176] text-sm" aria-hidden="true">check</span>
                PDF Export
              </li>
            </ul>
            <button
              type="button"
              className="w-full py-4 border border-[#C5C6CD] rounded-xl font-bold text-[#191C1E] transition-all duration-200 hover:bg-[#F3F4F6] hover:border-[#E9C176] active:scale-[0.99]"
            >
              Select Individual
            </button>
          </Reveal>

          {/* Professional Tier (Highlighted) */}
          <Reveal
            delay={150}
            className="group bg-[#0D1C32] text-white p-8 sm:p-10 rounded-2xl flex flex-col shadow-2xl relative mt-5 md:mt-0 lift hover:shadow-[0_36px_64px_-28px_rgba(13,28,50,0.7)]"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#E9C176] text-[#261900] text-[10px] font-black uppercase tracking-[1px] rounded-xl whitespace-nowrap">
              Recommended
            </div>
            <h4 className="text-sm font-bold uppercase tracking-[1.4px] text-[#76849F] mb-2">Professional</h4>
            <div className="mb-6 flex items-end gap-2">
              <span className="text-4xl font-bold text-white leading-none">$20</span>
              <span className="text-sm text-[#76849F] font-normal pb-0.5">/mo</span>
            </div>
            <ul className="space-y-4 text-sm text-white/80 mb-10 flex-grow">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#E9C176] text-sm" aria-hidden="true">check</span>
                Unlimited AI Research
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#E9C176] text-sm" aria-hidden="true">check</span>
                Precedent Prediction
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#E9C176] text-sm" aria-hidden="true">check</span>
                Side-by-Side Comparison
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#E9C176] text-sm" aria-hidden="true">check</span>
                24/7 Priority Support
              </li>
            </ul>
            <button
              type="button"
              className="w-full py-4 bg-[#E9C176] text-[#261900] rounded-xl font-bold shadow-lg transition-all duration-200 hover:shadow-[0_18px_34px_-16px_rgba(233,193,118,0.95)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
            >
              Select Professional
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
