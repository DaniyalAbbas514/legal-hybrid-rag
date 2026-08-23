import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { key: 'about', label: 'About', to: '/about' },
  { key: 'contact', label: 'Contact', to: '/contact' },
  { key: 'faq', label: 'FAQ', to: '/faq' },
];

const UserHeader = ({ activePage = '' }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on Escape and return focus to the toggle
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header
        className={`w-full bg-[#F8F9FB] sticky top-0 z-50 transition-shadow duration-300 ${
          scrolled ? 'shadow-[0_1px_0_0_rgba(197,198,205,0.5),0_8px_24px_-16px_rgba(13,28,50,0.25)]' : ''
        }`}
      >
        <nav
          aria-label="Main"
          className="flex justify-between items-center w-full max-w-[1440px] mx-auto px-5 sm:px-8 py-4 h-[72px] gap-4"
        >
          {/* Brand */}
          <Link
            to="/"
            className="font-headline font-bold text-xl sm:text-2xl text-[#0D1C32] tracking-[-1.2px] leading-8 transition-opacity hover:opacity-80 shrink-0"
          >
            Verdict AI
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-10 font-headline text-lg font-semibold tracking-[-0.45px]">
            {NAV_LINKS.map(({ key, label, to }) => {
              const isActive = activePage === key;
              return (
                <Link
                  key={key}
                  to={to}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group relative pb-1 transition-colors duration-200 ${
                    isActive ? 'text-[#0D1C32]' : 'text-[#64748B] hover:text-[#0D1C32]'
                  }`}
                >
                  {label}
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-0 bottom-0 h-[2px] w-full bg-[#E9C176] origin-left transition-transform duration-300 ease-out ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Auth actions */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              to="/login"
              className="hidden sm:inline-block text-[#475569] font-medium text-base hover:text-[#0D1C32] transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-[#0D1C32] text-white px-5 sm:px-6 py-2.5 rounded shadow-sm text-sm font-semibold tracking-[0.35px] transition-all duration-200 hover:shadow-[0_8px_20px_-8px_rgba(13,28,50,0.6)] hover:-translate-y-px active:translate-y-0 active:scale-[0.98]"
            >
              Signup
            </Link>

            {/* Mobile menu toggle */}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden w-11 h-11 -mr-2 flex items-center justify-center text-[#0D1C32] rounded transition-colors hover:bg-[#EDEEF0]"
            >
              <span className="material-symbols-outlined text-2xl">{menuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </nav>

        {/* Mobile nav panel */}
        <div
          id="mobile-nav"
          className={`md:hidden overflow-hidden border-t border-[rgba(197,198,205,0.4)] bg-[#F8F9FB] transition-[max-height,opacity] duration-300 ease-out ${
            menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col px-5 sm:px-8 py-3" aria-hidden={!menuOpen}>
            {NAV_LINKS.map(({ key, label, to }) => {
              const isActive = activePage === key;
              return (
                <Link
                  key={key}
                  to={to}
                  tabIndex={menuOpen ? 0 : -1}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={`font-headline text-lg font-semibold tracking-[-0.45px] py-3 border-l-2 pl-4 transition-colors ${
                    isActive
                      ? 'text-[#0D1C32] border-[#E9C176]'
                      : 'text-[#64748B] border-transparent hover:text-[#0D1C32] hover:border-[rgba(233,193,118,0.5)]'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <Link
              to="/login"
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
              className="sm:hidden font-headline text-lg font-semibold tracking-[-0.45px] py-3 border-l-2 border-transparent pl-4 text-[#64748B] hover:text-[#0D1C32] transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default UserHeader;
