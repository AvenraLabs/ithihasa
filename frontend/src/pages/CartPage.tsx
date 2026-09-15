import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCart, updateCartItemQuantity, removeCartItem } from '../api/cart.js';
import { addToWishlist } from '../api/wishlist.js';
import { ShoppingBag, Minus, Plus, ArrowRight, Heart, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const CartPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // State to hold item user clicked remove on, to present "Move to Wishlist or Delete"
  const [itemPendingRemoval, setItemPendingRemoval] = useState<any | null>(null);

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => fetchCart(),
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItemQuantity(itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setItemPendingRemoval(null);
      toast.success('Item removed from bag');
    },
  });

  const moveToWishlistMutation = useMutation({
    mutationFn: async (item: any) => {
      await addToWishlist(
        item.product.id,
        item.variant.id,
        {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          basePrice: item.unitPrice,
          image: item.product.image,
          selectedColor: item.variant.color,
          selectedSize: item.variant.size,
          variant: {
            id: item.variant.id,
            color: item.variant.color,
            size: item.variant.size,
            price: item.unitPrice,
          },
        },
        {
          color: item.variant.color,
          size: item.variant.size,
          variant: item.variant,
        }
      );
      await removeCartItem(item.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      setItemPendingRemoval(null);
      toast.success('Moved to Wishlist');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Unable to move item to wishlist');
    },
  });

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
        <p className="label-caps tracking-widest uppercase text-[12px]">Retrieving Shopping Bag...</p>
      </div>
    );
  }

  const items = cart?.items || [];
  const summary = cart?.summary;

  // Block checkout if any item in bag is out of stock
  const hasOosItems = items.some((item) => item.variant.availableStock === 0);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 md:py-32 px-6 text-center max-w-lg mx-auto min-h-[60vh]">
        <div className="w-20 h-20 bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--gold)] mb-6 shadow-sm">
          <ShoppingBag size={32} strokeWidth={1.5} />
        </div>
        <h2
          className="text-[28px] md:text-[36px] font-normal text-[var(--text-primary)] mb-2"
          style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
        >
          Your bag is empty.
        </h2>
        <p className="body-md text-[14px] md:text-[15px] text-[var(--text-secondary)] mb-8">
          Start your legacy with our handcrafted heritage collection.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--gold)] hover:text-[#0A0A0A] label-caps tracking-widest py-4 px-8 uppercase transition-colors duration-300"
        >
          Discover Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      <div className="flex-grow px-4 sm:px-6 md:px-20 py-6 md:py-12 max-w-[1440px] mx-auto w-full pb-36 sm:pb-28 md:pb-16">
        <h1
          className="text-[32px] md:text-[44px] mb-8 md:mb-12 text-center md:text-left font-normal uppercase tracking-wide text-[var(--text-primary)]"
          style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
        >
          Shopping Bag
        </h1>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          {/* Items List */}
          <div className="flex-1 w-full flex flex-col gap-8">
            {items.map((item, index) => {
                const itemIsOos = item.variant.availableStock === 0;
                return (
              <React.Fragment key={item.id}>
                <div className={`flex gap-4 md:gap-8 group transition-opacity ${itemIsOos ? 'opacity-70' : ''}`}>
                  {/* Item Image */}
                  <div className={`w-28 sm:w-36 md:w-44 shrink-0 relative bg-[var(--bg-secondary)] aspect-[3/4] overflow-hidden border ${itemIsOos ? 'border-rose-500/40 grayscale' : 'border-[var(--border-color)]'}`}>
                    <img
                      src={item.product.image || 'https://via.placeholder.com/200'}
                      alt={item.product.name}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />
                    {itemIsOos && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="label-caps text-[9px] tracking-widest uppercase bg-[var(--bg-primary)] text-rose-400 px-2 py-1 border border-rose-500/30">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex flex-col flex-grow justify-between py-1 min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <h3
                            className={`text-[18px] md:text-[22px] font-normal mb-1 truncate ${
                              itemIsOos ? 'text-[var(--text-secondary)] line-through decoration-rose-500/50' : 'text-[var(--text-primary)]'
                            }`}
                            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                          >
                            {item.product.name}
                          </h3>
                          <p className="body-sm text-[12px] md:text-[13px] text-[var(--text-secondary)] mb-3">
                            {item.variant.color ? `Color: ${item.variant.color}` : 'Heritage Piece'}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="label-caps text-[11px] tracking-widest text-[var(--text-secondary)]">
                              SIZE
                            </span>
                            <span className="body-sm text-[12px] font-semibold text-[var(--text-primary)] px-2 py-0.5 border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                              {item.variant.size}
                            </span>
                          </div>
                        </div>

                        <span className={`body-md text-[15px] md:text-[17px] font-semibold tabular-nums shrink-0 whitespace-nowrap ${
                          itemIsOos ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'
                        }`}>
                          {formatPrice(item.unitPrice)}
                        </span>
                      </div>

                      {/* OOS — Prominent Move to Wishlist nudge */}
                      {itemIsOos && (
                        <div className="mt-3 flex items-center gap-3 p-3 border border-rose-500/20 bg-rose-500/5 rounded-sm">
                          <span className="body-sm text-[12px] text-rose-400/80 flex-1 leading-snug">
                            This item is no longer available.
                          </span>
                          <button
                            type="button"
                            onClick={() => moveToWishlistMutation.mutate(item)}
                            disabled={moveToWishlistMutation.isPending}
                            className="flex items-center gap-1.5 label-caps text-[10px] tracking-wider text-[var(--gold)] hover:text-[var(--gold-bright)] transition-colors shrink-0 cursor-pointer font-semibold whitespace-nowrap"
                          >
                            <Heart size={12} className="fill-current" />
                            <span>Save for Later</span>
                          </button>
                        </div>
                      )}
                    </div>

                   {/* Quantity Controls & Remove / Move to Wishlist Actions */}
                    <div className="flex flex-col gap-2 mt-4 border-t border-[var(--border-color)] pt-3">
                      {/* Stock Warning */}
                      {item.variant.availableStock === 0 && (
                        <p className="label-caps text-[10px] tracking-widest text-rose-500/80 uppercase">
                          ⚠ This item is now out of stock
                        </p>
                      )}
                      {item.variant.availableStock > 0 && item.variant.availableStock < item.quantity && (
                        <p className="label-caps text-[10px] tracking-widest text-amber-500/80 uppercase">
                          ⚠ Only {item.variant.availableStock} left — quantity adjusted
                        </p>
                      )}

                      <div className="flex flex-wrap justify-between items-end gap-3">
                        <div className="flex items-center gap-3">
                          <span className="label-caps text-[11px] tracking-widest text-[var(--text-secondary)]">
                            QTY
                          </span>
                          <div className="flex items-center border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                            <button
                              onClick={() =>
                                updateQuantityMutation.mutate({
                                  itemId: item.id,
                                  quantity: Math.max(1, item.quantity - 1),
                                })
                              }
                              disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                              className="p-1.5 hover:text-[var(--gold)] disabled:opacity-40 transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="body-sm text-[13px] font-semibold tabular-nums w-7 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantityMutation.mutate({
                                  itemId: item.id,
                                  quantity: item.quantity + 1,
                                })
                              }
                              disabled={
                                updateQuantityMutation.isPending ||
                                (item.variant.availableStock > 0 && item.quantity >= item.variant.availableStock)
                              }
                              className="p-1.5 hover:text-[var(--gold)] transition-colors cursor-pointer disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Actions: Direct Move to Wishlist or Remove */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => moveToWishlistMutation.mutate(item)}
                            disabled={moveToWishlistMutation.isPending}
                            className="label-caps text-[11px] tracking-wider text-[var(--gold)] hover:underline transition-colors pb-0.5 cursor-pointer font-medium"
                          >
                            MOVE TO WISHLIST
                          </button>
                          <span className="text-[var(--border-color)]">|</span>
                          <button
                            type="button"
                            onClick={() => setItemPendingRemoval(item)}
                            className="label-caps text-[11px] tracking-widest text-[var(--text-secondary)] hover:text-rose-500 transition-colors pb-0.5 border-b border-transparent hover:border-rose-500 cursor-pointer"
                          >
                            REMOVE
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                {/* Brand Separator Motif */}
                {index < items.length - 1 && (
                  <div className="flex justify-center items-center py-2">
                    <div className="h-[1px] w-full bg-[var(--border-color)] relative">
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--bg-primary)] px-3 text-[var(--gold)]">
                        <span className="block w-2 h-2 rotate-45 border border-[var(--gold)] bg-[var(--bg-primary)]" />
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
              );
            })}
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-[400px] shrink-0 mt-6 lg:mt-0">
            <div className="bg-[var(--bg-card)] p-6 md:p-8 border border-[var(--border-color)] lg:sticky lg:top-24 shadow-sm">
              <h2
                className="text-[26px] mb-6 font-normal uppercase text-[var(--text-primary)]"
                style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
              >
                Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between body-sm text-[13px] md:text-[14px]">
                  <span className="text-[var(--text-secondary)]">Subtotal</span>
                  <span className="tabular-nums font-medium text-[var(--text-primary)]">
                    {formatPrice(summary?.subtotal || 0)}
                  </span>
                </div>

                {summary?.discountAmount ? (
                  <div className="flex justify-between body-sm text-[13px] text-[var(--success)] font-semibold">
                    <span>Discount ({summary.couponCode})</span>
                    <span>-{formatPrice(summary.discountAmount)}</span>
                  </div>
                ) : null}

                <div className="flex justify-between body-sm text-[13px] md:text-[14px]">
                  <span className="text-[var(--text-secondary)]">Complimentary Shipping</span>
                  <span className="text-[var(--gold)] font-medium">FREE</span>
                </div>

                <div className="flex justify-between body-sm text-[13px] md:text-[14px]">
                  <span className="text-[var(--text-secondary)]">Estimated Taxes</span>
                  <span className="text-[var(--text-secondary)]">Inclusive</span>
                </div>
              </div>

              <div className="border-t border-[var(--border-color)] pt-4 mb-6 flex justify-between items-center">
                <span
                  className="text-[20px] md:text-[22px] font-normal text-[var(--text-primary)]"
                  style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                >
                  Total
                </span>
                <span className="text-[20px] md:text-[22px] font-semibold tabular-nums text-[var(--text-primary)]">
                  {formatPrice(summary?.totalAmount || 0)}
                </span>
              </div>

              {/* OOS Block — explanation above checkout button */}
              {hasOosItems && (
                <div className="mb-4 p-3 border border-rose-500/25 bg-rose-500/5 text-center">
                  <p className="label-caps text-[10px] tracking-widest uppercase text-rose-400/90 leading-relaxed">
                    Remove or save out-of-stock items to proceed
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  const token = localStorage.getItem('ithihasa_access_token');
                  if (!token) {
                    navigate('/login?redirect=/checkout');
                  } else {
                    navigate('/checkout');
                  }
                }}
                disabled={hasOosItems}
                title={hasOosItems ? 'Remove out-of-stock items to continue' : undefined}
                className={`w-full label-caps tracking-widest py-4 px-6 transition-colors duration-300 flex justify-center items-center gap-2 uppercase shadow-lg ${
                  hasOosItems
                    ? 'bg-[var(--border-color)] text-[var(--text-secondary)] cursor-not-allowed opacity-60'
                    : 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--gold)] hover:text-[#0A0A0A] cursor-pointer'
                }`}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Item Modal: Move to Wishlist or Delete */}
      {itemPendingRemoval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <h3
                className="text-[22px] font-normal text-[var(--text-primary)]"
                style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
              >
                Remove from Bag
              </h3>
              <button
                type="button"
                onClick={() => setItemPendingRemoval(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <p className="body-sm text-[13px] text-[var(--text-secondary)] leading-relaxed">
              Would you like to move <span className="text-[var(--text-primary)] font-semibold">{itemPendingRemoval.product.name}</span> to your curated wishlist for later, or delete it from your bag?
            </p>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                disabled={moveToWishlistMutation.isPending}
                onClick={() => moveToWishlistMutation.mutate(itemPendingRemoval)}
                className="w-full py-3 bg-[var(--gold)] text-[#0A0A0A] font-bold label-caps tracking-widest text-[11px] uppercase transition-all hover:bg-[var(--gold-bright)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Heart size={14} className="fill-current" />
                <span>{moveToWishlistMutation.isPending ? 'Moving...' : 'Move to Wishlist'}</span>
              </button>

              <button
                type="button"
                disabled={removeItemMutation.isPending}
                onClick={() => removeItemMutation.mutate(itemPendingRemoval.id)}
                className="w-full py-2.5 bg-transparent border border-[var(--border-color)] hover:border-rose-500 hover:text-rose-500 text-[var(--text-secondary)] label-caps tracking-widest text-[11px] uppercase transition-colors cursor-pointer"
              >
                {removeItemMutation.isPending ? 'Deleting...' : 'Delete from Bag'}
              </button>

              <button
                type="button"
                onClick={() => setItemPendingRemoval(null)}
                className="w-full py-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] label-caps text-[10px] tracking-wider uppercase cursor-pointer"
              >
                Keep in Bag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
