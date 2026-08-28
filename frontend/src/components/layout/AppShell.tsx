import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppHeader } from './AppHeader.js';
import { BottomNav } from './BottomNav.js';
import {
  X,
  Sparkles,
  BookOpen,
  Compass,
  Leaf,
  HelpCircle,
  Globe,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCart } from '../../api/cart.js';
import { fetchWishlist } from '../../api/wishlist.js';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const queryClient = useQueryClient();
  const isPDP = location.pathname.startsWith('/products/');

  // Auto-close sidebar on any route or parameter change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname, location.search]);

  // Listen to custom wishlist updates
  useEffect(() => {
    const handleWishlistUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    };
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdate);
  }, [queryClient]);

  // Live cart query for badge counts
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => fetchCart(),
    staleTime: 1000 * 60 * 5,
  });

  // Live wishlist query for badge counts
  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchWishlist,
  });

  const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  const wishlistItemCount = wishlist.length;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Header */}
      <AppHeader
        cartItemCount={cartItemCount}
        wishlistItemCount={wishlistItemCount}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      {/* Navigation Drawer (Opens 75% width on mobile, 25% right side backdrop visible) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Overlay with backdrop blur (fills 100% of viewport, clicking right 25% closes drawer) */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-500 ease-out"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Navigation Drawer Aside Panel (Width: 75% on mobile, max 320px on desktop) */}
          <aside className="relative z-50 h-full w-[75vw] sm:w-80 sm:max-w-[320px] bg-[var(--bg-primary)] text-[var(--text-primary)] transform translate-x-0 transition-transform duration-500 ease-out flex flex-col justify-between border-r border-[var(--border-color)] shadow-2xl overflow-y-auto pb-safe">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between p-6 pt-10 mb-4">
                <h2
                  className="text-[30px] sm:text-[36px] uppercase tracking-wider text-[var(--gold)] font-normal"
                  style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                >
                  ITHIHASA
                </h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close navigation"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2"
                >
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col px-6 space-y-4">
                {/* 1. New Arrivals (Featured Active with Underline) */}
                <Link
                  to="/shop?sort=newest"
                  onClick={() => setIsMenuOpen(false)}
                  className="group flex items-center space-x-4 py-2.5 text-[var(--text-primary)] border-b border-[var(--text-primary)] duration-300 ease-out"
                >
                  <Sparkles
                    size={19}
                    className="text-[var(--gold)] shrink-0 transition-transform duration-300 group-hover:scale-110"
                  />
                  <span className="label-caps font-bold tracking-widest uppercase">
                    New Arrivals
                  </span>
                </Link>

                {/* 2. Collections */}
                <Link
                  to="/shop"
                  onClick={() => setIsMenuOpen(false)}
                  className="group flex items-center space-x-4 py-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-300 ease-out"
                >
                  <BookOpen
                    size={19}
                    strokeWidth={1.75}
                    className="text-[var(--text-secondary)] group-hover:text-[var(--gold)] transition-colors shrink-0"
                  />
                  <span className="label-caps tracking-widest uppercase">
                    Collections
                  </span>
                </Link>

                {/* 3. The Atelier */}
                <Link
                  to="/atelier"
                  onClick={() => setIsMenuOpen(false)}
                  className="group flex items-center space-x-4 py-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-300 ease-out"
                >
                  <Compass
                    size={19}
                    strokeWidth={1.75}
                    className="text-[var(--text-secondary)] group-hover:text-[var(--gold)] transition-colors shrink-0"
                  />
                  <span className="label-caps tracking-widest uppercase">
                    The Atelier
                  </span>
                </Link>

                {/* 4. Sustainability */}
                <Link
                  to="/sustainability"
                  onClick={() => setIsMenuOpen(false)}
                  className="group flex items-center space-x-4 py-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-300 ease-out"
                >
                  <Leaf
                    size={19}
                    strokeWidth={1.75}
                    className="text-[var(--text-secondary)] group-hover:text-[var(--gold)] transition-colors shrink-0"
                  />
                  <span className="label-caps tracking-widest uppercase">
                    Sustainability
                  </span>
                </Link>

                {/* 5. Customer Care */}
                <Link
                  to="/care"
                  onClick={() => setIsMenuOpen(false)}
                  className="group flex items-center space-x-4 py-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-300 ease-out"
                >
                  <HelpCircle
                    size={19}
                    strokeWidth={1.75}
                    className="text-[var(--text-secondary)] group-hover:text-[var(--gold)] transition-colors shrink-0"
                  />
                  <span className="label-caps tracking-widest uppercase">
                    Customer Care
                  </span>
                </Link>
              </nav>
            </div>

            {/* Footer Area */}
            <div className="p-6 mt-auto border-t border-[var(--border-color)]">
              <div className="flex items-center space-x-3 mb-2">
                <Globe size={16} strokeWidth={1.75} className="text-[var(--text-secondary)]" />
                <span className="label-caps text-[var(--text-secondary)] tracking-widest uppercase">
                  EN / INR
                </span>
              </div>
              <p className="body-sm text-[12px] text-[var(--text-muted)] tracking-wider">
                © {new Date().getFullYear()} ITHIHASA
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pt-16 md:pt-20 pb-20 md:pb-0">
        {children}
      </main>

      {/* Desktop Footer */}
      <footer className="bg-[var(--bg-footer)] text-[var(--text-footer)] border-t border-[var(--border-footer)] py-16 hidden md:block">
        <div className="max-w-[1440px] mx-auto px-10 grid grid-cols-4 gap-10">
          <div className="space-y-4">
            <span
              className="text-[26px] tracking-[0.25em] font-normal uppercase text-[var(--gold)] block"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              ITHIHASA
            </span>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              Quiet luxury handcrafted for timeless dignity. Royal Indian silhouettes woven with pure mulberry silks, fine pashmina and antique brushed gold accents.
            </p>
            <p className="text-[12px] text-[var(--gold)] font-medium tracking-widest uppercase pt-2">
              Wear Your Legacy.
            </p>
          </div>

          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--gold)] mb-4">
              Collections
            </h4>
            <ul className="space-y-2 text-[14px] text-[var(--text-secondary)]">
              <li><Link to="/shop?category=heritage-kurtas" className="hover:text-[var(--text-primary)]">Heritage Kurtas</Link></li>
              <li><Link to="/shop?category=bandhgalas-jackets" className="hover:text-[var(--text-primary)]">Bandhgalas & Jackets</Link></li>
              <li><Link to="/shop?category=dhoti-bottoms" className="hover:text-[var(--text-primary)]">Dhoti & Tailored Bottoms</Link></li>
              <li><Link to="/shop?category=royal-shawls-stoles" className="hover:text-[var(--text-primary)]">Royal Shawls & Stoles</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--gold)] mb-4">
              Client Experience
            </h4>
            <ul className="space-y-2 text-[14px] text-[var(--text-secondary)]">
              <li><Link to="/account/orders" className="hover:text-[var(--text-primary)]">Order Status & Tracking</Link></li>
              <li><Link to="/returns" className="hover:text-[var(--text-primary)]">Returns & Exchanges</Link></li>
              <li><Link to="/account" className="hover:text-[var(--text-primary)]">Theme & Preferences</Link></li>
              <li><Link to="/authenticity" className="hover:text-[var(--text-primary)]">Authenticity & Heritage</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--gold)] mb-4">
              Atelier Contact
            </h4>
            <div className="space-y-3 text-[13px] text-[var(--text-secondary)]">
              <p className="flex items-center space-x-2">
                <Mail size={16} className="text-[var(--gold)]" />
                <span>concierge@ithihasa.com</span>
              </p>
              <p className="flex items-center space-x-2">
                <Phone size={16} className="text-[var(--gold)]" />
                <span>+91 98765 43210</span>
              </p>
              <p className="flex items-start space-x-2">
                <MapPin size={16} className="text-[var(--gold)] shrink-0 mt-0.5" />
                <span>Heritage Atelier, Bangalore & New Delhi</span>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-10 mt-12 pt-6 border-t border-[var(--border-footer)] flex justify-between items-center text-[12px] text-[var(--text-secondary)]">
          <p>© {new Date().getFullYear()} ITHIHASA. All rights reserved.</p>
          <div className="flex space-x-6">
            <span>Verified PhonePe Gateway</span>
            <span>Zero-Tax Inclusive</span>
            <span>100% Pure Handloom</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation (Hidden on PDP where Sticky Add to Bag bar takes precedence) */}
      {!isPDP && (
        <BottomNav
          cartItemCount={cartItemCount}
          onItemClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
};
