import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Package,
  Users,
  ArrowUpRight,
  TrendingUp,
  Minus,
  ChevronDown,
  UserPlus,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { fetchDashboardAnalytics } from '../api/dashboard.js';

const formatINR = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export function DashboardView({ onNavigateToOrders }) {
  const [timeFilter, setTimeFilter] = useState('This Week');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await fetchDashboardAnalytics();
        if (stats) setData(stats);
      } catch (err) {
        console.warn('Dashboard stats fallback:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const overview = data?.overview || {
    totalRevenue: 1248500,
    totalOrders: 148,
    totalCustomers: 2481,
    averageOrderValue: 34500,
  };

  return (
    <div className="p-5 md:p-10 max-w-[1440px] w-full mx-auto space-y-8 flex-1">
      {/* Welcome & Live Status Header */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-garamond text-[32px] sm:text-[40px] text-[var(--text-primary)] font-normal tracking-tight leading-tight">
            Good Morning, Administrator
          </h1>
          <p className="body-md text-[14px] md:text-[15px] text-[var(--text-secondary)] mt-1">
            Here is the live performance overview for Ithihasa Atelier today.
          </p>
        </div>

        <div className="flex items-center gap-3 label-caps text-[11px] uppercase tracking-widest text-[var(--text-secondary)] self-start sm:self-auto bg-[var(--bg-card)] px-3 py-1.5 border border-[var(--border-color)] shadow-sm">
          <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span className="w-1 h-1 rounded-full bg-[var(--gold)]" />
          <span className="flex items-center gap-1.5 text-[var(--gold)]">
            <RefreshCw size={12} className="animate-spin" /> LIVE
          </span>
        </div>
      </section>

      {/* 4 Metric Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Metric 1: Total Revenue */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 transition-all duration-300 hover:border-[var(--gold)] shadow-sm group">
          <div className="flex justify-between items-start mb-6">
            <h3 className="label-caps text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">
              Total Revenue
            </h3>
            <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">
              <ShoppingBag size={16} strokeWidth={1.75} />
            </div>
          </div>
          <div>
            <div className="font-garamond text-[28px] md:text-[32px] text-[var(--text-primary)] font-normal tabular-nums leading-none">
              {formatINR(overview.totalRevenue)}
            </div>
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold text-[12px]">
                <TrendingUp size={14} className="mr-0.5" /> +12.5%
              </span>
              <span className="text-[12px] text-[var(--text-muted)]">vs last month</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Orders */}
        <div
          onClick={onNavigateToOrders}
          className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 transition-all duration-300 hover:border-[var(--gold)] shadow-sm group cursor-pointer"
        >
          <div className="flex justify-between items-start mb-6">
            <h3 className="label-caps text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">
              Orders
            </h3>
            <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">
              <Package size={16} strokeWidth={1.75} />
            </div>
          </div>
          <div>
            <div className="font-garamond text-[28px] md:text-[32px] text-[var(--text-primary)] font-normal tabular-nums leading-none">
              {overview.totalOrders.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold text-[12px]">
                <TrendingUp size={14} className="mr-0.5" /> +8.2%
              </span>
              <span className="text-[12px] text-[var(--text-muted)]">vs last month</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Active Patrons */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 transition-all duration-300 hover:border-[var(--gold)] shadow-sm group">
          <div className="flex justify-between items-start mb-6">
            <h3 className="label-caps text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">
              Active Patrons
            </h3>
            <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">
              <Users size={16} strokeWidth={1.75} />
            </div>
          </div>
          <div>
            <div className="font-garamond text-[28px] md:text-[32px] text-[var(--text-primary)] font-normal tabular-nums leading-none">
              {overview.totalCustomers.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold text-[12px]">
                <TrendingUp size={14} className="mr-0.5" /> +4.1%
              </span>
              <span className="text-[12px] text-[var(--text-muted)]">vs last month</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Average Order Value */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 transition-all duration-300 hover:border-[var(--gold)] shadow-sm group">
          <div className="flex justify-between items-start mb-6">
            <h3 className="label-caps text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">
              Avg. Order Value
            </h3>
            <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">
              <ArrowUpRight size={16} strokeWidth={1.75} />
            </div>
          </div>
          <div>
            <div className="font-garamond text-[28px] md:text-[32px] text-[var(--text-primary)] font-normal tabular-nums leading-none">
              {formatINR(overview.averageOrderValue)}
            </div>
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="flex items-center text-[var(--text-secondary)] font-semibold text-[12px]">
                <Minus size={14} className="mr-0.5" /> 0.0%
              </span>
              <span className="text-[12px] text-[var(--text-muted)]">vs last month</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Visual Data Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sales Over Time Chart & Category Performance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sales Chart Card */}
          <div className="border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-[var(--border-color)]">
              <h2 className="font-garamond text-[20px] font-normal text-[var(--text-primary)]">
                Sales Over Time
              </h2>

              <div className="relative">
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className="label-caps uppercase tracking-widest text-[11px] text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Filter: {timeFilter}</span>
                  <ChevronDown size={14} />
                </button>

                {isFilterDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl z-20 py-1">
                    {['This Week', 'This Month', 'This Quarter', 'This Year'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setTimeFilter(opt);
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer ${
                          timeFilter === opt ? 'text-[var(--gold)] font-bold' : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SVG Curve Chart matching Stitch Line Style */}
            <div className="h-64 w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] relative flex items-end justify-between p-4 overflow-hidden rounded-sm">
              {/* Grid horizontal lines */}
              <div className="absolute inset-x-8 top-1/4 border-b border-[var(--border-color)]/50" />
              <div className="absolute inset-x-8 top-2/4 border-b border-[var(--border-color)]/50" />
              <div className="absolute inset-x-8 top-3/4 border-b border-[var(--border-color)]/50" />

              {/* SVG Line & Gradient */}
              <svg
                className="absolute inset-0 w-full h-full p-8"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <polygon
                  points="0,80 16,60 33,68 50,38 66,50 83,30 100,15 100,100 0,100"
                  fill="url(#chartGrad)"
                />
                <polyline
                  points="0,80 16,60 33,68 50,38 66,50 83,30 100,15"
                  fill="none"
                  stroke="var(--text-primary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="100" cy="15" r="4" fill="var(--gold)" />
              </svg>

              {/* X Axis Labels */}
              <div className="absolute bottom-2 left-8 right-8 flex justify-between label-caps text-[10px] text-[var(--text-secondary)]">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>

          {/* Category Performance Card */}
          <div className="border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-[var(--border-color)]">
              <h2 className="font-garamond text-[20px] font-normal text-[var(--text-primary)]">
                Category Performance
              </h2>
              <span className="label-caps text-[11px] text-[var(--gold)]">OCTOBER 2026</span>
            </div>

            <div className="space-y-4">
              {/* Category 1: Outerwear */}
              <div>
                <div className="flex justify-between mb-1.5 font-manrope text-[13px]">
                  <span className="font-medium text-[var(--text-primary)]">Bandhgalas & Outerwear</span>
                  <span className="tabular-nums font-semibold text-[var(--text-primary)]">₹4,52,000</span>
                </div>
                <div className="w-full bg-[var(--bg-secondary)] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[var(--text-primary)] h-full rounded-full" style={{ width: '75%' }} />
                </div>
              </div>

              {/* Category 2: Dresses & Kurtas */}
              <div>
                <div className="flex justify-between mb-1.5 font-manrope text-[13px]">
                  <span className="font-medium text-[var(--text-primary)]">Heritage Silk Kurtas</span>
                  <span className="tabular-nums font-semibold text-[var(--text-primary)]">₹3,21,000</span>
                </div>
                <div className="w-full bg-[var(--bg-secondary)] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[var(--gold)] h-full rounded-full opacity-90" style={{ width: '55%' }} />
                </div>
              </div>

              {/* Category 3: Shawls & Accessories */}
              <div>
                <div className="flex justify-between mb-1.5 font-manrope text-[13px]">
                  <span className="font-medium text-[var(--text-primary)]">Royal Pashmina Shawls</span>
                  <span className="tabular-nums font-semibold text-[var(--text-primary)]">₹2,85,000</span>
                </div>
                <div className="w-full bg-[var(--bg-secondary)] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[var(--text-secondary)] h-full rounded-full opacity-70" style={{ width: '45%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Recent Activity Feed */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 flex flex-col h-full shadow-sm">
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-[var(--border-color)]">
            <h2 className="font-garamond text-[20px] font-normal text-[var(--text-primary)]">
              Recent Activity
            </h2>
            <button
              onClick={onNavigateToOrders}
              className="label-caps uppercase tracking-widest text-[11px] text-[var(--gold)] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto pr-1">
            {/* Activity 1 */}
            <div onClick={onNavigateToOrders} className="flex items-start gap-3.5 group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center shrink-0 mt-0.5 text-[var(--text-primary)] group-hover:bg-[var(--gold)] group-hover:text-black transition-colors">
                <ShoppingBag size={14} />
              </div>
              <div>
                <p className="text-[13px] text-[var(--text-primary)] leading-snug">
                  <span className="font-semibold">New Order #ITH-4920</span> placed by Eleanor Vance.
                </p>
                <p className="label-caps text-[10px] text-[var(--text-muted)] mt-1 tracking-wider">
                  2 mins ago • ₹34,500
                </p>
              </div>
            </div>

            {/* Activity 2 */}
            <div className="flex items-start gap-3.5 group cursor-default">
              <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center shrink-0 mt-0.5 text-[var(--text-primary)] group-hover:bg-[var(--gold)] group-hover:text-black transition-colors">
                <UserPlus size={14} />
              </div>
              <div>
                <p className="text-[13px] text-[var(--text-primary)] leading-snug">
                  <span className="font-semibold">New Patron:</span> Arthur Pendelton registered an account.
                </p>
                <p className="label-caps text-[10px] text-[var(--text-muted)] mt-1 tracking-wider">
                  15 mins ago
                </p>
              </div>
            </div>

            {/* Activity 3 */}
            <div onClick={onNavigateToOrders} className="flex items-start gap-3.5 group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center shrink-0 mt-0.5 text-[var(--text-primary)] group-hover:bg-[var(--gold)] group-hover:text-black transition-colors">
                <ShoppingBag size={14} />
              </div>
              <div>
                <p className="text-[13px] text-[var(--text-primary)] leading-snug">
                  <span className="font-semibold">New Order #ITH-4919</span> placed by Marcus James.
                </p>
                <p className="label-caps text-[10px] text-[var(--text-muted)] mt-1 tracking-wider">
                  1 hour ago • ₹48,000
                </p>
              </div>
            </div>

            {/* Activity 4 */}
            <div className="flex items-start gap-3.5 group cursor-default">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5 text-amber-600 dark:text-amber-400">
                <AlertTriangle size={14} />
              </div>
              <div>
                <p className="text-[13px] text-[var(--text-primary)] leading-snug">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Low Stock Alert:</span> Pure Pashmina Regal Stole reached threshold.
                </p>
                <p className="label-caps text-[10px] text-[var(--text-muted)] mt-1 tracking-wider">
                  3 hours ago
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
