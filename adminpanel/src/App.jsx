import React, { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate
} from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Megaphone,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { ThemeIcon } from './components/ThemeIcon.jsx';
import { DashboardView } from './components/DashboardView.jsx';
import { OrdersView } from './components/OrdersView.jsx';
import { OrderDetailView } from './components/OrderDetailView.jsx';
import { InventoryView } from './components/InventoryView.jsx';
import { CustomersView } from './components/CustomersView.jsx';
import { MarketingView } from './components/MarketingView.jsx';
import { SettingsView } from './components/SettingsView.jsx';
import { SupportView } from './components/SupportView.jsx';
import { DirectChatView } from './components/DirectChatView.jsx';
import { LoginView } from './components/LoginView.jsx';
import { NotificationsDrawer } from './components/NotificationsDrawer.jsx';
import { fetchNotifications, markNotificationsRead } from './api/notifications.js';
import { Toaster } from 'sonner';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ithihasa_admin_theme') || 'light';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'order',
      title: 'High-Value Order Received',
      time: 'Just now',
      description: 'Lady Catherine Morland placed order #ITH-4925 ($4,850.00)',
      read: false,
      targetPath: '/orders'
    },
    {
      id: '2',
      type: 'alert',
      title: 'Low Stock Alert',
      time: '42m ago',
      description: 'Gold Zari Raw Silk Kurta (Size: M) has reached 2 pieces threshold',
      read: false,
      targetPath: '/inventory'
    },
    {
      id: '3',
      type: 'user',
      title: 'Bespoke Tailoring Request',
      time: '2h ago',
      description: 'New measurement note submitted on order #ITH-4920',
      read: true,
      targetPath: '/support/chat'
    }
  ]);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await fetchNotifications().catch(() => null);
        if (data && Array.isArray(data) && data.length > 0) {
          setNotifications(data);
        }
      } catch (err) {
        console.warn('Notifications live load note:', err.message);
      }
    }
    loadNotifications();
  }, []);

  const hasUnreadNotifications = notifications.some(n => !n.read);

  const handleNotificationClick = (item) => {
    setNotifications(prev =>
      prev.map(n => (n.id === item.id ? { ...n, read: true } : n))
    );
    if (item.targetPath) {
      navigate(item.targetPath);
    }
    setIsNotificationsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await markNotificationsRead().catch(() => null);
    } catch {}
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('ithihasa_admin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const navItems = [
    { id: 'dashboard', path: '/dashboard', alias: '/', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', path: '/orders', label: 'Orders', icon: ShoppingBag, count: 12 },
    { id: 'inventory', path: '/inventory', label: 'Inventory', icon: Package, alert: true },
    { id: 'customers', path: '/customers', label: 'Customers', icon: Users },
    { id: 'marketing', path: '/marketing', label: 'Marketing', icon: Megaphone },
    { id: 'settings', path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isTabActive = (item) => {
    if (item.id === 'dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(item.path);
  };

  const isSupportActive = location.pathname.startsWith('/support');

  if (location.pathname === '/login') {
    return <LoginView onLoginSuccess={() => navigate('/dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex antialiased selection:bg-[var(--gold)] selection:text-black">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Side Navigation Bar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] z-50 flex flex-col justify-between py-6 px-4 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Header Branding */}
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-[var(--border-color)] shrink-0 bg-[var(--bg-secondary)] shadow-sm">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAN6YGn433thz6sYn0x7UeWugOYwNt38nb0ZDSkJamplGWA0o_1xeK6yk52C6bB96V3Z-uKAzaMoO9uV8Zl22ZqfmUZ5IWD74TPEKCvfiKdPRcEbT9jMZX7YHUob4O_bBQJNFUePqaAeYXW1JebK2JBIVtHhQ7MDvQdHpM5bsrRXwzyawuCUeGkliSrVaBzz6LTQZ7JWAzBaRgqVgfcPD54IIZJmZYvy7ZNnTDBLisAPKHhlwkUIIEK_g"
                  alt="Ithihasa Atelier Mark"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="font-garamond text-[20px] font-normal text-[var(--text-primary)] leading-tight">
                  Atelier Admin
                </h1>
                <p className="label-caps tracking-widest text-[9.5px] uppercase text-[var(--text-secondary)] mt-0.5">
                  Heritage Edition
                </p>
              </div>
            </div>

            {/* Mobile Drawer Close */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5 font-manrope">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isTabActive(item);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all duration-200 text-left outline-none focus:outline-none focus:ring-0 select-none cursor-pointer ${
                    active
                      ? 'bg-[var(--bg-secondary)]/80 text-[var(--gold)] font-semibold shadow-none'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/40 hover:text-[var(--text-primary)] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      strokeWidth={active ? 2.25 : 1.75}
                      className={active ? 'text-[var(--gold)]' : 'text-[var(--text-secondary)]'}
                    />
                    <span className="label-caps tracking-widest text-[11px] uppercase">
                      {item.label}
                    </span>
                  </div>
                  {item.count && (
                    <span className="bg-[var(--gold)] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  )}
                  {item.alert && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[var(--border-color)] space-y-3">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:opacity-90 label-caps py-2.5 px-4 uppercase tracking-[0.15em] text-[11px] transition-all shadow-sm"
          >
            <span>View Boutique</span>
            <ExternalLink size={13} />
          </a>

          <div className="space-y-1">
            <button
              onClick={() => {
                navigate('/support');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-md transition-colors text-left outline-none cursor-pointer ${
                isSupportActive
                  ? 'bg-[var(--bg-secondary)]/80 text-[var(--gold)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              <HelpCircle size={17} strokeWidth={1.75} />
              <span className="label-caps text-[11px] tracking-widest uppercase">Support</span>
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('ithihasa_admin_authenticated');
                navigate('/login');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 text-[var(--text-secondary)] hover:text-rose-500 hover:bg-[var(--bg-secondary)] px-3.5 py-2 rounded-md transition-colors text-left cursor-pointer"
            >
              <LogOut size={17} strokeWidth={1.75} />
              <span className="label-caps text-[11px] tracking-widest uppercase">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col min-w-0 w-full overflow-x-hidden">
        {/* Top App Bar Header */}
        <header className="sticky top-0 z-40 bg-[var(--bg-header)] backdrop-blur-md border-b border-[var(--border-color)] h-16 flex items-center justify-between px-4 sm:px-6 md:px-10 transition-colors">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 -ml-1 cursor-pointer"
            >
              <Menu size={22} />
            </button>
            <span className="font-garamond text-[18px] sm:text-[20px] md:text-[22px] tracking-[0.18em] uppercase text-[var(--gold)] font-normal select-none">
              ITHIHASA HERITAGE
            </span>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8 border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
            <Search size={16} className="text-[var(--text-secondary)] mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search orders, customers, inventory..."
              className="w-full bg-transparent border-none outline-none font-manrope text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)]"
            />
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bell Notifications Anchor */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(prev => !prev)}
                aria-label="Notifications"
                className={`relative p-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                  isNotificationsOpen || hasUnreadNotifications
                    ? 'text-[var(--gold)] font-bold bg-[var(--bg-secondary)]/60'
                    : 'text-[var(--text-secondary)] hover:text-[var(--gold)] hover:bg-[var(--bg-secondary)]/40'
                }`}
              >
                <Bell size={19} strokeWidth={isNotificationsOpen || hasUnreadNotifications ? 2.25 : 1.75} />
                {hasUnreadNotifications && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--gold)] animate-pulse" />
                )}
              </button>

              {/* Notifications Popover Card matching Stitch */}
              <NotificationsDrawer
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={notifications}
                onMarkAllAsRead={handleMarkAllAsRead}
                onNotificationClick={handleNotificationClick}
              />
            </div>

            {/* Contrast Theme Toggle Switcher */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors p-2 cursor-pointer"
            >
              <ThemeIcon theme={theme} />
            </button>
          </div>
        </header>

        {/* Dynamic Route Pages */}
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route
            path="/orders"
            element={
              <OrdersView
                onSelectOrder={(order) => navigate(`/orders/${order.id}`)}
              />
            }
          />
          <Route
            path="/orders/:orderId"
            element={<OrderDetailView onBack={() => navigate('/orders')} />}
          />
          <Route path="/inventory" element={<InventoryView />} />
          <Route path="/customers" element={<CustomersView />} />
          <Route path="/marketing" element={<MarketingView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/support" element={<SupportView />} />
          <Route path="/support/chat" element={<DirectChatView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster position="top-right" theme={theme} closeButton />
    </div>
  );
}
