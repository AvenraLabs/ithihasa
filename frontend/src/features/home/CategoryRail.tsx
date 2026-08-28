import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories, type Category } from '../../api/categories.js';

// Curated Category Imagery for Luxury Presentation
const CATEGORY_IMAGES: Record<string, string> = {
  'heritage-kurtas': 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=600&q=80',
  'bandhgalas-jackets': 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=600&q=80',
  'dhoti-bottoms': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
  'royal-shawls-stoles': 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=600&q=80',
};

export const CategoryRail: React.FC = () => {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  return (
    <section className="py-12 md:py-16 px-5 md:px-10 max-w-[1440px] mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--gold)] block mb-1">
            Curated Categories
          </span>
          <h2
            className="text-[26px] md:text-[34px] tracking-wide text-[var(--text-primary)] font-normal"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            Signature Silhouettes
          </h2>
        </div>
        <Link
          to="/shop"
          className="text-[12px] font-bold tracking-[0.15em] uppercase text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors pb-1 border-b border-[var(--text-primary)] hover:border-[var(--gold)]"
        >
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[4/5] bg-[var(--bg-secondary)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => {
            const bgImage = cat.imageUrl || CATEGORY_IMAGES[cat.slug] || CATEGORY_IMAGES['heritage-kurtas'];

            return (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="group relative aspect-[3/4] bg-[var(--bg-secondary)] overflow-hidden block transition-all duration-500 border border-[var(--border-color)]"
              >
                {/* Image */}
                <img
                  src={bgImage}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity duration-300" />

                {/* Text Content */}
                <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                  <h3
                    className="text-[20px] md:text-[22px] tracking-wide leading-snug mb-1 font-normal transition-transform duration-300 group-hover:-translate-y-1"
                    style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                  >
                    {cat.name}
                  </h3>
                  <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#E8C877] transition-opacity duration-300">
                    Explore Collection
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};
