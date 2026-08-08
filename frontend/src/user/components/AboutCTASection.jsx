import React from 'react';
import { Link } from 'react-router-dom';

const AboutCTASection = () => {
  return (
    <section className="w-full max-w-[832px] mx-auto px-8">
      <div className="bg-[#F3F4F6] border-t border-[rgba(197,198,205,0.1)] py-20 px-12 flex flex-col items-start gap-8">
        <div className="w-full flex justify-center">
          <h2 className="font-headline font-medium text-4xl leading-10 text-center text-[#191C1E]">
            Ready to elevate your practice?
          </h2>
        </div>
        <div className="w-full flex flex-row justify-center items-start gap-6">
          <Link
            to="/"
            className="flex flex-col items-center justify-center px-8 py-4 bg-[#0D1C32] text-white font-body font-bold text-sm uppercase tracking-[1.4px] text-center hover:opacity-90 transition-opacity"
          >
            Back to Home
          </Link>
          <button className="px-8 py-4 border border-[#75777E] font-body font-normal text-sm uppercase tracking-[1.4px] text-[#191C1E] text-center hover:bg-[#E7E8EA] transition-colors">
            Registration
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutCTASection;
