import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProductBySlug, fetchProducts, type Product } from '../api/products.js';
import { addToCart } from '../api/cart.js';
import { fetchWishlist, toggleWishlist } from '../api/wishlist.js';
import { fetchReviewsForProduct, submitReview, type Review } from '../api/reviews.js';
import { SizeGuideModal } from '../components/ui/SizeGuideModal.js';
import {
  ChevronDown,
  X,
  Check,
  CheckCircle2,
  ShoppingBag,
  Star,
  Heart,
  Share2,
  Ruler,
  Camera,
} from 'lucide-react';
import { toast } from 'sonner';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isSizeSheetOpen, setIsSizeSheetOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [colorErrorHighlight, setColorErrorHighlight] = useState(false);
  const [sizeErrorHighlight, setSizeErrorHighlight] = useState(false);

  const galleryRef = useRef<HTMLDivElement>(null);

  // Fetch active product
  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: Boolean(slug),
  });

  // Extract color swatches and available colors
  const colorSwatches = product?.metadata?.colorSwatches || [];
  const variantColors = Array.from(
    new Set((product?.variants || []).map((v) => v.color).filter(Boolean))
  ) as string[];

  const availableColors = colorSwatches.length > 0
    ? colorSwatches
    : variantColors.map((c) => ({
        name: c,
        hex: c.toLowerCase().includes('gold') ? '#C9A24B'
           : c.toLowerCase().includes('noir') || c.toLowerCase().includes('black') ? '#0A0A0A'
           : c.toLowerCase().includes('crimson') || c.toLowerCase().includes('red') ? '#7A1C22'
           : c.toLowerCase().includes('ivory') || c.toLowerCase().includes('white') ? '#F4EFE6'
           : c.toLowerCase().includes('emerald') || c.toLowerCase().includes('green') ? '#1B4D3E'
           : c.toLowerCase().includes('sapphire') || c.toLowerCase().includes('blue') ? '#1A2A44'
           : '#4A3E3D',
        images: []
      }));

  const availableSizes = Array.from(
    new Set((product?.variants || []).map((v) => v.size).filter(Boolean))
  );

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

  // Auto-select color and size from query parameters (e.g. from wishlist)
  useEffect(() => {
    if (!product) return;
    const urlColor = searchParams.get('color');
    const urlSize = searchParams.get('size');

    let matchedColorName: string | null = null;
    let matchedSizeName: string | null = null;

    if (urlColor) {
      const matchedColor = availableColors.find(
        (c) => c.name.toLowerCase() === urlColor.toLowerCase()
      );
      if (matchedColor) {
        matchedColorName = matchedColor.name;
        setSelectedColor(matchedColor.name);
      }
    }

    if (urlSize) {
      const matchedSize = availableSizes.find(
        (s) => s.toLowerCase() === urlSize.toLowerCase()
      );
      if (matchedSize) {
        matchedSizeName = matchedSize;
        setSelectedSize(matchedSize);
      }
    }

    if (matchedColorName || matchedSizeName || urlColor || urlSize) {
      const matchingVariant = (product.variants || []).find((v) => {
        const colorMatch = !urlColor || v.color?.toLowerCase() === urlColor.toLowerCase();
        const sizeMatch = !urlSize || v.size?.toLowerCase() === urlSize.toLowerCase();
        return colorMatch && sizeMatch;
      });
      if (matchingVariant) {
        setSelectedVariantId(matchingVariant.id);
        if (!matchedColorName && matchingVariant.color) setSelectedColor(matchingVariant.color);
        if (!matchedSizeName && matchingVariant.size) setSelectedSize(matchingVariant.size);
      }
    }
  }, [product, searchParams, availableColors.length, availableSizes.length]);

  const isWishlisted = product
    ? wishlist.some((item) => item.productId === product.id || item.product?.id === product.id)
    : false;

  const wishlistMutation = useMutation({
    mutationFn: () => {
      if (!product) return Promise.resolve({ added: false, message: '' });
      const matchingVariant = (product.variants || []).find(
        (v) => (!selectedColor || v.color === selectedColor) && (!selectedSize || v.size === selectedSize)
      ) || (selectedColor ? (product.variants || []).find((v) => v.color === selectedColor) : null)
        || (selectedSize ? (product.variants || []).find((v) => v.size === selectedSize) : null);

      const targetVariantId = matchingVariant?.id || selectedVariantId || null;

      return toggleWishlist(
        product.id,
        targetVariantId,
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          basePrice: matchingVariant?.price || product.basePrice,
          compareAtPrice: null,
          image: images[0]?.url || product.images?.[0]?.url,
          category: product.category,
          selectedColor: selectedColor || matchingVariant?.color || null,
          selectedSize: selectedSize || matchingVariant?.size || null,
          variant: matchingVariant ? {
            id: matchingVariant.id,
            color: matchingVariant.color,
            size: matchingVariant.size,
            price: matchingVariant.price,
          } : undefined,
        },
        {
          color: selectedColor || matchingVariant?.color || null,
          size: selectedSize || matchingVariant?.size || null,
          variant: matchingVariant,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      // Wishlist toast removed per user request (bad UX, covers navigation)
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
      setReviewComment('');
      setReviewImages([]);
      toast.success('Review submitted successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Unable to submit review');
    },
  });

  const handleReviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (reviewImages.length >= 2) {
      toast.error('You can upload at most 2 images');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReviewImages((prev) => [...prev, reader.result as string].slice(0, 2));
      }
    };
    reader.readAsDataURL(file);
  };

  const REVIEWS_PER_PAGE = 3;
  const totalReviewPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE) || 1;
  const paginatedReviews = reviews.slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE);

  // Handle mobile gallery swipe index
  const handleGalleryScroll = () => {
    if (galleryRef.current) {
      const { scrollLeft, clientWidth } = galleryRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setActiveImageIndex(index);
    }
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
          className="bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] px-8 py-3.5 label-caps uppercase tracking-widest cursor-pointer"
        >
          Return to Collection
        </button>
      </div>
    );
  }

  const activeVariant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  // Compute active images based on selected color
  const activeColorSwatch = selectedColor ? availableColors.find((c) => c.name === selectedColor) : null;
  const colorSpecificImages = activeColorSwatch?.images && activeColorSwatch.images.length > 0
    ? activeColorSwatch.images.map((url, idx) => ({ id: `color_${idx}`, url, altText: selectedColor, isPrimary: idx === 0, sortOrder: idx }))
    : (product.images || []).filter((img) => img.altText === selectedColor);

  const images = colorSpecificImages.length > 0
    ? colorSpecificImages
    : (product.images && product.images.length > 0 ? product.images : [{ id: '1', url: '', altText: 'Heritage Silhouette', isPrimary: true, sortOrder: 0 }]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddToCart = () => {
    let hasError = false;
    if (availableColors.length > 0 && !selectedColor) {
      setColorErrorHighlight(true);
      toast.error('Please select a color before adding to bag');
      document.getElementById('color-selector-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      hasError = true;
    }
    if (availableSizes.length > 0 && (!selectedSize || selectedSize === 'Select Size')) {
      setSizeErrorHighlight(true);
      toast.error('Please select a size before adding to bag');
      if (!hasError) {
        document.getElementById('size-selector-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      hasError = true;
    }
    if (hasError) return;

    const matchingVariant = (product?.variants || []).find(
      (v) => (!selectedColor || v.color === selectedColor) && (!selectedSize || v.size === selectedSize)
    ) || (product?.variants || []).find((v) => !selectedSize || v.size === selectedSize) || product?.variants?.[0];

    if (matchingVariant) {
      addToCartMutation.mutate(matchingVariant.id);
    } else {
      toast.error('This combination is currently out of stock');
    }
  };

  const handleToggleWishlist = () => {
    wishlistMutation.mutate();
  };

  const handleSelectSize = (variantId: string, sizeName: string) => {
    setSelectedVariantId(variantId);
    setSelectedSize(sizeName);
    setIsSizeSheetOpen(false);
  };

  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: `${product.name} — Ithihasa Atelier`,
      text: `${product.name}: Premium royal heritage clothing handcrafted by Ithihasa.`,
      url: window.location.href,
    };
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // cancelled by user
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      } catch (err) {}
    }
  };

  const lookProducts = (recommendedProducts || []).filter((p: Product) => p.id !== product.id).slice(0, 2);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors pb-24 md:pb-16 relative">
      {/* Added to Bag Feedback Notification */}
      {addedFeedback && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] bg-[var(--bg-card)] border border-[var(--border-color)] px-6 py-3.5 shadow-2xl flex items-center gap-3 whitespace-nowrap max-w-[90vw] transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="text-[var(--gold)] shrink-0" />
          <span
            className="text-[17px] tracking-wide text-[var(--gold)] font-medium"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            Added to Bag
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

          {/* Color Rounds / Swatches Selector */}
          {availableColors.length > 0 && (
            <div
              id="color-selector-section"
              className={`mb-6 border-b border-[var(--border-color)] pb-5 transition-all ${
                colorErrorHighlight
                  ? 'p-3 rounded border-amber-500/60 bg-amber-500/5 ring-1 ring-amber-500/30'
                  : ''
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="label-caps text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
                  COLOR: {selectedColor ? (
                    <span className="text-[var(--gold)] font-bold">{selectedColor}</span>
                  ) : (
                    <span className="text-amber-500/90 font-medium">(PLEASE SELECT A COLOR)</span>
                  )}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {availableColors.map((color) => {
                  const isSelected = selectedColor === color.name;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => {
                        setSelectedColor(color.name);
                        setColorErrorHighlight(false);
                        setActiveImageIndex(0);
                        if (galleryRef.current) {
                          galleryRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                        }
                      }}
                      className={`group flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--gold)] ring-2 ring-[var(--gold)]/40 bg-[var(--gold)]/15 text-[var(--text-primary)]'
                          : 'border-[var(--border-color)] hover:border-[var(--gold)]/60 bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                      }`}
                      title={color.name}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-white/20 shadow-sm shrink-0 flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ backgroundColor: color.hex }}
                      >
                        {isSelected && (
                          <Check
                            size={12}
                            className={color.hex === '#F4EFE6' || color.hex === '#FFFFFF' ? 'text-black' : 'text-white'}
                            strokeWidth={3}
                          />
                        )}
                      </span>
                      <span className={`text-[12px] font-medium uppercase tracking-wider ${isSelected ? 'text-[var(--gold)] font-bold' : 'text-[var(--text-primary)]'}`}>
                        {color.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {colorErrorHighlight && (
                <p className="text-[11px] text-amber-500 font-medium mt-2.5">
                  Please select a color to continue
                </p>
              )}
            </div>
          )}

          {/* Size Selector & Size Guide */}
          <div
            id="size-selector-section"
            className={`mb-6 border-b border-[var(--border-color)] pb-5 transition-all ${
              sizeErrorHighlight
                ? 'p-3 rounded border-amber-500/60 bg-amber-500/5 ring-1 ring-amber-500/30'
                : ''
            }`}
          >
            {/* Header: Label on Left, Size Guide on Right with clean alignment */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="label-caps text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
                  SIZE: {selectedSize ? (
                    <span className="text-[var(--gold)] font-bold">{selectedSize}</span>
                  ) : (
                    <span className="text-amber-500/90 font-medium">(PLEASE SELECT A SIZE)</span>
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="flex items-center gap-1.5 text-[11px] text-[var(--gold)] hover:underline uppercase tracking-wider label-caps cursor-pointer active:scale-95 py-1 px-2 rounded hover:bg-[var(--gold)]/10 transition-all ml-auto shrink-0"
              >
                <Ruler size={13} className="text-[var(--gold)]" />
                <span>Size Guide</span>
              </button>
            </div>

            {/* Direct selectable size chips / tiles right on the page */}
            {availableSizes.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2.5">
                {availableSizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  const matchingVariant = (product.variants || []).find(
                    (v) => (!selectedColor || v.color === selectedColor) && v.size === sz
                  ) || (product.variants || []).find((v) => v.size === sz);

                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        handleSelectSize(matchingVariant?.id || '', sz);
                        setSizeErrorHighlight(false);
                      }}
                      className={`min-w-[52px] h-11 px-4 flex items-center justify-center border text-[13px] font-semibold tracking-wider uppercase transition-all cursor-pointer select-none rounded ${
                        isSelected
                          ? 'border-[var(--gold)] bg-[var(--gold)] text-[#0A0A0A] font-bold shadow-md ring-2 ring-[var(--gold)]/40 scale-105'
                          : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-[var(--gold)] hover:text-[var(--gold)] active:scale-95'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-[12px] text-[var(--text-secondary)] italic">Free Size / Standard Fit</p>
            )}

            {sizeErrorHighlight && (
              <p className="text-[11px] text-amber-500 font-medium mt-2.5 flex items-center gap-1">
                <span>Please select a size to continue</span>
              </p>
            )}
          </div>

          {/* Desktop Add to Bag & Wishlist Actions */}
          <div className="hidden md:flex items-center gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
              className={`flex flex-1 items-center justify-center gap-2 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--gold)] hover:text-[#0A0A0A] label-caps py-4 tracking-[0.2em] uppercase transition-colors duration-300 ${
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
              onClick={handleToggleWishlist}
              disabled={wishlistMutation.isPending}
              aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              className={`w-14 h-[50px] border flex items-center justify-center transition-colors cursor-pointer ${
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

            <button
              onClick={handleShare}
              aria-label="Share Silhouette"
              className="w-14 h-[50px] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--gold)] hover:text-[var(--gold)] flex items-center justify-center transition-colors cursor-pointer"
            >
              <Share2
                size={20}
                strokeWidth={1.75}
              />
            </button>
          </div>

          {/* Customer Reviews (Default Open with Pagination) */}
          <div className="border-t border-[var(--border-color)]">
            <details className="group py-4" open>
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
                  <div className="flex items-center gap-1.5 text-[var(--gold)]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill="currentColor" />
                    ))}
                    <span className="body-sm text-[12px] text-[var(--text-primary)] ml-1 font-semibold">
                      {reviews.length > 0
                        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                        : '5.0'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const token = localStorage.getItem('ithihasa_access_token');
                      if (!token) {
                        toast.error('Please sign in to write a review');
                        navigate(`/login?redirect=/products/${slug}`);
                        return;
                      }
                      setIsReviewModalOpen(true);
                    }}
                    className="label-caps text-[10px] text-[var(--gold)] uppercase tracking-wider underline hover:opacity-80 cursor-pointer"
                  >
                    Write a Review
                  </button>
                </div>

                {reviews.length === 0 ? (
                  <p className="body-sm text-[13px] text-[var(--text-secondary)] py-2">
                    Be the first connoisseur to review this masterpiece.
                  </p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {paginatedReviews.map((rev) => (
                        <div key={rev.id} className="bg-[var(--bg-secondary)] p-3 rounded space-y-1.5">
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
                          <p className="body-sm text-[13px] text-[var(--text-secondary)] leading-relaxed">
                            {rev.comment}
                          </p>

                          {rev.images && rev.images.length > 0 && (
                            <div className="flex items-center gap-2 pt-1">
                              {rev.images.map((imgUrl, idx) => (
                                <a key={idx} href={imgUrl} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={imgUrl}
                                    alt={`Review photo ${idx + 1}`}
                                    className="w-14 h-14 object-cover rounded border border-[var(--border-color)] hover:opacity-90"
                                  />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Reviews Pagination Controls */}
                    {totalReviewPages > 1 && (
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]/60 text-[11px] label-caps">
                        <button
                          type="button"
                          disabled={reviewPage === 1}
                          onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                          className="text-[var(--gold)] hover:underline disabled:opacity-30 disabled:no-underline cursor-pointer"
                        >
                          Previous
                        </button>
                        <span className="text-[var(--text-secondary)]">
                          Page {reviewPage} of {totalReviewPages}
                        </span>
                        <button
                          type="button"
                          disabled={reviewPage === totalReviewPages}
                          onClick={() => setReviewPage((p) => Math.min(totalReviewPages, p + 1))}
                          className="text-[var(--gold)] hover:underline disabled:opacity-30 disabled:no-underline cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
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
          onClick={handleToggleWishlist}
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
                (selectedColor ? product.variants.filter((v) => !v.color || v.color === selectedColor) : product.variants).map((variant) => {
                  const isSelected = selectedVariantId === variant.id || selectedSize === variant.size;
                  const inStock = variant.availableStock > 0;

                  return (
                    <button
                      key={variant.id}
                      disabled={!inStock}
                      onClick={() => handleSelectSize(variant.id, variant.size)}
                      className={`w-full flex justify-between items-center py-3.5 px-4 border transition-colors text-left cursor-pointer ${
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
                      setSelectedSize(sz);
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
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1.5 label-caps text-[11px] text-[var(--gold)] uppercase tracking-wider hover:underline cursor-pointer"
                >
                  <Ruler size={13} />
                  <span>Size & Fitting Guide</span>
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
                    comment: reviewComment,
                    images: reviewImages,
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
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
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
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience — texture, sizing, craftsmanship... (optional)"
                  className="w-full bg-transparent border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[14px] focus:outline-none rounded"
                />
              </div>

              {/* Photo Upload: 2 images at most */}
              <div>
                <div className="flex items-center gap-3">
                  {reviewImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded border border-[var(--border-color)] overflow-hidden">
                      <img src={img} alt={`Review photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setReviewImages(reviewImages.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {reviewImages.length < 2 && (
                    <label className="w-16 h-16 rounded border border-dashed border-[var(--border-color)] hover:border-[var(--gold)] flex flex-col items-center justify-center text-[var(--text-secondary)] hover:text-[var(--gold)] cursor-pointer transition-colors bg-[var(--bg-secondary)]/30">
                      <Camera size={18} />
                      <span className="text-[9px] label-caps mt-1">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleReviewImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-5 py-2.5 label-caps text-[11px] uppercase tracking-wider text-[var(--text-secondary)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitReviewMutation.isPending}
                  className="bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] px-6 py-2.5 label-caps text-[11px] uppercase tracking-[0.15em] hover:bg-[var(--gold)] hover:text-[#0A0A0A] transition-colors font-semibold cursor-pointer"
                >
                  {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </div>
  );
};
