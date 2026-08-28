import React from 'react';
import { Package, Heart, MapPin, CreditCard, ChevronRight, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeIcon } from '../components/ui/ThemeIcon.js';

import { useAvatar } from '../context/AvatarContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { ProfileAvatar } from '../components/ui/ProfileAvatar.js';

const NAV_ITEMS = [
  {
    icon: Package,
    label: 'Orders',
    subtitle: 'View and track your history',
    to: '/account/orders',
  },
  {
    icon: Heart,
    label: 'Wishlist',
    subtitle: 'Your curated selection',
    to: '/wishlist',
  },
  {
    icon: MapPin,
    label: 'Addresses',
    subtitle: 'Manage delivery locations',
    to: '/account/addresses',
  },
  {
    icon: CreditCard,
    label: 'Payments',
    subtitle: 'Secure methods and wallets',
    to: '/account/payments',
  },
];

export const AccountPage: React.FC = () => {
  const { profileData } = useAvatar();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      <main className="pt-4 md:pt-10 pb-28 md:pb-16 px-4 md:px-20 max-w-[1440px] mx-auto flex flex-col md:flex-row gap-4 md:gap-6">

        {/* ─── Left Column: Profile Overview ─── */}
        <section className="w-full md:w-1/3 flex flex-col gap-3 md:gap-4">

          {/* Profile Card */}
          <div className="bg-[var(--bg-card)] rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden border border-[var(--border-color)]">
            {/* Theme Toggle — adapts to light/dark themes dynamically */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--gold)] active:scale-90 transition-all p-1"
            >
              <ThemeIcon size={20} />
            </button>

            {/* Avatar */}
            <Link
              to="/account/edit"
              className="shrink-0 block rounded-full overflow-hidden mb-4"
              style={{
                borderRadius: '50%',
                clipPath: 'circle(50% at 50% 50%)',
                WebkitClipPath: 'circle(50% at 50% 50%)',
              }}
              aria-label="Change Avatar"
            >
              <ProfileAvatar
                size={96}
                className="rounded-full transition-transform duration-300 hover:scale-105"
              />
            </Link>

            {/* Name */}
            <h1
              className="text-[22px] md:text-[24px] font-medium text-[var(--text-primary)] mb-0.5"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              {profileData.fullName}
            </h1>

            {/* Email */}
            <p className="body-sm text-[13px] text-[var(--text-secondary)] mb-5">
              {profileData.email}
            </p>

            {/* Edit Profile Button */}
            <Link
              to="/account/edit"
              className="w-full border border-[var(--text-primary)] py-2.5 px-4 text-center label-caps text-[11px] tracking-widest text-[var(--text-primary)] uppercase hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 rounded"
            >
              Edit Profile
            </Link>
          </div>

          {/* Member Tier Card */}
          <div className="bg-[var(--bg-card)] rounded-xl p-5 border border-[var(--border-color)] flex justify-between items-center">
            <div>
              <h3 className="label-caps text-[11px] tracking-widest text-[var(--text-secondary)] uppercase mb-1">
                Member Status
              </h3>
              <p
                className="text-[16px] font-semibold text-[var(--gold)] tracking-wide"
              >
                Noir Tier
              </p>
            </div>
            {/* Waves / Tier icon */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              className="text-[var(--gold)]"
            >
              <path
                d="M4 12c2.667-2.667 5.333-2.667 8 0s5.333 2.667 8 0 5.333-2.667 8 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M4 18c2.667-2.667 5.333-2.667 8 0s5.333 2.667 8 0 5.333-2.667 8 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M4 24c2.667-2.667 5.333-2.667 8 0s5.333 2.667 8 0 5.333-2.667 8 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </section>

        {/* ─── Right Column: Account Navigation ─── */}
        <section className="w-full md:w-2/3 flex flex-col gap-3">
          {/* Desktop-only heading */}
          <h2
            className="text-[24px] font-medium text-[var(--text-primary)] mb-2 hidden md:block"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            Account Details
          </h2>

          {/* Navigation List Items */}
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-center justify-between p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg hover:border-[var(--gold)] transition-colors duration-300"
            >
              <div className="flex items-center gap-4">
                <item.icon
                  size={22}
                  strokeWidth={1.75}
                  className="text-[var(--text-secondary)] group-hover:text-[var(--gold)] transition-colors shrink-0"
                />
                <div>
                  <h3 className="text-[16px] font-semibold text-[var(--text-primary)] tracking-wide">
                    {item.label}
                  </h3>
                  <p className="body-sm text-[13px] text-[var(--text-secondary)]">
                    {item.subtitle}
                  </p>
                </div>
              </div>
              <ChevronRight
                size={20}
                strokeWidth={1.75}
                className="text-[var(--text-secondary)] group-hover:translate-x-1 transition-transform shrink-0"
              />
            </Link>
          ))}

          {/* Sign Out */}
          <div className="mt-6 pt-5 border-t border-[var(--border-color)] flex justify-start">
            <button
              onClick={() => {
                navigate('/login');
              }}
              className="label-caps text-[12px] tracking-widest text-[var(--text-secondary)] hover:text-[var(--error)] transition-colors flex items-center gap-2 uppercase"
            >
              <LogOut size={16} strokeWidth={1.75} />
              Sign Out
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
