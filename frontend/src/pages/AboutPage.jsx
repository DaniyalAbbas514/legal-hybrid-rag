import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="flex flex-col items-start bg-[#F8F9FB] min-h-screen w-full">

      {/* TopNavBar Navigation Shell */}
      <header className="w-full bg-[#F8F9FB] sticky top-0 z-50">
        <nav className="flex justify-between items-center w-full px-8 py-4 h-[72px]">
          {/* Brand */}
          <Link to="/" className="font-headline text-2xl text-[#0D1C32] tracking-[-1.2px] leading-8">
            Verdict AI
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center font-headline text-lg tracking-[-0.45px]">
            <Link
              to="/about"
              className="text-[#0D1C32] border-b-2 border-[#E9C176] pb-1 hover:text-[#0D1C32] transition-colors"
            >
              About
            </Link>
            <Link className="text-[#64748B] hover:text-[#0D1C32] transition-colors pl-8" to="/contact">
              Contact
            </Link>
            <Link className="text-[#64748B] font-semibold hover:text-[#0D1C32] transition-colors pl-8" to="/faq">
              FAQ
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center">
            <Link to="/login" className="px-5 py-2 text-[#0D1C32] font-semibold font-headline text-base hover:opacity-80 transition-opacity">
              Login
            </Link>
            <Link to="/signup" className="ml-4 px-6 py-2 bg-[#0D1C32] text-white font-semibold font-headline rounded-lg text-base hover:opacity-90 transition-opacity">
              Signup
            </Link>
          </div>
        </nav>
      </header>

      <main className="w-full flex flex-col items-center pt-16 pb-24 gap-32">

        {/* Back to Home Link */}
        <div className="w-full max-w-[1216px] mx-auto px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-[#76849F] hover:text-[#0D1C32] transition-colors group">
            <span className="material-symbols-outlined text-xs">arrow_back</span>
            <span className="font-body font-medium text-base leading-6">Back to Home</span>
          </Link>
        </div>

        {/* Hero Section: Editorial Masthead */}
        <section className="w-full max-w-[1216px] mx-auto px-8">
          <div className="relative min-h-[264px]">
            {/* Left Column */}
            <div className="max-w-[794px]">
              {/* Eyebrow */}
              <div className="mb-6">
                <span className="font-body text-xs leading-4 tracking-[3.6px] uppercase text-[#44474D]">
                  Legacy Meets Intelligence
                </span>
              </div>
              {/* Main Heading */}
              <h1 className="font-headline font-normal text-[96px] leading-[96px] tracking-[-4.8px] text-[#191C1E]">
                The Sovereignty of<br />Legal Thought.
              </h1>
            </div>

            {/* Right Column - Description with gold border */}
            <div className="absolute right-0 bottom-0 max-w-[373px] pb-4">
              <div className="border-l-2 border-[#E9C176] pl-6">
                <p className="font-body text-lg leading-[29px] text-[#44474D]">
                  We are crafting a digital sanctuary where the weight of historical precedent meets the velocity of modern computation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section - Mission Statement: Tonal Depth Card */}
        <section className="w-full max-w-[1216px] mx-auto px-8">
          <div className="relative bg-white w-full h-[792px] overflow-hidden" style={{ boxShadow: '0px 32px 64px -12px rgba(25, 28, 30, 0.04)' }}>
            {/* Overlay */}
            <div className="absolute inset-0 bg-white/[0.002]"></div>

            {/* Text Content - Left */}
            <div className="absolute left-[96px] top-[218px] flex flex-col items-start gap-8 max-w-[480px]">
              {/* Heading */}
              <h2 className="font-headline font-normal text-4xl leading-10 tracking-[-0.9px] text-[#191C1E] w-full">
                Our Mission
              </h2>

              {/* Description */}
              <p className="font-body text-lg leading-9 text-[#44474D] w-full">
                At The Verdict AI, we believe that legal research is not just a task, but an art form. Our mission is to store Pakistan Supreme Court Judgement. By eliminating the friction of manual case retrieval, we empower lawyers to return to what matters most: strategy, advocacy, and the pursuit of justice.
              </p>

              {/* CTA Button */}
              <div className="pt-4">
                <button className="group flex items-center gap-3 font-body font-bold text-sm uppercase tracking-[1.4px] text-[#0D1C32]">
                  Explore our philosophy
                  <span className="material-symbols-outlined text-base text-[#0D1C32] transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Image - Right */}
            <div className="absolute left-[640px] right-[96px] top-[96px] h-[600px] flex flex-col justify-center items-start">
              <div className="relative w-full h-full overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  alt="Prestige Library"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC7a7pRtRpgISXb95fspIPDFKkp0sqsjgGFBRoOFBhVsYqKaAHF8HpVs2MaxiDKCmNQlcEEjn3P2TM64A04HTqvrNEx-1gihXFsX7Ut4yeyA7fJOKu63i0apQjZMsJLOAG98vUq64cJ9KDR35kXoghlRhS907ZvoJjxU2uXDpSM1gcit9DlnvOYv15MI0vawAVtFsiDBm2Q5tvM7Y6GcIVy5hhLvV92TUPzv0zPDCWdh9eX3HLg_d8JL0b1h4ldQn7ylg-lpOngPk"
                  style={{ backgroundBlendMode: 'saturation, normal' }}
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-[rgba(13,28,50,0.1)]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Section - Stats Bento Grid */}
        <section className="w-full max-w-[1216px] mx-auto px-8">
          <div className="relative w-full h-[256px]">
            {/* Stat 1 - Active Practitioners (Light) */}
            <div className="absolute left-0 top-0 h-[256px] bg-[#EDEEF0] flex flex-col justify-between p-10" style={{ right: 'calc(100% - 33.33%)' }}>
              {/* Icon */}
              <div>
                <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '18px' }}>groups</span>
              </div>
              {/* Stats */}
              <div className="flex flex-col gap-2">
                <span className="font-headline font-normal text-[48px] leading-[48px] tracking-[-2.4px] text-[#191C1E]">
                  12,400+
                </span>
                <span className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">
                  Active Practitioners
                </span>
              </div>
            </div>

            {/* Stat 2 - Queries Processed (Dark) */}
            <div className="absolute top-0 h-[256px] bg-[#0D1C32] flex flex-col justify-between p-10" style={{ left: '33.33%', right: '33.33%' }}>
              {/* Icon */}
              <div>
                <span className="material-symbols-outlined text-[#FFDEA5]" style={{ fontSize: '30px' }}>bolt</span>
              </div>
              {/* Stats */}
              <div className="flex flex-col gap-2">
                <span className="font-headline font-normal text-[48px] leading-[48px] tracking-[-2.4px] text-white">
                  2.8M
                </span>
                <span className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#76849F]">
                  Queries Processed
                </span>
              </div>
            </div>

            {/* Stat 3 - Citation Accuracy (Light) */}
            <div className="absolute top-0 right-0 h-[256px] bg-[#EDEEF0] flex flex-col justify-between p-10" style={{ left: '66.67%' }}>
              {/* Icon */}
              <div>
                <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '28.5px' }}>gavel</span>
              </div>
              {/* Stats */}
              <div className="flex flex-col gap-2">
                <span className="font-headline font-normal text-[48px] leading-[48px] tracking-[-2.4px] text-[#191C1E]">
                  99.8%
                </span>
                <span className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">
                  Citation Accuracy
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section - Benefits for Lawyers: Asymmetric Layout */}
        <section className="w-full max-w-[1280px] mx-auto px-8">
          {/* Section Header */}
          <div className="flex flex-col items-start gap-4 mb-16">
            <h2 className="font-headline font-normal text-[48px] leading-[48px] tracking-[-1.2px] text-[#191C1E] w-full">
              Precision as a Service
            </h2>
            <div className="w-24 h-1 bg-[#E9C176]"></div>
          </div>

          {/* Asymmetric Grid */}
          <div className="relative w-full h-[452px]">
            {/* Left Column */}
            <div className="absolute left-0 top-0 flex flex-col gap-16 pb-32" style={{ right: 'calc(100% - 560px)', maxWidth: '560px' }}>
              {/* Feature 1 - Sovereign Editorial Focus */}
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-6">
                  <span className="font-headline italic font-normal text-[30px] leading-9 text-[#E9C176]">01</span>
                  <h3 className="font-headline font-semibold text-2xl leading-8 text-[#191C1E]">Sovereign Editorial Focus</h3>
                </div>
                <div className="pl-14">
                  <p className="font-body text-base leading-[26px] text-[#44474D]">
                    Our interface is designed to disappear. We provide a clean, distraction-free environment that prioritizes deep reading and synthesis over clicking through endless tabs.
                  </p>
                </div>
              </div>

              {/* Feature 2 - Calculated Discovery */}
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-6">
                  <span className="font-headline italic font-normal text-[30px] leading-9 text-[#E9C176]">03</span>
                  <h3 className="font-headline font-semibold text-2xl leading-8 text-[#191C1E]">Calculated Discovery</h3>
                </div>
                <div className="pl-14">
                  <p className="font-body text-base leading-[26px] text-[#44474D]">
                    Utilize advanced neural retrieval to find the 'needle in the haystack'—hidden precedents and subtle judicial shifts that standard keyword searches miss.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column (offset down) */}
            <div className="absolute top-0 right-0 pt-32" style={{ left: '656px', maxWidth: '560px' }}>
              <div className="flex flex-col gap-16">
                {/* Feature 3 - Institutional Memory */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-6">
                    <span className="font-headline italic font-normal text-[30px] leading-9 text-[#E9C176]">02</span>
                    <h3 className="font-headline font-semibold text-2xl leading-8 text-[#191C1E]">Institutional Memory</h3>
                  </div>
                  <div className="pl-14">
                    <p className="font-body text-base leading-[26px] text-[#44474D]">
                      Every research session is securely archived, creating a growing private knowledge base for your firm that gets smarter with every case reviewed.
                    </p>
                  </div>
                </div>

                {/* Feature 4 - Verification Engine */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-6">
                    <span className="font-headline italic font-normal text-[30px] leading-9 text-[#E9C176]">04</span>
                    <h3 className="font-headline font-semibold text-2xl leading-8 text-[#191C1E]">Verification Engine</h3>
                  </div>
                  <div className="pl-14">
                    <p className="font-body text-base leading-[26px] text-[#44474D]">
                      Every insight is cross-referenced in real-time against current statutes to ensure that your arguments are built on solid, up-to-date legal ground.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full max-w-[832px] mx-auto px-8">
          <div className="bg-[#F3F4F6] border-t border-[rgba(197,198,205,0.1)] py-20 px-12 flex flex-col items-start gap-8">
            {/* Heading */}
            <div className="w-full flex justify-center">
              <h2 className="font-headline font-medium text-4xl leading-10 text-center text-[#191C1E]">
                Ready to elevate your practice?
              </h2>
            </div>

            {/* Buttons */}
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
      </main>

      {/* Footer Shell */}
      <footer className="w-full bg-[#F8F9FB] border-t border-[#F1F5F9] py-12">
        <div className="max-w-[1280px] mx-auto flex flex-row justify-between items-center px-8">
          {/* Brand */}
          <span className="font-body text-sm text-[#0D1C32]">Verdict AI</span>

          {/* Links */}
          <div className="flex items-start">
            <a className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#475569] hover:text-[#E9C176] transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#475569] hover:text-[#E9C176] transition-colors pl-8" href="#">
              Terms of Service
            </a>
            <a className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#475569] hover:text-[#E9C176] transition-colors pl-8" href="#">
              Legal Disclaimer
            </a>
          </div>

          {/* Copyright */}
          <span className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#94A3B8]">
            © 2024 Verdict AI. All Rights Reserved.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
