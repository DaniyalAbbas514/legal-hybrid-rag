import React from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className="flex flex-col bg-[#F8F9FB] min-h-screen w-full">

      {/* Header - Top Navigation Anchor */}
      <header className="w-full bg-[#F8F9FB] sticky top-0 z-50">
        <nav className="flex justify-between items-center w-full px-8 py-4 h-[68px]">
          {/* Brand */}
          <Link to="/" className="font-headline text-2xl text-[#0D1C32] tracking-[-1.2px] leading-8">
            Verdict AI
          </Link>

          {/* Home Button */}
          <Link
            to="/"
            className="bg-[#0D1C32] text-white px-6 py-2 rounded-[2px] font-body text-sm leading-5 tracking-[1.4px] uppercase text-center hover:opacity-90 transition-opacity"
          >
            Home
          </Link>
        </nav>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-4 py-16 relative overflow-hidden">

        {/* Aesthetic Background Elements */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: '600px',
            height: '600px',
            right: '-150px',
            top: '-300px',
            background: 'rgba(233, 193, 118, 0.1)',
            filter: 'blur(60px)',
            borderRadius: '12px',
          }}
        ></div>
        <div
          className="absolute pointer-events-none"
          style={{
            width: '400px',
            height: '400px',
            left: '-100px',
            bottom: '-200px',
            background: 'rgba(13, 28, 50, 0.05)',
            filter: 'blur(50px)',
            borderRadius: '12px',
          }}
        ></div>

        {/* Login Container */}
        <div
          className="w-full max-w-[1024px] grid md:grid-cols-2 bg-white overflow-hidden z-10"
          style={{ boxShadow: '0px 32px 64px -12px rgba(0, 0, 0, 0.04)' }}
        >

          {/* Branding/Visual Side */}
          <div className="hidden md:flex bg-[#0D1C32] relative p-12 flex-col justify-center overflow-hidden">
            <div className="flex flex-col justify-between h-full relative z-10">
              {/* Top Content */}
              <div className="flex flex-col gap-6">
                {/* Heading */}
                <h2 className="font-headline font-normal text-[48px] leading-[60px] tracking-[-1.2px] text-white">
                  Sovereign Editorial Intelligence.
                </h2>

                {/* Description */}
                <p className="font-body text-lg leading-[29px] text-[#76849F] max-w-[320px]">
                  Access your private workspace where complex data meets intellectual clarity.
                </p>
              </div>

              {/* Feature Callout */}
              <div className="flex items-center gap-4 mt-auto pt-8">
                <div
                  className="w-12 h-12 flex items-center justify-center rounded-xl"
                  style={{ border: '1px solid rgba(118, 132, 159, 0.3)' }}
                >
                  <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '18px' }}>gavel</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-body font-semibold text-sm leading-5 tracking-[1.4px] uppercase text-[#FFDEA5]">
                    Legal Integrity
                  </span>
                  <span className="font-body text-xs leading-4 text-[#76849F]">
                    Bank-grade encryption for every case.
                  </span>
                </div>
              </div>
            </div>

            {/* Decorative Abstract Element */}
            <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
              <div
                className="w-full h-full"
                style={{
                  background: 'linear-gradient(135deg, #E9C176 0%, rgba(233, 193, 118, 0) 100%)',
                  borderRadius: '12px 0px 0px 0px',
                }}
              ></div>
            </div>
          </div>

          {/* Form Side */}
          <div className="p-16 flex flex-col justify-center">

            {/* Header */}
            <div className="mb-10 pb-10 flex flex-col gap-2">
              <h1 className="font-headline font-normal text-[30px] leading-9 text-[#191C1E]">
                Welcome Back
              </h1>
              <p className="font-body text-sm leading-5 text-[#44474D]">
                Please enter your credentials to continue.
              </p>
            </div>

            {/* Form */}
            <form className="flex flex-col gap-6">

              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Daniyalabbas@gmail.com"
                  className="w-full bg-[#F3F4F6] px-4 py-[14px] font-body text-base leading-[19px] text-[#191C1E] placeholder:text-[#C5C6CD] outline-none border-none transition-all focus:ring-2 focus:ring-[#E9C176]"
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="font-body font-bold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">
                    Password
                  </label>
                  <a
                    href="#"
                    className="font-body text-[10px] leading-[15px] tracking-[-0.5px] uppercase text-[#A17F3B] hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-[#F3F4F6] px-4 py-[14px] font-body text-base leading-[19px] text-[#191C1E] placeholder:text-[#C5C6CD] outline-none border-none transition-all focus:ring-2 focus:ring-[#E9C176]"
                />
              </div>

              {/* Primary Action - Login Button */}
              <button
                type="submit"
                className="w-full bg-[#0D1C32] text-white py-4 font-body font-bold text-sm leading-5 tracking-[1.4px] uppercase text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-black active:scale-[0.98] transition-all duration-150"
              >
                Login
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 py-4">
                <div className="flex-1 h-[1px] bg-[#C5C6CD] opacity-20"></div>
                <span className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#75777E]">
                  or continue with
                </span>
                <div className="flex-1 h-[1px] bg-[#C5C6CD] opacity-20"></div>
              </div>

              {/* Google Sign-in Button */}
              <button
                type="button"
                className="w-full bg-[#F3F4F6] py-4 font-body font-semibold text-sm leading-5 text-[#191C1E] text-center flex items-center justify-center gap-3 hover:bg-[#E7E8EA] active:scale-[0.98] transition-all duration-150"
                style={{ border: '1px solid rgba(197, 198, 205, 0.1)' }}
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
            </form>

            {/* Footer Link */}
            <div className="mt-12 pt-12 text-center">
              <p className="font-body text-sm leading-5 text-[#44474D]">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-bold text-[#191C1E] underline decoration-[#E9C176] decoration-2 underline-offset-4 hover:text-[#A17F3B] transition-colors"
                >
                  Signup
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Anchor */}
      <footer className="w-full bg-[#F8F9FB] border-t border-[#F1F5F9] py-12">
        <div className="max-w-[1280px] mx-auto flex flex-row justify-between items-center px-8">
          <span className="font-body text-sm leading-5 tracking-[1.2px] uppercase text-[#0D1C32]">
            verdict ai
          </span>
          <div className="flex items-center gap-8">
            <a className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#475569] hover:text-[#E9C176] transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#475569] hover:text-[#E9C176] transition-colors" href="#">
              Terms of Service
            </a>
            <a className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#475569] hover:text-[#E9C176] transition-colors" href="#">
              Legal Disclaimer
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
