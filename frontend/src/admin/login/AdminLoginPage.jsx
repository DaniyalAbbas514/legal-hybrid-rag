import React from 'react';
import { Link } from 'react-router-dom';
import AdminLoginForm from '../components/AdminLoginForm';

const AdminLoginPage = () => {
  return (
    <div className="flex flex-col bg-[#0D1C32] min-h-screen w-full">
      {/* Transactional Header */}
      <header className="w-full flex justify-between items-center px-12 py-8 h-[100px] z-10">
        <Link to="/" className="font-headline font-normal text-[30px] leading-9 tracking-[-1.5px] text-[#E9C176]">
          Verdict AI
        </Link>
        <Link
          to="/"
          className="bg-transparent border border-[#76849F] border-opacity-30 hover:border-[#E9C176] hover:text-[#E9C176] text-[#76849F] px-5 py-2 rounded-[2px] font-body text-xs font-semibold leading-5 tracking-[1px] uppercase transition-all duration-300"
        >
          Back
        </Link>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-4">
        <AdminLoginForm />
      </main>

      {/* Footer */}
      <footer className="w-full py-12">
        <div className="max-w-[1280px] mx-auto flex flex-row justify-between items-center px-8">
          <span className="font-body text-sm leading-5 text-[#E9C176]">
            Verdict AI
          </span>
          <div className="flex items-center gap-8">
            <a className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors" href="#">
              Legal Disclaimer
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLoginPage;
