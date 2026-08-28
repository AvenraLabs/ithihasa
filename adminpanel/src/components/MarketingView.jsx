import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import { fetchMarketingStats, fetchCoupons, createCoupon } from '../api/marketing.js';

const INITIAL_CAMPAIGNS = [
  {
    id: '1',
    name: 'Diwali Regal Collection Launch',
    code: 'REGAL25',
    discount: '25% OFF',
    reach: '1.2M',
    conversions: '4,890',
    revenue: '$184,200',
    status: 'Active',
    dates: 'Oct 15 - Nov 15, 2023',
    banner: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCp2MY-i6FVyIWxqy0BivV4xT41MJJ9908qDTJIXx2JR2ZGU914DIv91Q0lLzgs-12T500ACSURod9mxu09pXYGiH230imPT-nC_Kivu20DwqYqsDZlIEg9CMHPNtuNWuhO1Rr3SOX0nuJjj9ZjSmuX-_u8mjt-aklkmwuk1gpy4yTYGzotBiAJ8_JriQOcnKtr1zO-h1YwFSuJSQTqJ7HPQA8T9HUf3RfeI_yKEjM-kzDW-e-j47BCcQ'
  },
  {
    id: '2',
    name: 'Winter Pashmina & Cashmere Showcase',
    code: 'WARMTH15',
    discount: '15% OFF',
    reach: '840K',
    conversions: '2,140',
    revenue: '$96,400',
    status: 'Active',
    dates: 'Nov 01 - Dec 31, 2023',
    banner: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChGPEW4JwxYYRiybHsS-xDf4jBYLJ3wC01QcXZpvzDppzHBh0sreoHltNCMjc4KSVwiL0E6zgwxQlZk-NtobJXtnx7JlSaoMooxLKskanJ0-jWuFL2CiNu8GLa5f71hcTC3C6yTV_NMkvpIUJN4PwZ5dzej2MmpS2ASUF1YSYmBu0763NoIlWC1BQ0DMdJ66eDXW8yT8E02O-gAXhjiQzc6mDELn72_NapGl1IqfkazBv43sdfse3FIQ'
  },
  {
    id: '3',
    name: 'Private Atelier VIP Preview Invitation',
    code: 'NOIRPRIVILEGE',
    discount: 'Complimentary Silk Stole',
    reach: '142K',
    conversions: '890',
    revenue: '$210,000',
    status: 'Scheduled',
    dates: 'Dec 10 - Dec 25, 2023',
    banner: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCi31WqWj678Qz9D0w3qL_vFp2jTfUf9rYF71s4v6a6Eqb0ICw2PfLdYlURCszUxM313a2REACEneZtg1TZzLp762yFMCIC7AWr6UJCtsjXlNoyXz__uHaqnmyPMWkZtmh-yv79JhdW0TZYOz-rz5WG-oZwyuIpfRjsvkXsWlcx8tt8-ioT_PP-jwFBwh6ILIy9ZiCdOKZZEbjmj95xILmAS3ssYqg_F1Wly908L9B5rh-3-8PE8bQytTwfRVgHYB1Xw67GSxOqoH49Yg'
  }
];

