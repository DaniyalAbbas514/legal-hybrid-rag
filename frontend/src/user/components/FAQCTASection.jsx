import React from 'react';
import { Link } from 'react-router-dom';

const FAQCTASection = () => {
  return (
    <div className="max-w-[1280px] mx-auto px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {/* Dark CTA Card */}
        <div className="md:col-span-2 bg-[#0D1C32] p-12 flex flex-col justify-between min-h-[304px]">
          <div className="flex flex-col gap-4">
            <h4 className="font-headline font-normal text-4xl leading-10 text-white">
              Still have inquiries?
            </h4>
            <p className="font-body text-lg leading-7 text-[#76849F] max-w-[512px]">
              Our editorial support team is available for deep-dive technical sessions and custom enterprise integrations.
            </p>
          </div>

          <div className="pt-12">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#E9C176] text-[#261900] font-body font-bold text-xs leading-4 tracking-[-0.3px] uppercase hover:opacity-90 transition-opacity"
            >
              Contact The Atelier
            </Link>
          </div>
        </div>

        {/* Whitepaper Card */}
        <div className="bg-[#E7E8EA] p-12 relative overflow-hidden min-h-[291px]">
          <div className="absolute -bottom-8 -right-8 opacity-5">
            <span className="material-symbols-outlined text-[#191C1E]" style={{ fontSize: '120px' }}>gavel</span>
          </div>

          <div className="relative z-10 flex flex-col gap-2">
            <span className="material-symbols-outlined text-[#76849F]" style={{ fontSize: '27px' }}>article</span>

            <div className="pt-4">
              <h4 className="font-headline font-normal text-2xl leading-8 text-[#191C1E]">
                Technical Whitepaper
              </h4>
            </div>

            <p className="font-body text-sm leading-5 text-[#44474D]">
              Review our algorithmic auditing and security protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQCTASection;
