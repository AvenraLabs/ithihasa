import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWishlist, toggleWishlist, type WishlistItem } from '../api/wishlist.js';
import { addToCart } from '../api/cart.js';
import { X, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProfileAvatar } from '../components/ui/ProfileAvatar.js';

export const WishlistPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      showToast('Removed from Wishlist');
    },
  });

  const addToBagMutation = useMutation({
    mutationFn: ({ variantId }: { variantId: string }) => addToCart(variantId, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      showToast('Added to Bag');
    },
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
      {/* Stitch Toast Notification */}
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

      <main className="flex-grow w-full max-w-[1440px] mx-auto px-5 md:px-20 py-8 md:py-16 pb-24 md:pb-16">
        {/* Header Section with Profile Picture */}
        <section className="flex flex-col items-center justify-center text-center mb-10 md:mb-14">
          <div className="flex justify-center mb-4">
            <ProfileAvatar
              size={64}
              className="rounded-2xl transition-transform duration-300 hover:scale-105"
            />
          </div>
          <h1
            className="text-[32px] md:text-[44px] mb-2 font-normal uppercase tracking-wide text-[var(--text-primary)]"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            Your Wishlist
          </h1>
          <p className="body-md text-[14px] md:text-[15px] text-[var(--text-secondary)]">
            Curated selections awaiting your collection. {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}.
          </p>
        </section>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center max-w-md mx-auto min-h-[35vh]">
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
          /* Wishlist Grid matching Stitch 2-column mobile, 3-column desktop */
          <section className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-12">
            {wishlist.map((item) => {
              const product = item.product;
              const primaryImage = product.image;

              return (
                <article
                  key={item.id}
                  className="flex flex-col group min-w-0"
                >
                  {/* Image Container */}
                  <div className="relative w-full aspect-[3/4] bg-[var(--bg-secondary)] overflow-hidden mb-3 border border-[var(--border-color)]">
                    <Link to={`/products/${product.slug}`} className="block w-full h-full">
                      <img
                        src={primaryImage || 'https://via.placeholder.com/300'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>

                    {/* Remove Item Button matching Stitch */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeWishlistMutation.mutate(product.id);
                      }}
                      disabled={removeWishlistMutation.isPending}
                      aria-label="Remove item"
                      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-primary)]/80 backdrop-blur-md text-[var(--text-primary)] hover:text-[var(--gold)] hover:scale-110 active:scale-90 transition-all border border-[var(--border-color)] shadow-sm"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-1 flex-grow min-w-0">
                    <div className="flex justify-between items-baseline gap-2 min-w-0">
                      <Link to={`/products/${product.slug}`} className="flex-1 min-w-0">
                        <h3
                          className="text-[17px] md:text-[19px] text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors truncate font-normal leading-snug"
                          style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                        >
                          {product.name}
                        </h3>
                      </Link>
                      <span className="body-md text-[14px] md:text-[15px] font-semibold text-[var(--text-primary)] tabular-nums shrink-0 whitespace-nowrap">
                        {formatPrice(product.basePrice)}
                      </span>
                    </div>

                    <p className="body-sm text-[12px] text-[var(--text-secondary)] truncate">
                      Pure Heritage Handloom Silk
                    </p>

                    {/* Add to Bag CTA Button matching Stitch */}
                    <div className="mt-auto pt-3">
                      <button
                        onClick={() => {
                          if (item.variantId) {
                            addToBagMutation.mutate({ variantId: item.variantId });
                          } else {
                            window.location.href = `/products/${product.slug}`;
                          }
                        }}
                        disabled={addToBagMutation.isPending}
                        className="w-full py-3 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--gold)] hover:text-[#0A0A0A] label-caps tracking-widest text-[11px] transition-colors uppercase border border-[var(--border-color)] active:scale-[0.98]"
                      >
                        ADD TO BAG
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
};
