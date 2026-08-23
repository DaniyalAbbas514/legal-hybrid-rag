import React, { useEffect, useRef, useState } from 'react';

const defaultFaqData = [
  {
    question: 'How does AI search work?',
    answer:
      'Our proprietary engine utilizes deep neural networks trained specifically on sovereign legal archives. Unlike generic search models, we prioritize semantic relevance over keyword matching, ensuring that nuanced case law and historical precedents are surfaced with mathematical precision. The system operates in "Editorial Mode," meaning every result is cross-referenced with verified metadata.',
  },
  {
    question: 'How many free queries are included?',
    answer:
      'The "Atelier Access" tier includes 10 high-resolution research sessions per month at no cost. These sessions allow for full document extraction and citation analysis. For heavy usage or firm-wide integration, our Professional and Sovereign tiers offer unlimited queries with prioritized compute resources.',
  },
  {
    question: 'What data sources are indexed?',
    answer:
      'We maintain live connections to federal, appellate, and state court repositories, alongside exclusive access to private historical law libraries. Our indexing protocol runs every 6 hours, ensuring that even the most recent rulings are searchable within our interface.',
  },
  {
    question: 'Is my research confidential?',
    answer:
      'Confidentiality is the cornerstone of The Verdict AI. All sessions are protected by AES-256 encryption. We utilize zero-knowledge architecture, meaning neither our engineers nor our AI models "learn" from your specific inputs or research paths. Your workspace is a private silo.',
  },
];

const AccordionItem = ({ item, index, isOpen, onToggle }) => {
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Measure the panel so the expand animation always matches the real content
  // height — no arbitrary max-height cap that could clip a long answer.
  useEffect(() => {
    const node = contentRef.current;
    if (!node) return undefined;

    const measure = () => setContentHeight(node.scrollHeight);
    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const buttonId = `faq-trigger-${index}`;
  const panelId = `faq-panel-${index}`;

  return (
    <div
      className={`rounded-lg overflow-hidden bg-white border transition-[border-color,box-shadow] duration-300 ${
        isOpen
          ? 'border-[rgba(233,193,118,0.85)] shadow-[0_18px_36px_-24px_rgba(13,28,50,0.35)]'
          : 'border-[rgba(197,198,205,0.4)] hover:border-[rgba(233,193,118,0.5)]'
      }`}
    >
      <h2 className="m-0">
        <button
          id={buttonId}
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className={`w-full p-6 sm:p-8 flex justify-between items-center gap-4 cursor-pointer text-left transition-colors duration-200 ${
            isOpen ? 'bg-white' : 'hover:bg-[#F3F4F6]'
          }`}
        >
          <span className="font-headline font-semibold text-lg sm:text-xl lg:text-2xl leading-8 text-[#191C1E]">
            {item.question}
          </span>
          <span
            aria-hidden="true"
            className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
              isOpen ? 'bg-[rgba(233,193,118,0.25)] text-[#191C1E] rotate-180' : 'bg-[#F3F4F6] text-[#44474D]'
            }`}
          >
            <span className="material-symbols-outlined text-xl leading-none">expand_more</span>
          </span>
        </button>
      </h2>

      {/* Panel */}
      <div
        className="overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? `${contentHeight}px` : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div
          id={panelId}
          ref={contentRef}
          role="region"
          aria-labelledby={buttonId}
          className="px-6 sm:px-8 pb-6 sm:pb-8 border-t border-[rgba(197,198,205,0.4)]"
        >
          <p className="font-body text-sm sm:text-base leading-[26px] text-[#44474D] pt-4">{item.answer}</p>
        </div>
      </div>
    </div>
  );
};

const FAQAccordion = ({ faqItems = defaultFaqData }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col gap-4">
      {faqItems.map((item, index) => (
        <AccordionItem
          key={index}
          item={item}
          index={index}
          isOpen={openIndex === index}
          onToggle={() => toggleAccordion(index)}
        />
      ))}
    </div>
  );
};

export default FAQAccordion;
