import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCart, updateCartItemQuantity, removeCartItem } from '../api/cart.js';
import { ShoppingBag, Minus, Plus, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const CartPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
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
            {items.map((item, index) => (
              <React.Fragment key={item.id}>
                <div className="flex gap-4 md:gap-8 group">
                  {/* Item Image */}
                  <div className="w-28 sm:w-36 md:w-44 shrink-0 relative bg-[var(--bg-secondary)] aspect-[3/4] overflow-hidden border border-[var(--border-color)]">
                    <img
                      src={item.product.image || 'https://via.placeholder.com/200'}
                      alt={item.product.name}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex flex-col flex-grow justify-between py-1 min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <h3
                            className="text-[18px] md:text-[22px] font-normal mb-1 text-[var(--text-primary)] truncate"
                            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                          >
                            {item.product.name}
                          </h3>
                          <p className="body-sm text-[12px] md:text-[13px] text-[var(--text-secondary)] mb-3">
                            {item.variant.color ? `Color: ${item.variant.color}` : 'Pure Handloom Silk'}
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

                        <span className="body-md text-[15px] md:text-[17px] font-semibold text-[var(--text-primary)] tabular-nums shrink-0 whitespace-nowrap">
                          {formatPrice(item.unitPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls & Remove Action */}
                    <div className="flex justify-between items-end mt-4 border-t border-[var(--border-color)] pt-3">
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
                            className="p-1.5 hover:text-[var(--gold)] disabled:opacity-40 transition-colors"
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
                            disabled={updateQuantityMutation.isPending}
                            className="p-1.5 hover:text-[var(--gold)] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItemMutation.mutate(item.id)}
                        disabled={removeItemMutation.isPending}
                        className="label-caps text-[11px] tracking-widest text-[var(--text-secondary)] hover:text-[var(--error)] transition-colors pb-0.5 border-b border-transparent hover:border-[var(--error)]"
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                </div>

                {/* Brand Separator Motif matching Stitch */}
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
            ))}
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

              <button
                onClick={() => {
                  const token = localStorage.getItem('ithihasa_access_token');
                  if (!token) {
                    navigate('/login?redirect=/checkout');
                  } else {
                    navigate('/checkout');
                  }
                }}
                className="w-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--gold)] hover:text-[#0A0A0A] label-caps tracking-widest py-4 px-6 transition-colors duration-300 flex justify-center items-center gap-2 uppercase shadow-lg"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              <p className="body-sm text-[12px] text-[var(--text-secondary)] text-center mt-4 leading-relaxed">
                Complimentary white-glove shipping and 7-day returns on all heritage orders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
