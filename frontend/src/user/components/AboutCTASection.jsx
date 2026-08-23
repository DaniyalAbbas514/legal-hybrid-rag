import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from './Reveal';

const AboutCTASection = () => {
  return (
    <section className="w-full max-w-[832px] mx-auto px-5 sm:px-8">
      <Reveal
        variant="scale"
        className="bg-[#F3F4F6] border-t border-[rgba(197,198,205,0.4)] py-14 sm:py-20 px-6 sm:px-12 flex flex-col items-center gap-8"
      >
        <h2 className="font-headline font-medium text-[clamp(1.75rem,4.5vw,2.25rem)] leading-tight text-center text-[#191C1E] text-balance">
          Ready to elevate your practice?
        </h2>

        <div className="w-full flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-4 sm:gap-6">
          <Link
            to="/"
            className="flex items-center justify-center px-8 py-4 bg-[#0D1C32] text-white font-body font-bold text-sm uppercase tracking-[1.4px] text-center transition-all duration-200 hover:shadow-[0_16px_32px_-16px_rgba(13,28,50,0.7)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            Back to Home
          </Link>
          <button
            type="button"
            className="px-8 py-4 border border-[#75777E] font-body font-normal text-sm uppercase tracking-[1.4px] text-[#191C1E] text-center transition-all duration-200 hover:bg-[#E7E8EA] hover:border-[#E9C176] active:scale-[0.98]"
          >
            Registration
          </button>
        </div>
      </Reveal>
    </section>
  );
};

export default AboutCTASection;
