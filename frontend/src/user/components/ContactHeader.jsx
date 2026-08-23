import React from 'react';

const ContactHeader = () => {
  return (
    <div className="lg:col-span-5 flex flex-col justify-center py-10 sm:py-16 lg:py-[132px]">
      {/* Eyebrow */}
      <div className="mb-4 rise-in" style={{ animationDelay: '0ms' }}>
        <span className="font-body text-[10px] sm:text-xs leading-4 tracking-[2.4px] uppercase text-[#E9C176]">
          Inquiry Channel
        </span>
      </div>

      {/* Main Heading */}
      <div className="mb-6 sm:mb-8 rise-in" style={{ animationDelay: '100ms' }}>
        <h1 className="font-headline font-normal text-[clamp(2.25rem,6.5vw,3.75rem)] leading-[1.2] tracking-[-0.05em] text-[#191C1E] text-balance">
          Establish Your Strategic Presence.
        </h1>
      </div>

      {/* Description */}
      <div className="mb-10 sm:mb-12 max-w-[448px] rise-in" style={{ animationDelay: '200ms' }}>
        <p className="font-body text-base sm:text-lg leading-[29px] text-[#44474D]">
          Our digital workspace is designed for those who demand precision. Connect with our principal consultants
          for sovereign editorial support and advanced case retrieval integration.
        </p>
      </div>

      {/* Contact Info */}
      <div className="flex flex-col gap-6 sm:gap-8 rise-in" style={{ animationDelay: '300ms' }}>
        {/* Location */}
        <div className="flex items-start gap-4">
          <div className="mt-1 shrink-0">
            <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '16px' }} aria-hidden="true">
              location_on
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-body text-base leading-6 text-[#191C1E]">Verdict AI</span>
            <span className="font-body text-sm leading-5 text-[#44474D]">
              Capital University Of Science And
              <br className="hidden sm:block" /> Technology, Islamabad
            </span>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-4">
          <div className="mt-1 shrink-0">
            <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '20px' }} aria-hidden="true">
              mail
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-body font-bold text-base leading-6 text-[#191C1E]">Correspondence</span>
            <a
              href="mailto:BSE231005@cust.pk"
              className="font-body text-sm leading-5 text-[#44474D] underline decoration-transparent underline-offset-4 transition-colors hover:text-[#0D1C32] hover:decoration-[#E9C176] break-all"
            >
              BSE231005@cust.pk
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactHeader;
