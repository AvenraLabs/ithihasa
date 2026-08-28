import React from 'react';
import { HeroSection } from '../features/home/HeroSection.js';
import { FeaturedSilhouettes } from '../features/home/FeaturedSilhouettes.js';

export const HomePage: React.FC = () => {
  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Spacer */}
      <div className="h-12 md:h-16" />

      {/* 3. Timeless Silhouettes Product Section */}
      <FeaturedSilhouettes />

      {/* 4. Bottom Spacer */}
      <div className="h-16 md:h-20" />
    </div>
  );
};
