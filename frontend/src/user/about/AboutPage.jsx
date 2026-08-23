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
      <main
        id="main-content"
        className="w-full flex flex-col items-center pt-12 sm:pt-16 pb-16 sm:pb-24 gap-16 sm:gap-24 lg:gap-32"
      >
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
