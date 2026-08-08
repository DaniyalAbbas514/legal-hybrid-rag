import React from 'react';
import UserHeader from '../components/UserHeader';
import UserFooter from '../components/UserFooter';
import FAQHero from '../components/FAQHero';
import FAQAccordion from '../components/FAQAccordion';
import FAQCTASection from '../components/FAQCTASection';

const FAQPage = () => {
  return (
    <div className="flex flex-col bg-[#F8F9FB] min-h-screen w-full">
      <UserHeader activePage="faq" />
      <main className="flex-1 pt-24 pb-24 relative">
        <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
          <FAQHero />
          <div className="lg:col-span-7">
            <FAQAccordion />
          </div>
        </div>
        <FAQCTASection />
      </main>
      <UserFooter />
    </div>
  );
};

export default FAQPage;
