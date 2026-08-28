import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProductBySlug, fetchProducts, type Product } from '../api/products.js';
import { addToCart } from '../api/cart.js';
import { fetchWishlist, toggleWishlist } from '../api/wishlist.js';
import { fetchReviewsForProduct, submitReview, type Review } from '../api/reviews.js';
import {
  ChevronDown,
  X,
  Check,
  CheckCircle2,
  ShoppingBag,
  Star,
  Heart,
} from 'lucide-react';
import { toast } from 'sonner';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedSizeLabel, setSelectedSizeLabel] = useState<string>('Select Size');
  const [isSizeSheetOpen, setIsSizeSheetOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const galleryRef = useRef<HTMLDivElement>(null);

  // Fetch active product
  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: Boolean(slug),
  });

  // Fetch recommended products for "Complete the Look"
  const { data: recommendedProducts = [] } = useQuery<Product[]>({
    queryKey: ['recommended-products'],
    queryFn: () => fetchProducts({ limit: 4 }),
  });

  // Live wishlist query for filled heart status
  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchWishlist,
  });

  const isWishlisted = product
    ? wishlist.some((item) => item.productId === product.id || item.product?.id === product.id)
    : false;

  const wishlistMutation = useMutation({
    mutationFn: () => {
      if (!product) return Promise.resolve({ added: false, message: '' });
      return toggleWishlist(product.id, selectedVariantId, {
        id: product.id,
        name: product.name,
        slug: product.slug,
        basePrice: product.basePrice,
        compareAtPrice: null,
        image: product.images?.[0]?.url,
        category: product.category,
      });
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      if (res?.message) {
        setToastMessage(res.message);
        setTimeout(() => setToastMessage(null), 2500);
      }
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: (variantId: string) => addToCart(variantId, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2500);
    },
  });

  // Fetch reviews for active product
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['reviews', product?.id],
    queryFn: () => fetchReviewsForProduct(product!.id),
    enabled: !!product?.id,
  });

  const submitReviewMutation = useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', product?.id] });
      setIsReviewModalOpen(false);
      setReviewTitle('');
      setReviewComment('');
      setToastMessage('Review submitted for verification');
      setTimeout(() => setToastMessage(null), 3000);
    },
    onError: (err: any) => {
      setToastMessage(err.message || 'Unable to submit review');
      setTimeout(() => setToastMessage(null), 3000);
    },
  });

  // Handle mobile gallery swipe index
  const handleGalleryScroll = () => {
    if (galleryRef.current) {
      const { scrollLeft, clientWidth } = galleryRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setActiveImageIndex(index);
    }
  };

  useEffect(() => {
    if (product && product.variants?.length > 0) {
      const defaultVar = product.variants[0];
      setSelectedVariantId(defaultVar.id);
      setSelectedSizeLabel(defaultVar.size);
    }
  }, [product]);

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
        <p className="label-caps tracking-widest uppercase text-[12px]">Revealing Heritage Silhouette...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="py-32 text-center max-w-md mx-auto px-6">
        <h2
          className="text-[28px] font-normal mb-2 text-[var(--text-primary)]"
          style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
        >
          Silhouette Not Found
        </h2>
        <p className="text-[14px] text-[var(--text-secondary)] mb-6">
          The requested heritage piece is not available.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] px-8 py-3.5 label-caps uppercase tracking-widest"
        >
          Return to Collection
        </button>
      </div>
    );
  }

  const activeVariant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const images = product.images.length > 0 ? product.images : [{ id: '1', url: 'https://via.placeholder.com/600', isPrimary: true, sortOrder: 0 }];

  const handleAddToCart = () => {
    const variantIdToUse = selectedVariantId || product.variants[0]?.id;
    if (variantIdToUse) {
      addToCartMutation.mutate(variantIdToUse);
    }
  };

  const handleSelectSize = (variantId: string, sizeName: string) => {
    setSelectedVariantId(variantId);
    setSelectedSizeLabel(sizeName);
    setIsSizeSheetOpen(false);
  };

  const lookProducts = recommendedProducts.filter((p) => p.id !== product.id).slice(0, 2);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors pb-24 md:pb-16 relative">
      {/* Stitch Toast Notification */}
      {(addedFeedback || toastMessage) && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] bg-[var(--bg-card)] border border-[var(--border-color)] px-6 py-3.5 shadow-2xl flex items-center gap-3 whitespace-nowrap max-w-[90vw] transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="text-[var(--gold)] shrink-0" />
          <span
            className="text-[17px] tracking-wide text-[var(--gold)] font-medium"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            {toastMessage || 'Added to Bag'}
          </span>
        </div>
      )}

      {/* Main PDP Grid (7 cols gallery, 5 cols info on Desktop) */}
      <div className="md:grid md:grid-cols-12 md:gap-8 lg:gap-12 md:px-10 lg:px-20 md:pt-10 max-w-[1440px] mx-auto">
        {/* Image Gallery (Full width mobile, 7 cols desktop) */}
        <section className="md:col-span-7 w-full overflow-hidden relative">
          {/* Scroll container */}
          <div
            ref={galleryRef}
            onScroll={handleGalleryScroll}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full h-[65vh] sm:h-[75vh] md:h-[80vh] bg-[var(--bg-secondary)]"
          >
            {images.map((img) => (
              <div key={img.id} className="flex-shrink-0 w-full snap-center h-full relative">
                <img
                  src={img.url}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ))}
          </div>

          {/* Mobile Swipe Indicators (Dots) */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2 md:hidden">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    activeImageIndex === i
                      ? 'bg-[var(--text-primary)] w-4'
                      : 'bg-[var(--text-primary)]/30'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Desktop Thumbnail Rail */}
          {images.length > 1 && (
            <div className="hidden md:flex gap-3 mt-4">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => {
                    setActiveImageIndex(i);
                    if (galleryRef.current) {
                      galleryRef.current.scrollTo({
                        left: i * galleryRef.current.clientWidth,
                        behavior: 'smooth',
                      });
                    }
                  }}
                  className={`relative w-20 aspect-[3/4] overflow-hidden border transition-all ${
                    activeImageIndex === i
                      ? 'border-[var(--gold)]'
                      : 'border-[var(--border-color)] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Product Information (5 cols desktop) */}
        <section className="px-5 md:px-0 py-6 md:py-0 md:col-span-5 md:sticky md:top-24 md:self-start">
          <div className="mb-6">
            <span className="label-caps text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--gold)] block mb-1">
              {product.category?.name || 'Heritage Atelier'}
            </span>
            <h1
              className="text-[28px] sm:text-[34px] md:text-[40px] leading-tight text-[var(--text-primary)] font-normal mb-2"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              {product.name}
            </h1>
            <p className="body-md text-[18px] md:text-[20px] tabular-nums text-[var(--text-primary)] font-semibold tracking-wide mb-4">
              {formatPrice(activeVariant?.price || product.basePrice)}
            </p>
            <p className="body-sm text-[14px] text-[var(--text-secondary)] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Size Selector Trigger Button */}
          <button
            onClick={() => setIsSizeSheetOpen(true)}
            className="w-full border-b border-[var(--border-color)] py-4 flex justify-between items-center group mb-6 text-left"
          >
            <div className="flex flex-col items-start">
              <span className="label-caps text-[11px] text-[var(--text-secondary)] mb-0.5 uppercase tracking-wider">
                Size
              </span>
              <span className="title-sm text-[15px] text-[var(--text-primary)] font-medium">
                {selectedSizeLabel}
              </span>
            </div>
            <ChevronDown
              size={18}
              className="text-[var(--text-secondary)] group-hover:text-[var(--gold)] transition-colors"
            />
          </button>

          {/* Desktop Add to Bag & Wishlist Actions */}
          <div className="hidden md:flex items-center gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
              className={`flex-1 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--gold)] hover:text-[#0A0A0A] label-caps py-4 tracking-[0.2em] uppercase items-center justify-center space-x-2 transition-colors duration-300 ${
                addedFeedback ? 'bg-[var(--gold)] text-[#0A0A0A]' : ''
              }`}
            >
              {addedFeedback ? (
                <>
                  <Check size={18} strokeWidth={2.5} />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} strokeWidth={1.75} />
                  <span>{addToCartMutation.isPending ? 'Adding...' : 'Add to Bag'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => wishlistMutation.mutate()}
              disabled={wishlistMutation.isPending}
              aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              className={`w-14 h-[50px] border flex items-center justify-center transition-colors ${
                isWishlisted
                  ? 'border-[var(--gold)] text-[var(--gold)] bg-[var(--bg-card)]'
                  : 'border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--gold)] hover:text-[var(--gold)]'
              }`}
            >
              <Heart
                size={20}
                strokeWidth={1.75}
                className="text-[var(--gold)]"
                fill={isWishlisted ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* Accordions for Details matching Stitch PDP */}
          <div className="border-t border-[var(--border-color)] divide-y divide-[var(--border-color)]">
            <details className="group py-4" open>
              <summary className="flex justify-between items-center cursor-pointer list-none text-[15px] font-semibold text-[var(--text-primary)] tracking-wide">
                <span>Fabric & Heritage</span>
                <ChevronDown size={18} className="text-[var(--text-secondary)] group-open:rotate-180 transition-transform duration-300" />
              </summary>
              <div className="pt-3 font-body-sm text-[13px] text-[var(--text-secondary)] leading-relaxed">
                Handcrafted from 100% pure Mulberry silk and pashmina wool, hand-spun on traditional looms by master artisans. Features authentic antique brushed gold zari borders and bespoke tailoring.
              </div>
            </details>

            <details className="group py-4">
              <summary className="flex justify-between items-center cursor-pointer list-none text-[15px] font-semibold text-[var(--text-primary)] tracking-wide">
                <span>Care Instructions</span>
                <ChevronDown size={18} className="text-[var(--text-secondary)] group-open:rotate-180 transition-transform duration-300" />
              </summary>
              <div className="pt-3 font-body-sm text-[13px] text-[var(--text-secondary)] leading-relaxed">
                Strictly dry clean only. Store folded in a breathable cotton muslin pouch provided with your garment. Protect from direct moisture and harsh sunlight.
              </div>
            </details>

            <details className="group py-4">
              <summary className="flex justify-between items-center cursor-pointer list-none text-[15px] font-semibold text-[var(--text-primary)] tracking-wide">
                <span>Sustainability</span>
                <ChevronDown size={18} className="text-[var(--text-secondary)] group-open:rotate-180 transition-transform duration-300" />
              </summary>
              <div className="pt-3 font-body-sm text-[13px] text-[var(--text-secondary)] leading-relaxed">
                Every silhouette supports generational artisan families with direct fair wages. Woven with organic vegetable dyes in zero-waste closed-loop ateliers.
              </div>
            </details>

            {/* Customer Reviews Accordion */}
            <details className="group py-4">
              <summary className="flex justify-between items-center cursor-pointer list-none text-[15px] font-semibold text-[var(--text-primary)] tracking-wide">
                <div className="flex items-center gap-2">
                  <span>Customer Reviews</span>
                  <span className="text-[12px] bg-[var(--bg-secondary)] px-2 py-0.5 rounded text-[var(--gold)] font-medium">
                    {reviews.length}
                  </span>
                </div>
                <ChevronDown size={18} className="text-[var(--text-secondary)] group-open:rotate-180 transition-transform duration-300" />
              </summary>

              <div className="pt-4 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]/60">
                  <div className="flex items-center gap-1 text-[var(--gold)]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill="currentColor" />
                    ))}
                    <span className="body-sm text-[12px] text-[var(--text-primary)] ml-1 font-semibold">
                      5.0 • Verified Heritage
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="label-caps text-[10px] text-[var(--gold)] uppercase tracking-wider underline hover:opacity-80"
                  >
                    Write a Review
                  </button>
                </div>

                {reviews.length === 0 ? (
                  <p className="body-sm text-[13px] text-[var(--text-secondary)] py-2">
                    Be the first connoisseur to review this masterpiece.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="bg-[var(--bg-secondary)] p-3 rounded space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                            {rev.userName}
                          </span>
                          <div className="flex text-[var(--gold)]">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} size={11} fill="currentColor" />
                            ))}
                          </div>
                        </div>
                        <h4 className="text-[13px] text-[var(--text-primary)] font-medium">
                          {rev.title}
                        </h4>
                        <p className="body-sm text-[12px] text-[var(--text-secondary)]">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </details>
          </div>
        </section>
      </div>

      {/* Complete the Look (Related Products matching Stitch) */}
      {lookProducts.length > 0 && (
        <section className="mt-16 md:mt-24 px-5 md:px-20 max-w-[1440px] mx-auto border-t border-[var(--border-color)] pt-12">
          <h2
            className="text-[24px] md:text-[30px] font-normal text-[var(--text-primary)] mb-8 text-center uppercase tracking-wide"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            Complete the Look
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {lookProducts.map((item) => {
              const primaryImg = item.images.find((img) => img.isPrimary)?.url || item.images[0]?.url;
              const secondaryImg = item.images.find((img) => !img.isPrimary)?.url || primaryImg;

              return (
                <Link
                  key={item.id}
                  to={`/products/${item.slug}`}
                  className="group block cursor-pointer"
                >
                  <div className="relative aspect-[3/4] mb-3 overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <img
                      src={primaryImg}
                      alt={item.name}
                      className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0 absolute inset-0 z-10"
                      loading="lazy"
                    />
                    <img
                      src={secondaryImg}
                      alt=""
                      className="w-full h-full object-cover absolute inset-0 z-0 scale-100 group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="body-md text-[14px] text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors truncate font-normal">
                    {item.name}
                  </h3>
                  <p className="body-sm text-[13px] text-[var(--text-secondary)] mt-0.5 tabular-nums font-semibold">
                    {formatPrice(item.basePrice)}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Mobile Sticky Add to Bag Bar matching Stitch */}
      <div className="fixed bottom-0 left-0 w-full z-30 p-3.5 bg-[var(--bg-header)] backdrop-blur-md border-t border-[var(--border-color)] md:hidden pb-safe flex items-center gap-3 shadow-lg">
        <button
          onClick={handleAddToCart}
          disabled={addToCartMutation.isPending}
          className={`flex-1 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--gold)] hover:text-[#0A0A0A] label-caps py-3.5 tracking-[0.2em] uppercase active:scale-[0.98] transition-all flex items-center justify-center space-x-2 ${
            addedFeedback ? 'bg-[var(--gold)] text-[#0A0A0A]' : ''
          }`}
        >
          {addedFeedback ? (
            <>
              <Check size={18} strokeWidth={2.5} />
              <span>Added to Bag</span>
            </>
          ) : (
            <>
              <ShoppingBag size={18} strokeWidth={1.75} />
              <span>{addToCartMutation.isPending ? 'Adding...' : 'Add to Bag'}</span>
            </>
          )}
        </button>

        <button
          onClick={() => wishlistMutation.mutate()}
          disabled={wishlistMutation.isPending}
          aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          className={`w-12 h-12 flex items-center justify-center border transition-all active:scale-90 bg-[var(--bg-card)] ${
            isWishlisted
              ? 'border-[var(--gold)] text-[var(--gold)]'
              : 'border-[var(--border-color)] text-[var(--text-primary)]'
          }`}
        >
          <Heart
            size={20}
            strokeWidth={1.75}
            className="text-[var(--gold)]"
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>
      </div>

      {/* Size Selection Bottom Sheet matching Stitch Specification */}
      {isSizeSheetOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-stretch md:justify-end">
          {/* Backdrop Scrim */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsSizeSheetOpen(false)}
          />

          {/* Size Sheet Panel */}
          <div className="relative z-10 w-full md:w-[400px] bg-[var(--bg-primary)] text-[var(--text-primary)] border-t md:border-t-0 md:border-l border-[var(--border-color)] flex flex-col justify-between shadow-2xl transition-transform duration-300 max-h-[85vh] md:max-h-full pb-safe">
            {/* Handle on Mobile */}
            <div className="w-12 h-1 bg-[var(--border-color)] mx-auto mt-3 mb-2 rounded-full md:hidden" />

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-color)]">
              <h3
                className="text-[22px] font-normal uppercase text-[var(--text-primary)]"
                style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
              >
                Select Size
              </h3>
              <button
                onClick={() => setIsSizeSheetOpen(false)}
                className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Close size selector"
              >
                <X size={22} />
              </button>
            </div>

            {/* Size Options List */}
            <div className="px-6 py-4 overflow-y-auto space-y-2 flex-1">
              {product.variants && product.variants.length > 0 ? (
                product.variants.map((variant) => {
                  const isSelected = selectedVariantId === variant.id;
                  const inStock = variant.availableStock > 0;

                  return (
                    <button
                      key={variant.id}
                      disabled={!inStock}
                      onClick={() => handleSelectSize(variant.id, variant.size)}
                      className={`w-full flex justify-between items-center py-3.5 px-4 border transition-colors text-left ${
                        isSelected
                          ? 'border-[var(--gold)] bg-[var(--bg-secondary)] text-[var(--gold)] font-bold'
                          : inStock
                          ? 'border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                          : 'border-[var(--border-color)] text-[var(--text-muted)] line-through cursor-not-allowed opacity-50'
                      }`}
                    >
                      <span className="title-sm text-[14px]">
                        {variant.size}
                      </span>
                      <span className="body-sm text-[12px] text-[var(--text-secondary)]">
                        {inStock ? `${variant.availableStock} in Atelier` : 'Sold Out'}
                      </span>
                    </button>
                  );
                })
              ) : (
                ['XS (Extra Small) - EU 34', 'S (Small) - EU 36', 'M (Medium) - EU 38', 'L (Large) - EU 40', 'XL (Extra Large) - EU 42'].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => {
                      setSelectedSizeLabel(sz);
                      setIsSizeSheetOpen(false);
                    }}
                    className="w-full flex justify-between items-center py-3.5 px-4 border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors text-left"
                  >
                    <span className="title-sm text-[14px]">{sz}</span>
                    <span className="body-sm text-[12px] text-[var(--text-secondary)]">Standard Fit</span>
                  </button>
                ))
              )}

              <div className="pt-4 text-center">
                <button
                  onClick={() => toast.info('Standard Heritage Fit: Designed for ease and dignified tailoring.')}
                  className="label-caps text-[11px] text-[var(--gold)] underline uppercase tracking-wider hover:opacity-80 cursor-pointer"
                >
                  Size & Fitting Guide
                </button>
              </div>
            </div>

            {/* Bottom Dismiss */}
            <div className="p-6 border-t border-[var(--border-color)]">
              <button
                onClick={() => setIsSizeSheetOpen(false)}
                className="w-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps py-3.5 tracking-widest uppercase transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Write a Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl w-full max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-5">
              <h2
                className="text-[24px] font-normal text-[var(--text-primary)]"
                style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
              >
                Write a Review
              </h2>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (product?.id) {
                  submitReviewMutation.mutate({
                    productId: product.id,
                    rating: newRating,
                    title: reviewTitle,
                    comment: reviewComment,
                  });
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="label-caps text-[10px] uppercase tracking-widest text-[var(--text-secondary)] block mb-2">
                  Rating
                </label>
                <div className="flex items-center gap-2 text-[var(--gold)]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={22}
                        fill={star <= newRating ? 'currentColor' : 'none'}
                        className={star <= newRating ? 'text-[var(--gold)]' : 'text-[var(--border-color)]'}
                      />
                    </button>
                  ))}
                  <span className="body-sm text-[13px] text-[var(--text-primary)] ml-2 font-medium">
                    {newRating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="label-caps text-[10px] uppercase tracking-widest text-[var(--text-secondary)] block mb-1">
                  Review Headline *
                </label>
                <input
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Exquisite craftsmanship & majestic drape"
                  className="w-full bg-transparent border-b border-[var(--border-color)] focus:border-[var(--gold)] py-2 text-[15px] focus:outline-none"
                />
              </div>

              <div>
                <label className="label-caps text-[10px] uppercase tracking-widest text-[var(--text-secondary)] block mb-1">
                  Detailed Experience *
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about the texture, sizing, and weave..."
                  className="w-full bg-transparent border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[14px] focus:outline-none rounded"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-5 py-2.5 label-caps text-[11px] uppercase tracking-wider text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitReviewMutation.isPending}
                  className="bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] px-6 py-2.5 label-caps text-[11px] uppercase tracking-[0.15em] hover:bg-[var(--gold)] hover:text-[#0A0A0A] transition-colors font-semibold"
                >
                  {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
