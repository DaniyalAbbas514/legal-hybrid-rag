import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-[921px] flex items-center overflow-hidden bg-[#F8F9FB] px-8 py-20">
      <div className="max-w-[1280px] mx-auto w-full relative">
        {/* Left Content */}
        <div className="relative z-10 max-w-[720px]">
          {/* Login as Admin Button */}
          <Link
            to="/admin-login"
            className="inline-flex items-center gap-3 bg-[#0D1C32] text-white px-8 py-4 mb-8 text-base font-medium hover:opacity-90 transition-all"
          >
            Login as Admin
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </Link>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F3F4F6] rounded-xl mb-8">
            <span className="w-2 h-2 bg-[#E9C176] rounded-xl animate-pulse"></span>
            <span className="text-xs font-bold tracking-[1.2px] uppercase text-[#44474D]">
              Sovereign Editorial Mode Active
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-headline font-extrabold text-[96px] leading-[96px] tracking-[-4.8px] text-[#191C1E] mb-8">
            AI-Based Legal<br />Case Retrieval System
          </h1>

          {/* Description */}
          <p className="text-xl leading-8 text-[#44474D] max-w-[672px] mb-4 font-body">
            Precision-engineered for the modern legal professional. Navigate Supreme Court judgments with efficiency and clarity, backed by structured and reliable legal insights.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-start gap-6 pt-4">
            <button className="flex items-center gap-3 bg-[#0D1C32] text-white px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-all">
              Get Started
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
            <button className="bg-[#E9C176] text-[#261900] px-8 py-4 rounded-lg font-medium text-base hover:opacity-90 transition-all">
              Try Demo
            </button>
          </div>
        </div>

        {/* Decorative Image - Right Side */}
        <div className="absolute right-0 top-0 hidden lg:block" style={{ width: '496px', height: '586.67px' }}>
          <div className="w-full h-full bg-[#E7E8EA] rounded-3xl overflow-hidden shadow-2xl relative">
            <img
              className="w-full h-full object-cover grayscale opacity-80 mix-blend-multiply"
              alt="Legal gavel and book in a dark mahogany library"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHP12du1qMiXOZplDrO-6ifBff6R8ik5yRcOkqwdtxCI6NnNrANme9U084UhHmg6czuhysJYOApaKnu8uDJZBQvalPvxUqwfMN3cvTsEAEMVlZ01FA-UM-ylt-LthTrIgZ9BF_5wrkFs3Q41hE-ecdypwlIefwrBXgCV0tVZWlYZYB05ODlrUhNr81SNAc0uYFHe2mn_6AYBqX7vDWUBIbQEwtvExGeN0eukAjf2z0n42qVXLSHrv6sUD2tuWjjZbrfknrA5qBT-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(13,28,50,0.4)] to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