export function MarketingView() {
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [stats, setStats] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('All Channels');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadMarketing() {
      try {
        setLoading(true);
        const data = await fetchMarketingStats().catch(() => null);
        if (data) setStats(data);
      } catch (err) {
        console.warn('Marketing stats note:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadMarketing();
  }, []);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !code) return;

    const newCamp = {
      id: Date.now().toString(),
      name,
      code: code.toUpperCase(),
      discount: discount || '10% OFF',
      reach: '50K',
      conversions: '0',
      revenue: '$0',
      status: 'Active',
      dates: 'Just Created',
      banner: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCp2MY-i6FVyIWxqy0BivV4xT41MJJ9908qDTJIXx2JR2ZGU914DIv91Q0lLzgs-12T500ACSURod9mxu09pXYGiH230imPT-nC_Kivu20DwqYqsDZlIEg9CMHPNtuNWuhO1Rr3SOX0nuJjj9ZjSmuX-_u8mjt-aklkmwuk1gpy4yTYGzotBiAJ8_JriQOcnKtr1zO-h1YwFSuJSQTqJ7HPQA8T9HUf3RfeI_yKEjM-kzDW-e-j47BCcQ'
    };

    setCampaigns([newCamp, ...campaigns]);
    try {
      await createCoupon({
        code: code.toUpperCase(),
        discount_type: 'PERCENTAGE',
        discount_value: 15,
        min_order_value: 1000,
        valid_from: new Date(),
        valid_until: new Date(Date.now() + 30 * 86400000),
      }).catch(() => null);
    } catch {}

    setName('');
    setCode('');
    setDiscount('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-[1440px] w-full mx-auto space-y-6 md:space-y-8 flex-1">
      {/* Page Header matching Stitch */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pb-2 border-b border-[var(--border-color)]">
        <div>
          <h1
            className="font-garamond text-[28px] sm:text-[34px] md:text-[44px] text-[var(--text-primary)] font-normal tracking-tight leading-tight m-0"
          >
            Marketing & Campaigns
          </h1>
          <p className="body-md text-[13px] sm:text-[14px] md:text-[15px] text-[var(--text-secondary)] mt-1">
            Orchestrate promotional launches, VIP invitations, and brand editorial reach.
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
        {/* Left Card: 7-Week Campaign Performance Chart (Col Span 8) */}
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

            <div className="relative">
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="bg-transparent border-b border-[var(--border-color)] font-manrope text-[13px] text-[var(--text-secondary)] focus:border-[var(--gold)] outline-none py-1 pr-6 cursor-pointer rounded-none appearance-none"
              >
                <option value="All Channels" className="bg-[var(--bg-card)] text-[var(--text-primary)]">All Channels</option>
                <option value="Email Editorial" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Email Editorial</option>
                <option value="VIP Concierge" className="bg-[var(--bg-card)] text-[var(--text-primary)]">VIP Concierge</option>
                <option value="Social & Press" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Social & Press</option>
              </select>
              <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
            </div>
          </div>

          {/* Minimalist Bar Chart: Weeks 1 - 7 */}
          <div className="pt-6 pb-2">
            <div className="flex items-end justify-around h-44 sm:h-52 w-full border-b border-[var(--border-color)] px-2 sm:px-4">
              {/* W1 */}
              <div className="flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer">
                <span className="text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">14K</span>
                <div className="w-6 sm:w-10 h-10 sm:h-12 bg-[var(--bg-secondary)] border border-[var(--border-color)] group-hover:border-[var(--gold)] transition-all rounded-t-sm" />
                <span className="label-caps text-[10px] sm:text-[11px] text-[var(--text-secondary)]">W1</span>
              </div>

              {/* W2 */}
              <div className="flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer">
                <span className="text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">28K</span>
                <div className="w-6 sm:w-10 h-16 sm:h-20 bg-[var(--bg-secondary)] border border-[var(--border-color)] group-hover:border-[var(--gold)] transition-all rounded-t-sm" />
                <span className="label-caps text-[10px] sm:text-[11px] text-[var(--text-secondary)]">W2</span>
              </div>

              {/* W3 */}
              <div className="flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer">
                <span className="text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">45K</span>
                <div className="w-6 sm:w-10 h-24 sm:h-28 bg-[var(--bg-secondary)] border border-[var(--border-color)] group-hover:border-[var(--gold)] transition-all rounded-t-sm" />
                <span className="label-caps text-[10px] sm:text-[11px] text-[var(--text-secondary)]">W3</span>
              </div>

              {/* W4 */}
              <div className="flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer">
                <span className="text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">68K</span>
                <div className="w-6 sm:w-10 h-32 sm:h-36 bg-[var(--text-secondary)] group-hover:bg-[var(--gold)] transition-all rounded-t-sm shadow-sm" />
                <span className="label-caps text-[10px] sm:text-[11px] text-[var(--text-secondary)]">W4</span>
              </div>

              {/* W5 */}
              <div className="flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer">
                <span className="text-[10px] text-[var(--gold)] font-bold opacity-0 group-hover:opacity-100 transition-opacity">92K</span>
                <div className="w-6 sm:w-10 h-40 sm:h-44 bg-[var(--text-primary)] group-hover:bg-[var(--gold)] transition-all rounded-t-sm shadow-md" />
                <span className="label-caps text-[10px] sm:text-[11px] text-[var(--text-primary)] font-bold">W5</span>
              </div>

              {/* W6 */}
              <div className="flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer">
                <span className="text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">54K</span>
                <div className="w-6 sm:w-10 h-28 sm:h-32 bg-[var(--bg-secondary)] border border-[var(--border-color)] group-hover:border-[var(--gold)] transition-all rounded-t-sm" />
                <span className="label-caps text-[10px] sm:text-[11px] text-[var(--text-secondary)]">W6</span>
              </div>

              {/* W7 */}
              <div className="flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer">
                <span className="text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">61K</span>
                <div className="w-6 sm:w-10 h-32 sm:h-36 bg-[var(--bg-secondary)] border border-[var(--border-color)] group-hover:border-[var(--gold)] transition-all rounded-t-sm" />
                <span className="label-caps text-[10px] sm:text-[11px] text-[var(--text-secondary)]">W7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Stack: Key KPI Cards (Col Span 4) */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
          {/* KPI 1: Total Editorial Reach */}
          <div className="bg-black text-[#F4EFE6] dark:bg-[#1f1d1b] p-5 sm:p-6 border border-[var(--border-color)] relative overflow-hidden group shadow-sm flex flex-col justify-between">
            <div>
              <span className="label-caps text-[11px] text-[var(--gold)] uppercase tracking-widest block mb-2">
                Total Reach
              </span>
              <h3 className="font-garamond text-[32px] sm:text-[40px] text-[#F4EFE6] font-normal leading-none tabular-nums">
                2.4M
              </h3>
              <p className="text-[12.5px] text-[var(--text-muted)] mt-2">
                Across email, VIP concierges, and print lookbooks.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border-color)]/30 flex items-center justify-between text-[12px] text-[var(--gold)]">
              <span>Conversion Rate</span>
              <span className="font-semibold tabular-nums">4.8%</span>
            </div>
          </div>

          {/* KPI 2: Attributed Campaign Revenue */}
          <div className="bg-[var(--bg-card)] p-5 sm:p-6 border border-[var(--border-color)] shadow-sm flex flex-col justify-between">
            <div>
              <span className="label-caps text-[11px] text-[var(--text-secondary)] uppercase tracking-widest block mb-2">
                Attributed Revenue
              </span>
              <h3 className="font-garamond text-[32px] sm:text-[40px] text-[var(--text-primary)] font-normal leading-none tabular-nums">
                $490.6K
              </h3>
              <p className="text-[12.5px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium flex items-center gap-1">
                <TrendingUp size={14} /> +24% YoY growth
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-[12px] text-[var(--text-secondary)]">
              <span>Avg Order Value</span>
              <span className="font-semibold text-[var(--text-primary)] tabular-nums">$1,240</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Promotions Gallery */}
      <div className="space-y-4">
        <h2 className="font-garamond text-[22px] sm:text-[24px] font-normal text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
          Promotions & Special Codes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm group hover:border-[var(--gold)] transition-all flex flex-col overflow-hidden"
            >
              {/* Banner with 16/9 Ratio */}
              <div className="aspect-[16/9] w-full bg-[var(--bg-secondary)] overflow-hidden relative">
                <img
                  src={camp.banner}
                  alt={camp.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`label-caps text-[9px] px-2.5 py-1 uppercase tracking-widest font-bold rounded-sm ${
                      camp.status === 'Active'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-black/80 text-[var(--gold)] border border-[var(--gold)]/30'
                    }`}
                  >
                    {camp.status}
                  </span>
                </div>
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
                  <span className="font-bold text-[var(--gold)]">{camp.code}</span>
                  <span className="text-[12px] text-[var(--text-secondary)] font-manrope">{camp.discount}</span>
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
      </div>

      {/* Create Campaign Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-color)] max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-4">
              <div>
                <span className="label-caps text-[10px] text-[var(--gold)] uppercase tracking-widest">
                  ATELIER CAMPAIGN
                </span>
                <h3 className="font-garamond text-[24px] sm:text-[26px] font-normal text-[var(--text-primary)] mt-0.5">
                  Launch New Promotion
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 font-manrope text-[13px]">
              <div>
                <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1">
                  CAMPAIGN TITLE *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal Wedding Season Lookbook"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1">
                    PROMO CODE *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="ROYAL20"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1">
                    OFFER DETAILS
                  </label>
                  <input
                    type="text"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="20% OFF"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[11px] uppercase tracking-wider py-3 shadow-sm hover:opacity-90"
                >
                  Create Promotion
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--gold)] label-caps text-[11px] uppercase tracking-wider"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
