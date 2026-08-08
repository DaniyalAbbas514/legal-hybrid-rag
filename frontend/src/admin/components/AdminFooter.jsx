import React from 'react';

const AdminFooter = () => {
  return (
    <footer className="w-full py-12 border-t border-[#F1F5F9] bg-[#F8F9FB] mt-auto">
      <div className="max-w-full mx-auto flex flex-row justify-between items-center px-8">
        <span className="font-body text-sm leading-5 text-[#0D1C32]">Verdict AI</span>
        <div className="flex items-center gap-8">
          <a
            className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors"
            href="#"
          >
            Privacy Policy
          </a>
          <a
            className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors"
            href="#"
          >
            Terms of Service
          </a>
          <a
            className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors"
            href="#"
          >
            Legal Disclaimer
          </a>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
