import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, type Product } from '../../api/products.js';
import { fetchWishlist, toggleWishlist } from '../../api/wishlist.js';
import { Heart, ArrowRight } from 'lucide-react';

export const FeaturedSilhouettes: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products', 'featured'],
    queryFn: () => fetchProducts({ featured: true, limit: 3 }),
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchWishlist,
  });

  const wishlistMutation = useMutation({
    mutationFn: ({ productId, product }: { productId: string; product?: any }) =>
      toggleWishlist(productId, undefined, product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="px-5 md:px-20 max-w-[1440px] mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10">
        <div>
          <h3
            className="headline-md text-[24px] md:text-[28px] text-[var(--text-primary)] mb-1 font-medium"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            Timeless Silhouettes
          </h3>
          <p className="body-sm text-[14px] text-[var(--text-secondary)] max-w-md leading-relaxed">
            Garments designed to transcend seasons, crafted with uncompromising attention to detail and heritage techniques.
          </p>
        </div>
        <Link
          to="/shop"
          className="hidden md:inline-flex items-center text-[var(--text-primary)] label-caps text-[12px] hover:text-[var(--gold)] transition-colors mt-4 md:mt-0 group"
        >
          <span>VIEW ALL</span>
          <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform text-[var(--gold)]" />
        </Link>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] bg-[var(--bg-secondary)] animate-pulse" />
              <div className="h-4 bg-[var(--bg-secondary)] w-3/4 animate-pulse" />
              <div className="h-4 bg-[var(--bg-secondary)] w-1/4 animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {products.map((product, idx) => {
            const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url;
            const secondaryImage = product.images.find((img) => !img.isPrimary)?.url || primaryImage;
            const isWishlisted = wishlist.some(
              (item) => item.productId === product.id || item.product?.id === product.id
            );

            return (
              <div
                key={product.id}
                className={`group cursor-pointer flex flex-col ${
                  idx === 2 ? 'hidden lg:flex' : 'flex'
                }`}
              >
                {/* Image Container with Hover Fade */}
                <div className="relative aspect-[3/4] bg-[var(--bg-secondary)] overflow-hidden mb-3 border border-[var(--border-color)]">
                  <Link to={`/products/${product.slug}`} className="block w-full h-full">
                    {/* Primary Image */}
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover object-center img-hover-fade z-10 group-hover:opacity-0 transition-opacity duration-500"
                      loading="lazy"
                    />

                    {/* Secondary Hover Image */}
                    <img
                      src={secondaryImage}
                      alt={`${product.name} craftsmanship`}
                      className="absolute inset-0 w-full h-full object-cover object-center z-0 scale-100 group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </Link>

                  {/* Wishlist Button */}
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
                    className="absolute top-3 right-3 z-20 w-9 h-9 bg-[var(--bg-primary)]/80 backdrop-blur-md flex items-center justify-center text-[var(--gold)] hover:scale-110 active:scale-90 transition-transform shadow-sm border border-[var(--border-color)] rounded-full"
                  >
                    <Heart
                      size={16}
                      strokeWidth={1.75}
                      className="text-[var(--gold)]"
                      fill={isWishlisted ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                {/* Info */}
                <div className="flex justify-between items-start pt-1">
                  <div>
                    <Link to={`/products/${product.slug}`}>
                      <h4
                        className="text-[18px] leading-tight text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors font-normal"
                        style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                      >
                        {product.name}
                      </h4>
                    </Link>
                    <p className="body-sm text-[13px] text-[var(--text-secondary)] mt-1">
                      {product.category?.name || '100% Mulberry Silk'}
                    </p>
                  </div>

                  <span className="body-md text-[15px] font-medium text-[var(--text-primary)] tabular-nums">
                    {formatPrice(product.basePrice)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile "VIEW ALL SILHOUETTES" Button matching Stitch */}
      <div className="mt-8 md:hidden flex justify-center">
        <Link
          to="/shop"
          className="inline-flex items-center text-[var(--text-primary)] label-caps px-8 py-3.5 border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors uppercase tracking-widest text-[12px]"
        >
          VIEW ALL SILHOUETTES
        </Link>
      </div>
    </section>
  );
};
