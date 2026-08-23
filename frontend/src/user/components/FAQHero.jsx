import React from 'react';

const FAQHero = () => {
  return (
    <div className="lg:col-span-5 lg:pt-12 flex flex-col items-start gap-6 sm:gap-8">
      {/* Main Heading */}
      <h1
        className="rise-in font-headline font-normal text-[clamp(2.25rem,7vw,4.5rem)] leading-[1.02] tracking-[-0.05em] text-[#191C1E] text-balance"
        style={{ animationDelay: '0ms' }}
      >
        Clarifying the Sovereign Process
      </h1>

      {/* Description */}
      <div className="max-w-[448px]">
        <p className="rise-in font-body text-base sm:text-lg lg:text-xl leading-8 text-[#44474D]" style={{ animationDelay: '120ms' }}>
          Welcome to the Verdict AI's knowledge base. Here we demystify the mechanics of our Case Retrieval AI and
          the editorial oversight of legal intelligence.
        </p>
      </div>

      {/* Gold Divider */}
      <div className="rise-in w-32 h-[1px] bg-[#E9C176]" style={{ animationDelay: '220ms' }}></div>
    </div>
  );
};

export default FAQHero;
