import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, onNewQuery, userEmail }) => {
  const navItems = [
    { id: 'case', label: 'Current Case', icon: 'gavel' },
    { id: 'statutes', label: 'Legal Statutes', icon: 'balance' },
    { id: 'history', label: 'Case History', icon: 'history' },
    { id: 'drafts', label: 'Drafts', icon: 'description' },
    { id: 'saved', label: 'Saved Research', icon: 'bookmarks' },
  ];

  const footerItems = [
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'support', label: 'Support', icon: 'help_outline' },
  ];

  return (
    <aside className="h-full w-72 fixed left-0 top-0 bg-surface-container flex flex-col p-6 gap-y-4 z-40 border-r border-outline-variant/10">
      <div className="mb-8 px-2">
        <h1 className="font-headline text-lg font-semibold text-primary-container">Atelier Research</h1>
        <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mt-1">
          {userEmail ? userEmail.split('@')[0] : 'Senior Counsel'}
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onNewQuery}
        className="w-full bg-tertiary-fixed-dim text-on-tertiary-fixed py-3 px-4 rounded-xl font-label text-sm font-semibold flex items-center justify-center gap-2 hover:translate-x-1 transition-transform duration-200 shadow-sm animate-pulse"
        style={{ animationDuration: '3s' }}
      >
        <span className="material-symbols-outlined">add</span>
        New Research Query
      </button>

      {/* Navigation Tabs */}
      <nav className="mt-4 flex flex-col gap-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return isActive ? (
            <div
              key={item.id}
              className="bg-surface-container-lowest text-primary-container rounded-r-none border-l-4 border-tertiary-fixed-dim flex items-center gap-3 px-4 py-3 cursor-default"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {item.icon}
              </span>
              <span className="font-label text-sm tracking-wide">{item.label}</span>
            </div>
          ) : (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="text-left text-on-surface-variant hover:bg-surface-container-highest transition-all duration-200 flex items-center gap-3 px-4 py-3 rounded-lg hover:translate-x-1 w-full"
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label text-sm tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Tabs */}
      <div className="mt-auto border-t border-outline-variant/20 pt-4 flex flex-col gap-y-1">
        {footerItems.map((item) => {
          const isActive = activeTab === item.id;
          return isActive ? (
            <div
              key={item.id}
              className="bg-surface-container-lowest text-primary-container rounded-r-none border-l-4 border-tertiary-fixed-dim flex items-center gap-3 px-4 py-3 cursor-default"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {item.icon}
              </span>
              <span className="font-label text-sm tracking-wide">{item.label}</span>
            </div>
          ) : (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="text-left text-on-surface-variant hover:bg-surface-container-highest transition-all duration-200 flex items-center gap-3 px-4 py-2 rounded-lg w-full"
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label text-sm tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
