import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Store, Search, ShoppingBag, User } from 'lucide-react';

interface BottomNavProps {
  cartItemCount?: number;
  onItemClick?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  cartItemCount = 0,
  onItemClick,
}) => {
  const navItems = [
    { label: 'Home', to: '/', icon: Home },
    { label: 'Shop', to: '/shop', icon: Store },
    { label: 'Search', to: '/search', icon: Search },
    { label: 'Bag', to: '/cart', icon: ShoppingBag, badge: cartItemCount },
    { label: 'Account', to: '/account', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-[var(--bg-header)] backdrop-blur-lg border-t border-[var(--border-color)] md:hidden pb-safe transition-colors duration-300">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => onItemClick?.()}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center w-14 h-full transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-[var(--text-primary)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon
                    size={22}
                    strokeWidth={isActive ? 2.2 : 1.75}
                    className="transition-colors"
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[var(--text-primary)] text-[var(--bg-primary)] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Stitch Signature Active Indicator Dot */}
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 bg-[var(--gold)] rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
