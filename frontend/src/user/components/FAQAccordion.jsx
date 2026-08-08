import React, { useState } from 'react';

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

const FAQAccordion = ({ faqItems = defaultFaqData }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col gap-4">
      {faqItems.map((item, index) => (
        <div key={index} className="flex flex-col">
          {/* Accordion Header */}
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full bg-white rounded-lg p-8 flex justify-between items-center cursor-pointer hover:bg-[#F3F4F6] transition-colors text-left"
          >
            <h3 className="font-headline font-semibold text-2xl leading-8 text-[#191C1E]">
              {item.question}
            </h3>
            <span
              className={`material-symbols-outlined text-[#44474D] transition-transform duration-300 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
              style={{ fontSize: '12px' }}
            >
              expand_more
            </span>
          </button>

          {/* Accordion Content */}
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: openIndex === index ? '500px' : '0px',
            }}
          >
            <div className="bg-white px-8 pb-8 rounded-b-lg border-t border-[rgba(197,198,205,0.1)]">
              <p className="font-body text-base leading-[26px] text-[#44474D] pt-4">
                {item.answer}
              </p>
            </div>
          </div>

          {/* Horizontal Divider */}
          <div
            className="w-full h-[1px] rounded-b-lg"
            style={{
              background: '#FFFFFF',
              borderTop: '1px solid rgba(197, 198, 205, 0.1)',
            }}
          ></div>
        </div>
      ))}
    </div>
  );
};

export default FAQAccordion;
