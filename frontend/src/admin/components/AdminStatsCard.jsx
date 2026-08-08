import React from 'react';

const AdminStatsCard = ({ label, value, subtext, icon, loading }) => {
  return (
    <div className="bg-white p-8 rounded-lg relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <span className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#75777E]">{label}</span>
        {icon && (
          <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '20px' }}>
            {icon}
          </span>
        )}
      </div>
      <div className="flex flex-col">
        <span className="font-headline font-normal text-[48px] leading-[48px] text-[#0D1C32]">
          {loading ? '...' : value}
        </span>
        {subtext && (
          <div className="flex items-center gap-1 mt-2 pt-2">
            <span className="font-body text-xs leading-4 text-[#44474D]">{subtext}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStatsCard;
