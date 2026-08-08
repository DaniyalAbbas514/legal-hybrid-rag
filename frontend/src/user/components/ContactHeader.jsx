import React from 'react';

const ContactHeader = () => {
  return (
    <div className="lg:col-span-5 flex flex-col justify-center py-[132px]">
      {/* Eyebrow */}
      <div className="mb-4 pb-4">
        <span className="font-body text-xs leading-4 tracking-[2.4px] uppercase text-[#E9C176]">
          Inquiry Channel
        </span>
      </div>

      {/* Main Heading */}
      <div className="mb-8 pb-8">
        <h1 className="font-headline font-normal text-[60px] leading-[75px] tracking-[-3px] text-[#191C1E]">
          Establish Your Strategic Presence.
        </h1>
      </div>

      {/* Description */}
      <div className="mb-12 max-w-[448px] pb-12">
        <p className="font-body text-lg leading-[29px] text-[#44474D]">
          Our digital workspace is designed for those who demand precision. Connect with our principal consultants for sovereign editorial support and advanced case retrieval integration.
        </p>
      </div>

      {/* Contact Info */}
      <div className="flex flex-col gap-8">
        {/* Location */}
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '16px' }}>location_on</span>
          </div>
          <div className="flex flex-col">
            <span className="font-body text-base leading-6 text-[#191C1E]">Verdict AI</span>
            <span className="font-body text-sm leading-5 text-[#44474D]">
              Capital University Of Science And<br />Technology, Islamabad
            </span>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '20px' }}>mail</span>
          </div>
          <div className="flex flex-col">
            <span className="font-body font-bold text-base leading-6 text-[#191C1E]">Correspondence</span>
            <span className="font-body text-sm leading-5 text-[#44474D]">BSE231005@cust.pk</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactHeader;
