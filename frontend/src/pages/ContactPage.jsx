import React from 'react';
import { Link } from 'react-router-dom';

const ContactPage = () => {
  return (
    <div className="flex flex-col items-center bg-[#F8F9FB] min-h-screen w-full">

      {/* TopNavBar Navigation Shell */}
      <header className="w-full bg-[#F8F9FB] sticky top-0 z-50">
        <nav className="flex justify-between items-center w-full px-8 py-4 h-[72px]">
          {/* Brand */}
          <Link to="/" className="font-headline text-2xl text-[#0D1C32] tracking-[-1.2px] leading-8">
            Verdict AI
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center font-headline text-lg font-semibold tracking-[-0.45px]">
            <Link
              to="/about"
              className="text-[#64748B] hover:text-[#0D1C32] transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-[#0D1C32] border-b-2 border-[#E9C176] pb-1 hover:text-[#0D1C32] transition-colors ml-8"
            >
              Contact
            </Link>
            <Link className="text-[#64748B] hover:text-[#0D1C32] transition-colors ml-8" to="/faq">
              FAQ
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center">
            <Link to="/login" className="text-[#64748B] font-semibold font-headline text-base hover:text-[#0D1C32] transition-colors">
              Login
            </Link>
            <Link to="/signup" className="ml-4 px-6 py-2 bg-[#0D1C32] text-white font-semibold font-headline rounded-sm text-base hover:opacity-90 transition-opacity shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              Signup
            </Link>
          </div>
        </nav>
      </header>

      {/* Back to Home Link */}
      <div className="w-full max-w-[1216px] mx-auto px-8 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 text-[#76849F] hover:text-[#0D1C32] transition-colors group">
          <span className="material-symbols-outlined text-xs">arrow_back</span>
          <span className="font-body font-medium text-base leading-6">Back to Home</span>
        </Link>
      </div>

      {/* Main Content */}
      <main className="w-full max-w-[1216px] mx-auto px-8 pt-8">
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-16 min-h-[858px]">

          {/* Context & Editorial Content - Left Side */}
          <div className="lg:col-span-5 flex flex-col justify-center py-[132px]">
            {/* Eyebrow */}
            <div className="mb-4 pb-4">
              <span className="font-body text-xs leading-4 tracking-[2.4px] uppercase text-[#E9C176]">
                Inquiry Channel
              </span>
            </div>

            {/* Main Heading */}
            <div className="mb-8 pb-8">
              <h1 className="font-headline font-normal text-[60px] leading-[75px] tracking-[-3px] text-[#191C1E]">
                Establish Your Strategic Presence.
              </h1>
            </div>

            {/* Description */}
            <div className="mb-12 max-w-[448px] pb-12">
              <p className="font-body text-lg leading-[29px] text-[#44474D]">
                Our digital workspace is designed for those who demand precision. Connect with our principal consultants for sovereign editorial support and advanced case retrieval integration.
              </p>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col gap-8">
              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '16px' }}>location_on</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-body text-base leading-6 text-[#191C1E]">Verdict AI</span>
                  <span className="font-body text-sm leading-5 text-[#44474D]">
                    Capital University Of Science And<br />Technology, Islamabad
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '20px' }}>mail</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-body font-bold text-base leading-6 text-[#191C1E]">Correspondence</span>
                  <span className="font-body text-sm leading-5 text-[#44474D]">BSE231005@cust.pk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Area - Right Side */}
          <div className="lg:col-span-7 relative flex flex-col gap-12">
            {/* Abstract Design Element */}
            <div
              className="absolute w-64 h-64 -right-12 -top-12 rounded-xl pointer-events-none"
              style={{
                background: 'rgba(255, 222, 165, 0.1)',
                filter: 'blur(32px)',
              }}
            ></div>

            {/* Form Card */}
            <div
              className="relative bg-white rounded-lg overflow-hidden z-10"
              style={{
                border: '1px solid rgba(197, 198, 205, 0.1)',
                boxShadow: '0px 32px 64px -12px rgba(0, 0, 0, 0.04)',
              }}
            >
              {/* Inner overlay */}
              <div
                className="absolute inset-0 rounded-lg pointer-events-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.002)',
                }}
              ></div>

              {/* Form Content */}
              <div className="px-16 pt-16 pb-20">
                <form className="flex flex-col gap-8">
                  {/* Name + Email Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Full Name */}
                    <div className="flex flex-col gap-2">
                      <label className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#44474D]">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Daniyal Abbas"
                        className="w-full bg-transparent border-0 border-b border-[#C5C6CD] focus:border-[#E9C176] focus:ring-0 px-0 py-[14px] text-base leading-[19px] text-[#191C1E] placeholder:text-[rgba(197,198,205,0.5)] font-body outline-none transition-colors"
                      />
                    </div>

                    {/* Email Address */}
                    <div className="flex flex-col gap-2">
                      <label className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#44474D]">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="Daniyalabbas@gmail.com"
                        className="w-full bg-transparent border-0 border-b border-[#C5C6CD] focus:border-[#E9C176] focus:ring-0 px-0 py-[14px] text-base leading-[19px] text-[#191C1E] placeholder:text-[rgba(197,198,205,0.5)] font-body outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="flex flex-col gap-2">
                    <label className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#44474D]">
                      Subject of Inquiry
                    </label>
                    <input
                      type="text"
                      placeholder="Strategic Integration Query"
                      className="w-full bg-transparent border-0 border-b border-[#C5C6CD] focus:border-[#E9C176] focus:ring-0 px-0 py-[14px] text-base leading-[19px] text-[#191C1E] placeholder:text-[rgba(197,198,205,0.5)] font-body outline-none transition-colors"
                    />
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-2">
                    <label className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#44474D]">
                      Detailed Message
                    </label>
                    <textarea
                      placeholder="How may we assist in your digital evolution?"
                      rows="4"
                      className="w-full bg-transparent border-0 border-b border-[#C5C6CD] focus:border-[#E9C176] focus:ring-0 px-0 py-3 text-base leading-6 text-[#191C1E] placeholder:text-[rgba(197,198,205,0.5)] font-body outline-none resize-none transition-colors"
                    ></textarea>
                  </div>

                  {/* Submit Action */}
                  <div className="flex items-center justify-between pt-6">
                    <p className="font-body text-xs leading-4 text-[rgba(68,71,77,0.6)] max-w-[320px]">
                      By submitting, you acknowledge our professional privacy protocols and data handling standards.
                    </p>
                    <button
                      type="submit"
                      className="group relative flex items-center gap-3 bg-[#0D1C32] text-white px-10 py-5 font-body font-bold text-base leading-6 tracking-[-0.4px] overflow-hidden hover:opacity-95 transition-all"
                    >
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="relative z-10">Submit Inquiry</span>
                      <span className="material-symbols-outlined text-[#E9C176] relative z-10 text-base">arrow_forward</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Subtle Map/Location Visual */}
            <div
              className="w-full h-[192px] rounded-lg overflow-hidden opacity-40 hover:opacity-70 transition-opacity z-10"
              style={{
                border: '1px solid rgba(197, 198, 205, 0.2)',
              }}
            >
              <img
                className="w-full h-full object-cover"
                alt="Map showing Capital University location in Islamabad"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4ggiaIah6zGwPGv0wKouFlPTSb6qXfpJ-wmPyNkhU8HuFZ6XtnJjGCll-ZG3ybS6Uz0NLZ1NUaHY1pSB6ETzPK0kYoo2-kw55bZm2Nj4mjB2DGxLIwFYWed5_ajFYbKIxW31FW_ZQaDXA76HqMoq_A6JekD7Wrs9CSrpxSDFZldOIFqj-wpCgiuhJ_wiBw2qVhP5E0eiSLUlU3OzEMN4-_hNoSjtgfQC9VCPsKpVwW5JsqI2cDe2JdZlNG6-b_IkEcIMBs50k3_A"
                style={{ backgroundBlendMode: 'saturation' }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer Shell */}
      <footer className="w-full bg-[#F8F9FB] border-t border-[#F1F5F9] py-12 mt-auto">
        <div className="max-w-[1280px] mx-auto flex flex-row justify-between items-center px-8">
          {/* Brand */}
          <span className="font-body text-sm text-[#0D1C32]">Verdict AI</span>

          {/* Links */}
          <div className="flex items-center gap-8">
            <a className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors" href="#">
              Terms of Service
            </a>
            <a className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors" href="#">
              Legal Disclaimer
            </a>
          </div>

          {/* Copyright placeholder (empty per spec) */}
          <div></div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;
