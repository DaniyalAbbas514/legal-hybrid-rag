import React from 'react';

const StatsSection = () => {
  return (
    <section className="w-full max-w-[1216px] mx-auto px-8">
      <div className="relative w-full h-[256px]">
        {/* Stat 1 - Active Practitioners (Light) */}
        <div className="absolute left-0 top-0 h-[256px] bg-[#EDEEF0] flex flex-col justify-between p-10" style={{ right: 'calc(100% - 33.33%)' }}>
          {/* Icon */}
          <div>
            <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '18px' }}>groups</span>
          </div>
          {/* Stats */}
          <div className="flex flex-col gap-2">
            <span className="font-headline font-normal text-[48px] leading-[48px] tracking-[-2.4px] text-[#191C1E]">
              12,400+
            </span>
            <span className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">
              Active Practitioners
            </span>
          </div>
        </div>

        {/* Stat 2 - Queries Processed (Dark) */}
        <div className="absolute top-0 h-[256px] bg-[#0D1C32] flex flex-col justify-between p-10" style={{ left: '33.33%', right: '33.33%' }}>
          {/* Icon */}
          <div>
            <span className="material-symbols-outlined text-[#FFDEA5]" style={{ fontSize: '30px' }}>bolt</span>
          </div>
          {/* Stats */}
          <div className="flex flex-col gap-2">
            <span className="font-headline font-normal text-[48px] leading-[48px] tracking-[-2.4px] text-white">
              2.8M
            </span>
            <span className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#76849F]">
              Queries Processed
            </span>
          </div>
        </div>

        {/* Stat 3 - Citation Accuracy (Light) */}
        <div className="absolute top-0 right-0 h-[256px] bg-[#EDEEF0] flex flex-col justify-between p-10" style={{ left: '66.67%' }}>
          {/* Icon */}
          <div>
            <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '28.5px' }}>gavel</span>
          </div>
          {/* Stats */}
          <div className="flex flex-col gap-2">
            <span className="font-headline font-normal text-[48px] leading-[48px] tracking-[-2.4px] text-[#191C1E]">
              99.8%
            </span>
            <span className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">
              Citation Accuracy
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
