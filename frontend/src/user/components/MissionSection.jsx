import React from 'react';
import Reveal from './Reveal';

const MissionSection = () => {
  return (
    <section className="w-full max-w-[1216px] mx-auto px-5 sm:px-8">
      <Reveal
        variant="fade"
        className="relative bg-white w-full overflow-hidden"
        style={{ boxShadow: '0px 32px 64px -12px rgba(25, 28, 30, 0.04)' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-16 p-8 sm:p-12 lg:p-24">
          {/* Text Content */}
          <div className="flex flex-col items-start gap-6 sm:gap-8 max-w-[480px] order-2 lg:order-1">
            <Reveal
              as="h2"
              variant="left"
              className="font-headline font-normal text-[clamp(1.75rem,4.5vw,2.25rem)] leading-tight tracking-[-0.025em] text-[#191C1E] w-full"
            >
              Our Mission
            </Reveal>

            <Reveal
              as="p"
              variant="left"
              delay={110}
              className="font-body text-base sm:text-lg leading-8 lg:leading-9 text-[#44474D] w-full"
            >
              At The Verdict AI, we believe that legal research is not just a task, but an art form. Our mission is
              to store Pakistan Supreme Court Judgement. By eliminating the friction of manual case retrieval, we
              empower lawyers to return to what matters most: strategy, advocacy, and the pursuit of justice.
            </Reveal>

            <Reveal variant="left" delay={200} className="pt-2 sm:pt-4">
              <button
                type="button"
                className="group flex items-center gap-3 font-body font-bold text-sm uppercase tracking-[1.4px] text-[#0D1C32] py-2 transition-opacity hover:opacity-80"
              >
                Explore our philosophy
                <span
                  className="material-symbols-outlined text-base text-[#0D1C32] transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  arrow_forward
                </span>
              </button>
            </Reveal>
          </div>

          {/* Image */}
          <Reveal
            variant="scale"
            delay={120}
            className="relative w-full aspect-[4/5] sm:aspect-[16/12] lg:aspect-[480/600] overflow-hidden order-1 lg:order-2 group"
          >
            <img
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              alt="Prestige Library"
              loading="lazy"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC7a7pRtRpgISXb95fspIPDFKkp0sqsjgGFBRoOFBhVsYqKaAHF8HpVs2MaxiDKCmNQlcEEjn3P2TM64A04HTqvrNEx-1gihXFsX7Ut4yeyA7fJOKu63i0apQjZMsJLOAG98vUq64cJ9KDR35kXoghlRhS907ZvoJjxU2uXDpSM1gcit9DlnvOYv15MI0vawAVtFsiDBm2Q5tvM7Y6GcIVy5hhLvV92TUPzv0zPDCWdh9eX3HLg_d8JL0b1h4ldQn7ylg-lpOngPk"
              style={{ backgroundBlendMode: 'saturation, normal' }}
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-[rgba(13,28,50,0.1)]"></div>
          </Reveal>
        </div>
      </Reveal>
    </section>
  );
};

export default MissionSection;
