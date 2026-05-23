import React from 'react';
import { Link } from 'react-router-dom';

const supportTickets = [
  {
    initials: 'DA',
    name: 'Daniyal Abbas',
    email: 'Daniyalabbas@gmail.com',
    subject: 'Download Error',
    description: 'Unable to download the relevent case judgement',
    date: 'Oct 12, 2024',
    time: '09:42 AM',
    status: 'Urgent',
    statusStyle: 'bg-[#FFDAD6] text-[#93000A]',
    statusRing: 'shadow-[inset_0_0_0_1px_rgba(186,26,26,0.2)]',
  },
  {
    initials: 'AA',
    name: 'Ahsan Ali',
    email: 'AhsanAli@gmail.com',
    subject: 'Access Credentials Update',
    description: 'Cant get the OTP Verification',
    date: 'Oct 11, 2024',
    time: '02:15 PM',
    status: 'Pending',
    statusStyle: 'bg-[#E1E2E4] text-[#191C1E]',
    statusRing: 'shadow-[inset_0_0_0_1px_rgba(117,119,126,0.2)]',
  },
  {
    initials: 'KW',
    name: 'Khalid Bin Waleed',
    email: 'KhalidbinWaleedgmail.com',
    subject: 'Plan Update',
    description: 'Unable to cancel the plan',
    date: 'Oct 10, 2024',
    time: '11:00 AM',
    status: 'Follow Up',
    statusStyle: 'bg-[#FFDEA5] text-[#261900]',
    statusRing: 'shadow-[inset_0_0_0_1px_rgba(233,193,118,0.5)]',
  },
];

