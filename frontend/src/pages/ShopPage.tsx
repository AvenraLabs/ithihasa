import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, type Product } from '../api/products.js';
import { fetchCategories, type Category } from '../api/categories.js';
import { fetchWishlist, toggleWishlist } from '../api/wishlist.js';
import { addToCart } from '../api/cart.js';
import {
  SlidersHorizontal,
  ChevronDown,
  X,
  Heart,
  Check,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const currentCategory = searchParams.get('category') || '';
  const currentSort = (searchParams.get('sort') as any) || 'newest';

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Filter state
  const [selectedCat, setSelectedCat] = useState<string>(currentCategory);
  const [selectedSort, setSelectedSort] = useState<string>(currentSort);

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Fetch products with active filters
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products', currentCategory, currentSort],
    queryFn: () =>
      fetchProducts({
        categorySlug: currentCategory || undefined,
        sort: currentSort,
      }),
  });

  // Fetch wishlist for filled heart status
  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchWishlist,
  });

  const wishlistMutation = useMutation({
    mutationFn: ({ productId, product }: { productId: string; product?: any }) =>
      toggleWishlist(productId, undefined, product),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      showToast(res.message || 'Saved to Wishlist');
    },
  });

  const quickAddToCartMutation = useMutation({
    mutationFn: ({ variantId }: { variantId: string }) => addToCart(variantId, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      showToast('Added to Bag');
    },
  });

  const showToast = (msg: string) => {
    toast.success(msg);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams);
    if (selectedCat) {
      params.set('category', selectedCat);
    } else {
      params.delete('category');
    }
    if (selectedSort) {
      params.set('sort', selectedSort);
    }
    setSearchParams(params);
    setIsFilterOpen(false);
  };

  const handleSortSelect = (sortVal: string) => {
    setSelectedSort(sortVal);
    const params = new URLSearchParams(searchParams);
    params.set('sort', sortVal);
    setSearchParams(params);
    setIsSortOpen(false);
  };

  const getPageTitle = () => {
    if (!currentCategory) return 'New Arrivals';
    const match = categories.find((c) => c.slug === currentCategory);
    return match ? match.name : currentCategory.replace(/-/g, ' ');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors relative">
      <div className="pt-2 md:pt-6 px-4 sm:px-6 md:px-20 max-w-[1440px] mx-auto pb-24 md:pb-16">
        {/* Category Header & Controls matching Stitch Shop Spec */}
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[var(--text-secondary)] label-caps mb-2 text-[11px]">
              <Link to="/" className="hover:text-[var(--text-primary)] transition-colors">
                HOME
              </Link>
              <span>/</span>
              <span className="text-[var(--text-primary)]">SHOP</span>
              {currentCategory && (
                <>
                  <span>/</span>
                  <span className="text-[var(--gold)] uppercase">{getPageTitle()}</span>
                </>
              )}
            </nav>

            <h1
              className="text-[28px] md:text-[44px] leading-tight text-[var(--text-primary)] font-normal uppercase tracking-wide"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              {getPageTitle()}
            </h1>
          </div>

          {/* Filter & Sort Action Buttons */}
          <div className="flex items-center gap-4 border-t md:border-t-0 border-[var(--border-color)] pt-3 md:pt-0">
            {/* Filters Button */}
            <button
              onClick={() => {
                setSelectedCat(currentCategory);
                setIsFilterOpen(true);
              }}
              className="flex items-center gap-2 label-caps text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors py-2 active:scale-95 text-[12px]"
            >
              <SlidersHorizontal size={16} className="text-[var(--gold)]" />
              <span>FILTERS {currentCategory ? '(1)' : ''}</span>
            </button>

            {/* Sort Dropdown Anchor */}
            <div className="relative ml-auto md:ml-4">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 label-caps text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors py-2 active:scale-95 text-[12px]"
              >
                <span>SORT BY</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Sort Menu Popup */}
              {isSortOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsSortOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl z-40 py-2">
                    {[
                      { label: 'Newest Arrivals', val: 'newest' },
                      { label: 'Featured First', val: 'featured' },
                      { label: 'Price: Low to High', val: 'price_asc' },
                      { label: 'Price: High to Low', val: 'price_desc' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        onClick={() => handleSortSelect(item.val)}
                        className={`w-full text-left px-4 py-2.5 text-[12px] label-caps flex items-center justify-between transition-colors ${
                          currentSort === item.val
                            ? 'text-[var(--gold)] font-bold bg-[var(--bg-secondary)]'
                            : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                        }`}
                      >
                        <span>{item.label}</span>
                        {currentSort === item.val && <Check size={14} className="text-[var(--gold)]" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Product Grid (2-col mobile, 4-col desktop matching Stitch) */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-[var(--bg-secondary)] animate-pulse" />
                <div className="h-4 bg-[var(--bg-secondary)] w-3/4 animate-pulse" />
                <div className="h-4 bg-[var(--bg-secondary)] w-1/4 animate-pulse" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center max-w-md mx-auto">
            <h3
              className="text-[24px] font-normal mb-2 text-[var(--text-primary)]"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              No Silhouettes Found
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] mb-6">
              No garments match the selected filters.
            </p>
            <button
              onClick={() => {
                setSearchParams({});
                setSelectedCat('');
              }}
              className="bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] px-8 py-3.5 label-caps"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
            {products.map((product) => {
              const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url;
              const secondaryImage = product.images.find((img) => !img.isPrimary)?.url || primaryImage;
              const firstVariant = product.variants?.[0];
              const isWishlisted = wishlist.some(
                (item) => item.productId === product.id || item.product?.id === product.id
              );

              return (
                <article key={product.id} className="group cursor-pointer flex flex-col min-w-0">
                  {/* Image Container with Hover Fade and Card Action Buttons */}
                  <div className="relative aspect-[3/4] mb-3 overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <Link to={`/products/${product.slug}`} className="block w-full h-full">
                      {/* Primary Image */}
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0 absolute inset-0 z-10 img-hover-fade"
                        loading="lazy"
                      />

                      {/* Secondary Hover Image */}
                      <img
                        src={secondaryImage}
                        alt={`${product.name} detail`}
                        className="w-full h-full object-cover absolute inset-0 z-0 scale-100 group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    </Link>

                    {/* Top-Right Wishlist Heart Action (Stitch Specification) */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        wishlistMutation.mutate({
                          productId: product.id,
                          product: {
                            id: product.id,
                            name: product.name,
                            slug: product.slug,
                            basePrice: product.basePrice,
                            compareAtPrice: product.compareAtPrice,
                            image: primaryImage,
                            category: product.category,
                          },
                        });
                      }}
                      aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                      className="absolute top-2 right-2 z-20 p-2 bg-[var(--bg-primary)]/85 backdrop-blur-md rounded-full text-[var(--gold)] hover:scale-110 active:scale-90 transition-transform duration-200 shadow-sm border border-[var(--border-color)]"
                    >
                      <Heart
                        size={18}
                        strokeWidth={1.75}
                        className="text-[var(--gold)]"
                        fill={isWishlisted ? "currentColor" : "none"}
                      />
                    </button>

                    {/* Bottom-Right Quick Add to Bag Action (Stitch Specification) */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (firstVariant) {
                          quickAddToCartMutation.mutate({ variantId: firstVariant.id });
                        }
                      }}
                      disabled={quickAddToCartMutation.isPending}
                      aria-label="Quick Add to Bag"
                      className="absolute bottom-2 right-2 z-20 p-2 bg-[var(--bg-primary)]/85 backdrop-blur-md rounded-full text-[var(--gold)] hover:scale-110 active:scale-90 transition-transform duration-200 shadow-sm border border-[var(--border-color)]"
                    >
                      <ShoppingBag size={18} strokeWidth={1.75} />
                    </button>
                  </div>

                  {/* Product Info (min-w-0 prevents text overflow/collision) */}
                  <div className="flex items-baseline justify-between gap-2 min-w-0">
                    <Link to={`/products/${product.slug}`} className="flex-1 min-w-0 block">
                      <h3 className="body-md text-[14px] md:text-[16px] text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors truncate font-normal leading-snug">
                        {product.name}
                      </h3>
                    </Link>
                    <span className="body-md text-[13px] md:text-[15px] text-[var(--text-primary)] tabular-nums font-semibold shrink-0 whitespace-nowrap">
                      {formatPrice(product.basePrice)}
                    </span>
                  </div>
                  <p className="body-sm text-[12px] text-[var(--text-secondary)] mt-0.5 truncate">
                    {product.category?.name || 'Pure Handloom'}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet matching Stitch Specification */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-stretch md:justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsFilterOpen(false)}
          />

          {/* Sheet Panel */}
          <div className="relative z-10 w-full md:w-[400px] h-[80vh] md:h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] border-t md:border-t-0 md:border-l border-[var(--border-color)] flex flex-col justify-between shadow-2xl transition-transform duration-300">
            {/* Top Handle on Mobile */}
            <div className="flex justify-center pt-3 pb-2 md:hidden">
              <div className="w-12 h-1 bg-[var(--border-color)]" />
            </div>

            {/* Sheet Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-color)]">
              <h2
                className="text-[22px] text-[var(--text-primary)] font-normal uppercase"
                style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
              >
                Filters
              </h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-1 text-[var(--text-primary)] hover:opacity-70"
                aria-label="Close filters"
              >
                <X size={22} />
              </button>
            </div>

            {/* Filter Options */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="label-caps text-[12px] font-bold text-[var(--gold)] mb-3 uppercase tracking-wider">
                  COLLECTION CATEGORY
                </h3>
                <div className="space-y-3">
                  <label
                    onClick={() => setSelectedCat('')}
                    className="flex items-center gap-3 text-[14px] cursor-pointer group"
                  >
                    <div
                      className={`w-5 h-5 border flex items-center justify-center transition-colors ${
                        selectedCat === ''
                          ? 'bg-[var(--gold)] border-[var(--gold)] text-[#0A0A0A]'
                          : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'
                      }`}
                    >
                      {selectedCat === '' && <Check size={14} strokeWidth={2.5} />}
                    </div>
                    <span className={selectedCat === '' ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)]'}>
                      All Silhouettes
                    </span>
                  </label>

                  {categories.map((cat) => {
                    const isSelected = selectedCat === cat.slug;
                    return (
                      <label
                        key={cat.id}
                        onClick={() => setSelectedCat(isSelected ? '' : cat.slug)}
                        className="flex items-center gap-3 text-[14px] cursor-pointer group"
                      >
                        <div
                          className={`w-5 h-5 border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[var(--gold)] border-[var(--gold)] text-[#0A0A0A]'
                              : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'
                          }`}
                        >
                          {isSelected && <Check size={14} strokeWidth={2.5} />}
                        </div>
                        <span className={isSelected ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)]'}>
                          {cat.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Sort Order */}
              <div className="border-t border-[var(--border-color)] pt-6">
                <h3 className="label-caps text-[12px] font-bold text-[var(--gold)] mb-3 uppercase tracking-wider">
                  SORT ORDER
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Newest Arrivals', val: 'newest' },
                    { label: 'Featured Masterpieces', val: 'featured' },
                    { label: 'Price: Low to High', val: 'price_asc' },
                    { label: 'Price: High to Low', val: 'price_desc' },
                  ].map((item) => (
                    <label
                      key={item.val}
                      onClick={() => setSelectedSort(item.val)}
                      className="flex items-center gap-3 text-[14px] cursor-pointer group"
                    >
                      <div
                        className={`w-5 h-5 border flex items-center justify-center transition-colors ${
                          selectedSort === item.val
                            ? 'bg-[var(--gold)] border-[var(--gold)] text-[#0A0A0A]'
                            : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'
                        }`}
                      >
                        {selectedSort === item.val && <Check size={14} strokeWidth={2.5} />}
                      </div>
                      <span className={selectedSort === item.val ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)]'}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Apply Action Bottom Bar */}
            <div className="p-6 border-t border-[var(--border-color)] pb-safe">
              <button
                onClick={handleApplyFilters}
                className="w-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--gold)] hover:text-[#0A0A0A] label-caps py-4 tracking-widest transition-colors duration-300 uppercase shadow-lg"
              >
                VIEW RESULTS ({products.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
