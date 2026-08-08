import React from 'react';

const AboutHero = () => {
  return (
    <section className="w-full max-w-[1216px] mx-auto px-8">
      <div className="relative min-h-[264px]">
        <div className="max-w-[794px]">
          <div className="mb-6">
            <span className="font-body text-xs leading-4 tracking-[3.6px] uppercase text-[#44474D]">
              Legacy Meets Intelligence
            </span>
          </div>
          <h1 className="font-headline font-normal text-[96px] leading-[96px] tracking-[-4.8px] text-[#191C1E]">
            The Sovereignty of<br />Legal Thought.
          </h1>
        </div>

        <div className="absolute right-0 bottom-0 max-w-[373px] pb-4">
          <div className="border-l-2 border-[#E9C176] pl-6">
            <p className="font-body text-lg leading-[29px] text-[#44474D]">
              We are crafting a digital sanctuary where the weight of historical precedent meets the velocity of modern computation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
