import React from 'react';

const BenefitsSection = () => {
  return (
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
  );
};

export default BenefitsSection;
