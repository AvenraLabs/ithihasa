import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchStorefrontData } from '../../api/merchandising.js';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const { data: cms } = useQuery({
    queryKey: ['storefront'],
    queryFn: fetchStorefrontData,
    staleTime: 1000 * 60 * 5,
  });

  const hero = cms?.hero || {
    title: 'The Heritage Collection',
    subtitle: 'Wear Your Legacy.',
    imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=2000&q=85',
    ctaText: 'EXPLORE COLLECTION',
    ctaLink: '/shop',
  };

  return (
    <section className="relative w-full h-[85vh] md:h-screen flex items-end justify-center pb-16 md:pb-24 px-5 md:px-20 bg-[var(--bg-secondary)] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        {/* Subtle overlay for text legibility */}
        <div className="absolute inset-0 bg-black/25 z-10" />
        <img
          src={hero.imageUrl}
          alt={hero.title}
          className="w-full h-full object-cover object-center transition-all duration-700"
          loading="eager"
          fetchPriority="high"
        />
      </div>

      {/* Hero Content matching Stitch Specification */}
      <div className="relative z-20 text-center w-full max-w-4xl mx-auto text-white animate-in fade-in slide-in-from-bottom-3 duration-700">
        <h2
          className="text-[32px] sm:text-[40px] md:text-[48px] mb-2 uppercase tracking-widest font-normal drop-shadow-md"
          style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
        >
          {hero.title}
        </h2>
        <p className="body-md text-[16px] text-white/90 mb-8 tracking-wide font-light drop-shadow">
          {hero.subtitle}
        </p>
        <button
          onClick={() => navigate(hero.ctaLink || '/shop')}
          className="bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-label-caps text-label-caps px-8 py-4 tracking-widest hover:bg-[var(--gold)] hover:text-[#0A0A0A] transition-colors duration-300 border border-[var(--border-color)] uppercase shadow-lg active:scale-95"
        >
          {hero.ctaText || 'EXPLORE COLLECTION'}
        </button>
      </div>
    </section>
  );
};
