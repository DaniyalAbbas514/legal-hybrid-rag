import React from 'react';
import { Link } from 'react-router-dom';

const usersData = [
  {
    name: 'Marcus Sterling',
    email: 'm.sterling@sterling-law.com',
    org: 'Sterling & Associates',
    plan: 'Enterprise',
    planColor: 'bg-[#0D1C32] text-white',
    status: 'Active',
    statusColor: 'bg-[#22C55E]',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk7kxc5PmFz5lnkgrpkCMtWXHGOEWgoKe3RGkSOr45Cm7UeMOGlgSUlh6PfhhKWqkWglmpRm2XgCfWQMaTSot9T8baYY9JzWl9l6FT83wSqGHsFaEpbhOeyGwJkBDLmoy2jpRuRPAYFnUm_udwFCQnJSK5pBedboX7VXtT6T06snjXIMLNMRFRQTNUYVTZuXVMTgAv2KQG2GoMZe9iXSXDVV4MnkWpi0w3SRZ61Vbn9YlLlhbTYH6dxItT5uRZ89iXCyyGLxe6bAM',
  },
  {
    name: 'Elena Rodriguez',
    email: 'elena.r@lexicon-corp.io',
    org: 'Lexicon Global',
    plan: 'Professional',
    planColor: 'bg-[#E9C176] text-[#261900]',
    status: 'Active',
    statusColor: 'bg-[#22C55E]',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiD7jmvM3uvMVxKv3QpcdNf8qoijZwMEFeIi9HuPGwU8UfPJRHMO5Lwcew4YGpDP-6KNzWSZOD9HO_epD27Hvi4Q_XIwlQtPqekuV2N0GM2SkzsHXi2OYu_RF7Ak2kC5zYvzhkSmm1eQEo4EShdarpBbY9w04CX9SV_RFXFp0ISk5vLn4wjkPOKm90kpq0lh34SJKBEc-1yJZy--PEOdRNW7bkHhFY4DOY4rh4UL3_IUjghiIuYI-bR_hSTtUfwmzRA7PZb_X8-rw',
  },
  {
    name: 'Arthur Vance',
    email: 'vance@indie-legal.co',
    org: 'Vance Independent',
    plan: 'Standard',
    planColor: 'bg-[#E7E8EA] text-[#44474D]',
    status: 'Pending',
    statusColor: 'bg-[#FB923C]',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQzyIPAJuXtjng0rrWHPtxvQEcjclTivsD9yabUaSztnBy7la0YAorKM9WfovVryAbFBEEkV8iVR23SGHJBxqgjEx1dsSKAdUoNzJn9E96swUDlkvvourBm0nCnj6iXFM70TpZlmRto70YrvxO9c7KhSVFuV1_iX-jXeImguryhL8JgBmHaK0h7OJQ_fFRZpL7icc_CSDVdSQCssTOYPdt7slmlLctw7A9zj1u9A1V_hOIgf-tIWbHRHfY2gr4KKUTSRsEUWLMTkQ',
  },
];

