import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWishlist, toggleWishlist, removeFromWishlist, type WishlistItem } from '../api/wishlist.js';
import { addToCart } from '../api/cart.js';
import { fetchProductBySlug, type Product } from '../api/products.js';
import { X, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export const WishlistPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Quick Select modal state when wishlisted item needs size/color confirmation
  const [quickSelectProduct, setQuickSelectProduct] = useState<Product | null>(null);
  const [quickSelectedColor, setQuickSelectedColor] = useState<string | null>(null);
  const [quickSelectedSize, setQuickSelectedSize] = useState<string | null>(null);
  const [quickColorError, setQuickColorError] = useState(false);
  const [quickSizeError, setQuickSizeError] = useState(false);

  const { data: wishlist = [], isLoading } = useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: fetchWishlist,
  });

  React.useEffect(() => {
    const handleUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    };
    window.addEventListener('wishlist-updated', handleUpdated);
    return () => window.removeEventListener('wishlist-updated', handleUpdated);
  }, [queryClient]);

  const removeWishlistMutation = useMutation({
    mutationFn: (productId: string) => toggleWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  // Adding to bag removes item from wishlist
  const addToBagMutation = useMutation({
    mutationFn: async ({ variantId, productId }: { variantId: string; productId: string }) => {
      await addToCart(variantId, 1);
      await removeFromWishlist(productId);
      return { productId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      showToast('Moved to Shopping Bag');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Unable to add item to bag');
    },
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleAddToBagFromWishlist = async (item: WishlistItem) => {
    const directVariantId = item.variantId || item.variant?.id;
    if (directVariantId) {
      addToBagMutation.mutate({ variantId: directVariantId, productId: item.productId });
      return;
    }

    // If no direct variant is tied, fetch product to let user select size/color
    try {
      const prod = await fetchProductBySlug(item.product.slug);
      if (!prod) {
        window.location.href = `/products/${item.product.slug}`;
        return;
      }
      if (prod.variants && prod.variants.length === 1) {
        addToBagMutation.mutate({ variantId: prod.variants[0].id, productId: item.productId });
        return;
      }
      setQuickSelectedColor(item.selectedColor || item.variant?.color || null);
      setQuickSelectedSize(item.selectedSize || item.variant?.size || null);
      setQuickSelectProduct(prod);
    } catch {
      window.location.href = `/products/${item.product.slug}`;
    }
  };

  const handleConfirmQuickAdd = () => {
    if (!quickSelectProduct) return;
    const colors = quickColors;
    const sizes = quickSizes;
    let hasError = false;

    if (colors.length > 0 && !quickSelectedColor) {
      setQuickColorError(true);
      hasError = true;
    }
    if (sizes.length > 0 && !quickSelectedSize) {
      setQuickSizeError(true);
      hasError = true;
    }
    if (hasError) return;

    const matchingVariant = (quickSelectProduct.variants || []).find(
      (v) => (!quickSelectedColor || v.color === quickSelectedColor) && (!quickSelectedSize || v.size === quickSelectedSize)
    ) || (quickSelectProduct.variants || [])[0];

    if (matchingVariant) {
      addToBagMutation.mutate({
        variantId: matchingVariant.id,
        productId: quickSelectProduct.id,
      });
      setQuickSelectProduct(null);
    } else {
      toast.error('Selected combination is out of stock');
    }
  };

  const quickColors = quickSelectProduct
    ? (quickSelectProduct.metadata?.colorSwatches && quickSelectProduct.metadata.colorSwatches.length > 0
        ? quickSelectProduct.metadata.colorSwatches
        : Array.from(new Set((quickSelectProduct.variants || []).map((v) => v.color).filter((c): c is string => Boolean(c)))).map((c) => ({
            name: c,
            hex: c.toLowerCase().includes('gold') ? '#C9A24B'
               : c.toLowerCase().includes('noir') || c.toLowerCase().includes('black') ? '#0A0A0A'
               : c.toLowerCase().includes('crimson') || c.toLowerCase().includes('red') ? '#7A1C22'
               : c.toLowerCase().includes('ivory') || c.toLowerCase().includes('white') ? '#F4EFE6'
               : c.toLowerCase().includes('emerald') || c.toLowerCase().includes('green') ? '#1B4D3E'
               : c.toLowerCase().includes('sapphire') || c.toLowerCase().includes('blue') ? '#1A2A44'
               : '#4A3E3D',
            images: []
          })))
    : [];

  const quickSizes = quickSelectProduct
    ? Array.from(new Set((quickSelectProduct.variants || []).map((v) => v.size).filter((s): s is string => Boolean(s))))
    : [];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalPages = Math.ceil(wishlist.length / ITEMS_PER_PAGE) || 1;
  const paginatedWishlist = wishlist.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="py-32 text-center text-[var(--text-secondary)]">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="label-caps tracking-widest uppercase text-[12px]">Retrieving Curated Selections...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] bg-[var(--bg-card)] border border-[var(--border-color)] px-6 py-3.5 shadow-2xl flex items-center gap-3 whitespace-nowrap max-w-[90vw] transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="text-[var(--gold)] shrink-0" />
          <span
            className="text-[17px] tracking-wide text-[var(--gold)] font-medium"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            {toastMessage}
          </span>
        </div>
      )}

      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 py-4 md:py-8 pb-24 md:pb-16">
        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-md mx-auto min-h-[40vh]">
            <h2
              className="text-[24px] md:text-[28px] font-normal mb-2 text-[var(--text-primary)]"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              Your wishlist is currently empty.
            </h2>
            <p className="body-sm text-[14px] text-[var(--text-secondary)] mb-8 leading-relaxed">
              Explore our timeless silhouettes and tap the heart icon on pieces you love to curate your collection.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--gold)] hover:text-[#0A0A0A] label-caps tracking-widest py-4 px-8 uppercase transition-colors duration-300 shadow-md"
            >
              Discover Collection
            </Link>
          </div>
        ) : (
          <>
            {/* Compact Wishlist Grid */}
            <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {paginatedWishlist.map((item) => {
                const product = item.product;
                const primaryImage = product.image;
                const itemColor = item.selectedColor || item.variant?.color || null;
                const itemSize = item.selectedSize || item.variant?.size || null;
                const isDeleted = item.productDeleted === true;
                const isOutOfStock = !isDeleted && item.availableStock !== null && item.availableStock !== undefined && item.availableStock === 0;

                const productUrl = (() => {
                  if (isDeleted || !product.slug) return '#';
                  const params = new URLSearchParams();
                  if (itemColor) params.set('color', itemColor);
                  if (itemSize) params.set('size', itemSize);
                  const qs = params.toString();
                  return `/products/${product.slug}${qs ? `?${qs}` : ''}`;
                })();

                return (
                  <article
                    key={item.id}
                    className={`flex flex-col group min-w-0 ${isDeleted ? 'opacity-60' : ''}`}
                  >
                    {/* Compact Image Container */}
                    <div className="relative w-full aspect-[4/5] bg-[var(--bg-secondary)] overflow-hidden mb-2 border border-[var(--border-color)]">
                      {isDeleted ? (
                        <div className="w-full h-full bg-[var(--bg-secondary)] flex items-center justify-center">
                          <img
                            src={primaryImage || 'https://via.placeholder.com/300'}
                            alt={product.name}
                            className="w-full h-full object-cover opacity-30"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <Link to={productUrl} className="block w-full h-full">
                          <img
                            src={primaryImage || 'https://via.placeholder.com/300'}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            loading="lazy"
                          />
                        </Link>
                      )}

                      {/* Status Badge */}
                      {isDeleted && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                          <span className="label-caps text-[9px] tracking-widest uppercase bg-[var(--bg-primary)] text-[var(--text-secondary)] px-2 py-1 border border-[var(--border-color)]">
                            No Longer Available
                          </span>
                        </div>
                      )}
                      {isOutOfStock && !isDeleted && (
                        <div className="absolute bottom-0 left-0 right-0 bg-[var(--bg-primary)]/90 backdrop-blur-sm py-1 text-center border-t border-[var(--border-color)]">
                          <span className="label-caps text-[9px] tracking-widest uppercase text-[var(--text-secondary)]">
                            Out of Stock
                          </span>
                        </div>
                      )}

                      {/* Remove Item Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeWishlistMutation.mutate(product.id);
                        }}
                        disabled={removeWishlistMutation.isPending}
                        aria-label="Remove item"
                        className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center rounded-full bg-[var(--bg-primary)]/85 backdrop-blur-md text-[var(--text-primary)] hover:text-[var(--gold)] hover:scale-110 active:scale-90 transition-all border border-[var(--border-color)] shadow-sm cursor-pointer z-10"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Compact Info */}
                    <div className="flex flex-col gap-0.5 flex-grow justify-between min-w-0">
                      <div className="flex flex-col min-w-0">
                        {isDeleted ? (
                          <h3
                            className="text-[14px] sm:text-[15px] text-[var(--text-secondary)] truncate font-normal leading-snug"
                            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                          >
                            {product.name}
                          </h3>
                        ) : (
                          <Link to={productUrl} className="min-w-0">
                            <h3
                              className="text-[14px] sm:text-[15px] text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors truncate font-normal leading-snug"
                              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                            >
                              {product.name}
                            </h3>
                          </Link>
                        )}
                        {!isDeleted && (
                          <span className="body-md text-[13px] font-semibold text-[var(--text-primary)] tabular-nums mt-0.5">
                            {formatPrice(item.variant?.price || product.basePrice)}
                          </span>
                        )}

                        {/* Selected Color & Size Display if wishlisted (only color and size, no headings) */}
                        {Boolean(itemColor || itemSize) && !isDeleted && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] mt-0.5 flex-wrap">
                            {Boolean(itemColor) && (
                              <span className="capitalize text-[var(--text-primary)] font-medium">
                                {itemColor}
                              </span>
                            )}
                            {Boolean(itemColor && itemSize) && (
                              <span className="text-[var(--border-color)]">•</span>
                            )}
                            {Boolean(itemSize) && (
                              <span className="uppercase text-[var(--text-primary)] font-semibold">
                                {itemSize}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Add to Bag Button -> Moves to bag and removes from wishlist */}
                      <div className="mt-auto pt-2">
                        {isDeleted ? (
                          <button
                            disabled
                            className="w-full py-2 bg-transparent text-[var(--text-secondary)] label-caps tracking-widest text-[10px] uppercase border border-[var(--border-color)] opacity-40 cursor-not-allowed font-semibold"
                          >
                            UNAVAILABLE
                          </button>
                        ) : isOutOfStock ? (
                          <button
                            disabled
                            className="w-full py-2 bg-transparent text-[var(--text-secondary)] label-caps tracking-widest text-[10px] uppercase border border-[var(--border-color)] opacity-60 cursor-not-allowed font-semibold"
                          >
                            OUT OF STOCK
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddToBagFromWishlist(item)}
                            disabled={addToBagMutation.isPending}
                            className="w-full py-2 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--gold)] hover:text-[#0A0A0A] label-caps tracking-widest text-[10px] transition-colors uppercase border border-[var(--border-color)] active:scale-[0.98] cursor-pointer font-semibold"
                          >
                            {addToBagMutation.isPending ? 'ADDING...' : 'ADD TO BAG'}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}

            </section>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 pt-6 border-t border-[var(--border-color)] flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="border border-[var(--border-color)] px-4 py-2 text-[12px] label-caps uppercase tracking-wider text-[var(--text-primary)] hover:border-[var(--gold)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => {
                      setCurrentPage(pg);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-9 h-9 flex items-center justify-center border text-[13px] font-semibold transition-all cursor-pointer ${
                      currentPage === pg
                        ? 'border-[var(--gold)] bg-[var(--gold)] text-[#0A0A0A] font-bold shadow-md'
                        : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--gold)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="border border-[var(--border-color)] px-4 py-2 text-[12px] label-caps uppercase tracking-wider text-[var(--text-primary)] hover:border-[var(--gold)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Quick Select Size & Color Modal for items needing selection */}
      {quickSelectProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setQuickSelectProduct(null)}
          />

          <div className="relative w-full sm:max-w-md bg-[var(--bg-primary)] border border-[var(--border-color)] sm:rounded-lg p-6 z-10 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="label-caps text-[10px] text-[var(--gold)] uppercase tracking-wider block">
                  Select Size & Color
                </span>
                <h3 className="text-[20px] font-normal text-[var(--text-primary)] font-garamond">
                  {quickSelectProduct.name}
                </h3>
                <p className="text-[14px] font-semibold text-[var(--text-primary)] tabular-nums mt-0.5">
                  {formatPrice(quickSelectProduct.basePrice)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickSelectProduct(null)}
                className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Colors in Quick Select */}
            {quickColors.length > 0 && (
              <div className={`space-y-2 p-2.5 rounded border transition-all ${quickColorError ? 'border-amber-500/60 bg-amber-500/5' : 'border-transparent'}`}>
                <div className="flex justify-between items-center">
                  <span className="label-caps text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
                    Color: {quickSelectedColor ? <span className="text-[var(--gold)] font-bold">{quickSelectedColor}</span> : <span className="text-amber-500/90 font-medium">(Required)</span>}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {quickColors.map((color) => {
                    const isSelected = quickSelectedColor === color.name;
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => {
                          setQuickSelectedColor(color.name);
                          setQuickColorError(false);
                        }}
                        className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[var(--gold)] ring-2 ring-[var(--gold)]/40 bg-[var(--gold)]/15 text-[var(--text-primary)]'
                            : 'border-[var(--border-color)] hover:border-[var(--gold)]/60 bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-[12px] font-medium">{color.name}</span>
                      </button>
                    );
                  })}
                </div>
                {quickColorError && (
                  <p className="text-[11px] text-amber-500 font-medium">Please select a color</p>
                )}
              </div>
            )}

            {/* Sizes in Quick Select */}
            {quickSizes.length > 0 && (
              <div className={`space-y-2 p-2.5 rounded border transition-all ${quickSizeError ? 'border-amber-500/60 bg-amber-500/5' : 'border-transparent'}`}>
                <div className="flex justify-between items-center">
                  <span className="label-caps text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
                    Size: {quickSelectedSize ? <span className="text-[var(--gold)] font-bold">{quickSelectedSize}</span> : <span className="text-amber-500/90 font-medium">(Required)</span>}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {quickSizes.map((sz) => {
                    const isSelected = quickSelectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          setQuickSelectedSize(sz);
                          setQuickSizeError(false);
                        }}
                        className={`min-w-[48px] h-11 px-3.5 flex items-center justify-center border text-[13px] font-semibold tracking-wider uppercase transition-all cursor-pointer select-none rounded ${
                          isSelected
                            ? 'border-[var(--gold)] bg-[var(--gold)] text-[#0A0A0A] font-bold shadow-md ring-2 ring-[var(--gold)]/40'
                            : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-[var(--gold)]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
                {quickSizeError && (
                  <p className="text-[11px] text-amber-500 font-medium">Please select a size</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleConfirmQuickAdd}
                disabled={addToBagMutation.isPending}
                className="w-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--gold)] hover:text-[#0A0A0A] label-caps py-3.5 tracking-widest uppercase transition-all font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <ShoppingBag size={16} />
                <span>{addToBagMutation.isPending ? 'Adding to Bag...' : 'Add to Bag'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
