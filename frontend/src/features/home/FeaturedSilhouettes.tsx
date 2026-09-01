import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, type Product } from '../../api/products.js';
import { fetchWishlist, toggleWishlist } from '../../api/wishlist.js';
import { fetchStorefrontData } from '../../api/merchandising.js';
import { resolveMediaUrl } from '../../api/client.js';
import { Heart, ArrowRight } from 'lucide-react';

export const FeaturedSilhouettes: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: cms } = useQuery({
    queryKey: ['storefront'],
    queryFn: fetchStorefrontData,
    staleTime: 1000 * 60 * 5,
  });

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

  // If disabled in Admin Storefront CMS, do not render this section on live app
  if (cms && cms.showHighlighted === false) {
    return null;
  }

  // 2 Highlighted Items from CMS if available, else products from catalog
  const displayItems = cms?.highlightedItems && cms.highlightedItems.length > 0
    ? cms.highlightedItems
    : products.slice(0, 2).map((p) => ({
        id: p.id,
        title: p.name,
        categoryTag: p.category?.name || 'Heritage Atelier',
        price: p.basePrice,
        imageUrl: p.images[0]?.url || '',
        slug: p.slug
      }));

  return (
    <section className="px-5 md:px-20 max-w-[1440px] mx-auto py-12 md:py-16">
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
          <span>VIEW ALL SILHOUETTES</span>
          <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform text-[var(--gold)]" />
        </Link>
      </div>

      {/* 2 Highlighted Items Grid */}
      {isLoading && !cms ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] bg-[var(--bg-secondary)] animate-pulse" />
              <div className="h-4 bg-[var(--bg-secondary)] w-3/4 animate-pulse" />
              <div className="h-4 bg-[var(--bg-secondary)] w-1/4 animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {displayItems.map((item: any) => {
            const isWishlisted = wishlist.some(
              (w) => w.productId === item.id || w.product?.id === item.id
            );

            return (
              <div
                key={item.id}
                className="group cursor-pointer flex flex-col"
              >
                {/* Image Container with Hover Zoom */}
                <div className="relative aspect-[3/4] bg-[var(--bg-secondary)] overflow-hidden mb-4 border border-[var(--border-color)]">
                  <Link to={`/products/${item.slug || 'piece'}`} className="block w-full h-full">
                    <img
                      src={resolveMediaUrl(item.imageUrl)}
                      alt={item.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  </Link>

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 z-10 pointer-events-none">
                    <span className="bg-[#0A0A0A]/85 backdrop-blur-sm text-[var(--gold)] label-caps text-[10px] tracking-widest px-2.5 py-1 uppercase border border-[var(--gold)]/30">
                      {item.categoryTag}
                    </span>
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      wishlistMutation.mutate({
                        productId: item.id,
                        product: {
                          id: item.id,
                          name: item.title,
                          slug: item.slug,
                          basePrice: item.price,
                          image: item.imageUrl,
                        },
                      });
                    }}
                    className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-[#0A0A0A]/70 backdrop-blur-md flex items-center justify-center text-white hover:text-[var(--gold)] hover:scale-110 active:scale-95 transition-all shadow-md"
                    aria-label="Save to Wishlist"
                  >
                    <Heart
                      size={18}
                      className={isWishlisted ? 'fill-[var(--gold)] text-[var(--gold)]' : ''}
                    />
                  </button>
                </div>

                {/* Product Metadata */}
                <div className="flex justify-between items-start pt-1">
                  <div className="min-w-0 flex-1 pr-4">
                    <h4
                      className="text-[20px] md:text-[22px] font-normal text-[var(--text-primary)] mb-1 group-hover:text-[var(--gold)] transition-colors truncate"
                      style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                    >
                      <Link to={`/products/${item.slug || 'piece'}`}>
                        {item.title}
                      </Link>
                    </h4>
                    <p className="body-sm text-[12px] text-[var(--text-secondary)] tracking-wider uppercase font-semibold">
                      {item.categoryTag}
                    </p>
                  </div>
                  <span className="body-md text-[16px] md:text-[18px] font-semibold text-[var(--text-primary)] tabular-nums shrink-0">
                    {formatPrice(item.price)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile View All Link */}
      <div className="mt-8 text-center md:hidden">
        <Link
          to="/shop"
          className="inline-flex items-center justify-center w-full py-3.5 border border-[var(--border-color)] label-caps text-[12px] text-[var(--text-primary)] hover:border-[var(--gold)] hover:text-[var(--gold)] tracking-widest uppercase transition-all"
        >
          <span>VIEW ALL SILHOUETTES</span>
          <ArrowRight size={14} className="ml-2 text-[var(--gold)]" />
        </Link>
      </div>
    </section>
  );
};
