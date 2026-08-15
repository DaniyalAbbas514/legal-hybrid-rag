import React from 'react';

const EmptyState = ({ onSelectCard }) => {
  const cards = [
    {
      title: 'Analyze Statute',
      description: 'Extract core implications and legislative intent from complex regulatory frameworks.',
      icon: 'scale',
      prompt: 'Analyze the statute implications for corporate tax governance in the current framework.',
    },
    {
      title: 'Precedent Review',
      description: 'Identify landmark rulings and dissenting opinions relevant to your current brief.',
      icon: 'account_balance',
      prompt: 'Summarize key precedents and dissenting opinions on civil liability and digital rights.',
    },
    {
      title: 'Drafting Support',
      description: 'Refine arguments and ensure citation accuracy across multiple jurisdictions.',
      icon: 'edit_note',
      prompt: 'Help me draft an argument summary addressing cross-jurisdictional contract breaches.',
    },
  ];

  const chips = [
    { text: 'Use specific jurisdiction names', icon: 'lightbulb' },
    { text: 'Upload case files for analysis', icon: 'attachment' },
    { text: 'Summarize historical timelines', icon: 'timer' },
  ];

  return (
    <div className="flex-grow flex flex-col items-center justify-center max-w-4xl mx-auto px-8 pt-24 pb-44 w-full select-none animate-[fadeIn_0.5s_ease-out]">
      {/* Welcome Section */}
      <div className="text-center mb-16">
        <h2 className="font-headline text-5xl md:text-6xl text-primary-container mb-6 tracking-tight leading-tight">
          How can I assist your <span className="serif-italic">research</span> today?
        </h2>
        <p className="text-on-surface-variant text-lg max-w-2xl mx-auto font-body leading-relaxed">
          Access the collective intelligence of the Atelier. From statute interpretation to landmark precedent analysis, our workspace is designed for high-stakes accuracy.
        </p>
      </div>

      {/* Bento Grid Suggested Points */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {cards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => onSelectCard(card.prompt)}
            className="group bg-surface-container-low p-8 rounded-none border border-outline-variant/10 hover:border-tertiary-fixed-dim/40 hover:bg-surface-container-highest hover:shadow-sm transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <span className="material-symbols-outlined text-tertiary-fixed-dim mb-4 block text-3xl">
                {card.icon}
              </span>
              <h3 className="font-headline text-xl text-primary-container mb-2">{card.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{card.description}</p>
            </div>
            <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center text-xs font-semibold text-tertiary-fixed-dim uppercase tracking-widest">
              Start Session{' '}
              <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tips / Guidance */}
      <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4">
        {chips.map((chip, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 text-xs text-on-secondary-container bg-secondary-container/30 px-4 py-2 rounded-full border border-outline-variant/5"
          >
            <span className="material-symbols-outlined text-sm">{chip.icon}</span>
            <span>{chip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;
