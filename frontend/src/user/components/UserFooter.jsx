import React from 'react';

const UserFooter = ({ showSocials = false }) => {
  return (
    <footer className="w-full bg-[#F8F9FB] border-t border-[#F1F5F9] py-12 mt-auto">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center px-8 gap-8">
        {/* Brand + Copyright */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-[#0D1C32]">Verdict AI</span>
          <span className="text-xs uppercase tracking-[1.2px] text-[#94A3B8] font-body">© 2024 Verdict AI</span>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap justify-center gap-8 text-xs uppercase tracking-[1.2px] text-[#94A3B8] font-body">
          <a className="hover:text-[#E9C176] transition-colors" href="#">Help</a>
          <a className="hover:text-[#E9C176] transition-colors" href="#">Contact</a>
          <a className="hover:text-[#E9C176] transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-[#E9C176] transition-colors" href="#">Terms of Service</a>
          <a className="hover:text-[#E9C176] transition-colors" href="#">Legal Disclaimer</a>
        </div>

        {/* Social Icons or Spacer */}
        {showSocials ? (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-xl bg-[#EDEEF0] flex items-center justify-center text-[#0D1C32] hover:bg-[#E9C176] transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">share</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#EDEEF0] flex items-center justify-center text-[#0D1C32] hover:bg-[#E9C176] transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">mail</span>
            </div>
          </div>
        ) : (
          <div className="hidden md:block w-[100px]"></div>
        )}
      </div>
    </footer>
  );
};

export default UserFooter;
