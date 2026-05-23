import React from 'react';
import { Link } from 'react-router-dom';

const recentUploads = [
  {
    title: 'Harrington v. United States',
    time: 'Processed 14 mins ago • Ref: #0921',
  },
  {
    title: 'Estate of Miller et al.',
    time: 'Processed 2 hours ago • Ref: #0920',
  },
  {
    title: 'Chevron U.S.A. Inc. v. NRDC',
    time: 'Processed 5 hours ago • Ref: #0919',
  },
];

const AdminCasesPage = () => {
  return (
    <div className="flex min-h-screen bg-[#F8F9FB]">

      {/* ═══════════════════════════════════════════════════
          Sidebar - Navigation Shell
          ═══════════════════════════════════════════════════ */}
      <aside
        className="fixed left-0 top-0 w-72 h-screen flex flex-col bg-[#191C1E] z-50"
        style={{
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Brand */}
        <div className="px-6 py-8">
          <span className="font-body text-lg leading-7 tracking-[1.8px] uppercase text-white">
            Admin Console
          </span>
          <p className="font-body text-[10px] leading-[15px] tracking-[2px] uppercase text-[#64748B] mt-1">
            System Oversight
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4">
          <ul className="flex flex-col gap-1">
            {/* User Management */}
            <li>
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-4 w-full px-6 py-4 transition-all duration-200 text-[#64748B] hover:bg-[#0D1C32] hover:text-white"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#64748B' }}>group</span>
                <span className="font-body font-medium text-sm tracking-[0.35px]">User Management</span>
              </Link>
            </li>
            {/* Cases (Active) */}
            <li>
              <Link
                to="/admin/cases"
                className="flex items-center gap-4 w-full px-6 py-4 transition-all duration-200 bg-[#0D1C32] text-[#E9C176] font-bold translate-x-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#E9C176' }}>gavel</span>
                <span className="font-body font-medium text-sm tracking-[0.35px]">Cases</span>
              </Link>
            </li>
            {/* Support */}
            <li>
              <Link
                to="/admin/support"
                className="flex items-center gap-4 w-full px-6 py-4 transition-all duration-200 text-[#64748B] hover:bg-[#0D1C32] hover:text-white"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#64748B' }}>contact_support</span>
                <span className="font-body font-medium text-sm tracking-[0.35px]">Support</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-6">
          <div className="bg-[#0D1C32] p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E9C176] flex items-center justify-center">
              <span className="font-body font-bold text-sm leading-5 text-[#261900]">JD</span>
            </div>
            <div className="flex flex-col pl-1">
              <span className="font-body font-semibold text-sm leading-5 text-white">Chief Registrar</span>
              <span className="font-body text-[10px] leading-[15px] text-[#64748B]">Active Session</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════
          Main Content Canvas
          ═══════════════════════════════════════════════════ */}
      <main className="ml-72 flex-1 flex flex-col min-h-screen">

        {/* Header Section */}
        <header
          className="flex justify-between items-end w-full px-10 py-8 sticky top-0 z-40"
          style={{
            background: 'rgba(248, 249, 251, 0.8)',
            backdropFilter: 'blur(6px)',
            height: '132px',
          }}
        >
          <div className="flex flex-col gap-2">
            <h2 className="font-headline font-bold text-4xl leading-10 tracking-[-0.9px] text-[#0D1C32]">
              Case Management
            </h2>
            <p className="font-body font-medium text-sm leading-5 text-[#44474D]">
              Ingest and catalog judicial precedents with high-fidelity OCR.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Logout Button */}
            <Link
              to="/"
              className="bg-[#0D1C32] text-white font-body font-medium text-xs leading-4 tracking-[1.2px] uppercase px-8 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Logout
            </Link>

            {/* Upload PDF Button */}
            <button className="bg-[#0D1C32] text-white font-body font-semibold text-sm leading-5 px-5 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '14px' }}>upload_file</span>
              Upload PDF
            </button>
          </div>
        </header>

        {/* Content Grid */}
        <div className="px-10 pb-20 grid grid-cols-12 gap-8">

          {/* ═══ Left Column: Upload & Form ═══ */}
          <section className="col-span-12 lg:col-span-8 flex flex-col gap-8">

            {/* Bento Card: Upload Zone */}
            <div
              className="bg-white p-8 relative overflow-hidden"
              style={{ borderLeft: '4px solid #E9C176' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="font-headline font-bold text-2xl leading-8 text-[#0D1C32]">
                    Judgment Document Ingestion
                  </h3>
                  <p className="font-body text-sm leading-5 text-[#44474D]">
                    Drag and drop the official court PDF to begin sovereign processing.
                  </p>
                </div>
                <div className="bg-[#F3F4F6] p-3 rounded-xl flex-shrink-0">
                  <span className="material-symbols-outlined text-[#0D1C32]" style={{ fontSize: '16px' }}>description</span>
                </div>
              </div>

              {/* Dropzone */}
              <div
                className="mt-8 flex flex-col items-center justify-center py-12 rounded-lg cursor-pointer hover:bg-[#F3F4F6] transition-colors"
                style={{ border: '2px dashed #C5C6CD' }}
              >
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(233, 193, 118, 0.2)' }}>
                  <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '28px' }}>cloud_upload</span>
                </div>
                <p className="font-body font-semibold text-base leading-6 text-[#0D1C32]">Select a PDF file</p>
                <p className="font-body text-xs leading-4 text-[#44474D] mt-1">
                  Maximum file size: 50MB. Searchable PDFs preferred.
                </p>
              </div>
            </div>

            {/* Bento Card: Metadata Form */}
            <div className="bg-white p-8 flex flex-col gap-8">
              {/* Section Header */}
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 bg-[#0D1C32] rounded-sm"></span>
                <h4 className="font-body font-bold text-xs leading-4 tracking-[1.2px] uppercase text-[#0D1C32]">
                  Case Metadata
                </h4>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Full Case Title - Full Width */}
                <div className="col-span-2 flex flex-col gap-2">
                  <label className="font-body font-bold text-[11px] leading-4 tracking-[0.55px] uppercase text-[#44474D]">
                    Full Case Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Termination Of Employee"
                    className="w-full bg-[#F8F9FB] border-none py-4 px-4 font-body text-sm leading-[17px] text-[#191C1E] placeholder:text-[#6B7280] outline-none focus:ring-1 focus:ring-[#E9C176] transition-all"
                  />
                </div>

                {/* Unique Case ID */}
                <div className="flex flex-col gap-2">
                  <label className="font-body font-bold text-[11px] leading-4 tracking-[0.55px] uppercase text-[#44474D]">
                    Unique Case ID
                  </label>
                  <input
                    type="text"
                    placeholder="CR-2024-8849-NY"
                    className="w-full bg-[#F8F9FB] border-none py-4 px-4 font-body text-sm leading-[17px] text-[#191C1E] placeholder:text-[#6B7280] outline-none focus:ring-1 focus:ring-[#E9C176] transition-all"
                  />
                </div>

                {/* Jurisdiction / Court */}
                <div className="flex flex-col gap-2">
                  <label className="font-body font-bold text-[11px] leading-4 tracking-[0.55px] uppercase text-[#44474D]">
                    Jurisdiction / Court
                  </label>
                  <div className="relative">
                    <select className="w-full bg-[#F8F9FB] border-none py-4 px-4 font-body text-sm leading-5 text-[#191C1E] outline-none appearance-none focus:ring-1 focus:ring-[#E9C176] transition-all cursor-pointer">
                      <option>Supreme Court of the United States</option>
                      <option>U.S. Court of Appeals</option>
                      <option>New York Supreme Court</option>
                      <option>District Court of California</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" style={{ fontSize: '20px' }}>expand_more</span>
                  </div>
                </div>

                {/* Judgment Year */}
                <div className="flex flex-col gap-2">
                  <label className="font-body font-bold text-[11px] leading-4 tracking-[0.55px] uppercase text-[#44474D]">
                    Judgment Year
                  </label>
                  <input
                    type="text"
                    placeholder="2024"
                    className="w-full bg-[#F8F9FB] border-none py-4 px-4 font-body text-sm leading-[17px] text-[#191C1E] placeholder:text-[#6B7280] outline-none focus:ring-1 focus:ring-[#E9C176] transition-all"
                  />
                </div>

                {/* Judgment Month */}
                <div className="flex flex-col gap-2">
                  <label className="font-body font-bold text-[11px] leading-4 tracking-[0.55px] uppercase text-[#44474D]">
                    Judgment Month
                  </label>
                  <div className="relative">
                    <select className="w-full bg-[#F8F9FB] border-none py-4 px-4 font-body text-sm leading-5 text-[#191C1E] outline-none appearance-none focus:ring-1 focus:ring-[#E9C176] transition-all cursor-pointer">
                      <option>January</option>
                      <option>February</option>
                      <option>March</option>
                      <option>April</option>
                      <option>May</option>
                      <option>June</option>
                      <option>July</option>
                      <option>August</option>
                      <option>September</option>
                      <option>October</option>
                      <option>November</option>
                      <option>December</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" style={{ fontSize: '20px' }}>expand_more</span>
                  </div>
                </div>
              </div>
            </div>

          </section>

          {/* ═══ Right Column: Status & Sidebar ═══ */}
          <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">

            {/* Processing State Card */}
            <div className="bg-[#0D1C32] p-8 relative overflow-hidden">
              {/* Animated dots + label */}
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#E9C176] rounded-full animate-pulse"></span>
                  <span className="w-1.5 h-1.5 bg-[#E9C176] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-[#E9C176] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                </div>
                <span className="font-body font-bold text-[10px] leading-[15px] tracking-[2px] uppercase text-[#E9C176]">
                  AI Sovereign Engine
                </span>
              </div>

              {/* Title */}
              <h4 className="font-headline text-xl leading-7 text-white mb-2 relative z-10" style={{ paddingTop: '16px' }}>
                Reading PDF...
              </h4>

              {/* Description */}
              <p className="font-body text-xs leading-5 text-[#94A3B8] relative z-10">
                The Verdict is currently extracting semantic structures, legal citations, and party entities from the uploaded document.
              </p>

              {/* Progress Bar */}
              <div className="mt-6 relative z-10" style={{ paddingTop: '24px' }}>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-body font-bold text-[10px] leading-[15px] uppercase text-[#64748B]">OCR Precision</span>
                  <span className="font-body font-bold text-[10px] leading-[15px] uppercase text-[#64748B]">88%</span>
                </div>
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  <div
                    className="h-full rounded-full bg-[#E9C176] transition-all duration-1000"
                    style={{ width: '88%' }}
                  ></div>
                </div>
              </div>

              {/* Watermark */}
              <div
                className="absolute -bottom-5 -right-8 opacity-5"
                style={{ transform: 'rotate(12deg)' }}
              >
                <span className="material-symbols-outlined text-white" style={{ fontSize: '120px' }}>visibility</span>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-[#E7E8EA] p-8">
              <h5 className="font-headline text-lg leading-7 text-[#0D1C32] mb-6">
                Recent Uploads
              </h5>

              <div className="flex flex-col gap-6">
                {recentUploads.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-10 h-10 bg-white flex-shrink-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#0D1C32]" style={{ fontSize: '14px' }}>task_alt</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-body font-bold text-xs leading-4 text-[#0D1C32]">{item.title}</span>
                      <span className="font-body text-[10px] leading-[15px] text-[#44474D]">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* View Full Registry Button */}
              <button
                className="w-full mt-8 font-body font-bold text-[11px] leading-4 tracking-[1.1px] uppercase text-[#0D1C32] pb-1 hover:opacity-70 transition-opacity"
                style={{ borderBottom: '1px solid rgba(13, 28, 50, 0.1)' }}
              >
                View Full Registry
              </button>
            </div>

          </aside>
        </div>

        {/* Footer */}
        <footer className="w-full py-12 border-t border-[#F1F5F9] bg-[#F8F9FB] mt-auto">
          <div className="max-w-full mx-auto flex flex-row justify-between items-center px-10">
            <span className="font-body text-sm leading-5 text-[#0D1C32]">Verdict AI</span>
            <div className="flex items-center gap-8">
              <a className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors" href="#">
                Privacy Policy
              </a>
              <a className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors" href="#">
                Terms of Service
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AdminCasesPage;
