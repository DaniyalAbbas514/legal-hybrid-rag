import React from 'react';

const AboutHero = () => {
  return (
    <section className="w-full max-w-[1216px] mx-auto px-5 sm:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-end">
        <div className="lg:col-span-8 max-w-[794px]">
          <div className="mb-6 rise-in" style={{ animationDelay: '0ms' }}>
            <span className="font-body text-[10px] sm:text-xs leading-4 tracking-[3.6px] uppercase text-[#44474D]">
              Legacy Meets Intelligence
            </span>
          </div>
          <h1
            className="rise-in font-headline font-normal text-[clamp(2.5rem,9vw,6rem)] leading-[1.02] tracking-[-0.05em] text-[#191C1E] text-balance"
            style={{ animationDelay: '110ms' }}
          >
            The Sovereignty of
            <br />
            Legal Thought.
          </h1>
        </div>

        <div className="lg:col-span-4 lg:max-w-[373px] lg:justify-self-end lg:pb-4">
          <div
            className="rise-in border-l-2 border-[#E9C176] pl-6"
            style={{ animationDelay: '240ms' }}
          >
            <p className="font-body text-base sm:text-lg leading-[29px] text-[#44474D]">
              We are crafting a digital sanctuary where the weight of historical precedent meets the velocity of
              modern computation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
