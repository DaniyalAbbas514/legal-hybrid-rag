import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminHeader = ({ title, subtitle, actionButtonText, onActionClick }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('currentAdmin');
    navigate('/admin-login');
  };

  return (
    <header className="flex justify-between items-center w-full px-12 py-8 bg-[#F8F9FB] sticky top-0 z-40 h-[128px]">
      <div className="flex flex-col gap-1">
        <h1 className="font-headline font-semibold text-4xl leading-10 tracking-[-0.9px] text-[#0D1C32]">
          {title}
        </h1>
        {subtitle && (
          <p className="font-body text-sm leading-5 text-[#44474D]">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Optional Primary Action Button */}
        {actionButtonText && onActionClick && (
          <button
            onClick={onActionClick}
            className="bg-[#0D1C32] text-white font-body font-medium text-xs leading-4 tracking-[1.2px] uppercase px-8 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            {actionButtonText}
          </button>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-[#0D1C32] text-white font-body font-medium text-xs leading-4 tracking-[1.2px] uppercase px-8 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          Logout
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <span
            className="material-symbols-outlined text-[#75777E] cursor-pointer hover:text-[#0D1C32] transition-colors"
            style={{ fontSize: '20px' }}
          >
            notifications
          </span>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#BA1A1A] rounded-full"></span>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
