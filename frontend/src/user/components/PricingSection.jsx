import React from 'react';

const PricingSection = () => {
  return (
    <section className="py-32 px-8 bg-[#EDEEF0]">
      <div className="max-w-[1280px] mx-auto flex flex-col items-center">
        {/* Badge */}
        <div className="inline-block px-4 py-1 border border-[rgba(13,28,50,0.2)] rounded-xl text-xs font-bold uppercase tracking-[2.4px] text-[#44474D] mb-8">
          Institutional Access
        </div>

        {/* Heading */}
        <h2 className="font-headline font-bold text-[60px] leading-[60px] tracking-[-3px] text-[#191C1E] text-center mb-8">
          Elevate your practice to<br />the sovereign level.
        </h2>

        {/* Pricing Grid - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-[1152px] w-full mt-4">
          {/* Individual Tier */}
          <div className="bg-white p-10 rounded-2xl flex flex-col shadow-sm">
            <h4 className="text-sm font-bold uppercase tracking-[1.4px] text-[#94A3B8] mb-2">Individual</h4>
            <div className="mb-6 relative h-10">
              <span className="text-4xl font-bold text-[#191C1E]">$10</span>
              <span className="text-sm text-[#94A3B8] font-normal ml-5 absolute bottom-[2px]">/mo</span>
            </div>
            <ul className="space-y-4 text-sm text-[#44474D] mb-12 flex-grow">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#E9C176] text-sm">check</span>
                50 AI Research Sessions
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#E9C176] text-sm">check</span>
                Global Case Access
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#E9C176] text-sm">check</span>
                PDF Export
              </li>
            </ul>
            <button className="w-full py-4 border border-[#C5C6CD] hover:bg-[#F3F4F6] transition-colors rounded-xl font-bold text-[#191C1E]">
              Select Individual
            </button>
          </div>

          {/* Professional Tier (Highlighted) */}
          <div className="bg-[#0D1C32] text-white p-10 rounded-2xl flex flex-col shadow-2xl relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#E9C176] text-[#261900] text-[10px] font-black uppercase tracking-[1px] rounded-xl whitespace-nowrap">
              Recommended
            </div>
            <h4 className="text-sm font-bold uppercase tracking-[1.4px] text-[#76849F] mb-2">Professional</h4>
            <div className="mb-6 relative h-10">
              <span className="text-4xl font-bold text-white">$20</span>
              <span className="text-sm text-[#76849F] font-normal ml-5 absolute bottom-[2px]">/mo</span>
            </div>
            <ul className="space-y-4 text-sm text-white/80 mb-12 flex-grow">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#E9C176] text-sm">check</span>
                Unlimited AI Research
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#E9C176] text-sm">check</span>
                Precedent Prediction
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#E9C176] text-sm">check</span>
                Side-by-Side Comparison
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#E9C176] text-sm">check</span>
                24/7 Priority Support
              </li>
            </ul>
            <button className="w-full py-4 bg-[#E9C176] text-[#261900] rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity">
              Select Professional
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