const AdminDashboardPage = () => {
  return (
    <div className="flex min-h-screen bg-[#F8F9FB]">

      {/* Sidebar - SideNavBar */}
      <aside
        className="fixed left-0 top-0 w-72 h-screen flex flex-col bg-[#191C1E] z-50"
        style={{
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Brand */}
        <div className="px-8 py-10">
          <span className="font-body font-bold text-lg leading-7 tracking-[1.8px] uppercase text-white">
            Admin Console
          </span>
          <p className="font-body text-[10px] leading-[15px] tracking-[2px] uppercase text-[#64748B] mt-1">
            System Oversight
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4">
          <ul className="flex flex-col gap-1">
            {/* User Management (Active) */}
            <li>
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-4 w-full px-8 py-4 transition-all duration-200 bg-[#0D1C32] text-[#E9C176] font-bold translate-x-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#E9C176' }}>group</span>
                <span className="font-body text-sm tracking-[0.35px]">User Management</span>
              </Link>
            </li>
            {/* Cases */}
            <li>
              <Link
                to="/admin/cases"
                className="flex items-center gap-4 w-full px-8 py-4 transition-all duration-200 text-[#64748B] hover:bg-[#0D1C32] hover:text-white"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748B' }}>gavel</span>
                <span className="font-body text-sm tracking-[0.35px]">Cases</span>
              </Link>
            </li>
            {/* Support */}
            <li>
              <Link
                to="/admin/support"
                className="flex items-center gap-4 w-full px-8 py-4 transition-all duration-200 text-[#64748B] hover:bg-[#0D1C32] hover:text-white"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#64748B' }}>contact_support</span>
                <span className="font-body text-sm tracking-[0.35px]">Support</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-8">
          <div className="bg-white/5 p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E9C176] flex items-center justify-center">
              <span className="font-body font-bold text-base leading-6 text-[#261900]">AA</span>
            </div>
            <div className="flex flex-col">
              <span className="font-body text-xs leading-4 text-white">Ahsan ALI</span>
              <span className="font-body text-[10px] leading-[15px] text-[#94A3B8]">Super Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="ml-72 flex-1 flex flex-col min-h-screen">

        {/* TopNavBar Header */}
        <header className="flex justify-between items-center w-full px-12 py-8 bg-[#F8F9FB] sticky top-0 z-40 h-[128px]">
          <div className="flex flex-col gap-1">
            <h1 className="font-headline font-semibold text-4xl leading-10 tracking-[-0.9px] text-[#0D1C32]">
              Management Suite
            </h1>
            <p className="font-body text-sm leading-5 text-[#44474D]">
              Orchestrating professional identities and permissions.
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Logout Button */}
            <Link
              to="/"
              className="bg-[#0D1C32] text-white font-body font-medium text-xs leading-4 tracking-[1.2px] uppercase px-8 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Logout
            </Link>

            {/* Notification Bell */}
            <div className="relative">
              <span className="material-symbols-outlined text-[#75777E] cursor-pointer hover:text-[#0D1C32] transition-colors" style={{ fontSize: '20px' }}>notifications</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#BA1A1A] rounded-full"></span>
            </div>

            {/* Add New User Button */}
            <button className="bg-[#0D1C32] text-white font-body text-sm leading-5 px-6 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '14px' }}>person_add</span>
              Add New User
            </button>
          </div>
        </header>

        {/* Stats Section (Bento Grid) */}
        <section className="px-12 py-6 grid grid-cols-3 gap-8">
          {/* Total Users Card */}
          <div className="bg-white p-8 rounded-lg relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#75777E]">Global Reach</span>
              <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '22px' }}>group</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-normal text-[48px] leading-[48px] text-[#0D1C32]">1,284</span>
              <div className="flex items-center gap-1 mt-2 pt-2">
                <span className="font-body font-bold text-xs leading-4 text-[#16A34A]">+12%</span>
                <span className="font-body text-xs leading-4 text-[#44474D]">vs last month</span>
              </div>
            </div>
            {/* Decorative Icon */}
            <div className="absolute -bottom-12 -right-4 opacity-5">
              <span className="material-symbols-outlined text-[#191C1E]" style={{ fontSize: '96px' }}>analytics</span>
            </div>
          </div>

          {/* Cases Card */}
          <div className="bg-white p-8 rounded-lg relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#75777E]">Active Cases</span>
              <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '18px' }}>gavel</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-normal text-[48px] leading-[48px] text-[#0D1C32]">492</span>
              <div className="flex items-center gap-1 mt-2 pt-2">
                <span className="font-body font-bold text-xs leading-4 text-[#16A34A]">88%</span>
                <span className="font-body text-xs leading-4 text-[#44474D]">Resolution Rate</span>
              </div>
            </div>
          </div>

          {/* Support Requests Card */}
          <div className="bg-white p-8 rounded-lg relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="font-body text-xs leading-4 tracking-[1.2px] uppercase text-[#75777E]">Tickets Open</span>
              <span className="material-symbols-outlined text-[#E9C176]" style={{ fontSize: '17px' }}>contact_support</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-normal text-[48px] leading-[48px] text-[#0D1C32]">24</span>
              <div className="flex items-center gap-1 mt-2 pt-2">
                <span className="font-body text-xs leading-4 text-[#44474D]">Avg. Response</span>
                <span className="font-body font-bold text-xs leading-4 text-[#44474D]">14m</span>
              </div>
            </div>
          </div>
        </section>

        {/* User Table Section */}
        <section className="px-12 py-10 flex-1">
          <div
            className="bg-white overflow-hidden flex flex-col"
            style={{ boxShadow: '0px 0px 0px 1px rgba(197, 198, 205, 0.15)' }}
          >
            {/* Table Header Controls */}
            <div
              className="px-8 py-6 flex justify-between items-center"
              style={{ background: 'rgba(243, 244, 246, 0.5)' }}
            >
              <div className="flex gap-4">
                {/* Search Input */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#75777E]" style={{ fontSize: '14px' }}>search</span>
                  <input
                    type="text"
                    placeholder="Filter users..."
                    className="pl-10 pr-4 py-2 bg-white text-sm leading-[17px] text-[#6B7280] font-body rounded-lg w-64 outline-none transition-all placeholder:text-[#6B7280]"
                    style={{ boxShadow: '0px 0px 0px 1px rgba(197, 198, 205, 0.2)' }}
                  />
                </div>

                {/* Filter Button */}
                <button
                  className="px-4 py-2 flex items-center gap-2 font-body font-bold text-xs leading-4 text-[#0D1C32] bg-white rounded-lg hover:bg-[#F3F4F6] transition-all"
                  style={{ boxShadow: '0px 0px 0px 1px rgba(197, 198, 205, 0.2)' }}
                >
                  <span className="material-symbols-outlined text-[#0D1C32]" style={{ fontSize: '14px' }}>filter_list</span>
                  Advanced Filter
                </button>
              </div>

              <span className="font-body font-medium text-xs leading-4 text-[#44474D]">
                Showing 1-10 of 1,284 users
              </span>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white" style={{ borderBottom: '1px solid rgba(197, 198, 205, 0.1)' }}>
                    <th className="px-8 py-5 font-body font-bold text-xs leading-4 tracking-[1.8px] uppercase text-[#75777E]">User Name</th>
                    <th className="px-8 py-5 font-body font-bold text-xs leading-4 tracking-[1.8px] uppercase text-[#75777E]">Organization</th>
                    <th className="px-8 py-5 font-body font-bold text-xs leading-4 tracking-[1.8px] uppercase text-[#75777E]">Plan</th>
                    <th className="px-8 py-5 font-body font-bold text-xs leading-4 tracking-[1.8px] uppercase text-[#75777E]">Status</th>
                    <th className="px-8 py-5 font-body font-bold text-xs leading-4 tracking-[1.8px] uppercase text-[#75777E] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.map((user, index) => (
                    <tr
                      key={index}
                      className="group hover:bg-[#F3F4F6] transition-colors"
                      style={{ borderTop: index > 0 ? '1px solid rgba(197, 198, 205, 0.05)' : 'none' }}
                    >
                      {/* User Name + Avatar */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#E7E8EA] ring-2 ring-transparent group-hover:ring-[#E9C176] transition-all flex-shrink-0">
                            <img className="w-full h-full object-cover" src={user.avatar} alt={user.name} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-headline font-bold text-base leading-6 text-[#0D1C32]">{user.name}</span>
                            <span className="font-body text-xs leading-4 text-[#44474D]">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Organization */}
                      <td className="px-8 py-6">
                        <span className="font-body font-medium text-sm leading-5 text-[#0D1C32]">{user.org}</span>
                      </td>

                      {/* Plan Badge */}
                      <td className="px-8 py-6">
                        <span className={`inline-block px-3 py-1 ${user.planColor} font-body font-bold text-[10px] leading-3 tracking-[1px] uppercase rounded-full`}>
                          {user.plan}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${user.statusColor}`}></span>
                          <span className="font-body font-medium text-xs leading-4 text-[#44474D]">{user.status}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-[#75777E] hover:text-[#0D1C32] transition-colors" title="Edit User">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit_note</span>
                          </button>
                          <button className="p-2 text-[#75777E] hover:text-[#E9C176] transition-colors" title="Upgrade Plan">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>rocket_launch</span>
                          </button>
                          <button className="p-2 text-[#75777E] hover:text-[#BA1A1A] transition-colors" title="Delete">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div
              className="px-8 py-6 flex justify-between items-center"
              style={{
                background: 'rgba(243, 244, 246, 0.2)',
                borderTop: '1px solid rgba(197, 198, 205, 0.1)',
              }}
            >
              <button className="flex items-center gap-1 px-4 py-2 font-body font-bold text-xs leading-4 text-[#75777E] hover:text-[#0D1C32] transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_left</span>
                Previous
              </button>

              <div className="flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-[#0D1C32] text-white font-body font-bold text-xs rounded-[2px]">1</span>
                <span className="w-8 h-8 flex items-center justify-center text-[#75777E] font-body font-bold text-xs rounded-[2px] hover:bg-[#E7E8EA] cursor-pointer transition-all">2</span>
                <span className="w-8 h-8 flex items-center justify-center text-[#75777E] font-body font-bold text-xs rounded-[2px] hover:bg-[#E7E8EA] cursor-pointer transition-all">3</span>
                <span className="px-2 font-body text-base leading-6 text-[#75777E]">...</span>
                <span className="w-8 h-8 flex items-center justify-center text-[#75777E] font-body font-bold text-xs rounded-[2px] hover:bg-[#E7E8EA] cursor-pointer transition-all">128</span>
              </div>

              <button className="flex items-center gap-1 px-4 py-2 font-body font-bold text-xs leading-4 text-[#75777E] hover:text-[#0D1C32] transition-colors">
                Next
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full py-12 border-t border-[#F1F5F9] bg-[#F8F9FB] mt-auto">
          <div className="max-w-full mx-auto flex flex-row justify-between items-center px-8">
            <span className="font-body text-sm leading-5 text-[#0D1C32]">Verdict AI</span>
            <div className="flex items-center gap-8">
              <a className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors" href="#">
                Privacy Policy
              </a>
              <a className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors" href="#">
                Terms of Service
              </a>
              <a className="font-body text-[10px] leading-[15px] tracking-[1px] uppercase text-[#94A3B8] hover:text-[#E9C176] transition-colors" href="#">
                Legal Disclaimer
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
