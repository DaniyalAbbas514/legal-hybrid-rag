import React from 'react';

const FOOTER_LINKS = ['Help', 'Contact', 'Privacy Policy', 'Terms of Service', 'Legal Disclaimer'];

const UserFooter = ({ showSocials = false }) => {
  return (
    <footer className="w-full bg-[#F8F9FB] border-t border-[#F1F5F9] py-10 sm:py-12 mt-auto">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center px-5 sm:px-8 gap-8">
        {/* Brand + Copyright */}
        <div className="flex flex-col gap-2 items-center md:items-start">
          <span className="text-sm font-bold text-[#0D1C32]">Verdict AI</span>
          <span className="text-xs uppercase tracking-[1.2px] text-[#94A3B8] font-body">© 2024 Verdict AI</span>
        </div>

        {/* Footer Links */}
        <nav
          aria-label="Footer"
          className="flex flex-wrap justify-center gap-x-6 gap-y-3 sm:gap-8 text-xs uppercase tracking-[1.2px] text-[#94A3B8] font-body"
        >
          {FOOTER_LINKS.map((label) => (
            <a
              key={label}
              className="relative py-1 transition-colors duration-200 hover:text-[#E9C176] after:pointer-events-none after:absolute after:left-0 after:bottom-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#E9C176] after:transition-transform after:duration-300 hover:after:scale-x-100"
              href="#"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Social Icons or Spacer */}
        {showSocials ? (
          <div className="flex gap-4">
            <button
              type="button"
              aria-label="Share"
              className="w-11 h-11 rounded-xl bg-[#EDEEF0] flex items-center justify-center text-[#0D1C32] transition-all duration-200 hover:bg-[#E9C176] hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                share
              </span>
            </button>
            <button
              type="button"
              aria-label="Email us"
              className="w-11 h-11 rounded-xl bg-[#EDEEF0] flex items-center justify-center text-[#0D1C32] transition-all duration-200 hover:bg-[#E9C176] hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                mail
              </span>
            </button>
          </div>
        ) : (
          <div className="hidden md:block w-[100px]"></div>
        )}
      </div>
    </footer>
  );
};

export default UserFooter;
