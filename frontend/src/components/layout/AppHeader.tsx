import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Heart, Search, ShoppingBag, User, ChevronLeft } from 'lucide-react';

interface AppHeaderProps {
  cartItemCount?: number;
  wishlistItemCount?: number;
  onOpenMenu?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  cartItemCount = 0,
  wishlistItemCount = 0,
  onOpenMenu,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isPDP = location.pathname.startsWith('/products/');

  return (
    <>
      {/* Desktop Header (>= 768px) */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[var(--bg-header)] backdrop-blur-md border-b border-[var(--border-color)] hidden md:flex items-center h-20 transition-all duration-300">
        <div className="w-full max-w-[1440px] mx-auto px-10 flex justify-between items-center">
          {/* Left Menu & Nav Links */}
          <div className="flex items-center space-x-8">
            <button
              onClick={onOpenMenu}
              aria-label="Open Navigation Menu"
              className="text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors p-2"
            >
              <Menu size={22} strokeWidth={1.75} />
            </button>

            <nav className="hidden lg:flex items-center space-x-6 text-[13px] font-semibold tracking-[0.15em] uppercase text-[var(--text-primary)]">
              <Link to="/shop" className="hover:text-[var(--gold)] transition-colors">Collection</Link>
              <Link to="/shop?category=heritage-kurtas" className="hover:text-[var(--gold)] transition-colors">Kurtas</Link>
              <Link to="/shop?category=bandhgalas-jackets" className="hover:text-[var(--gold)] transition-colors">Bandhgalas</Link>
              <Link to="/shop?category=royal-shawls-stoles" className="hover:text-[var(--gold)] transition-colors">Shawls</Link>
            </nav>
          </div>

          {/* Center Brand Identity (Pure Typography) */}
          <Link to="/" className="flex items-center group">
            <span
              className="text-[28px] tracking-[0.25em] font-normal uppercase text-[var(--gold)] transition-transform duration-300 group-hover:scale-105"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              ITHIHASA
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigate('/search')}
              aria-label="Search Collection"
              className="text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors p-2"
            >
              <Search size={20} strokeWidth={1.75} />
            </button>

            {/* Wishlist Header Link */}
            <Link
              to="/account/wishlist"
              aria-label="Saved Wishlist"
              className="relative text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors p-2"
            >
              <Heart
                size={20}
                strokeWidth={1.75}
              />
              {wishlistItemCount > 0 && (
                <span className="absolute top-1 right-1 bg-[var(--gold)] text-[#0A0A0A] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {wishlistItemCount}
                </span>
              )}
            </Link>

            {/* Bag Header Link */}
            <Link
              to="/cart"
              aria-label="Shopping Bag"
              className="relative text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors p-2"
            >
              <ShoppingBag size={20} strokeWidth={1.75} />
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-1 bg-[var(--text-primary)] text-[var(--bg-primary)] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <Link
              to="/account"
              aria-label="My Account"
              className="text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors p-2"
            >
              <User size={20} strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Header (< 768px) */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[var(--bg-header)] backdrop-blur-md border-b border-[var(--border-color)] md:hidden flex justify-between items-center px-5 h-16 transition-all duration-300">
        {isPDP ? (
          <button
            onClick={() => navigate(-1)}
            aria-label="Go Back"
            className="text-[var(--text-primary)] active:scale-95 transition-transform p-2 -ml-2 hover:text-[var(--gold)]"
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>
        ) : (
          <button
            onClick={onOpenMenu}
            aria-label="Menu"
            className="text-[var(--text-primary)] active:scale-95 transition-transform p-2 -ml-2 hover:text-[var(--gold)]"
          >
            <Menu size={22} strokeWidth={1.75} />
          </button>
        )}

        {/* Center Wordmark */}
        <Link to="/" className="flex items-center">
          <span
            className="text-[24px] tracking-[0.15em] font-normal uppercase text-[var(--gold)]"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            ITHIHASA
          </span>
        </Link>

        {/* Right Actions: Wishlist */}
        <div className="flex items-center space-x-2 -mr-2">
          <Link
            to="/account/wishlist"
            aria-label="Favorites"
            className="relative text-[var(--text-primary)] hover:text-[var(--gold)] active:scale-95 transition-transform p-2"
          >
            <Heart
              size={22}
              strokeWidth={1.75}
            />
            {wishlistItemCount > 0 && (
              <span className="absolute top-1 right-1 bg-[var(--gold)] text-[#0A0A0A] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {wishlistItemCount}
              </span>
            )}
          </Link>
        </div>
      </header>
    </>
  );
};