const AdminSupportPage = () => {
  return (
    <div className="flex min-h-screen bg-[#F8F9FB]">

      {/* ═══════════════════════════════════════════════════
          Sidebar - Navigation Shell
          ═══════════════════════════════════════════════════ */}
      <aside
        className="fixed left-0 top-0 w-72 h-screen flex flex-col bg-[#191C1E] z-50"
        style={{
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Brand */}
        <div className="px-6 py-8">
          <span className="font-body font-bold text-lg leading-7 tracking-[1.8px] uppercase text-white">
            Admin Console
          </span>
          <p className="font-body text-xs leading-4 tracking-[0.3px] text-[#64748B] mt-1">
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
                className="flex items-center gap-4 w-full px-6 py-4 text-[#64748B] hover:bg-[#0D1C32] hover:text-white transition-all duration-200"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#64748B' }}>group</span>
                <span className="font-body font-medium text-sm tracking-[0.35px]">User Management</span>
              </Link>
            </li>
            {/* Cases */}
            <li>
              <Link
                to="/admin/cases"
                className="flex items-center gap-4 w-full px-6 py-4 text-[#64748B] hover:bg-[#0D1C32] hover:text-white transition-all duration-200"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748B' }}>gavel</span>
                <span className="font-body text-sm tracking-[0.35px]">Cases</span>
              </Link>
            </li>
            {/* Support (Active) */}
            <li>
              <Link
                to="/admin/support"
                className="flex items-center gap-4 w-full px-6 py-4 bg-[#0D1C32] text-[#E9C176] font-bold translate-x-1 transition-all duration-200"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#E9C176' }}>contact_support</span>
                <span className="font-body font-bold text-sm tracking-[0.35px]">Support</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl bg-[#0D1C32] flex items-center justify-center"
              style={{ border: '1px solid rgba(233, 193, 118, 0.2)' }}
            >
              <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '20px' }}>shield_person</span>
            </div>
            <div className="flex flex-col pl-1">
              <span className="font-body font-semibold text-sm leading-5 text-white">Admin User</span>
              <span className="font-body text-xs leading-4 text-[#64748B]">Primary Controller</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════
          Main Content Canvas
          ═══════════════════════════════════════════════════ */}
      <main className="ml-72 flex-1 flex flex-col min-h-screen p-12" style={{ gap: '48px' }}>

        {/* Header Section */}
        <header className="flex justify-between items-end">
          <div className="flex flex-col gap-3">
            <h1 className="font-headline font-bold text-[48px] leading-[48px] tracking-[-1.2px] text-[#191C1E]">
              User Support
            </h1>
            <p className="font-body text-lg leading-7 text-[#44474D] max-w-[672px]">
              Manage incoming communications and client inquiries through the central sovereign terminal.
            </p>
          </div>

          <div className="flex items-start gap-4">
            {/* Logout Button */}
            <Link
              to="/"
              className="bg-[#0D1C32] text-white font-body font-medium text-xs leading-4 tracking-[1.2px] uppercase px-8 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Logout
            </Link>

            {/* Export Logs Button */}
            <button
              className="bg-[#0D1C32] text-white font-body font-semibold text-sm leading-5 px-6 py-4 rounded-lg flex items-center gap-4 hover:opacity-90 transition-opacity"
              style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
            >
              <span className="material-symbols-outlined text-white" style={{ fontSize: '15px' }}>archive</span>
              Export Logs
            </button>
          </div>
        </header>

        {/* Stats Bento Grid (Asymmetric) */}
        <div className="grid grid-cols-12 gap-0">
          {/* Unresolved Inquiries Card */}
          <div
            className="col-span-4 bg-[#F3F4F6] p-8 flex flex-col justify-between"
            style={{ borderLeft: '4px solid #E9C176', minHeight: '160px' }}
          >
            <div className="flex flex-col gap-2">
              <span className="font-body font-bold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">
                Unresolved Inquiries
              </span>
              <h3 className="font-headline text-4xl leading-10 text-[#191C1E]">24</h3>
            </div>
            <div className="flex items-center gap-1 mt-4 pt-4">
              <span className="material-symbols-outlined text-[#BA1A1A]" style={{ fontSize: '14px' }}>priority_high</span>
              <span className="font-body font-semibold text-xs leading-4 uppercase text-[#BA1A1A]">
                Requires Attention
              </span>
            </div>
          </div>

          {/* Resolution Speed Card */}
          <div className="col-span-8 bg-white p-8 flex items-center justify-between">
            <div className="flex flex-col gap-2 flex-1">
              <span className="font-body font-bold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">
                Resolution Speed
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline font-bold text-4xl leading-10 text-[#191C1E]">4.2</span>
                <span className="font-headline text-lg leading-7 text-[#191C1E]">hrs</span>
              </div>
              <span className="font-body text-xs leading-4 text-[#44474D] mt-1">
                Avg. Response Time this week
              </span>
            </div>

            {/* Mini Bar Chart */}
            <div className="w-48 h-16 opacity-30">
              <div
                className="h-full w-full flex items-end gap-1"
                style={{ background: 'linear-gradient(90deg, #E9C176 0%, rgba(233, 193, 118, 0) 100%)' }}
              >
                <div className="w-2 bg-[#0D1C32]" style={{ height: '30%' }}></div>
                <div className="w-2 bg-[#0D1C32]" style={{ height: '50%' }}></div>
                <div className="w-2 bg-[#0D1C32]" style={{ height: '45%' }}></div>
                <div className="w-2 bg-[#0D1C32]" style={{ height: '70%' }}></div>
                <div className="w-2 bg-[#0D1C32]" style={{ height: '90%' }}></div>
                <div className="w-2 bg-[#0D1C32]" style={{ height: '85%' }}></div>
                <div className="w-2 bg-[#0D1C32]" style={{ height: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Table Container */}
        <div className="bg-white flex flex-col">
          {/* Table Header */}
          <div
            className="px-6 py-6 flex justify-between items-center"
            style={{
              background: 'rgba(237, 238, 240, 0.3)',
              borderBottom: '1px solid #EDEEF0',
            }}
          >
            <h2 className="font-headline font-bold text-xl leading-7 text-[#191C1E]">
              Communication Queue
            </h2>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#44474D]" style={{ fontSize: '15px' }}>search</span>
              <input
                type="text"
                placeholder="Search inquiries..."
                className="pl-10 pr-4 py-2 bg-white text-sm leading-[17px] text-[#6B7280] font-body rounded-lg w-64 outline-none transition-all placeholder:text-[#6B7280]"
                style={{ border: '1px solid rgba(197, 198, 205, 0.2)' }}
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F3F4F6]">
                  <th className="px-8 py-4 font-body font-semibold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">Requester</th>
                  <th className="px-8 py-4 font-body font-semibold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">Subject</th>
                  <th className="px-8 py-4 font-body font-semibold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">Received</th>
                  <th className="px-8 py-4 font-body font-semibold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D]">Status</th>
                  <th className="px-8 py-4 font-body font-semibold text-xs leading-4 tracking-[1.2px] uppercase text-[#44474D] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {supportTickets.map((ticket, index) => (
                  <tr
                    key={index}
                    className="group hover:bg-[#F3F4F6]/50 transition-colors"
                    style={{
                      borderTop: index > 0 ? '1px solid rgba(237, 238, 240, 0.5)' : 'none',
                      background: index === 1 ? 'rgba(243, 244, 246, 0.2)' : 'transparent',
                    }}
                  >
                    {/* Requester */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E7E8EA] flex items-center justify-center flex-shrink-0">
                          <span className="font-body text-base leading-[19px] text-[#76849F]">{ticket.initials}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-body text-sm leading-5 text-[#191C1E]">{ticket.name}</span>
                          <span className="font-body text-xs leading-4 text-[#44474D]">{ticket.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="px-8 py-6" style={{ paddingLeft: '64px' }}>
                      <div className="flex flex-col gap-1 max-w-[260px]">
                        <span className="font-body text-sm leading-5 text-[#191C1E]">{ticket.subject}</span>
                        <span className="font-body text-xs leading-4 text-[#44474D]">{ticket.description}</span>
                      </div>
                    </td>

                    {/* Received */}
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-body text-xs leading-4 text-[#44474D]">{ticket.date}</span>
                        <span className="font-body text-[10px] leading-3 uppercase text-[#44474D]/70 mt-1">{ticket.time}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-[2px] font-body font-bold text-[10px] leading-3 uppercase ${ticket.statusStyle} ${ticket.statusRing}`}>
                        {ticket.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#44474D] hover:bg-[#E9C176]/20 hover:text-[#0D1C32] transition-all" title="Reply">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>reply</span>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#44474D] hover:bg-green-100 hover:text-green-800 transition-all" title="Resolve">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#44474D] hover:bg-[#FFDAD6] hover:text-[#BA1A1A] transition-all" title="Delete">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div
            className="px-6 py-6 flex justify-between items-center bg-white"
            style={{ borderTop: '1px solid #EDEEF0' }}
          >
            <span className="font-body text-xs leading-4 text-[#44474D]">
              Showing 1 to 3 of 24 active entries
            </span>
            <div className="flex items-center gap-2">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-[2px] text-[#44474D] hover:bg-[#EDEEF0] transition-all"
                style={{ border: '1px solid rgba(197, 198, 205, 0.1)' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_left</span>
              </button>
              <span className="w-8 h-8 flex items-center justify-center bg-[#0D1C32] text-white font-body font-bold text-xs rounded-[2px]">1</span>
              <span className="w-8 h-8 flex items-center justify-center text-[#44474D] font-body text-xs rounded-[2px] hover:bg-[#E7E8EA] cursor-pointer transition-all">2</span>
              <span className="w-8 h-8 flex items-center justify-center text-[#44474D] font-body text-xs rounded-[2px] hover:bg-[#E7E8EA] cursor-pointer transition-all">3</span>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-[2px] text-[#44474D] hover:bg-[#EDEEF0] transition-all"
                style={{ border: '1px solid rgba(197, 198, 205, 0.1)' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-row justify-between items-center px-10 max-w-[1280px]">
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
      </main>
    </div>
  );
};

export default AdminSupportPage;
