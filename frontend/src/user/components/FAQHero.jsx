import React from 'react';

const FAQHero = () => {
  return (
    <div className="lg:col-span-5 pt-12 flex flex-col items-start gap-8">
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
  );
};

export default FAQHero;
