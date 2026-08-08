import React from 'react';
import { Link } from 'react-router-dom';
import UserFooter from '../components/UserFooter';
import SignupForm from '../components/SignupForm';

const SignupPage = () => {
  return (
    <div className="flex flex-col bg-[#F8F9FB] min-h-screen w-full">
      {/* Header - Minimalist Brand Presence */}
      <header className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center w-full px-8 py-6 h-[80px]">
        <Link to="/" className="font-headline text-2xl text-[#0D1C32] tracking-[-1.2px] leading-8">
          Verdict AI
        </Link>
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="bg-transparent border border-[#0D1C32] border-opacity-20 hover:border-[#0D1C32] text-[#0D1C32] px-4 py-1.5 rounded-[2px] font-body text-xs font-semibold leading-5 tracking-[1px] uppercase transition-all duration-300"
          >
            Back
          </Link>
          <Link to="/faq" className="font-body font-medium text-sm leading-5 text-[#44474D] hover:text-[#0D1C32] transition-colors">
            Help
          </Link>
        </div>
      </header>

      {/* Main - Split Layout */}
      <main className="flex flex-row min-h-screen">
        {/* Aside - Visual Sidebar */}
        <aside className="hidden md:flex w-1/2 bg-[#0D1C32] relative overflow-hidden flex-col justify-end items-start p-16">
          <div className="absolute inset-0 opacity-40">
            <img
              className="w-full h-full object-cover"
              alt="Legal books and scale"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOwk8LRCLNWQOxXudMjecejeCLkIYrJKH42AMTp0npSto8MWO2bkEGTLckwuzCwW6gR_1DYXMBPyODQ234WAnxKch4Thv1fnQDtgmuaBD5WiOymHXVSA6bSqo5KCntrvDLlLmfGaEX0F6DLQeqlMYu1q1xulSOKb8n4NFKMx6NAWEcHtlyhohRvd33OpLSOtWP4PlsOL7OyeJMrIQggzDUnQlgzOmS2-ye649GdZbA-zaprnMD6XfobL0SkJjAffBly19stjR1lp4"
              style={{ backgroundBlendMode: 'saturation, normal', filter: 'grayscale(100%)' }}
            />
          </div>

          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(0deg, #0D1C32 0%, rgba(13, 28, 50, 0) 50%, rgba(13, 28, 50, 0) 100%)',
            }}
          ></div>

          <div className="relative z-10 max-w-[512px] flex flex-col gap-8">
            <h1 className="font-headline font-normal text-[72px] leading-[72px] tracking-[-1.44px] text-[#E9C176]">
              The Sovereign Editorial.
            </h1>
            <p className="font-body font-light text-xl leading-7 text-[#76849F] max-w-[448px]">
              Welcome to a workspace designed for the high-stakes precision of legal excellence. Impeccable organization meets modern efficiency.
            </p>
          </div>
        </aside>

        {/* Form Section */}
        <section className="flex-1 flex items-center justify-center p-24 bg-[#F8F9FB] overflow-y-auto">
          <SignupForm />
        </section>
      </main>

      <UserFooter />
    </div>
  );
};

export default SignupPage;
