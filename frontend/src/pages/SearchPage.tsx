import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, type Product } from '../api/products.js';
import { Search as SearchIcon, X, History, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Varanasi Silk Kurtas',
    'Imperial Bandhgala',
    'The Royal Heritage Series',
    'Mulberry Silk Dhoti',
  ]);

  const { data: results = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products', 'search', searchTerm],
    queryFn: () => {
      if (searchTerm.trim() && !recentSearches.includes(searchTerm.trim())) {
        setRecentSearches((prev) => [searchTerm.trim(), ...prev.slice(0, 3)]);
      }
      return fetchProducts({ search: searchTerm });
    },
    enabled: searchTerm.trim().length > 1,
  });

  const handleSelectRecent = (term: string) => {
    setSearchTerm(term);
  };

  const handleClear = () => {
    setSearchTerm('');
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-5 md:px-20 py-8 md:py-16 pb-24 md:pb-16">
        {/* Desktop Header / Search Context */}
        <div className="hidden md:flex flex-col items-center mb-12 text-center">
          <h1
            className="text-[44px] text-[var(--text-primary)] mb-3 font-normal uppercase tracking-wide"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            Discover Heritage
          </h1>
          <p className="body-md text-[15px] text-[var(--text-secondary)] max-w-md">
            Search our curated collection of timeless pieces, editorial archives, and atelier exclusives.
          </p>
        </div>

        {/* Search Input Section matching Stitch */}
        <div className="relative max-w-3xl mx-auto mb-12 group">
          <SearchIcon
            size={26}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--gold)] transition-colors"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Heritage Silhouettes..."
            autoFocus
            autoComplete="off"
            className="w-full pl-10 pr-10 py-4 font-normal text-[22px] md:text-[32px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 placeholder:font-light bg-transparent border-b border-[var(--border-color)] focus:border-[var(--gold)] focus:outline-none transition-colors rounded-none"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          />
          {searchTerm.length > 0 && (
            <button
              onClick={handleClear}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1"
              aria-label="Clear search"
            >
              <X size={22} />
            </button>
          )}
        </div>

        {/* Search Results Mode */}
        {searchTerm.trim().length > 1 ? (
          <div className="max-w-5xl mx-auto">
            {isLoading ? (
              <div className="py-20 text-center text-[var(--text-secondary)]">
                <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="label-caps tracking-widest uppercase text-[12px]">Searching Heritage Archive...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-[var(--border-color)] mb-6">
                  <span className="label-caps text-[12px] uppercase text-[var(--gold)] font-semibold tracking-wider">
                    {results.length} Silhouettes Found
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((product) => {
                    const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url;
                    return (
                      <Link
                        key={product.id}
                        to={`/products/${product.slug}`}
                        className="flex items-center justify-between p-4 bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] transition-colors group"
                      >
                        <div className="flex items-center space-x-4 min-w-0">
                          <img
                            src={primaryImage || 'https://via.placeholder.com/150'}
                            alt={product.name}
                            className="w-16 h-20 object-cover bg-[var(--bg-secondary)] shrink-0 border border-[var(--border-color)]"
                          />
                          <div className="min-w-0 flex-1">
                            <h3
                              className="text-[18px] md:text-[20px] font-normal text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors truncate"
                              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                            >
                              {product.name}
                            </h3>
                            <p className="body-sm text-[12px] text-[var(--text-secondary)] truncate">
                              {product.category?.name || 'Heritage Creation'}
                            </p>
                            <p className="body-sm text-[14px] font-semibold text-[var(--text-primary)] mt-1 tabular-nums">
                              {formatPrice(product.basePrice)}
                            </p>
                          </div>
                        </div>
                        <ArrowRight size={18} className="text-[var(--gold)] shrink-0 ml-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center max-w-md mx-auto">
                <h3
                  className="text-[24px] font-normal mb-2 text-[var(--text-primary)]"
                  style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                >
                  No Silhouettes Found
                </h3>
                <p className="text-[14px] text-[var(--text-secondary)] mb-6">
                  No pieces matched "{searchTerm}". Try searching for silk, bandhgala, or explore our curated collections.
                </p>
                <button
                  onClick={handleClear}
                  className="bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--gold)] hover:text-[#0A0A0A] px-8 py-3.5 label-caps uppercase tracking-widest transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Default Stitch Search Screen Content Grid (Recent Searches + Trending Bento) */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 max-w-5xl mx-auto">
            {/* Left Column: Recent Searches & Suggestions (5 cols) */}
            <div className="md:col-span-5 flex flex-col gap-8">
              {/* Recent Searches */}
              <section>
                <h2 className="label-caps text-[12px] text-[var(--gold)] mb-4 tracking-[0.15em] uppercase font-bold">
                  Recent Searches
                </h2>
                <ul className="flex flex-col gap-3">
                  {recentSearches.map((term, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handleSelectRecent(term)}
                        className="group flex items-center gap-3 body-md text-[14px] md:text-[15px] text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors text-left w-full"
                      >
                        <History size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--gold)] transition-colors shrink-0" />
                        <span>{term}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Suggestions */}
              <section className="pt-4 border-t border-[var(--border-color)]">
                <h2 className="label-caps text-[12px] text-[var(--gold)] mb-4 tracking-[0.15em] uppercase font-bold">
                  Popular Categories
                </h2>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Pure Handloom Kurtas', query: 'kurtas' },
                    { label: 'Imperial Bandhgalas', query: 'bandhgala' },
                    { label: 'Silk Dhotis & Sarees', query: 'silk' },
                    { label: 'Pashmina Shawls', query: 'pashmina' },
                  ].map((cat, i) => (
                    <Link
                      key={i}
                      to={`/shop?category=${cat.query}`}
                      className="px-3.5 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[12px] label-caps text-[var(--text-primary)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Trending Bento Grid (7 cols matching Stitch) */}
            <div className="md:col-span-7 flex flex-col gap-6">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="label-caps text-[12px] text-[var(--gold)] tracking-[0.15em] uppercase font-bold">
                    Trending Collections
                  </h2>
                  <Link
                    to="/shop"
                    className="label-caps text-[11px] text-[var(--text-secondary)] hover:text-[var(--gold)] underline transition-colors"
                  >
                    View All
                  </Link>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {/* Large Featured Card */}
                  <Link
                    to="/shop"
                    className="col-span-2 group relative block h-64 overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop"
                      alt="The Silk Archive"
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3
                        className="text-[22px] md:text-[26px] font-normal leading-snug"
                        style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                      >
                        The Silk Archive
                      </h3>
                      <p className="label-caps text-[11px] text-white/80 mt-1 uppercase tracking-wider">
                        Explore Curated Masterpieces
                      </p>
                    </div>
                  </Link>

                  {/* Small Card 1 */}
                  <Link
                    to="/shop"
                    className="col-span-1 group relative block h-40 overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop"
                      alt="Atelier Craft"
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <span className="label-caps text-[11px] text-white bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/20 uppercase tracking-widest text-center">
                        Atelier Weaves
                      </span>
                    </div>
                  </Link>

                  {/* Small Card 2 */}
                  <Link
                    to="/shop"
                    className="col-span-1 group relative block h-40 overflow-hidden bg-[var(--bg-card)] flex flex-col items-center justify-center p-4 text-center border border-[var(--border-color)] hover:border-[var(--gold)] transition-colors shadow-sm"
                  >
                    <Sparkles size={28} className="text-[var(--gold)] mb-2 group-hover:scale-110 transition-transform" />
                    <h4
                      className="text-[18px] font-normal text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors"
                      style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                    >
                      Royal Heritage
                    </h4>
                    <span className="label-caps text-[10px] text-[var(--text-secondary)] mt-1 uppercase tracking-wider">
                      Handcrafted
                    </span>
                  </Link>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
