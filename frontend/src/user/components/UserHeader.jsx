import React from 'react';
import { Link } from 'react-router-dom';

const UserHeader = ({ activePage = '' }) => {
  return (
    <header className="w-full bg-[#F8F9FB] sticky top-0 z-50">
      <nav className="flex justify-between items-center w-full px-8 py-4 h-[72px]">
        {/* Brand */}
        <Link to="/" className="font-headline font-bold text-2xl text-[#0D1C32] tracking-[-1.2px] leading-8">
          Verdict AI
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-10 font-headline text-lg font-semibold tracking-[-0.45px]">
          <Link
            className={`transition-colors ${
              activePage === 'about'
                ? 'text-[#0D1C32] border-b-2 border-[#E9C176] pb-1'
                : 'text-[#64748B] hover:text-[#0D1C32]'
            }`}
            to="/about"
          >
            About
          </Link>
          <Link
            className={`transition-colors ${
              activePage === 'contact'
                ? 'text-[#0D1C32] border-b-2 border-[#E9C176] pb-1'
                : 'text-[#64748B] hover:text-[#0D1C32]'
            }`}
            to="/contact"
          >
            Contact
          </Link>
          <Link
            className={`transition-colors ${
              activePage === 'faq'
                ? 'text-[#0D1C32] border-b-2 border-[#E9C176] pb-1'
                : 'text-[#64748B] hover:text-[#0D1C32]'
            }`}
            to="/faq"
          >
            FAQ
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-6">
          <Link
            to="/login"
            className="text-[#475569] font-medium text-base hover:text-[#0D1C32] transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-[#0D1C32] text-white px-6 py-2.5 rounded shadow-sm text-sm font-semibold tracking-[0.35px] hover:opacity-90 transition-opacity"
          >
            Signup
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default UserHeader;
