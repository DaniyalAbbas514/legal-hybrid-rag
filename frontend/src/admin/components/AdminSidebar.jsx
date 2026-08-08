import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminSidebar = ({ activeRoute, currentAdmin }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentAdmin');
    navigate('/admin-login');
  };

  return (
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
          {/* User Management */}
          <li>
            <Link
              to="/admin/dashboard"
              className={`flex items-center gap-4 w-full px-8 py-4 transition-all duration-200 ${
                activeRoute === 'dashboard'
                  ? 'bg-[#0D1C32] text-[#E9C176] font-bold translate-x-1'
                  : 'text-[#64748B] hover:bg-[#0D1C32] hover:text-white'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '22px', color: activeRoute === 'dashboard' ? '#E9C176' : '#64748B' }}
              >
                group
              </span>
              <span className="font-body text-sm tracking-[0.35px]">User Management</span>
            </Link>
          </li>

          {/* Admin Management (Super Admin only) */}
          {currentAdmin?.role === 'super_admin' && (
            <li>
              <Link
                to="/admin/management"
                className={`flex items-center gap-4 w-full px-8 py-4 transition-all duration-200 ${
                  activeRoute === 'management'
                    ? 'bg-[#0D1C32] text-[#E9C176] font-bold translate-x-1'
                    : 'text-[#64748B] hover:bg-[#0D1C32] hover:text-white'
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '20px', color: activeRoute === 'management' ? '#E9C176' : '#64748B' }}
                >
                  manage_accounts
                </span>
                <span className="font-body text-sm tracking-[0.35px]">Admin Management</span>
              </Link>
            </li>
          )}

          {/* Cases */}
          <li>
            <Link
              to="/admin/cases"
              className={`flex items-center gap-4 w-full px-8 py-4 transition-all duration-200 ${
                activeRoute === 'cases'
                  ? 'bg-[#0D1C32] text-[#E9C176] font-bold translate-x-1'
                  : 'text-[#64748B] hover:bg-[#0D1C32] hover:text-white'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '18px', color: activeRoute === 'cases' ? '#E9C176' : '#64748B' }}
              >
                gavel
              </span>
              <span className="font-body text-sm tracking-[0.35px]">Cases</span>
            </Link>
          </li>

          {/* Support */}
          <li>
            <Link
              to="/admin/support"
              className={`flex items-center gap-4 w-full px-8 py-4 transition-all duration-200 ${
                activeRoute === 'support'
                  ? 'bg-[#0D1C32] text-[#E9C176] font-bold translate-x-1'
                  : 'text-[#64748B] hover:bg-[#0D1C32] hover:text-white'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '17px', color: activeRoute === 'support' ? '#E9C176' : '#64748B' }}
              >
                contact_support
              </span>
              <span className="font-body text-sm tracking-[0.35px]">Support</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* User Profile Footer */}
      <div className="p-8 relative">
        {showProfileMenu && (
          <div
            className="absolute bottom-24 left-8 right-8 bg-[#191C1E] rounded-xl p-2 flex flex-col gap-1 border border-white/10 shadow-2xl animate-fade-in"
            style={{
              boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.3), 0px 4px 6px -4px rgba(0, 0, 0, 0.3)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                navigate('/admin/settings');
                setShowProfileMenu(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-body text-[#94A3B8] hover:bg-white/5 hover:text-white transition-all text-left"
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              Settings
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-body text-[#BA1A1A] hover:bg-[#BA1A1A]/10 transition-all text-left"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Logout
            </button>
          </div>
        )}

        <div
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="bg-white/5 p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/10 active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E9C176] flex items-center justify-center flex-shrink-0">
            <span className="font-body font-bold text-base leading-6 text-[#261900]">
              {getInitials(currentAdmin?.name || 'Admin')}
            </span>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-body text-xs leading-4 text-white truncate max-w-[120px]">
              {currentAdmin?.name || 'Admin'}
            </span>
            <span className="font-body text-[10px] leading-[15px] text-[#94A3B8]">
              {currentAdmin?.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
            </span>
          </div>
          <span
            className={`material-symbols-outlined text-[#64748B] transition-transform duration-200 ${
              showProfileMenu ? 'rotate-180' : ''
            }`}
            style={{ fontSize: '16px' }}
          >
            keyboard_arrow_up
          </span>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
