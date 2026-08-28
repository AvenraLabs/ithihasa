import React from 'react';
import { ShieldCheck, Sparkles, Feather, Clock } from 'lucide-react';

export const BrandCraftsmanship: React.FC = () => {
  const pillars = [
    {
      icon: Feather,
      title: 'Varanasi Mulberry Silk',
      description: 'Handloom spun raw silk woven by generational artisan families on traditional wooden pit looms.',
    },
    {
      icon: Sparkles,
      title: 'Antique Brushed Gold',
      description: 'Zari borders crafted with electroplated bullion threads and hand-cast metal buttons.',
    },
    {
      icon: ShieldCheck,
      title: 'GI-Certified Pashmina',
      description: '100% authentic Changthangi mountain cashmere hand-embroidered with classic Sozni needlework.',
    },
    {
      icon: Clock,
      title: 'Timeless Dignity',
      description: 'Structured 0px clean geometry designed to transcend transient trends and endure generations.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-[var(--bg-secondary)] border-y border-[var(--border-color)] transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Editorial Statement */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[var(--gold)] block mb-2">
            The Philosophy of Quiet Luxury
          </span>
          <h2
            className="text-[30px] md:text-[42px] leading-tight text-[var(--text-primary)] font-normal mb-4"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            "We do not make fashion for seasons. We craft legacies for generations."
          </h2>
          <div className="w-16 h-0.5 bg-[var(--gold)] mx-auto mb-4" />
          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
            Ithihasa represents the confluence of royal Indian silhouettes and uncompromising modern craftsmanship. Every weave tells a story of heritage.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center p-6 bg-[var(--bg-card)] border border-[var(--border-color)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--gold)] mb-4">
                <pillar.icon size={22} strokeWidth={1.75} />
              </div>
              <h3
                className="text-[19px] text-[var(--text-primary)] font-normal mb-2"
                style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
              >
                {pillar.title}
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
