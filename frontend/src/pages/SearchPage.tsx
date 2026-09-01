import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, type Product } from '../api/products.js';
import { fetchStorefrontData } from '../api/merchandising.js';
import { Search as SearchIcon, X, History, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ithihasa_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { data: cms } = useQuery({
    queryKey: ['storefront'],
    queryFn: fetchStorefrontData,
  });

  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((t) => t.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 6);
      try {
        localStorage.setItem('ithihasa_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('ithihasa_recent_searches');
    } catch {}
  };

  const { data: results = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products', 'search', searchTerm],
    queryFn: () => {
      if (searchTerm.trim().length > 1) {
        saveRecentSearch(searchTerm.trim());
      }
      return fetchProducts({ search: searchTerm });
    },
    enabled: searchTerm.trim().length > 1,
  });

  const handleSelectRecent = (term: string) => {
    setSearchTerm(term);
    saveRecentSearch(term);
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

  const trendingCollections = cms?.trendingCollections || [];
  const quickQueryTags = cms?.quickQueryTags && cms.quickQueryTags.length > 0
    ? cms.quickQueryTags
    : [
        { label: 'Silk Shirts', query: 'silk shirt' },
        { label: 'Heritage Kurtas', query: 'kurta' },
        { label: 'Bandhgalas', query: 'bandhgala' },
        { label: 'Pashmina', query: 'pashmina' },
      ];

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
            placeholder="Search Heritage Silhouettes (e.g. silk, black shirt, kurta)..."
            autoFocus
            autoComplete="off"
            className="w-full pl-10 pr-10 py-4 font-normal text-[20px] md:text-[30px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 placeholder:font-light bg-transparent border-b border-[var(--border-color)] focus:border-[var(--gold)] focus:outline-none transition-colors rounded-none"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          />
          {searchTerm.length > 0 && (
            <button
              onClick={handleClear}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1 cursor-pointer"
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
                  No pieces matched "{searchTerm}". Try searching for silk, bandhgala, kurta, or explore our curated collections below.
                </p>
                <button
                  onClick={handleClear}
                  className="bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--gold)] hover:text-[#0A0A0A] px-8 py-3.5 label-caps uppercase tracking-widest transition-colors cursor-pointer"
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
              {recentSearches.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="label-caps text-[12px] text-[var(--gold)] tracking-[0.15em] uppercase font-bold">
                      Recent Searches
                    </h2>
                    <button
                      onClick={clearAllRecent}
                      className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--gold)] cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {recentSearches.map((term, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleSelectRecent(term)}
                          className="group flex items-center gap-3 body-md text-[14px] md:text-[15px] text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors text-left w-full cursor-pointer"
                        >
                          <History size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--gold)] transition-colors shrink-0" />
                          <span>{term}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Quick Suggestion Chips */}
              <section className="pt-4 border-t border-[var(--border-color)]">
                <h2 className="label-caps text-[12px] text-[var(--gold)] mb-4 tracking-[0.15em] uppercase font-bold">
                  Quick Query Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {quickQueryTags.map((tag, i) => (
                    <button
                      key={i}
                      onClick={() => setSearchTerm(tag.query)}
                      className="px-3.5 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[12px] label-caps text-[var(--text-primary)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors cursor-pointer"
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Trending Collections Grid */}
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

                {/* Dynamic Collections Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {trendingCollections.map((col, idx) => (
                    <Link
                      key={col.slug || idx}
                      to={`/shop?category=${col.slug}`}
                      className="group relative block h-44 overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm"
                    >
                      <img
                        src={col.imageUrl}
                        alt={col.name}
                        className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                      <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white flex justify-between items-end">
                        <div>
                          <h3
                            className="text-[18px] sm:text-[20px] font-normal leading-snug"
                            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                          >
                            {col.name}
                          </h3>
                          <span className="label-caps text-[10px] text-[var(--gold)] uppercase tracking-wider block mt-0.5">
                            {col.itemCount} Masterpieces
                          </span>
                        </div>
                        <ArrowRight size={16} className="text-[var(--gold)] group-hover:translate-x-1 transition-transform shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
