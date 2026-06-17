import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  if (!currentUser) {
    return null; // Don't flash content before redirect
  }

  return (
    <div className="flex flex-col bg-[#0D1C32] min-h-screen w-full relative overflow-hidden">
      
      {/* Premium Ambient Background Blurs */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '700px',
          height: '700px',
          right: '-200px',
          top: '-200px',
          background: 'rgba(233, 193, 118, 0.08)',
          filter: 'blur(100px)',
          borderRadius: '50%',
        }}
      ></div>
      <div
        className="absolute pointer-events-none"
        style={{
          width: '500px',
          height: '500px',
          left: '-150px',
          bottom: '-150px',
          background: 'rgba(118, 132, 159, 0.05)',
          filter: 'blur(80px)',
          borderRadius: '50%',
        }}
      ></div>

      {/* Sticky Header with Logout Button at top right */}
      <header className="w-full flex justify-between items-center px-12 py-6 z-10">
        <div className="font-headline text-2xl text-[#E9C176] tracking-[-1px] font-semibold">
          Verdict AI
        </div>
        <button
          onClick={handleLogout}
          className="bg-transparent border border-[#76849F] border-opacity-30 hover:border-[#E9C176] hover:text-[#E9C176] text-[#76849F] px-5 py-2 font-body text-xs font-semibold leading-5 tracking-[1px] uppercase transition-all duration-300"
        >
          Logout
        </button>
      </header>

      {/* Main content centered */}
      <main className="flex-grow flex items-center justify-center px-6 z-10">
        <div className="text-center max-w-[600px] flex flex-col gap-6 animate-[fadeIn_0.8s_ease-out]">
          <h1 className="font-headline font-normal text-5xl md:text-6xl text-[#E9C176] tracking-[-1px] leading-[1.15]">
            Welcome to Verdict AI
          </h1>
          <div className="w-24 h-[1px] bg-[#E9C176] bg-opacity-40 mx-auto my-2"></div>
          <p className="font-body text-base md:text-lg text-[#76849F] leading-7 tracking-[0.5px]">
            Stay tuned for the future updates
          </p>
        </div>
      </main>

      {/* Subtle bottom accent footer */}
      <footer className="w-full py-8 text-center z-10 opacity-30">
        <span className="font-body text-[10px] leading-4 tracking-[2px] uppercase text-[#76849F]">
          Verdict AI © 2026. All rights reserved.
        </span>
      </footer>
    </div>
  );
};

export default WelcomePage;
