import React from 'react';
import UserHeader from '../components/UserHeader';
import UserFooter from '../components/UserFooter';
import AboutHero from '../components/AboutHero';
import MissionSection from '../components/MissionSection';
import StatsSection from '../components/StatsSection';
import BenefitsSection from '../components/BenefitsSection';
import AboutCTASection from '../components/AboutCTASection';

const AboutPage = () => {
  return (
    <div className="flex flex-col items-start bg-[#F8F9FB] min-h-screen w-full">
      <UserHeader activePage="about" />
      <main className="w-full flex flex-col items-center pt-16 pb-24 gap-32">
        <AboutHero />
        <MissionSection />
        <StatsSection />
        <BenefitsSection />
        <AboutCTASection />
      </main>
      <UserFooter />
    </div>
  );
};

export default AboutPage;
