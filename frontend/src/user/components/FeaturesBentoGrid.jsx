import React from 'react';

const FeaturesBentoGrid = () => {
  return (
    <section className="py-32 px-8 bg-[#F8F9FB]">
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className="mb-20 text-left">
          <h2 className="font-headline font-bold text-[48px] leading-[48px] tracking-[-1.2px] text-[#191C1E] mb-4">
            Master Complexity
          </h2>
          <p className="text-base leading-6 text-[#44474D] max-w-[576px] font-body">
            Our suite of analytical tools elevates raw data into actionable legal intelligence.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="relative h-[800px]">
          {/* Large Feature: AI Legal Search - Top Left */}
          <div className="absolute left-0 top-0 right-[calc(100%-66.67%)] bottom-[300px] bg-[#F3F4F6] rounded-3xl p-12 flex flex-col justify-between overflow-hidden">
            <div className="z-10">
              <span className="material-symbols-outlined text-[27px] text-[#E9C176] mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>
                search
              </span>
              <h3 className="font-headline font-bold text-4xl leading-10 text-[#191C1E] mt-2 mb-4">
                AI Legal Search
              </h3>
              <p className="text-[#44474D] text-lg leading-7 max-w-[448px]">
                Semantic understanding of case law beyond simple keywords. Find context-relevant precedents in seconds.
              </p>
            </div>

            {/* Query Log Card */}
            <div className="mt-12 bg-white p-6 rounded-2xl shadow-inner border border-[rgba(197,198,205,0.1)]">
              <div className="flex items-center gap-4 mb-4 text-sm font-mono text-[#44474D]">
                <span>query_log_1102.sys</span>
                <span className="ml-auto opacity-50">v4.2.0</span>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-[#EDEEF0] rounded-md w-full"></div>
                <div className="h-4 bg-[#EDEEF0] rounded-md w-5/6"></div>
                <div className="h-4 bg-[#EDEEF0] rounded-md w-4/6"></div>
              </div>
            </div>

            {/* Background image overlay */}
            <img
              className="absolute top-0 right-0 w-1/2 h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity"
              alt="Neural network visualization"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmfmDZ47zXx8zSgX10e8VvtWAu-FIz7hxotZEKdQOip3jlJOJ-72DcYERySMTaKv9F3J6OR7ts61z_Vt5qmt7ovcgAIYpCBN3R0B0ATmXk5mmPtyjcbHZd0_A5j5NyXA7gnOIEzwxTBBlIaR4-slG-igjSU2M1Dydd3TSdBoT1P_LBWGjiU9xr5glfsrE_IAHaCatG1xNHvIff7JO2F2iOCdqunqoyGH1436Nrks8Me6SXaYflS2JyoLBHi55QyB06KJHi-fEyMhE"
            />
          </div>

          {/* Side Feature: Relevant Judgments - Top Right */}
          <div className="absolute left-[67.86%] right-0 top-0 bottom-[300px] bg-[#0D1C32] rounded-3xl p-10 flex flex-col justify-center items-start">
            <div className="mb-8 w-14 h-14 rounded-xl bg-[rgba(233,193,118,0.2)] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#E9C176] text-[25px]">fact_check</span>
            </div>
            <h3 className="font-headline font-bold text-2xl leading-8 text-white mb-4">Relevant Judgments</h3>
            <p className="text-[#76849F] text-sm leading-[23px] mb-6 max-w-[327px]">
              Proprietary ranking algorithms ensure that the most legally impactful Supreme Court judgments are prioritized for your specific case strategy.
            </p>
            <button className="text-[#E9C176] font-bold uppercase tracking-[1.2px] text-xs flex items-center gap-2">
              Explore Algorithm <span className="material-symbols-outlined text-[10.5px] text-[#E9C176]">open_in_new</span>
            </button>
          </div>

          {/* Bottom Left: Case Comparison */}
          <div className="absolute left-0 right-[calc(100%-32.14%)] top-[524px] bottom-0 bg-[#E7E8EA] rounded-3xl p-10 flex flex-col gap-3">
            <span className="material-symbols-outlined text-[25px] text-[#191C1E]">compare_arrows</span>
            <h3 className="font-headline font-bold text-xl leading-7 text-[#191C1E] pt-3">Case Comparison</h3>
            <p className="text-[#44474D] text-sm leading-5">Side-by-side analysis of contradictory rulings to build bulletproof arguments.</p>
          </div>

          {/* Bottom Center: Download Judgments */}
          <div className="absolute left-[33.96%] right-[33.96%] top-[524px] bottom-0 bg-white border border-[rgba(197,198,205,0.1)] shadow-sm rounded-3xl p-10 flex flex-col gap-3">
            <span className="material-symbols-outlined text-[20px] text-[#191C1E]">download</span>
            <h3 className="font-headline font-bold text-xl leading-7 text-[#191C1E] pt-3">Download Judgments</h3>
            <p className="text-[#44474D] text-sm leading-5">Export clean, formatted PDF documents ready for inclusion in legal briefs or court filings.</p>
          </div>

          {/* Bottom Right: Subscription Plans */}
          <div className="absolute left-[67.86%] right-0 top-[524px] bottom-0 bg-[#E9C176] rounded-3xl p-10 flex flex-col justify-between">
            <div className="flex flex-col gap-3">
              <span className="material-symbols-outlined text-[25px] text-[#261900]">star</span>
              <h3 className="font-headline font-bold text-xl leading-7 text-[#261900] pt-3">Subscription Plans</h3>
              <p className="text-[#5D4201] text-sm leading-5 font-medium">Enterprise-grade solutions for law firms and independent counsels.</p>
            </div>
            <div className="flex items-center justify-between pt-6">
              <span className="text-2xl font-bold leading-8 text-[#261900]">View Tiering</span>
              <span className="material-symbols-outlined text-[#261900]">arrow_right_alt</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesBentoGrid;
