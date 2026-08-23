import React from 'react';
import Reveal from './Reveal';

const FeaturesBentoGrid = () => {
  return (
    <section className="py-20 md:py-28 lg:py-32 px-5 sm:px-8 bg-[#F8F9FB]">
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className="mb-12 md:mb-20 text-left">
          <Reveal
            as="h2"
            className="font-headline font-bold text-[clamp(2rem,5vw,3rem)] leading-[1.05] tracking-[-0.025em] text-[#191C1E] mb-4"
          >
            Master Complexity
          </Reveal>
          <Reveal as="p" delay={90} className="text-base leading-6 text-[#44474D] max-w-[576px] font-body">
            Our suite of analytical tools elevates raw data into actionable legal intelligence.
          </Reveal>
        </div>

        {/* Bento Grid - stacks on mobile, 2 columns on tablet, 3 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:grid-rows-[500px_276px]">
          {/* Large Feature: AI Legal Search */}
          <Reveal className="group relative md:col-span-2 bg-[#F3F4F6] rounded-3xl p-8 sm:p-10 lg:p-12 flex flex-col justify-between overflow-hidden lift hover:shadow-[0_28px_56px_-28px_rgba(13,28,50,0.35)]">
            <div className="relative z-10">
              <span
                className="material-symbols-outlined text-[27px] text-[#E9C176] mb-4 block transition-transform duration-300 group-hover:-translate-y-1"
                style={{ fontVariationSettings: "'FILL' 1" }}
                aria-hidden="true"
              >
                search
              </span>
              <h3 className="font-headline font-bold text-2xl sm:text-3xl lg:text-4xl leading-tight text-[#191C1E] mt-2 mb-4">
                AI Legal Search
              </h3>
              <p className="text-[#44474D] text-base lg:text-lg leading-7 max-w-[448px]">
                Semantic understanding of case law beyond simple keywords. Find context-relevant precedents in seconds.
              </p>
            </div>

            {/* Query Log Card */}
            <div className="relative z-10 mt-10 bg-white p-6 rounded-2xl shadow-inner border border-[rgba(197,198,205,0.1)] transition-shadow duration-300 group-hover:shadow-[0_16px_32px_-20px_rgba(13,28,50,0.35)]">
              <div className="flex items-center gap-4 mb-4 text-xs sm:text-sm font-mono text-[#44474D]">
                <span className="truncate">query_log_1102.sys</span>
                <span className="ml-auto opacity-50 shrink-0">v4.2.0</span>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-[#EDEEF0] rounded-md w-full"></div>
                <div className="h-4 bg-[#EDEEF0] rounded-md w-5/6"></div>
                <div className="h-4 bg-[#EDEEF0] rounded-md w-4/6"></div>
              </div>
            </div>

            {/* Background image overlay */}
            <img
              className="pointer-events-none absolute top-0 right-0 w-1/2 h-full object-cover opacity-10 transition-opacity duration-500 group-hover:opacity-20"
              alt=""
              aria-hidden="true"
              loading="lazy"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmfmDZ47zXx8zSgX10e8VvtWAu-FIz7hxotZEKdQOip3jlJOJ-72DcYERySMTaKv9F3J6OR7ts61z_Vt5qmt7ovcgAIYpCBN3R0B0ATmXk5mmPtyjcbHZd0_A5j5NyXA7gnOIEzwxTBBlIaR4-slG-igjSU2M1Dydd3TSdBoT1P_LBWGjiU9xr5glfsrE_IAHaCatG1xNHvIff7JO2F2iOCdqunqoyGH1436Nrks8Me6SXaYflS2JyoLBHi55QyB06KJHi-fEyMhE"
            />
          </Reveal>

          {/* Side Feature: Relevant Judgments */}
          <Reveal
            delay={100}
            className="group bg-[#0D1C32] rounded-3xl p-8 sm:p-10 flex flex-col justify-center items-start lift hover:shadow-[0_28px_56px_-24px_rgba(13,28,50,0.6)]"
          >
            <div className="mb-8 w-14 h-14 rounded-xl bg-[rgba(233,193,118,0.2)] flex items-center justify-center transition-colors duration-300 group-hover:bg-[rgba(233,193,118,0.32)]">
              <span className="material-symbols-outlined text-[#E9C176] text-[25px]" aria-hidden="true">
                fact_check
              </span>
            </div>
            <h3 className="font-headline font-bold text-2xl leading-8 text-white mb-4">Relevant Judgments</h3>
            <p className="text-[#76849F] text-sm leading-[23px] mb-6 max-w-[327px]">
              Proprietary ranking algorithms ensure that the most legally impactful Supreme Court judgments are
              prioritized for your specific case strategy.
            </p>
            <button
              type="button"
              className="group/btn text-[#E9C176] font-bold uppercase tracking-[1.2px] text-xs flex items-center gap-2 py-2 transition-opacity hover:opacity-80"
            >
              Explore Algorithm
              <span
                className="material-symbols-outlined text-[10.5px] text-[#E9C176] transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                aria-hidden="true"
              >
                open_in_new
              </span>
            </button>
          </Reveal>

          {/* Case Comparison */}
          <Reveal className="group bg-[#E7E8EA] rounded-3xl p-8 sm:p-10 flex flex-col gap-3 lift hover:shadow-[0_24px_48px_-24px_rgba(13,28,50,0.35)]">
            <span
              className="material-symbols-outlined text-[25px] text-[#191C1E] transition-transform duration-300 group-hover:-translate-y-1"
              aria-hidden="true"
            >
              compare_arrows
            </span>
            <h3 className="font-headline font-bold text-xl leading-7 text-[#191C1E] pt-3">Case Comparison</h3>
            <p className="text-[#44474D] text-sm leading-5">
              Side-by-side analysis of contradictory rulings to build bulletproof arguments.
            </p>
          </Reveal>

          {/* Download Judgments */}
          <Reveal
            delay={90}
            className="group bg-white border border-[rgba(197,198,205,0.4)] shadow-sm rounded-3xl p-8 sm:p-10 flex flex-col gap-3 lift hover:border-[rgba(233,193,118,0.7)] hover:shadow-[0_24px_48px_-24px_rgba(13,28,50,0.28)]"
          >
            <span
              className="material-symbols-outlined text-[20px] text-[#191C1E] transition-transform duration-300 group-hover:-translate-y-1"
              aria-hidden="true"
            >
              download
            </span>
            <h3 className="font-headline font-bold text-xl leading-7 text-[#191C1E] pt-3">Download Judgments</h3>
            <p className="text-[#44474D] text-sm leading-5">
              Export clean, formatted PDF documents ready for inclusion in legal briefs or court filings.
            </p>
          </Reveal>

          {/* Subscription Plans */}
          <Reveal
            delay={180}
            className="group bg-[#E9C176] rounded-3xl p-8 sm:p-10 flex flex-col justify-between gap-8 lift hover:shadow-[0_24px_48px_-24px_rgba(233,193,118,0.9)]"
          >
            <div className="flex flex-col gap-3">
              <span
                className="material-symbols-outlined text-[25px] text-[#261900] transition-transform duration-300 group-hover:-translate-y-1"
                aria-hidden="true"
              >
                star
              </span>
              <h3 className="font-headline font-bold text-xl leading-7 text-[#261900] pt-3">Subscription Plans</h3>
              <p className="text-[#5D4201] text-sm leading-5 font-medium">
                Enterprise-grade solutions for law firms and independent counsels.
              </p>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xl sm:text-2xl font-bold leading-8 text-[#261900]">View Tiering</span>
              <span
                className="material-symbols-outlined text-[#261900] transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              >
                arrow_right_alt
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default FeaturesBentoGrid;
