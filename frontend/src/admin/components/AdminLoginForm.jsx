import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [adminid, setAdminid] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminid, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('currentAdmin', JSON.stringify(data));
        navigate('/admin/dashboard');
      } else {
        const data = await res.json();
        setErrorMsg(data?.detail || 'Invalid Admin ID or Password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMsg('Failed to connect to the authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-[1024px] grid grid-cols-1 md:grid-cols-2 rounded-[2px] overflow-hidden"
      style={{
        background: '#F8F9FB',
        boxShadow: '0px 32px 64px -12px rgba(13, 28, 50, 0.15)',
      }}
    >
      {/* Visual Anchor / Branding Column */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-[#0D1C32] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBMgmYoJemAJ-To4d2p2GUGC0FVVFU0ivIjrjh3hoeLW9MRaw76G9szTIuCybT6AXU4r6j5-H380Jwo9F7ycFMeavzu-UKmXLBnuAY2DeqKhSjo37yPc9aljnySGJQIOMW9ddfHGd_2C_oQUeHklqV5Wfrzii3fGFipHSmZlMhBeW2FqwwBCe05XAtIN6W4fzDX_lGC-eZEAmkiCl7DWXI88-ihbnT_4BSjQ1suyOAmIfnSPEVFxtNobn7aExaGNXktD5cFVv3HJPw')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>

        {/* Top Content */}
        <div className="relative z-10 flex flex-col gap-4">
          <span
            className="inline-block self-start px-3 py-1 font-body text-[10px] leading-[15px] tracking-[2px] uppercase text-[#E9C176]"
            style={{
              background: 'rgba(233, 193, 118, 0.1)',
              border: '1px solid rgba(233, 193, 118, 0.2)',
            }}
          >
            Secure Access Portal
          </span>

          <h1 className="font-headline font-normal text-4xl leading-[45px] text-white mt-2">
            Sovereign<br />Editorial Interface
          </h1>

          <p className="font-body text-sm leading-[23px] text-[#76849F] max-w-[320px]">
            Access the administrative core of the Verdict Ai High-stakes oversight for modern legal professionals.
          </p>
        </div>

        {/* Bottom - Encrypted Session */}
        <div className="relative z-10 mt-auto flex items-center gap-3">
          <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '12px' }}>lock</span>
          <span className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#E9C176] opacity-80">
            Encrypted Session
          </span>
        </div>
      </div>

      {/* Form Column */}
      <div className="p-16 flex flex-col justify-center bg-white">
        <div className="mb-10 pb-10 flex flex-col gap-2">
          <h2 className="font-headline font-normal text-2xl leading-8 text-[#0D1C32]">
            Admin Login
          </h2>
          <p className="font-body text-xs leading-4 tracking-[0.3px] text-[#44474D]">
            Enter your credentials to manage the workspace.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-[#FFDAD6] text-[#93000A] p-4 mb-6 rounded-[2px] text-xs font-body border border-[#FFDAD6] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#BA1A1A]" style={{ fontSize: '16px' }}>error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {/* Admin ID Field */}
          <div className="flex flex-col items-end gap-2">
            <label className="self-start font-body font-bold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#44474D] ml-1">
              Admin ID
            </label>
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#75777E]" style={{ fontSize: '14px' }}>badge</span>
              <input
                type="text"
                value={adminid}
                onChange={(e) => setAdminid(e.target.value)}
                required
                placeholder="e.g. AdminDaniyal@cust.com"
                className="w-full bg-[#F3F4F6] pl-11 pr-4 py-[15px] font-body text-sm leading-[17px] text-[#191C1E] placeholder:text-[#C5C6CD] outline-none border-none border-l-2 border-transparent focus:border-l-2 focus:border-l-[#E9C176] focus:ring-0 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col items-end gap-2">
            <label className="self-start font-body font-bold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#44474D] ml-1">
              Password
            </label>
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#75777E]" style={{ fontSize: '14px' }}>key</span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full bg-[#F3F4F6] pl-11 pr-12 py-[15px] font-body text-sm leading-[17px] text-[#191C1E] placeholder:text-[#C5C6CD] outline-none border-none border-l-2 border-transparent focus:border-l-2 focus:border-l-[#E9C176] focus:ring-0 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C5C6CD] hover:text-[#44474D] transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Remember Workstation */}
          <div className="flex items-center justify-between pt-2 pb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 bg-white border border-[#C5C6CD] rounded-none text-[#0D1C32] focus:ring-0 focus:ring-offset-0"
              />
              <span className="font-body text-xs leading-4 text-[#44474D]">
                Remember this workstation
              </span>
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0D1C32] text-white py-4 font-body font-semibold text-sm leading-5 tracking-[1.4px] uppercase text-center flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] disabled:opacity-50 transition-all duration-150 group"
          >
            <span>{loading ? 'Authenticating...' : 'Login'}</span>
            <span className="material-symbols-outlined text-white transition-transform group-hover:translate-x-1" style={{ fontSize: '14px' }}>arrow_forward</span>
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-12 pt-12 border-t border-[#E7E8EA]">
          <div className="text-center">
            <p className="font-body text-[10px] leading-5 tracking-[1px] uppercase text-[#75777E]">
              Unauthorized access is strictly prohibited and monitored.<br />
              Contact System Oversight for new credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginForm;
