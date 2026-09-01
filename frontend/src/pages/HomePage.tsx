import React from 'react';
import { HeroSection } from '../features/home/HeroSection.js';
import { FeaturedSilhouettes } from '../features/home/FeaturedSilhouettes.js';

export const HomePage: React.FC = () => {
  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Timeless Silhouettes Product Section (Padding is encapsulated within the component when enabled) */}
      <FeaturedSilhouettes />
    </div>
  );
};
