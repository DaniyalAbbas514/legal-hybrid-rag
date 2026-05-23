import React from 'react';
import { Link } from 'react-router-dom';

const SignupPage = () => {
  return (
    <div className="flex flex-col bg-[#F8F9FB] min-h-screen w-full">

      {/* Header - Minimalist Brand Presence */}
      <header className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center w-full px-8 py-6 h-[80px]">
        <Link to="/" className="font-headline text-2xl text-[#0D1C32] tracking-[-1.2px] leading-8">
          Verdict AI
        </Link>
        <Link to="/faq" className="font-body font-medium text-sm leading-5 text-[#44474D] hover:text-[#0D1C32] transition-colors">
          Help
        </Link>
      </header>

      {/* Main - Split Layout */}
      <main className="flex flex-row min-h-[1141px]">

        {/* Aside - Visual Sidebar */}
        <aside className="hidden md:flex w-1/2 bg-[#0D1C32] relative overflow-hidden flex-col justify-end items-start p-16">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-40">
            <img
              className="w-full h-full object-cover"
              alt="Legal books and scale"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOwk8LRCLNWQOxXudMjecejeCLkIYrJKH42AMTp0npSto8MWO2bkEGTLckwuzCwW6gR_1DYXMBPyODQ234WAnxKch4Thv1fnQDtgmuaBD5WiOymHXVSA6bSqo5KCntrvDLlLmfGaEX0F6DLQeqlMYu1q1xulSOKb8n4NFKMx6NAWEcHtlyhohRvd33OpLSOtWP4PlsOL7OyeJMrIQggzDUnQlgzOmS2-ye649GdZbA-zaprnMD6XfobL0SkJjAffBly19stjR1lp4"
              style={{ backgroundBlendMode: 'saturation, normal', filter: 'grayscale(100%)' }}
            />
          </div>

          {/* Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(0deg, #0D1C32 0%, rgba(13, 28, 50, 0) 50%, rgba(13, 28, 50, 0) 100%)',
            }}
          ></div>

          {/* Content */}
          <div className="relative z-10 max-w-[512px] flex flex-col gap-8">
            <h1 className="font-headline font-normal text-[72px] leading-[72px] tracking-[-1.44px] text-[#E9C176]">
              The Sovereign Editorial.
            </h1>
            <p className="font-body font-light text-xl leading-7 text-[#404752] max-w-[448px]">
              Welcome to a workspace designed for the high-stakes precision of legal excellence. Impeccable organization meets modern efficiency.
            </p>
          </div>
        </aside>

        {/* Form Section */}
        <section className="flex-1 flex items-center justify-center p-24 bg-[#F8F9FB]">
          <div className="w-full max-w-[448px] flex flex-col gap-12 pb-4">

            {/* Header */}
            <div className="flex flex-col gap-2">
              <h2 className="font-headline font-normal text-4xl leading-10 tracking-[-0.72px] text-[#0D1C32]">
                Create Account
              </h2>
              <p className="font-body text-base leading-6 text-[#44474D]">
                Enter your credentials to join the workspace.
              </p>
            </div>

            {/* Form */}
            <form className="flex flex-col gap-[23.5px]">

              {/* Row for Names */}
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Daniyal"
                    className="w-full bg-white px-4 py-[13px] font-body text-sm leading-[17px] text-[#191C1E] placeholder:text-[#CBD5E1] outline-none transition-all"
                    style={{ boxShadow: '0px 0px 0px 1px rgba(197, 198, 205, 0.2)' }}
                  />
                </div>

                {/* Last Name */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Abbas"
                    className="w-full bg-white px-4 py-[13px] font-body text-sm leading-[17px] text-[#191C1E] placeholder:text-[#CBD5E1] outline-none transition-all"
                    style={{ boxShadow: '0px 0px 0px 1px rgba(197, 198, 205, 0.2)' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-[6px]">
                <label className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Daniyalabbas@gmail.com"
                  className="w-full bg-white px-4 py-[13px] font-body text-sm leading-[17px] text-[#191C1E] placeholder:text-[#CBD5E1] outline-none transition-all"
                  style={{ boxShadow: '0px 0px 0px 1px rgba(197, 198, 205, 0.2)' }}
                />
              </div>

              {/* Organization */}
              <div className="flex flex-col gap-[6px]">
                <label className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">
                  Organization
                </label>
                <input
                  type="text"
                  placeholder="The Digital Atelier"
                  className="w-full bg-white px-4 py-[13px] font-body text-sm leading-[17px] text-[#191C1E] placeholder:text-[#CBD5E1] outline-none transition-all"
                  style={{ boxShadow: '0px 0px 0px 1px rgba(197, 198, 205, 0.2)' }}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-[6px]">
                <label className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white px-4 py-[13px] font-body text-sm leading-[17px] text-[#191C1E] placeholder:text-[#CBD5E1] outline-none transition-all"
                  style={{ boxShadow: '0px 0px 0px 1px rgba(197, 198, 205, 0.2)' }}
                />
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-[6px]">
                <label className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white px-4 py-[13px] font-body text-sm leading-[17px] text-[#191C1E] placeholder:text-[#CBD5E1] outline-none transition-all"
                  style={{ boxShadow: '0px 0px 0px 1px rgba(197, 198, 205, 0.2)' }}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-4 pt-4">
                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-[#0D1C32] text-white py-4 font-body font-semibold text-base leading-6 tracking-[0.4px] text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:opacity-90 active:scale-[0.99] transition-all"
                >
                  Create Account
                </button>

                {/* Divider with "or" */}
                <div className="flex items-center justify-center py-2">
                  <div className="flex-1 h-[1px]" style={{ borderTop: '1px solid rgba(197, 198, 205, 0.2)' }}></div>
                  <span className="px-4 font-body font-semibold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">
                    or
                  </span>
                  <div className="flex-1 h-[1px]" style={{ borderTop: '1px solid rgba(197, 198, 205, 0.2)' }}></div>
                </div>

                {/* Google Sign-in Button */}
                <button
                  type="button"
                  className="w-full bg-white py-[14px] font-body font-medium text-base leading-6 text-[#0D1C32] text-center flex items-center justify-center gap-3 hover:bg-[#EDEEF0] active:scale-[0.99] transition-all"
                  style={{ border: '1px solid rgba(197, 198, 205, 0.3)' }}
                >
                  {/* Google SVG Icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.67l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>
              </div>

              {/* Footer Link */}
              <div className="flex items-center justify-center gap-1 mt-2">
                <span className="font-body text-sm leading-5 text-[#44474D]">
                  Already have an account?
                </span>
                <Link to="/login" className="font-body font-semibold text-sm leading-5 text-[#0D1C32] hover:opacity-80 transition-opacity">
                  Login
                </Link>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <footer className="w-full bg-[#F8F9FB] border-t border-[#F1F5F9] py-12">
        <div className="max-w-[1280px] mx-auto flex flex-row justify-between items-center px-8">
          <span className="font-body text-sm text-[#0D1C32]">Verdict AI</span>
          <div className="flex items-center gap-8">
            <a className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors" href="#">
              Terms of Service
            </a>
            <a className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors" href="#">
              Legal Disclaimer
            </a>
          </div>
          <div></div>
        </div>
      </footer>
    </div>
  );
};

export default SignupPage;
