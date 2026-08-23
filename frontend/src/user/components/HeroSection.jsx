import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative flex items-center overflow-hidden bg-[#F8F9FB] px-5 sm:px-8 py-16 md:py-24 lg:min-h-[860px]">
      {/* Soft brand-tinted wash — existing navy/gold at very low opacity */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 78% 22%, rgba(233,193,118,0.10) 0%, rgba(248,249,251,0) 70%), radial-gradient(50% 45% at 8% 85%, rgba(13,28,50,0.05) 0%, rgba(248,249,251,0) 70%)',
        }}
      />

      <div className="max-w-[1280px] mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        {/* Left content */}
        <div className="lg:col-span-7 xl:col-span-7 max-w-[720px]">
          {/* Admin entry */}
          <Link
            to="/admin-login"
            className="rise-in group inline-flex items-center gap-3 bg-[#0D1C32] text-white px-6 sm:px-8 py-3.5 mb-8 text-sm sm:text-base font-medium transition-all duration-200 hover:shadow-[0_12px_28px_-12px_rgba(13,28,50,0.65)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
            style={{ animationDelay: '0ms' }}
          >
            Login as Admin
            <span className="material-symbols-outlined text-[15px] transition-transform duration-200 group-hover:translate-x-1">
              arrow_forward
            </span>
          </Link>

          {/* Status badge */}
          <div
            className="rise-in inline-flex items-center gap-2 px-3 py-1 bg-[#F3F4F6] rounded-xl mb-8"
            style={{ animationDelay: '80ms' }}
          >
            <span className="w-2 h-2 bg-[#E9C176] rounded-xl animate-pulse" />
            <span className="text-[10px] sm:text-xs font-bold tracking-[1.2px] uppercase text-[#44474D]">
              Sovereign Editorial Mode Active
            </span>
          </div>

          {/* Heading */}
          <h1
            className="rise-in font-headline font-extrabold text-[clamp(2.5rem,9vw,6rem)] leading-[1.03] tracking-[-0.05em] text-[#191C1E] mb-8 text-balance"
            style={{ animationDelay: '160ms' }}
          >
            AI-Based Legal
            <br />
            Case Retrieval System
          </h1>

          {/* Description */}
          <p
            className="rise-in text-base sm:text-lg lg:text-xl leading-relaxed lg:leading-8 text-[#44474D] max-w-[672px] mb-4 font-body"
            style={{ animationDelay: '260ms' }}
          >
            Precision-engineered for the modern legal professional. Navigate Supreme Court judgments with
            efficiency and clarity, backed by structured and reliable legal insights.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4">
            <button
              type="button"
              className="rise-in group flex items-center justify-center gap-3 bg-[#0D1C32] text-white px-7 sm:px-8 py-4 rounded-lg font-bold text-base sm:text-lg transition-all duration-200 hover:shadow-[0_16px_32px_-14px_rgba(13,28,50,0.7)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              style={{ animationDelay: '340ms' }}
            >
              Get Started
              <span className="material-symbols-outlined text-base transition-transform duration-200 group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>
            <button
              type="button"
              className="rise-in bg-[#E9C176] text-[#261900] px-7 sm:px-8 py-4 rounded-lg font-medium text-base transition-all duration-200 hover:shadow-[0_16px_32px_-14px_rgba(233,193,118,0.9)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              style={{ animationDelay: '400ms' }}
            >
              Try Demo
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="lg:col-span-5 hidden lg:flex justify-end">
          <div
            className="image-reveal group w-full max-w-[496px] aspect-[496/587] bg-[#E7E8EA] rounded-3xl overflow-hidden shadow-2xl relative"
            style={{ animationDelay: '220ms' }}
          >
            <img
              className="w-full h-full object-cover grayscale opacity-80 mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              alt="Legal gavel and book in a dark mahogany library"
              loading="eager"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHP12du1qMiXOZplDrO-6ifBff6R8ik5yRcOkqwdtxCI6NnNrANme9U084UhHmg6czuhysJYOApaKnu8uDJZBQvalPvxUqwfMN3cvTsEAEMVlZ01FA-UM-ylt-LthTrIgZ9BF_5wrkFs3Q41hE-ecdypwlIefwrBXgCV0tVZWlYZYB05ODlrUhNr81SNAc0uYFHe2mn_6AYBqX7vDWUBIbQEwtvExGeN0eukAjf2z0n42qVXLSHrv6sUD2tuWjjZbrfknrA5qBT-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(13,28,50,0.4)] to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
