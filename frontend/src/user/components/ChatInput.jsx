import React, { useState } from 'react';

const ChatInput = ({ onSend, loading, placeholder = "Ask your legal query..." }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    onSend(query.trim());
    setQuery('');
  };

  return (
    <div className="fixed bottom-0 right-0 left-72 p-8 z-40 bg-gradient-to-t from-surface via-surface/95 to-transparent">
      <div className="max-w-4xl mx-auto relative">
        <form
          onSubmit={handleSubmit}
          className="glass-panel rounded-full border border-outline-variant/15 p-2 pr-4 flex items-center gap-4 focus-within:ring-2 focus-within:ring-tertiary-fixed-dim transition-all shadow-sm"
        >
          <input
            type="text"
            className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/60 font-body py-4 pl-6 outline-none border-0"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-primary-container disabled:opacity-50 text-on-primary w-12 h-12 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg focus:outline-none flex-shrink-0"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 600" }}>
                arrow_upward
              </span>
            )}
          </button>
        </form>
        <p className="text-[10px] text-center text-outline mt-3 uppercase tracking-wider">
          The Digital Atelier AI may provide general legal research; verify all findings with original statutes.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
