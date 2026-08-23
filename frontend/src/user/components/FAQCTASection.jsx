import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from './Reveal';

const FAQCTASection = () => {
  return (
    <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {/* Dark CTA Card */}
        <Reveal
          variant="left"
          className="md:col-span-2 bg-[#0D1C32] p-8 sm:p-12 flex flex-col justify-between gap-10 min-h-[280px] sm:min-h-[304px]"
        >
          <div className="flex flex-col gap-4">
            <h2 className="font-headline font-normal text-[clamp(1.75rem,4.5vw,2.25rem)] leading-tight text-white">
              Still have inquiries?
            </h2>
            <p className="font-body text-base sm:text-lg leading-7 text-[#76849F] max-w-[512px]">
              Our editorial support team is available for deep-dive technical sessions and custom enterprise
              integrations.
            </p>
          </div>

          <div>
            <Link
              to="/contact"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#E9C176] text-[#261900] font-body font-bold text-xs leading-4 tracking-[-0.3px] uppercase transition-all duration-200 hover:shadow-[0_16px_32px_-14px_rgba(233,193,118,0.9)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
            >
              Contact The Atelier
              <span
                className="material-symbols-outlined text-sm transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              >
                arrow_forward
              </span>
            </Link>
          </div>
        </Reveal>

        {/* Whitepaper Card */}
        <Reveal
          variant="right"
          delay={110}
          className="group bg-[#E7E8EA] p-8 sm:p-12 relative overflow-hidden min-h-[240px] sm:min-h-[291px]"
        >
          <div
            className="absolute -bottom-8 -right-8 opacity-5 transition-transform duration-500 group-hover:scale-110"
            aria-hidden="true"
          >
            <span className="material-symbols-outlined text-[#191C1E]" style={{ fontSize: '120px' }}>
              gavel
            </span>
          </div>

          <div className="relative z-10 flex flex-col gap-2">
            <span className="material-symbols-outlined text-[#76849F]" style={{ fontSize: '27px' }} aria-hidden="true">
              article
            </span>

            <div className="pt-4">
              <h3 className="font-headline font-normal text-xl sm:text-2xl leading-8 text-[#191C1E]">
                Technical Whitepaper
              </h3>
            </div>

            <p className="font-body text-sm leading-5 text-[#44474D]">
              Review our algorithmic auditing and security protocols.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default FAQCTASection;
