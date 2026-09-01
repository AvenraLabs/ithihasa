import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppHeader } from './AppHeader.js';
import { BottomNav } from './BottomNav.js';
import {
  X,
  Compass,
  Leaf,
  HelpCircle,
  Globe,
  Phone,
  Mail,
  MapPin,
  User,
  LogOut,
  Smartphone,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchCart } from '../../api/cart.js';
import { fetchWishlist } from '../../api/wishlist.js';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isPDP = location.pathname.startsWith('/products/');

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem('ithihasa_access_token'));
  });

  // Keep auth state synchronized
  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem('ithihasa_access_token')));
  }, [location.pathname]);

  // PWA Install prompt listener
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('To install Ithihasa on your device:\n\n• iOS (Safari): Tap Share ➔ "Add to Home Screen"\n• Android (Chrome): Tap browser menu (⋮) ➔ "Install App"');
    }
  };

  // Auto-close sidebar on any route or parameter change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname, location.search]);

  // Live cart query for badge counts
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => fetchCart(),
    staleTime: 1000 * 30,
  });

  // Live wishlist query for badge counts
  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => fetchWishlist(),
    staleTime: 1000 * 30,
  });

  const cartItemCount = cart?.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;
  const wishlistItemCount = Array.isArray(wishlist) ? wishlist.length : 0;

  const handleSignOut = () => {
    localStorage.removeItem('ithihasa_access_token');
    localStorage.removeItem('ithihasa_user_profile');
    setIsLoggedIn(false);
    setIsMenuOpen(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col antialiased transition-colors duration-300 font-sans selection:bg-[var(--gold)] selection:text-[#0A0A0A]">
      {/* Top Header */}
      <AppHeader
        cartItemCount={cartItemCount}
        wishlistItemCount={wishlistItemCount}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      {/* Slide-out Sidebar Drawer (z-[150] strictly above BottomNav z-50) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[150] flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Menu */}
          <aside className="relative z-[160] h-full w-[75vw] sm:w-80 sm:max-w-[320px] bg-[var(--bg-primary)] text-[var(--text-primary)] transform translate-x-0 transition-transform duration-500 ease-out flex flex-col justify-between border-r border-[var(--border-color)] shadow-2xl overflow-y-auto pb-safe">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between p-6 pt-8 mb-2 border-b border-[var(--border-color)]">
                <div>
                  <h2
                    className="text-[26px] sm:text-[30px] uppercase tracking-wider text-[var(--gold)] font-normal leading-tight"
                    style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                  >
                    ITHIHASA
                  </h2>
                  <span className="label-caps text-[9.5px] uppercase tracking-widest text-[var(--text-secondary)]">
                    Wear Your Legacy
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close navigation"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 cursor-pointer"
                >
                  <X size={22} strokeWidth={1.5} />
                </button>
              </div>

              {/* Patron Authentication Status Banner */}
              <div className="px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/40 mb-2">
                {isLoggedIn ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[var(--gold)] text-black flex items-center justify-center font-bold text-[12px]">
                        <User size={15} />
                      </div>
                      <div>
                        <span className="label-caps text-[10px] uppercase text-[var(--gold)] font-semibold block">
                          Patron Active
                        </span>
                        <Link
                          to="/account"
                          onClick={() => setIsMenuOpen(false)}
                          className="body-sm text-[13px] font-medium text-[var(--text-primary)] hover:text-[var(--gold)]"
                        >
                          View Account
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)] text-[var(--gold)] flex items-center justify-center">
                        <User size={15} />
                      </div>
                      <div>
                        <span className="label-caps text-[11px] uppercase tracking-wider text-[var(--gold)] font-bold block">
                          Sign In / Register
                        </span>
                        <span className="body-sm text-[11px] text-[var(--text-secondary)]">
                          Access orders & wishlist
                        </span>
                      </div>
                    </div>
                  </Link>
                )}
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col px-6 space-y-3">
                {/* 1. The Atelier */}
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
                  <span className="label-caps tracking-widest uppercase text-[12px]">
                    The Atelier
                  </span>
                </Link>

                {/* 2. Sustainability */}
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
                  <span className="label-caps tracking-widest uppercase text-[12px]">
                    Sustainability
                  </span>
                </Link>

                {/* 3. Customer Care */}
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
                  <span className="label-caps tracking-widest uppercase text-[12px]">
                    Customer Care
                  </span>
                </Link>

                {/* 4. Install App */}
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="group flex items-center space-x-4 py-2.5 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors duration-300 ease-out text-left w-full cursor-pointer"
                >
                  <Smartphone
                    size={19}
                    strokeWidth={1.75}
                    className="text-[var(--text-secondary)] group-hover:text-[var(--gold)] transition-colors shrink-0"
                  />
                  <span className="label-caps tracking-widest uppercase text-[12px]">
                    Install Mobile App
                  </span>
                </button>

                {/* Sign Out (Only when authenticated) */}
                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="group flex items-center space-x-4 py-2.5 text-[var(--text-secondary)] hover:text-[var(--error)] transition-colors duration-300 ease-out text-left w-full cursor-pointer"
                  >
                    <LogOut
                      size={18}
                      strokeWidth={1.75}
                      className="text-[var(--text-secondary)] group-hover:text-[var(--error)] transition-colors shrink-0"
                    />
                    <span className="label-caps tracking-widest uppercase text-[12px]">
                      Sign Out
                    </span>
                  </button>
                )}
              </nav>
            </div>

            {/* Footer Area */}
            <div className="p-6 mt-auto border-t border-[var(--border-color)]">
              <div className="flex items-center space-x-3 mb-2">
                <Globe size={16} strokeWidth={1.75} className="text-[var(--text-secondary)]" />
                <span className="label-caps text-[var(--text-secondary)] tracking-widest uppercase text-[11px]">
                  EN / INR (₹)
                </span>
              </div>
              <p className="body-sm text-[11px] text-[var(--text-secondary)] tracking-wider">
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
