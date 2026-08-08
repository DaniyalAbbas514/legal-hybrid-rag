import React from 'react';
import UserHeader from '../components/UserHeader';
import UserFooter from '../components/UserFooter';
import HeroSection from '../components/HeroSection';
import FeaturesBentoGrid from '../components/FeaturesBentoGrid';
import PricingSection from '../components/PricingSection';

const HomePage = () => {
  return (
    <div className="flex flex-col items-start bg-[#F8F9FB] min-h-screen w-full">
      <UserHeader activePage="home" />
      <main className="w-full">
        <HeroSection />
        <FeaturesBentoGrid />
        <PricingSection />
      </main>
      <UserFooter showSocials={true} />
    </div>
  );
};

export default HomePage;
