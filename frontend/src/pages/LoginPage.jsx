import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!email.trim() || !password) {
      setErrorMsg('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('currentUser', JSON.stringify(data));
        navigate('/welcome');
      } else {
        const err = await res.json();
        setErrorMsg(err.detail || 'Invalid Email or Password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMsg('Failed to communicate with the authentication server.');
    } finally {
      setLoading(false);
    }
  };
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

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-50 text-red-700 p-4 mb-4 rounded-lg text-xs font-body border border-red-100">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="Daniyalabbas@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F3F4F6] px-4 py-[14px] font-body text-base leading-[19px] text-[#191C1E] placeholder:text-[#C5C6CD] outline-none border-none transition-all focus:ring-2 focus:ring-[#E9C176]"
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <label className="font-body font-bold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">
                  Password
                </label>
                <div className="relative w-full">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F3F4F6] pl-4 pr-12 py-[14px] font-body text-base leading-[19px] text-[#191C1E] placeholder:text-[#C5C6CD] outline-none border-none transition-all focus:ring-2 focus:ring-[#E9C176]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C5C6CD] hover:text-[#44474D] transition-colors flex items-center"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Primary Action - Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0D1C32] text-white py-4 font-body font-bold text-sm leading-5 tracking-[1.4px] uppercase text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-black active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
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
