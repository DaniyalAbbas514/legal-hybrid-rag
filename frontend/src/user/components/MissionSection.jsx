import React from 'react';

const MissionSection = () => {
  return (
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
  );
};

export default MissionSection;
