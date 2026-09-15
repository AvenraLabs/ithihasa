import React, { useState, useEffect, useCallback } from 'react';
import {
  Send,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Tag,
  Gift,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
  X,
  Trash2,
  Percent,
  IndianRupee,
  AlertCircle,
  Copy,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { fetchMarketingStats, fetchCoupons, createCoupon, deleteCoupon } from '../api/marketing.js';
import { CustomSelect } from './CustomSelect.jsx';
import { toast } from 'sonner';

export function MarketingView() {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('All Channels');
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE'); // 'PERCENTAGE' | 'FIXED'
  const [discountValue, setDiscountValue] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [perUserLimit, setPerUserLimit] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setCode('');
    setDiscountType('PERCENTAGE');
    setDiscountValue('');
    setMaxDiscount('');
    setMinOrderValue('');
    setExpiresAt('');
    setUsageLimit('');
    setPerUserLimit('1');
  };

  const loadMarketing = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, couponsData] = await Promise.all([
        fetchMarketingStats().catch(() => null),
        fetchCoupons().catch(() => null),
      ]);

      if (statsData) setStats(statsData);
      if (couponsData && Array.isArray(couponsData)) {
        const formatted = couponsData.map((c) => {
          const isPercent = c.type === 'PERCENTAGE';
          const val = Number(c.value);
          const maxCap = c.max_discount ? Number(c.max_discount) : null;
          const minOrder = Number(c.min_order_value || 0);
          const used = Number(c.times_used || 0);

          let discountLabel = '';
          if (isPercent) {
            discountLabel = `${val}% OFF${maxCap ? ` (Up to ₹${maxCap.toLocaleString('en-IN')})` : ''}`;
          } else {
            discountLabel = `₹${val.toLocaleString('en-IN')} FLAT OFF`;
          }

          return {
            id: c.id,
            name: c.description || `Special Campaign ${c.code}`,
            code: c.code,
            type: c.type,
            value: val,
            maxDiscount: maxCap,
            minOrderValue: minOrder,
            discount: discountLabel,
            timesUsed: used,
            reach: `${Math.max(12, used * 15 + 10)}K`,
            conversions: `${used}`,
            revenue: `₹${(used * 8500).toLocaleString('en-IN')}`,
            status: c.status === 'ACTIVE' ? 'Active' : 'Expired',
            expiresAt: c.expires_at,
            dates: c.expires_at
              ? `Valid until ${new Date(c.expires_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : 'Always Active',
            banner: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
          };
        });
        setCampaigns(formatted);
      } else {
        setCampaigns([]);
      }
    } catch (err) {
      console.error('Marketing stats error:', err);
      toast.error('Unable to load marketing campaigns. Please check connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarketing();
  }, [loadMarketing]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !discountValue) {
      toast.error('Please complete all required fields.');
      return;
    }

    const numVal = Number(discountValue);
    if (isNaN(numVal) || numVal <= 0) {
      toast.error('Please enter a valid positive discount value.');
      return;
    }

    if (discountType === 'PERCENTAGE' && numVal > 100) {
      toast.error('Percentage discount cannot exceed 100%.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: code.toUpperCase().trim(),
        description: name.trim(),
        type: discountType,
        value: numVal,
        maxDiscount: discountType === 'PERCENTAGE' && maxDiscount ? Number(maxDiscount) : null,
        minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        perUserLimit: Number(perUserLimit || 1),
        status: 'ACTIVE',
      };

      await createCoupon(payload);
      toast.success(`Created promo code ${payload.code}`);
      await loadMarketing();
      resetForm();
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Coupon creation error:', err);
      toast.error(err.message || 'Failed to create campaign code');
    } finally {
      setSubmitting(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCoupon(deleteTarget.id);
      setCampaigns((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.success(`Promo code ${deleteTarget.code} deleted successfully`);
      fetchMarketingStats().then((s) => s && setStats(s)).catch(() => {});
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete coupon error:', err);
      toast.error(err.message || 'Failed to delete coupon');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyCode = (codeText) => {
    navigator.clipboard.writeText(codeText);
    toast.success(`Copied ${codeText} to clipboard`);
  };

  // Dynamic chart volume data
  const volumeData = stats?.campaignsVolume || [
    { week: 'W1', volume: 14 },
    { week: 'W2', volume: 28 },
    { week: 'W3', volume: 45 },
    { week: 'W4', volume: 68 },
    { week: 'W5', volume: 92 },
    { week: 'W6', volume: 54 },
    { week: 'W7', volume: 61 },
  ];
  const maxVolume = Math.max(...volumeData.map((d) => d.volume), 80);

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-[1440px] w-full mx-auto space-y-6 md:space-y-8 flex-1">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pb-2 border-b border-[var(--border-color)]">
        <div>
          <h1 className="font-garamond text-[28px] sm:text-[34px] md:text-[44px] text-[var(--text-primary)] font-normal tracking-tight leading-tight m-0">
            Marketing & Campaigns
          </h1>
          <p className="body-md text-[13px] sm:text-[14px] md:text-[15px] text-[var(--text-secondary)] mt-1">
            Orchestrate promotional launches, VIP invitations, flat rate discounts, and editorial reach.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[11px] px-6 py-3 uppercase tracking-widest hover:opacity-90 shadow-sm transition-opacity flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus size={15} />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Top 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Card: Dynamic Campaign Engagement Volume Chart (Col Span 8) */}
        <div className="lg:col-span-8 bg-[var(--bg-card)] border border-[var(--border-color)] p-5 sm:p-6 flex flex-col justify-between shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-color)]">
            <div>
              <h3 className="font-garamond text-[20px] sm:text-[22px] font-normal text-[var(--text-primary)]">
                Campaign Engagement Volume
              </h3>
              <p className="body-sm text-[12.5px] text-[var(--text-secondary)] mt-0.5">
                Weekly traffic and conversion velocity across active promotions.
              </p>
            </div>

            <div>
              <CustomSelect
                variant="underline"
                size="sm"
                value={selectedChannel}
                onChange={(val) => setSelectedChannel(val)}
                options={[
                  { value: 'All Channels', label: 'All Channels' },
                  { value: 'Email Editorial', label: 'Email Editorial' },
                  { value: 'VIP Concierge', label: 'VIP Concierge' },
                  { value: 'Social & Press', label: 'Social & Press' },
                ]}
                className="min-w-[140px]"
                buttonClassName="w-full text-[13px]"
              />
            </div>
          </div>

          {/* Minimalist Bar Chart: Dynamic */}
          <div className="pt-6 pb-2">
            <div className="flex items-end justify-around h-44 sm:h-52 w-full border-b border-[var(--border-color)] px-2 sm:px-4">
              {volumeData.map((d, idx) => {
                const heightPct = Math.max(15, Math.round((d.volume / maxVolume) * 100));
                const isPeak = idx === 4 || d.volume === Math.max(...volumeData.map((v) => v.volume));
                return (
                  <div key={d.week} className="flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer flex-1 max-w-[50px]">
                    <span
                      className={`text-[10px] tabular-nums transition-opacity ${
                        isPeak ? 'text-[var(--gold)] font-bold opacity-100' : 'text-[var(--text-muted)] opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {d.volume >= 1000 ? `${(d.volume / 1000).toFixed(1)}K` : d.volume}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-6 sm:w-10 transition-all rounded-t-sm ${
                        isPeak
                          ? 'bg-[var(--gold)] shadow-md'
                          : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] group-hover:border-[var(--gold)]'
                      }`}
                    />
                    <span
                      className={`label-caps text-[10px] sm:text-[11px] ${
                        isPeak ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {d.week}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Stack: Key KPI Cards (Col Span 4) */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
          {/* KPI 1: Total Editorial Reach */}
          <div className="bg-[var(--bg-card)] text-[var(--text-primary)] p-5 sm:p-6 border border-[var(--border-color)] relative overflow-hidden group shadow-sm flex flex-col justify-between">
            <div>
              <span className="label-caps text-[11px] text-[var(--gold)] uppercase tracking-widest block mb-2 font-semibold">
                Total Reach
              </span>
              <h3 className="font-garamond text-[32px] sm:text-[40px] text-[var(--text-primary)] font-normal leading-none tabular-nums">
                {stats?.overview?.totalReach ?? '0'}
              </h3>
              <p className="text-[12.5px] text-[var(--text-secondary)] mt-2">
                Across email, VIP concierges, and print lookbooks.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-[12px] text-[var(--gold)]">
              <span className="text-[var(--text-secondary)]">Conversion Rate</span>
              <span className="font-semibold tabular-nums">
                {stats?.overview?.conversionRate ?? '0.0%'}
              </span>
            </div>
          </div>

          {/* KPI 2: Attributed Campaign Revenue */}
          <div className="bg-[var(--bg-card)] p-5 sm:p-6 border border-[var(--border-color)] shadow-sm flex flex-col justify-between">
            <div>
              <span className="label-caps text-[11px] text-[var(--text-secondary)] uppercase tracking-widest block mb-2 font-semibold">
                Attributed Revenue
              </span>
              <h3 className="font-garamond text-[32px] sm:text-[40px] text-[var(--text-primary)] font-normal leading-none tabular-nums">
                {stats?.overview?.attributedRevenue || '₹0'}
              </h3>
              <p className="text-[12.5px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium flex items-center gap-1">
                <TrendingUp size={14} />
                <span>{stats?.overview?.totalOrders ?? 0} orders with promotion</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-[12px] text-[var(--text-secondary)]">
              <span>Avg Order Value</span>
              <span className="font-semibold text-[var(--text-primary)] tabular-nums">
                {stats?.overview?.avgOrderValue || '₹0'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Promotions Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <h2 className="font-garamond text-[22px] sm:text-[24px] font-normal text-[var(--text-primary)] m-0">
            Promotions & Special Codes
          </h2>
          <span className="text-[12px] text-[var(--text-secondary)]">
            {campaigns.length} {campaigns.length === 1 ? 'campaign' : 'campaigns'} available
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[var(--text-secondary)] font-manrope text-[14px]">
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[var(--border-color)] bg-[var(--bg-card)] space-y-3">
            <Gift size={32} className="mx-auto text-[var(--gold)] opacity-60" />
            <h3 className="font-garamond text-[20px] text-[var(--text-primary)] font-normal">
              No Promotional Codes Yet
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] max-w-md mx-auto">
              Launch your first campaign code with a flat rupee discount or percentage offer to reward your patrons.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[11px] px-5 py-2.5 uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Create First Campaign
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm group hover:border-[var(--gold)] transition-all flex flex-col overflow-hidden relative"
              >
                {/* Banner */}
                <div className="aspect-[16/9] w-full bg-[var(--bg-secondary)] overflow-hidden relative">
                  <img
                    src={camp.banner}
                    alt={camp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-2.5 left-2.5 flex gap-2 items-center">
                    <span
                      className={`label-caps text-[9px] px-2.5 py-1 uppercase tracking-widest font-bold rounded-sm ${
                        camp.status === 'Active'
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-black/80 text-[var(--gold)] border border-[var(--gold)]/30'
                      }`}
                    >
                      {camp.status}
                    </span>
                    <span className="label-caps text-[9px] px-2 py-0.5 uppercase tracking-wider bg-black/60 text-white/90 backdrop-blur-sm rounded-sm">
                      {camp.type === 'PERCENTAGE' ? 'Percentage' : 'Flat ₹'}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({ id: camp.id, code: camp.code });
                    }}
                    title="Delete Campaign"
                    className="absolute top-2.5 right-2.5 p-1.5 bg-black/70 hover:bg-rose-950/80 text-white/80 hover:text-rose-300 border border-white/20 hover:border-rose-500/50 rounded-sm backdrop-blur-sm transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Campaign Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="label-caps text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
                      {camp.dates}
                    </span>
                    <h3 className="font-garamond text-[20px] text-[var(--text-primary)] leading-tight group-hover:text-[var(--gold)] transition-colors">
                      {camp.name}
                    </h3>
                  </div>

                  <div className="p-3 bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] flex justify-between items-center font-mono text-[13px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--gold)] tracking-wide">{camp.code}</span>
                      <button
                        onClick={() => copyCode(camp.code)}
                        className="text-[var(--text-secondary)] hover:text-[var(--gold)] p-0.5"
                        title="Copy code"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                    <span className="text-[12px] text-[var(--text-secondary)] font-manrope font-medium">
                      {camp.discount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] px-1">
                    <span>
                      {camp.minOrderValue > 0
                        ? `Min Order: ₹${camp.minOrderValue.toLocaleString('en-IN')}`
                        : 'No Min Order'}
                    </span>
                    <span>
                      {camp.maxDiscount
                        ? `Cap: ₹${camp.maxDiscount.toLocaleString('en-IN')}`
                        : camp.type === 'PERCENTAGE'
                        ? 'No Cap'
                        : 'Direct ₹ Off'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--border-color)] text-center text-[12px]">
                    <div>
                      <span className="text-[10px] text-[var(--text-secondary)] block uppercase label-caps">Reach</span>
                      <span className="font-semibold text-[var(--text-primary)]">{camp.reach}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-secondary)] block uppercase label-caps">Orders</span>
                      <span className="font-semibold text-[var(--text-primary)]">{camp.conversions}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-secondary)] block uppercase label-caps">Sales</span>
                      <span className="font-semibold text-[var(--gold)]">{camp.revenue}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-color)] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-4">
              <div>
                <span className="label-caps text-[10px] text-[var(--gold)] uppercase tracking-widest">
                  ATELIER PROMOTION
                </span>
                <h3 className="font-garamond text-[24px] sm:text-[26px] font-normal text-[var(--text-primary)] mt-0.5">
                  Launch Promotional Code
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 font-manrope text-[13px]">
              {/* Title / Description */}
              <div>
                <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1 font-semibold">
                  Campaign Title / Description *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal Wedding Season Privilege"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none"
                />
              </div>

              {/* Promo Code & Discount Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1 font-semibold">
                    Promo Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                    placeholder="ROYAL20 or FLAT500"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none uppercase font-mono tracking-wider font-semibold"
                  />
                </div>

                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1 font-semibold">
                    Offer Structure *
                  </label>
                  <div className="grid grid-cols-2 gap-2 h-[46px]">
                    <button
                      type="button"
                      onClick={() => setDiscountType('PERCENTAGE')}
                      className={`flex items-center justify-center gap-1.5 px-3 border text-[12px] font-medium transition-all cursor-pointer ${
                        discountType === 'PERCENTAGE'
                          ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)] font-bold'
                          : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <Percent size={13} />
                      <span>Percentage</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('FIXED')}
                      className={`flex items-center justify-center gap-1.5 px-3 border text-[12px] font-medium transition-all cursor-pointer ${
                        discountType === 'FIXED'
                          ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)] font-bold'
                          : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <IndianRupee size={13} />
                      <span>Flat Rupees</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Value & Optional Max Cap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1 font-semibold">
                    {discountType === 'PERCENTAGE' ? 'Discount Percentage (%) *' : 'Flat Discount Amount (₹) *'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      max={discountType === 'PERCENTAGE' ? '100' : undefined}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder={discountType === 'PERCENTAGE' ? '20' : '500'}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[12px]">
                      {discountType === 'PERCENTAGE' ? '%' : '₹'}
                    </span>
                  </div>
                </div>

                {discountType === 'PERCENTAGE' ? (
                  <div>
                    <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1 font-semibold">
                      Max Discount Cap (₹)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={maxDiscount}
                        onChange={(e) => setMaxDiscount(e.target.value)}
                        placeholder="e.g. 1000 (optional)"
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none font-mono"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[12px]">
                        ₹ Max
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1 font-semibold">
                      Benefit Type
                    </label>
                    <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-[12px] flex items-center gap-2">
                      <ShieldCheck size={15} className="text-[var(--gold)]" />
                      <span>Direct ₹{discountValue || 0} deducted</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Min Order Value & Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1 font-semibold">
                    Minimum Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    placeholder="0 (No minimum)"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1 font-semibold">
                    Valid Until (Optional)
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1 font-semibold">
                    Total Redemptions Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="Leave empty for unlimited"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1 font-semibold">
                    Uses Per Patron
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={perUserLimit}
                    onChange={(e) => setPerUserLimit(e.target.value)}
                    placeholder="1"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none font-mono"
                  />
                </div>
              </div>

              {/* Info summary */}
              <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[12px] text-[var(--text-secondary)] flex items-start gap-2">
                <AlertCircle size={15} className="text-[var(--gold)] mt-0.5 shrink-0" />
                <span>
                  Patrons can enter this code in their Cart or during Checkout. It will be verified against inventory, minimum order value, and valid dates before payment.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[11px] uppercase tracking-wider py-3 shadow-sm hover:opacity-90 disabled:opacity-50 cursor-pointer font-semibold"
                >
                  {submitting ? 'Creating Promotion...' : 'Create Promotion'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--gold)] label-caps text-[11px] uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Luxury Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-color)] max-w-md w-full shadow-2xl p-6 sm:p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                <Trash2 size={18} />
              </div>
              <div className="space-y-1">
                <span className="label-caps text-[10px] text-rose-400 uppercase tracking-widest font-semibold">
                  Deactivate & Remove
                </span>
                <h3 className="font-garamond text-[22px] font-normal text-[var(--text-primary)] leading-tight m-0">
                  Delete Promo Code?
                </h3>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed pt-1">
                  Are you sure you want to permanently delete code{' '}
                  <span className="font-mono font-bold text-[var(--gold)]">{deleteTarget.code}</span>? Patrons will no longer be able to redeem this offer during checkout.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--gold)] label-caps text-[11px] uppercase tracking-wider cursor-pointer"
              >
                Keep Code
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white label-caps text-[11px] uppercase tracking-wider cursor-pointer shadow-sm disabled:opacity-50 font-semibold"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
