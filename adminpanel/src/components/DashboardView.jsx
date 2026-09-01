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
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    revenueGrowth: '0.0%',
    ordersGrowth: '0.0%',
    patronsGrowth: '0.0%',
    aovGrowth: '0.0%',
  };

  const revenueCurve = data?.revenueCurve || [
    { day: 'Mon', revenue: 0 },
    { day: 'Tue', revenue: 0 },
    { day: 'Wed', revenue: 0 },
    { day: 'Thu', revenue: 0 },
    { day: 'Fri', revenue: 0 },
    { day: 'Sat', revenue: 0 },
    { day: 'Sun', revenue: 0 },
  ];

  // Dynamically calculate SVG chart coordinates
  const maxRevenue = Math.max(...revenueCurve.map((c) => Number(c.revenue || 0)), 1000);
  const chartPoints = revenueCurve.map((item, idx) => {
    const x = revenueCurve.length > 1 ? (idx / (revenueCurve.length - 1)) * 100 : 50;
    const val = Number(item.revenue || 0);
    // Y mapped between 15 (top) and 85 (bottom)
    const y = val > 0 ? 85 - (val / maxRevenue) * 70 : 85;
    return { x, y, ...item };
  });

  const polylineStr = chartPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const polygonStr = `0,85 ${polylineStr} 100,85`;

  const categoryData = data?.categoryPerformance || {
    month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase(),
    items: [],
  };

  const maxCatRev = Math.max(...(categoryData.items?.map((i) => Number(i.revenue || 0)) || []), 1);

  const recentActivity = data?.recentActivity || [];

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
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> LIVE
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
              <span className={`flex items-center font-semibold text-[12px] ${
                overview.revenueGrowth?.startsWith('+')
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-[var(--text-secondary)]'
              }`}>
                {overview.revenueGrowth?.startsWith('+') ? <TrendingUp size={14} className="mr-0.5" /> : <Minus size={14} className="mr-0.5" />}
                {overview.revenueGrowth || '0.0%'}
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
              {(overview.totalOrders || 0).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className={`flex items-center font-semibold text-[12px] ${
                overview.ordersGrowth?.startsWith('+')
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-[var(--text-secondary)]'
              }`}>
                {overview.ordersGrowth?.startsWith('+') ? <TrendingUp size={14} className="mr-0.5" /> : <Minus size={14} className="mr-0.5" />}
                {overview.ordersGrowth || '0.0%'}
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
              {(overview.totalCustomers || 0).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className={`flex items-center font-semibold text-[12px] ${
                overview.patronsGrowth?.startsWith('+')
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-[var(--text-secondary)]'
              }`}>
                {overview.patronsGrowth?.startsWith('+') ? <TrendingUp size={14} className="mr-0.5" /> : <Minus size={14} className="mr-0.5" />}
                {overview.patronsGrowth || '0.0%'}
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
              <span className={`flex items-center font-semibold text-[12px] ${
                overview.aovGrowth?.startsWith('+')
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-[var(--text-secondary)]'
              }`}>
                {overview.aovGrowth?.startsWith('+') ? <TrendingUp size={14} className="mr-0.5" /> : <Minus size={14} className="mr-0.5" />}
                {overview.aovGrowth || '0.0%'}
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

            {/* Dynamic SVG Curve Chart */}
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
                <polygon points={polygonStr} fill="url(#chartGrad)" />
                <polyline
                  points={polylineStr}
                  fill="none"
                  stroke="var(--text-primary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {chartPoints.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={i === chartPoints.length - 1 ? 4 : 2.5}
                    fill="var(--gold)"
                  />
                ))}
              </svg>

              {/* X Axis Labels */}
              <div className="absolute bottom-2 left-8 right-8 flex justify-between label-caps text-[10px] text-[var(--text-secondary)]">
                {revenueCurve.map((item, idx) => (
                  <span key={idx}>{item.day}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Category Performance Card */}
          <div className="border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-[var(--border-color)]">
              <h2 className="font-garamond text-[20px] font-normal text-[var(--text-primary)]">
                Category Performance
              </h2>
              <span className="label-caps text-[11px] text-[var(--gold)]">{categoryData.month}</span>
            </div>

            <div className="space-y-4">
              {categoryData.items && categoryData.items.length > 0 ? (
                categoryData.items.map((cat, idx) => {
                  const rev = Number(cat.revenue || 0);
                  const pct = maxCatRev > 0 ? Math.round((rev / maxCatRev) * 100) : 0;
                  const barColors = ['bg-[var(--text-primary)]', 'bg-[var(--gold)]', 'bg-[var(--text-secondary)]'];
                  return (
                    <div key={cat.id || idx}>
                      <div className="flex justify-between mb-1.5 font-manrope text-[13px]">
                        <span className="font-medium text-[var(--text-primary)]">{cat.name}</span>
                        <span className="tabular-nums font-semibold text-[var(--text-primary)]">{formatINR(rev)}</span>
                      </div>
                      <div className="w-full bg-[var(--bg-secondary)] h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`${barColors[idx % barColors.length]} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-[var(--text-muted)] text-[13px]">
                  No sales recorded across categories for this period yet.
                </div>
              )}
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
            {recentActivity.length > 0 ? (
              recentActivity.map((act) => {
                const isOrder = act.type === 'order';
                const isPatron = act.type === 'patron';
                const isInventory = act.type === 'inventory';

                return (
                  <div
                    key={act.id}
                    onClick={isOrder ? onNavigateToOrders : undefined}
                    className={`flex items-start gap-3.5 group ${isOrder ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                        isInventory
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                          : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] group-hover:bg-[var(--gold)] group-hover:text-black'
                      }`}
                    >
                      {isOrder && <ShoppingBag size={14} />}
                      {isPatron && <UserPlus size={14} />}
                      {isInventory && <AlertTriangle size={14} />}
                    </div>
                    <div>
                      <p className="text-[13px] text-[var(--text-primary)] leading-snug">
                        <span className="font-semibold">{act.title} </span>
                        {act.description}
                      </p>
                      <p className="label-caps text-[10px] text-[var(--text-muted)] mt-1 tracking-wider">
                        {act.timeAgo}
                        {act.amount !== undefined && ` • ${formatINR(act.amount)}`}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-[var(--text-muted)] text-[13px]">
                No recent activity recorded yet. Live events will appear here.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
