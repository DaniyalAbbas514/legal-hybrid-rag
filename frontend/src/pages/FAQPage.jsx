import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const faqData = [
  {
    question: 'How does AI search work?',
    answer:
      'Our proprietary engine utilizes deep neural networks trained specifically on sovereign legal archives. Unlike generic search models, we prioritize semantic relevance over keyword matching, ensuring that nuanced case law and historical precedents are surfaced with mathematical precision. The system operates in "Editorial Mode," meaning every result is cross-referenced with verified metadata.',
  },
  {
    question: 'How many free queries are included?',
    answer:
      'The "Atelier Access" tier includes 10 high-resolution research sessions per month at no cost. These sessions allow for full document extraction and citation analysis. For heavy usage or firm-wide integration, our Professional and Sovereign tiers offer unlimited queries with prioritized compute resources.',
  },
  {
    question: 'What data sources are indexed?',
    answer:
      'We maintain live connections to federal, appellate, and state court repositories, alongside exclusive access to private historical law libraries. Our indexing protocol runs every 6 hours, ensuring that even the most recent rulings are searchable within our interface.',
  },
  {
    question: 'Is my research confidential?',
    answer:
      'Confidentiality is the cornerstone of The Verdict AI. All sessions are protected by AES-256 encryption. We utilize zero-knowledge architecture, meaning neither our engineers nor our AI models "learn" from your specific inputs or research paths. Your workspace is a private silo.',
  },
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col bg-[#F8F9FB] min-h-screen w-full">

      {/* Header - TopNavBar Shell */}
      <header className="w-full bg-[#F8F9FB] sticky top-0 z-50">
        <nav className="flex justify-between items-center w-full px-8 py-4 h-[68px]">
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
              className="text-[#64748B] hover:text-[#0D1C32] transition-colors ml-8"
            >
              Contact
            </Link>
            <Link
              to="/faq"
              className="text-[#0D1C32] border-b-2 border-[#E9C176] pb-1 ml-8"
            >
              FAQ
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center">
            <Link to="/login" className="px-5 py-2 text-[#475569] font-body font-medium text-sm hover:text-[#0D1C32] transition-colors">
              Login
            </Link>
            <Link to="/signup" className="ml-4 px-6 py-2 bg-[#0D1C32] text-white font-body font-semibold text-sm rounded-[4px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:opacity-90 transition-opacity">
              Signup
            </Link>
          </div>
        </nav>
      </header>

      {/* Main */}
      <main className="flex-1 pt-24 pb-24 relative">

        {/* Hero Section Asymmetry */}
        <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">

          {/* Left Column */}
          <div className="lg:col-span-5 pt-12 flex flex-col items-start gap-8">
            {/* Back to Home */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[#76849F] hover:text-[#0D1C32] transition-colors"
            >
              <span className="material-symbols-outlined text-xs">arrow_back</span>
              <span className="font-body font-medium text-base leading-6">Back to Home</span>
            </Link>

            {/* Main Heading */}
            <h1 className="font-headline font-normal text-[72px] leading-[72px] tracking-[-3.6px] text-[#191C1E]">
              Clarifying the Sovereign Process
            </h1>

            {/* Description */}
            <div className="max-w-[448px] pb-4">
              <p className="font-body text-xl leading-8 text-[#44474D] max-w-[439px]">
                Welcome to the Verdict AI's knowledge base. Here we demystify the mechanics of our Case Retrieval AI and the editorial oversight of legal intelligence.
              </p>
            </div>

            {/* Gold Divider */}
            <div className="w-32 h-[1px] bg-[#E9C176]"></div>
          </div>

          {/* Right Column - Bento FAQ Grid */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {faqData.map((item, index) => (
              <div key={index} className="flex flex-col">
                {/* Accordion Header */}
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full bg-white rounded-lg p-8 flex justify-between items-center cursor-pointer hover:bg-[#F3F4F6] transition-colors text-left"
                >
                  <h3 className="font-headline font-semibold text-2xl leading-8 text-[#191C1E]">
                    {item.question}
                  </h3>
                  <span
                    className={`material-symbols-outlined text-[#44474D] transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    style={{ fontSize: '12px' }}
                  >
                    expand_more
                  </span>
                </button>

                {/* Accordion Content */}
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: openIndex === index ? '500px' : '0px',
                  }}
                >
                  <div className="bg-white px-8 pb-8 rounded-b-lg border-t border-[rgba(197,198,205,0.1)]">
                    <p className="font-body text-base leading-[26px] text-[#44474D] pt-4">
                      {item.answer}
                    </p>
                  </div>
                </div>

                {/* Horizontal Divider */}
                <div
                  className="w-full h-[1px] rounded-b-lg"
                  style={{
                    background: '#FFFFFF',
                    borderTop: '1px solid rgba(197, 198, 205, 0.1)',
                  }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary CTA Grid (Bento Style) */}
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
              {/* Background Icon */}
              <div className="absolute -bottom-8 -right-8 opacity-5">
                <span className="material-symbols-outlined text-[#191C1E]" style={{ fontSize: '120px' }}>gavel</span>
              </div>

              {/* Content */}
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
      </main>

      {/* Footer Shell */}
      <footer className="w-full bg-[#F8F9FB] border-t border-[#F1F5F9] py-20">
        <div className="max-w-[1280px] mx-auto flex flex-row justify-between items-center px-8">
          {/* Brand */}
          <span className="font-body text-sm text-[#0D1C32]">Verdict AI</span>

          {/* Links */}
          <div className="flex items-center justify-center gap-8">
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

          {/* Empty placeholder */}
          <div></div>
        </div>
      </footer>
    </div>
  );
};

export default FAQPage;
