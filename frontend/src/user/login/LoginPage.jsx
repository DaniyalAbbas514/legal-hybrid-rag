import React from 'react';
import { Link } from 'react-router-dom';
import UserFooter from '../components/UserFooter';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <div className="flex flex-col bg-[#F8F9FB] min-h-screen w-full">
      {/* Header */}
      <header className="w-full bg-[#F8F9FB] sticky top-0 z-50">
        <nav className="flex justify-between items-center w-full px-8 py-4 h-[68px]">
          <Link to="/" className="font-headline text-2xl text-[#0D1C32] tracking-[-1.2px] leading-8">
            Verdict AI
          </Link>
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
        <div
          className="w-full max-w-[1024px] grid md:grid-cols-2 bg-white overflow-hidden z-10"
          style={{ boxShadow: '0px 32px 64px -12px rgba(0, 0, 0, 0.04)' }}
        >
          <div className="hidden md:flex bg-[#0D1C32] relative p-12 flex-col justify-center overflow-hidden">
            <div className="flex flex-col justify-between h-full relative z-10">
              <div className="flex flex-col gap-6">
                <h2 className="font-headline font-normal text-[48px] leading-[60px] tracking-[-1.2px] text-white">
                  Sovereign Editorial Intelligence.
                </h2>
                <p className="font-body text-lg leading-[29px] text-[#76849F] max-w-[320px]">
                  Access your private workspace where complex data meets intellectual clarity.
                </p>
              </div>

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
          </div>

          <LoginForm />
        </div>
      </main>

      <UserFooter />
    </div>
  );
};

export default LoginPage;
