import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="flex flex-col items-start bg-[#F8F9FB] min-h-screen w-full">
      
      {/* Header - Top Navigation Bar */}
      <header className="w-full bg-[#F8F9FB] sticky top-0 z-50">
        <nav className="flex justify-between items-center w-full px-8 py-4 h-[72px]">
          {/* Brand */}
          <div className="font-headline font-bold text-2xl text-[#0D1C32] tracking-[-1.2px] leading-8">
            Verdict AI
          </div>
          
          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-10 font-headline text-lg font-semibold tracking-[-0.45px]">
            <Link className="text-[#0D1C32] border-b-2 border-[#E9C176] pb-1 hover:text-[#0D1C32] transition-colors" to="/about">About</Link>
            <Link className="text-[#64748B] hover:text-[#0D1C32] transition-colors" to="/contact">Contact</Link>
            <Link className="text-[#64748B] hover:text-[#0D1C32] transition-colors" to="/faq">FAQ</Link>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-[#475569] font-medium text-base hover:text-[#0D1C32] transition-colors">Login</Link>
            <Link to="/signup" className="bg-[#0D1C32] text-white px-6 py-2.5 rounded shadow-sm text-sm font-semibold tracking-[0.35px] hover:opacity-90 transition-opacity">
              Signup
            </Link>
          </div>
        </nav>
      </header>

      <main className="w-full">
        {/* Hero Section */}
        <section className="relative min-h-[921px] flex items-center overflow-hidden bg-[#F8F9FB] px-8 py-20">
          <div className="max-w-[1280px] mx-auto w-full relative">
            {/* Left Content */}
            <div className="relative z-10 max-w-[720px]">
              
              {/* Login as Admin Button */}
              <Link to="/admin-login" className="inline-flex items-center gap-3 bg-[#0D1C32] text-white px-8 py-4 mb-8 text-base font-medium hover:opacity-90 transition-all">
                Login as Admin
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F3F4F6] rounded-xl mb-8">
                <span className="w-2 h-2 bg-[#E9C176] rounded-xl animate-pulse"></span>
                <span className="text-xs font-bold tracking-[1.2px] uppercase text-[#44474D]">Sovereign Editorial Mode Active</span>
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

        {/* Features Bento Grid Section */}
        <section className="py-32 px-8 bg-[#F8F9FB]">
          <div className="max-w-[1280px] mx-auto">
            {/* Section Header */}
            <div className="mb-20 text-left">
              <h2 className="font-headline font-bold text-[48px] leading-[48px] tracking-[-1.2px] text-[#191C1E] mb-4">Master Complexity</h2>
              <p className="text-base leading-6 text-[#44474D] max-w-[576px] font-body">Our suite of analytical tools elevates raw data into actionable legal intelligence.</p>
            </div>

            {/* Bento Grid */}
            <div className="relative h-[800px]">
              
              {/* Large Feature: AI Legal Search - Top Left */}
              <div className="absolute left-0 top-0 right-[calc(100%-66.67%)] bottom-[300px] bg-[#F3F4F6] rounded-3xl p-12 flex flex-col justify-between overflow-hidden">
                <div className="z-10">
                  <span className="material-symbols-outlined text-[27px] text-[#E9C176] mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
                  <h3 className="font-headline font-bold text-4xl leading-10 text-[#191C1E] mt-2 mb-4">AI Legal Search</h3>
                  <p className="text-[#44474D] text-lg leading-7 max-w-[448px]">Semantic understanding of case law beyond simple keywords. Find context-relevant precedents in seconds.</p>
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

        {/* Subscription / CTA Section */}
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
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#F8F9FB] border-t border-[#F1F5F9] py-12">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center px-8 gap-8">
          {/* Brand + Copyright */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-[#0D1C32]">Verdict AI</span>
            <span className="text-xs uppercase tracking-[1.2px] text-[#94A3B8] font-body">© 2024 Verdict AI</span>
          </div>

          {/* Footer Links */}
          <div className="flex flex-wrap justify-center gap-8 text-xs uppercase tracking-[1.2px] text-[#94A3B8] font-body">
            <a className="hover:text-[#E9C176] transition-colors" href="#">Help</a>
            <a className="hover:text-[#E9C176] transition-colors" href="#">Contact</a>
            <a className="hover:text-[#E9C176] transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-[#E9C176] transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-[#E9C176] transition-colors" href="#">Legal Disclaimer</a>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-xl bg-[#EDEEF0] flex items-center justify-center text-[#0D1C32] hover:bg-[#E9C176] transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">share</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#EDEEF0] flex items-center justify-center text-[#0D1C32] hover:bg-[#E9C176] transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">mail</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
