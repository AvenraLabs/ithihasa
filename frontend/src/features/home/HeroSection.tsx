import React from 'react';
import { useNavigate } from 'react-router-dom';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full h-[85vh] md:h-screen flex items-end justify-center pb-16 md:pb-24 px-5 md:px-20 bg-[var(--bg-secondary)] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        {/* Subtle overlay for text legibility */}
        <div className="absolute inset-0 bg-black/20 z-10" />
        <img
          src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=2000&q=85"
          alt="The Heritage Collection"
          className="w-full h-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
        />
      </div>

      {/* Hero Content matching Stitch Specification */}
      <div className="relative z-20 text-center w-full max-w-4xl mx-auto text-white">
        <h2
          className="text-[32px] sm:text-[40px] md:text-[48px] mb-2 uppercase tracking-widest font-normal"
          style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
        >
          The Heritage Collection
        </h2>
        <p className="body-md text-[16px] text-white/90 mb-8 tracking-wide font-light">
          Wear Your Legacy.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-label-caps text-label-caps px-8 py-4 tracking-widest hover:bg-[var(--gold)] hover:text-[#0A0A0A] transition-colors duration-300 border border-[var(--border-color)] uppercase"
        >
          EXPLORE COLLECTION
        </button>
      </div>
    </section>
  );
};
