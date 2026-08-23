import React from 'react';
import Reveal from './Reveal';

const BENEFITS = [
  {
    number: '01',
    title: 'Sovereign Editorial Focus',
    body: 'Our interface is designed to disappear. We provide a clean, distraction-free environment that prioritizes deep reading and synthesis over clicking through endless tabs.',
  },
  {
    number: '02',
    title: 'Institutional Memory',
    body: 'Every research session is securely archived, creating a growing private knowledge base for your firm that gets smarter with every case reviewed.',
  },
  {
    number: '03',
    title: 'Calculated Discovery',
    body: "Utilize advanced neural retrieval to find the 'needle in the haystack'—hidden precedents and subtle judicial shifts that standard keyword searches miss.",
  },
  {
    number: '04',
    title: 'Verification Engine',
    body: 'Every insight is cross-referenced in real-time against current statutes to ensure that your arguments are built on solid, up-to-date legal ground.',
  },
];

const BenefitsSection = () => {
  return (
    <section className="w-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:pb-32">
      {/* Section Header */}
      <div className="flex flex-col items-start gap-4 mb-12 md:mb-16">
        <Reveal
          as="h2"
          className="font-headline font-normal text-[clamp(2rem,5vw,3rem)] leading-[1.05] tracking-[-0.025em] text-[#191C1E] w-full"
        >
          Precision as a Service
        </Reveal>
        <Reveal delay={110} variant="left" className="w-24 h-1 bg-[#E9C176]" />
      </div>

      {/* Two-column asymmetric grid. DOM order stays 01-04 so the single-column
          mobile flow reads in sequence; the right column keeps its editorial
          offset on large screens via a transform on the wrapper. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-x-24 lg:gap-y-16">
        {BENEFITS.map(({ number, title, body }, index) => {
          const isRightColumn = index % 2 === 1;
          return (
            <div key={number} className={isRightColumn ? 'lg:translate-y-32' : undefined}>
              <Reveal delay={isRightColumn ? 90 : 0} className="group flex flex-col gap-4">
                <div className="flex items-start gap-4 sm:gap-6">
                  <span className="font-headline italic font-normal text-2xl sm:text-[30px] leading-9 text-[#E9C176] transition-transform duration-300 group-hover:-translate-y-0.5">
                    {number}
                  </span>
                  <h3 className="font-headline font-semibold text-xl sm:text-2xl leading-8 text-[#191C1E]">
                    {title}
                  </h3>
                </div>
                <div className="pl-10 sm:pl-14">
                  <p className="font-body text-base leading-[26px] text-[#44474D]">{body}</p>
                </div>
              </Reveal>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default BenefitsSection;
