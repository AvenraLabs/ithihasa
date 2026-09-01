import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, type Product } from '../api/products.js';
import { fetchCategories, type Category } from '../api/categories.js';
import { fetchWishlist, toggleWishlist } from '../api/wishlist.js';
import { addToCart } from '../api/cart.js';
import { SizeGuideModal } from '../components/ui/SizeGuideModal.js';
import {
  SlidersHorizontal,
  ChevronDown,
  X,
  Heart,
  Check,
  ShoppingBag,
  Ruler,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const currentCategory = searchParams.get('category') || '';
  const currentSort = (searchParams.get('sort') as any) || 'newest';
  const currentSize = searchParams.get('size') || '';
  const currentColor = searchParams.get('color') || '';

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Draft filter state for drawer
  const [selectedCat, setSelectedCat] = useState<string>(currentCategory);
  const [selectedSort, setSelectedSort] = useState<string>(currentSort);
  const [selectedSize, setSelectedSize] = useState<string>(currentSize);
  const [selectedColor, setSelectedColor] = useState<string>(currentColor);

  // Fetch categories dynamically from backend
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Fetch all products (unfiltered) to dynamically extract sizes & colors present in the atelier
  const { data: allCatalogProducts = [] } = useQuery<Product[]>({
    queryKey: ['all-catalog-products-for-filters'],
    queryFn: () => fetchProducts({ limit: 50 }),
  });

  // Fetch filtered & sorted products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products', currentCategory, currentSort, currentSize, currentColor],
    queryFn: () =>
      fetchProducts({
        categorySlug: currentCategory || undefined,
        sort: currentSort,
        size: currentSize || undefined,
        color: currentColor || undefined,
      }),
  });

  // Extract dynamic sizes from actual backend product inventory
  const dynamicSizes = Array.from(
    new Set(
      allCatalogProducts
        .flatMap((p) => p.variants?.map((v) => v.size) || [])
        .filter(Boolean)
    )
  );
  const availableSizes = dynamicSizes.length > 0
    ? dynamicSizes
    : ['36', '38', '40', '42', '44', '46', 'Free Size'];

  // Extract dynamic colors from actual backend product inventory
  const colorMap = new Map<string, string>();
  allCatalogProducts.forEach((p) => {
    if (p.metadata?.colorSwatches && Array.isArray(p.metadata.colorSwatches)) {
      p.metadata.colorSwatches.forEach((swatch: any) => {
        if (swatch.name && !colorMap.has(swatch.name)) {
          colorMap.set(swatch.name, swatch.hex || '#0A0A0A');
        }
      });
    }
    p.variants?.forEach((v) => {
      if (v.color && !colorMap.has(v.color)) {
        const hex = v.color.toLowerCase().includes('gold') ? '#C9A24B'
          : v.color.toLowerCase().includes('noir') || v.color.toLowerCase().includes('black') ? '#0A0A0A'
          : v.color.toLowerCase().includes('crimson') || v.color.toLowerCase().includes('red') ? '#7A1C22'
          : v.color.toLowerCase().includes('ivory') || v.color.toLowerCase().includes('white') ? '#F4EFE6'
          : v.color.toLowerCase().includes('emerald') || v.color.toLowerCase().includes('green') ? '#1B4D3E'
          : v.color.toLowerCase().includes('sapphire') || v.color.toLowerCase().includes('blue') ? '#1A2A44'
          : '#4A3E3D';
        colorMap.set(v.color, hex);
      }
    });
  });

  const availableColors = colorMap.size > 0
    ? Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }))
    : [
        { name: 'Midnight Noir', hex: '#0A0A0A' },
        { name: 'Royal Crimson', hex: '#7A1C22' },
        { name: 'Antique Gold', hex: '#C9A24B' },
        { name: 'Ivory Silk', hex: '#F4EFE6' },
        { name: 'Emerald Heritage', hex: '#1B4D3E' },
      ];

  // Calculate active applied filter count
  const activeFilters = [
    currentCategory,
    currentSize,
    currentColor,
    currentSort && currentSort !== 'newest' ? currentSort : null,
  ].filter(Boolean);
  const activeFilterCount = activeFilters.length;

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
      toast.success(res.message || 'Saved to Wishlist');
    },
  });

  const quickAddToCartMutation = useMutation({
    mutationFn: ({ variantId }: { variantId: string }) => addToCart(variantId, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to Bag');
    },
  });

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (selectedCat) params.set('category', selectedCat);
    if (selectedSize) params.set('size', selectedSize);
    if (selectedColor) params.set('color', selectedColor);
    if (selectedSort && selectedSort !== 'newest') params.set('sort', selectedSort);
    setSearchParams(params);
    setIsFilterOpen(false);
    toast.success('Filters applied');
  };

  const handleResetFilters = () => {
    setSelectedCat('');
    setSelectedSize('');
    setSelectedColor('');
    setSelectedSort('newest');
    setSearchParams({});
    setIsFilterOpen(false);
    toast.success('All filters reset');
  };

  const handleSortSelect = (sortVal: string) => {
    setSelectedSort(sortVal);
    const params = new URLSearchParams(searchParams);
    if (sortVal === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', sortVal);
    }
    setSearchParams(params);
    setIsSortOpen(false);
  };

  const getPageTitle = () => {
    if (!currentCategory) return 'The Collection';
    const match = categories.find((c) => c.slug === currentCategory);
    return match ? match.name : currentCategory.replace(/-/g, ' ');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors relative">
      <div className="pt-2 md:pt-6 px-4 sm:px-6 md:px-20 max-w-[1440px] mx-auto pb-24 md:pb-16">
        {/* Category Header & Controls */}
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

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 border-t md:border-t-0 border-[var(--border-color)] pt-3 md:pt-0">
            {/* FILTERS Button with Active Count Badge */}
            <button
              onClick={() => {
                setSelectedCat(currentCategory);
                setSelectedSize(currentSize);
                setSelectedColor(currentColor);
                setSelectedSort(currentSort);
                setIsFilterOpen(true);
              }}
              className="flex items-center gap-2 label-caps text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors py-2 active:scale-95 text-[12px] cursor-pointer relative"
            >
              <SlidersHorizontal size={16} className="text-[var(--gold)]" />
              <span>FILTERS</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[var(--gold)] text-[#0A0A0A] text-[10px] font-bold flex items-center justify-center -ml-0.5 shadow-sm">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* SORT BY Dropdown */}
            <div className="relative ml-auto md:ml-2">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 label-caps text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors py-2 active:scale-95 text-[12px] cursor-pointer"
              >
                <span>SORT BY</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180 text-[var(--gold)]' : ''}`} />
              </button>

              {isSortOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsSortOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl z-40 py-2 rounded">
                    {[
                      { label: 'Newest Arrivals', val: 'newest' },
                      { label: 'Featured First', val: 'featured' },
                      { label: 'Price: Low to High', val: 'price_asc' },
                      { label: 'Price: High to Low', val: 'price_desc' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        onClick={() => handleSortSelect(item.val)}
                        className={`w-full text-left px-4 py-2.5 text-[12px] label-caps flex items-center justify-between transition-colors cursor-pointer ${
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

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 pt-2 border-t border-[var(--border-color)]/60">
            <span className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider label-caps">
              Active Filters:
            </span>
            {currentCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[12px] text-[var(--text-primary)]">
                <span>Category: {getPageTitle()}</span>
                <button
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.delete('category');
                    setSearchParams(p);
                  }}
                  className="hover:text-rose-500 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {currentSize && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[12px] text-[var(--text-primary)]">
                <span>Size: {currentSize}</span>
                <button
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.delete('size');
                    setSearchParams(p);
                  }}
                  className="hover:text-rose-500 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {currentColor && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[12px] text-[var(--text-primary)]">
                <span>Color: {currentColor}</span>
                <button
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.delete('color');
                    setSearchParams(p);
                  }}
                  className="hover:text-rose-500 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-[var(--gold)] hover:underline ml-2 label-caps cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
              onClick={handleResetFilters}
              className="bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] px-8 py-3.5 label-caps cursor-pointer hover:bg-[var(--gold)] hover:text-black transition-colors"
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
                  <div className="relative aspect-[3/4] mb-3 overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <Link to={`/products/${product.slug}`} className="block w-full h-full">
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0 absolute inset-0 z-10 img-hover-fade"
                        loading="lazy"
                      />
                      <img
                        src={secondaryImage}
                        alt={`${product.name} craftsmanship`}
                        className="w-full h-full object-cover z-0 scale-100 group-hover:scale-105 transition-transform duration-700 absolute inset-0"
                        loading="lazy"
                      />
                    </Link>

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
                      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      className="absolute top-2.5 right-2.5 z-20 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/80 backdrop-blur-sm rounded-full transition-all duration-300 text-white cursor-pointer active:scale-90"
                    >
                      <Heart
                        size={15}
                        strokeWidth={2}
                        className={isWishlisted ? "text-[var(--gold)] fill-current" : "text-white"}
                      />
                    </button>

                    {firstVariant && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          quickAddToCartMutation.mutate({ variantId: firstVariant.id });
                        }}
                        aria-label="Quick add to bag"
                        className="absolute bottom-2.5 right-2.5 z-20 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-[var(--gold)] hover:text-[#0A0A0A] backdrop-blur-sm rounded-full transition-all duration-300 text-white opacity-0 group-hover:opacity-100 cursor-pointer active:scale-90"
                        title="Quick Add"
                      >
                        <ShoppingBag size={14} strokeWidth={2} />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 justify-between">
                    <div>
                      {product.category?.name && (
                        <span className="label-caps text-[10px] tracking-widest text-[var(--gold)] block mb-1">
                          {product.category.name}
                        </span>
                      )}
                      <h3 className="body-md text-[14px] text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors leading-snug line-clamp-1">
                        <Link to={`/products/${product.slug}`}>{product.name}</Link>
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="body-sm text-[13px] tabular-nums font-semibold text-[var(--text-primary)]">
                        {formatPrice(product.basePrice)}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                        <span className="body-sm text-[11px] tabular-nums text-[var(--text-secondary)] line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsFilterOpen(false)}
          />

          <div className="relative w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border-color)] h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h2
                  className="text-[24px] font-normal uppercase text-[var(--text-primary)]"
                  style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                >
                  Filters
                </h2>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[var(--gold)] text-black text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-1 text-[var(--text-primary)] hover:opacity-70 cursor-pointer"
                aria-label="Close filters"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Dynamic Category Filter */}
              <div>
                <h3 className="label-caps text-[12px] font-bold text-[var(--gold)] mb-3 uppercase tracking-wider">
                  COLLECTION CATEGORY
                </h3>
                <div className="space-y-2.5">
                  <label
                    onClick={() => setSelectedCat('')}
                    className="flex items-center gap-3 text-[13px] cursor-pointer group"
                  >
                    <div
                      className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                        selectedCat === ''
                          ? 'bg-[var(--gold)] border-[var(--gold)] text-[#0A0A0A]'
                          : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'
                      }`}
                    >
                      {selectedCat === '' && <Check size={12} strokeWidth={2.5} />}
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
                        className="flex items-center gap-3 text-[13px] cursor-pointer group"
                      >
                        <div
                          className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[var(--gold)] border-[var(--gold)] text-[#0A0A0A]'
                              : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={2.5} />}
                        </div>
                        <span className={isSelected ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)]'}>
                          {cat.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Sizes Filter */}
              <div className="border-t border-[var(--border-color)] pt-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="label-caps text-[12px] font-bold text-[var(--gold)] uppercase tracking-wider">
                    SIZE
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--gold)] flex items-center gap-1 cursor-pointer"
                  >
                    <Ruler size={13} />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSize('')}
                    className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider border rounded transition-all cursor-pointer ${
                      selectedSize === ''
                        ? 'bg-[var(--gold)] text-black border-[var(--gold)]'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--gold)]'
                    }`}
                  >
                    All Sizes
                  </button>
                  {availableSizes.map((sz) => {
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(isSelected ? '' : sz)}
                        className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider border rounded transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--gold)] text-black border-[var(--gold)]'
                            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--gold)]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Colors Filter */}
              <div className="border-t border-[var(--border-color)] pt-5">
                <h3 className="label-caps text-[12px] font-bold text-[var(--gold)] mb-3 uppercase tracking-wider">
                  COLOR / SHADE
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedColor('')}
                    className={`px-3 py-1.5 text-[11px] font-semibold tracking-wider border rounded transition-all cursor-pointer ${
                      selectedColor === ''
                        ? 'bg-[var(--gold)] text-black border-[var(--gold)]'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--gold)]'
                    }`}
                  >
                    All Colors
                  </button>
                  {availableColors.map((col) => {
                    const isSelected = selectedColor === col.name;
                    return (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => setSelectedColor(isSelected ? '' : col.name)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium tracking-wider border rounded-full transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[var(--gold)] bg-[var(--gold)]/15 text-[var(--gold)] font-bold ring-1 ring-[var(--gold)]'
                            : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--gold)]'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span>{col.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort Order Filter */}
              <div className="border-t border-[var(--border-color)] pt-5">
                <h3 className="label-caps text-[12px] font-bold text-[var(--gold)] mb-3 uppercase tracking-wider">
                  SORT ORDER
                </h3>
                <div className="space-y-2.5">
                  {[
                    { label: 'Newest Arrivals', val: 'newest' },
                    { label: 'Featured Masterpieces', val: 'featured' },
                    { label: 'Price: Low to High', val: 'price_asc' },
                    { label: 'Price: High to Low', val: 'price_desc' },
                  ].map((item) => (
                    <label
                      key={item.val}
                      onClick={() => setSelectedSort(item.val)}
                      className="flex items-center gap-3 text-[13px] cursor-pointer group"
                    >
                      <div
                        className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                          selectedSort === item.val
                            ? 'bg-[var(--gold)] border-[var(--gold)] text-[#0A0A0A]'
                            : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'
                        }`}
                      >
                        {selectedSort === item.val && <Check size={12} strokeWidth={2.5} />}
                      </div>
                      <span className={selectedSort === item.val ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)]'}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Action Bar (Apply / Save & Reset) */}
            <div className="p-6 border-t border-[var(--border-color)] pb-safe space-y-2.5 bg-[var(--bg-card)]">
              <button
                type="button"
                onClick={handleApplyFilters}
                className="w-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--gold)] hover:text-[#0A0A0A] label-caps py-4 tracking-widest transition-colors duration-300 uppercase shadow-lg cursor-pointer font-bold text-[12px]"
              >
                Apply Filters & Save
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] label-caps py-3 tracking-wider transition-colors duration-200 uppercase cursor-pointer text-[11px] flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={13} />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </div>
  );
};
