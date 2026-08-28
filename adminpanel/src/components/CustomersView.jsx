import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Diamond,
  Filter,
  MoreVertical,
  Download,
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  X,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { fetchCustomerInsights, fetchCustomers } from '../api/customers.js';
import { toast } from 'sonner';

const INITIAL_CLIENTS = [
  {
    id: '1',
    name: 'Eleanor Sterling',
    initials: 'ES',
    tier: 'Noir',
    spend: 18450,
    lastOrder: 'Oct 12, 2023',
    email: 'eleanor.sterling@mayfair.com',
    phone: '+44 20 7946 0912',
    joinedDate: 'January 2022',
    totalOrders: 14,
    preferredCraft: 'Zari Weaves & Pashmina'
  },
  {
    id: '2',
    name: 'Alistair DuPont',
    initials: 'AD',
    tier: 'Gold',
    spend: 9200,
    lastOrder: 'Nov 04, 2023',
    email: 'a.dupont@geneve-capital.ch',
    phone: '+41 22 819 4400',
    joinedDate: 'August 2022',
    totalOrders: 7,
    preferredCraft: 'Brocade Sherwanis'
  },
  {
    id: '3',
    name: 'Clara Winslow',
    initials: 'CW',
    tier: 'Silver',
    spend: 4120,
    lastOrder: 'Nov 18, 2023',
    email: 'clara.winslow@manhattan.com',
    phone: '+1 (212) 555-0188',
    joinedDate: 'March 2023',
    totalOrders: 4,
    preferredCraft: 'Kalamkari & Silks'
  },
  {
    id: '4',
    name: 'Julian Mercer',
    initials: 'JM',
    tier: 'Silver',
    spend: 2850,
    lastOrder: 'Dec 01, 2023',
    email: 'j.mercer@mercer-design.com',
    phone: '+1 (415) 555-0143',
    joinedDate: 'June 2023',
    totalOrders: 2,
    preferredCraft: 'Living Brass Artefacts'
  }
];

export function CustomersView() {
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [insights, setInsights] = useState(null);
  const [timeRange, setTimeRange] = useState('Last 6 Months');
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [insightsData, customersData] = await Promise.all([
          fetchCustomerInsights().catch(() => null),
          fetchCustomers({ search: searchQuery || undefined }).catch(() => null),
        ]);

        if (insightsData) setInsights(insightsData);
        if (customersData && Array.isArray(customersData) && customersData.length > 0) {
          setClients(customersData);
        }
      } catch (err) {
        console.warn('Customer live sync note:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [searchQuery]);

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'Noir':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 bg-black text-[#F4EFE6] dark:bg-white dark:text-black border border-[var(--border-color)] label-caps text-[9.5px] sm:text-[10px] uppercase tracking-widest font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
            Noir
          </span>
        );
      case 'Gold':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 label-caps text-[9.5px] sm:text-[10px] uppercase tracking-widest font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
            Gold
          </span>
        );
      case 'Silver':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] label-caps text-[9.5px] sm:text-[10px] uppercase tracking-widest font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Silver
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] label-caps text-[9.5px] sm:text-[10px] uppercase tracking-widest">
            {tier}
          </span>
        );
    }
  };

  const filteredClients = clients.filter((client) => {
    return (
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.tier.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-[1440px] w-full mx-auto space-y-6 md:space-y-8 flex-1 min-w-0">
      {/* Page Header matching Stitch */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-5 pb-2 border-b border-[var(--border-color)]">
        <div>
          <h1
            className="font-garamond text-[26px] sm:text-[34px] md:text-[44px] text-[var(--text-primary)] font-normal tracking-tight leading-tight m-0"
          >
            Customer Insights
          </h1>
          <p className="body-md text-[13px] sm:text-[14px] md:text-[15px] text-[var(--text-secondary)] mt-1">
            Analyze behavior and manage relationships across the atelier.
          </p>
        </div>

        <button
          onClick={() => toast.success('Atelier Client Relationship Dossier (PDF) generated.')}
          className="w-full sm:w-auto border border-[var(--border-color)] text-[var(--text-primary)] px-5 py-2.5 label-caps text-[11px] uppercase tracking-widest hover:border-[var(--gold)] hover:text-[var(--gold)] bg-[var(--bg-card)] shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download size={14} />
          <span>Export Report</span>
        </button>
      </div>

      {/* Bento Grid Top Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column (Span 1): 3 Stacked KPI Cards */}
        <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3.5 sm:gap-4">
          {/* Card 1: Total Active Clients */}
          <div className="bg-[var(--bg-card)] p-4 sm:p-6 border border-[var(--border-color)] shadow-sm hover:border-[var(--gold)] transition-colors">
            <p className="label-caps text-[10.5px] sm:text-[11px] text-[var(--text-secondary)] uppercase tracking-widest mb-1">
              Total Active Clients
            </p>
            <h3 className="font-garamond text-[26px] sm:text-[32px] md:text-[36px] text-[var(--text-primary)] font-normal tabular-nums leading-none">
              2,481
            </h3>
            <div className="flex items-center gap-1.5 mt-2.5 text-[11.5px] sm:text-[12px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <TrendingUp size={13} />
              <span>+12% vs last quarter</span>
            </div>
          </div>

          {/* Card 2: Noir Tier Members */}
          <div className="bg-black text-[#F4EFE6] dark:bg-[#1f1d1b] p-4 sm:p-6 border border-[var(--border-color)] relative overflow-hidden group shadow-sm">
            <div className="relative z-10">
              <p className="label-caps text-[10.5px] sm:text-[11px] text-[var(--gold)] uppercase tracking-widest mb-1">
                Noir Tier Members
              </p>
              <h3 className="font-garamond text-[26px] sm:text-[32px] md:text-[36px] text-[#F4EFE6] font-normal tabular-nums leading-none">
                142
              </h3>
              <div className="flex items-center gap-1.5 mt-2.5 text-[11.5px] sm:text-[12px] text-[var(--text-muted)]">
                <span>Exclusive access granted</span>
              </div>
            </div>
            <Diamond
              size={70}
              className="absolute -bottom-4 -right-4 text-[var(--gold)]/10 transform group-hover:scale-110 transition-transform duration-500 pointer-events-none"
            />
          </div>

          {/* Card 3: Average LTV */}
          <div className="bg-[var(--bg-card)] p-4 sm:p-6 border border-[var(--border-color)] shadow-sm hover:border-[var(--gold)] transition-colors">
            <p className="label-caps text-[10.5px] sm:text-[11px] text-[var(--text-secondary)] uppercase tracking-widest mb-1">
              Average Lifetime Value
            </p>
            <h3 className="font-garamond text-[26px] sm:text-[32px] md:text-[36px] text-[var(--text-primary)] font-normal tabular-nums leading-none">
              $4,850
            </h3>
            <div className="flex items-center gap-1.5 mt-2.5 text-[11.5px] sm:text-[12px] text-[var(--text-secondary)]">
              <span>Across all tiers</span>
            </div>
          </div>
        </div>

        {/* Right Column (Span 2): Client Acquisition Growth Bar Chart */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] p-4 sm:p-6 border border-[var(--border-color)] flex flex-col justify-between shadow-sm min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-[var(--border-color)]">
            <div>
              <h3 className="font-garamond text-[19px] sm:text-[21px] font-normal text-[var(--text-primary)]">
                Client Acquisition Growth
              </h3>
              <p className="body-sm text-[12px] sm:text-[13px] text-[var(--text-secondary)] mt-0.5">
                New client registrations over the past 6 months.
              </p>
            </div>

            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent border-b border-[var(--border-color)] font-manrope text-[12.5px] text-[var(--text-secondary)] focus:border-[var(--gold)] outline-none py-1 pr-6 cursor-pointer rounded-none appearance-none"
              >
                <option value="Last 6 Months" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Last 6 Months</option>
                <option value="Last Year" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Last Year</option>
                <option value="All Time" className="bg-[var(--bg-card)] text-[var(--text-primary)]">All Time</option>
              </select>
              <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
            </div>
          </div>

          {/* Minimalist Bar Chart */}
          <div className="pt-2 pb-2">
            <div className="flex items-end justify-between sm:justify-around h-40 sm:h-52 w-full border-b border-[var(--border-color)] px-1 sm:px-4">
              {/* Sep */}
              <div className="flex flex-col items-center gap-1.5 group cursor-pointer">
                <span className="text-[9px] sm:text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">120</span>
                <div className="w-4 sm:w-10 md:w-12 h-10 sm:h-14 bg-[var(--bg-secondary)] border border-[var(--border-color)] group-hover:border-[var(--gold)] transition-all rounded-t-xs sm:rounded-t-sm" />
                <span className="label-caps text-[9px] sm:text-[11px] text-[var(--text-secondary)]">SEP</span>
              </div>

              {/* Oct */}
              <div className="flex flex-col items-center gap-1.5 group cursor-pointer">
                <span className="text-[9px] sm:text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">185</span>
                <div className="w-4 sm:w-10 md:w-12 h-16 sm:h-24 bg-[var(--bg-secondary)] border border-[var(--border-color)] group-hover:border-[var(--gold)] transition-all rounded-t-xs sm:rounded-t-sm" />
                <span className="label-caps text-[9px] sm:text-[11px] text-[var(--text-secondary)]">OCT</span>
              </div>

              {/* Nov */}
              <div className="flex flex-col items-center gap-1.5 group cursor-pointer">
                <span className="text-[9px] sm:text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">250</span>
                <div className="w-4 sm:w-10 md:w-12 h-24 sm:h-36 bg-[var(--text-secondary)] group-hover:bg-[var(--gold)] transition-all rounded-t-xs sm:rounded-t-sm shadow-sm" />
                <span className="label-caps text-[9px] sm:text-[11px] text-[var(--text-primary)] font-bold">NOV</span>
              </div>

              {/* Dec */}
              <div className="flex flex-col items-center gap-1.5 group cursor-pointer">
                <span className="text-[9px] sm:text-[10px] text-[var(--gold)] font-bold opacity-0 group-hover:opacity-100 transition-opacity">410</span>
                <div className="w-4 sm:w-10 md:w-12 h-32 sm:h-48 bg-[var(--text-primary)] group-hover:bg-[var(--gold)] transition-all rounded-t-xs sm:rounded-t-sm shadow-md" />
                <span className="label-caps text-[9px] sm:text-[11px] text-[var(--text-primary)] font-bold">DEC</span>
              </div>

              {/* Jan */}
              <div className="flex flex-col items-center gap-1.5 group cursor-pointer">
                <span className="text-[9px] sm:text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">190</span>
                <div className="w-4 sm:w-10 md:w-12 h-16 sm:h-24 bg-[var(--bg-secondary)] border border-[var(--border-color)] group-hover:border-[var(--gold)] transition-all rounded-t-xs sm:rounded-t-sm" />
                <span className="label-caps text-[9px] sm:text-[11px] text-[var(--text-secondary)]">JAN</span>
              </div>

              {/* Feb */}
              <div className="flex flex-col items-center gap-1.5 group cursor-pointer">
                <span className="text-[9px] sm:text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">215</span>
                <div className="w-4 sm:w-10 md:w-12 h-20 sm:h-32 bg-[var(--bg-secondary)] border border-[var(--border-color)] group-hover:border-[var(--gold)] transition-all rounded-t-xs sm:rounded-t-sm" />
                <span className="label-caps text-[9px] sm:text-[11px] text-[var(--text-secondary)]">FEB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Directory */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-[var(--bg-secondary)]/30">
          <div>
            <h3 className="font-garamond text-[19px] sm:text-[22px] font-normal text-[var(--text-primary)]">
              Client Directory
            </h3>
            <p className="body-sm text-[12px] text-[var(--text-secondary)]">
              Top atelier collectors and patronage tiers.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48 border-b border-[var(--border-color)] focus-within:border-[var(--gold)] pb-1">
              <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="w-full bg-transparent border-none outline-none font-manrope text-[12px] pl-5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
            </div>
            <button
              aria-label="Filter"
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] rounded shrink-0 cursor-pointer"
            >
              <Filter size={15} />
            </button>
          </div>
        </div>

        {/* Mobile View: Client Cards (< 640px) */}
        <div className="block sm:hidden divide-y divide-[var(--border-color)]">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className="p-3.5 space-y-2.5 cursor-pointer active:bg-[var(--bg-secondary)]/40 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center label-caps text-[10.5px] font-bold text-[var(--text-secondary)] shrink-0">
                    {client.initials}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-[13.5px] text-[var(--text-primary)] truncate">
                      {client.name}
                    </h4>
                    <span className="text-[11.5px] text-[var(--text-secondary)] block truncate">{client.email}</span>
                  </div>
                </div>
                {getTierBadge(client.tier)}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[var(--border-color)]/60 text-[12.5px]">
                <span className="text-[var(--text-secondary)] text-[11.5px]">Last order: {client.lastOrder}</span>
                <span className="font-semibold text-[14px] text-[var(--text-primary)] tabular-nums">
                  ${client.spend.toLocaleString('en-US')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View (>= 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] label-caps text-[11px] uppercase tracking-widest bg-[var(--bg-secondary)]/50">
                <th className="py-4 px-6 font-medium">Client Name</th>
                <th className="py-4 px-6 font-medium">Status Tier</th>
                <th className="py-4 px-6 font-medium">Total Spend</th>
                <th className="py-4 px-6 font-medium text-right">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] font-manrope text-[14px]">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className="hover:bg-[var(--bg-secondary)]/40 transition-colors group cursor-pointer"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center label-caps text-[11px] font-bold text-[var(--text-secondary)]">
                        {client.initials}
                      </div>
                      <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">
                        {client.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getTierBadge(client.tier)}
                  </td>
                  <td className="py-4 px-6 font-semibold text-[var(--text-primary)] tabular-nums">
                    ${client.spend.toLocaleString('en-US')}
                  </td>
                  <td className="py-4 px-6 text-right text-[var(--text-secondary)] text-[13px]">
                    {client.lastOrder}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-[var(--border-color)] flex justify-center bg-[var(--bg-secondary)]/20">
          <button
            onClick={() => toast.info('Displaying all active atelier collectors & patrons.')}
            className="label-caps text-[11px] uppercase tracking-widest text-[var(--text-primary)] hover:text-[var(--gold)] border-b border-[var(--text-primary)] hover:border-[var(--gold)] pb-0.5 transition-colors cursor-pointer"
          >
            View All Clients
          </button>
        </div>
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-color)] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-8 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="label-caps text-[10px] text-[var(--gold)] tracking-widest uppercase">
                  ATELIER CLIENT DOSSIER
                </span>
                <h2 className="font-garamond text-[22px] sm:text-[26px] text-[var(--text-primary)] font-normal mt-0.5">
                  {selectedClient.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 sm:p-4 border border-[var(--border-color)] bg-[var(--bg-secondary)]/40">
              <div>
                <span className="label-caps text-[9.5px] text-[var(--text-secondary)] uppercase block mb-1">
                  PATRONAGE TIER
                </span>
                {getTierBadge(selectedClient.tier)}
              </div>
              <div className="text-right">
                <span className="label-caps text-[9.5px] text-[var(--text-secondary)] uppercase block mb-1">
                  LIFETIME SPEND
                </span>
                <span className="font-garamond text-[20px] sm:text-[22px] text-[var(--gold)] font-medium">
                  ${selectedClient.spend.toLocaleString('en-US')}
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 border border-[var(--border-color)] space-y-2 font-manrope text-[12.5px] sm:text-[13px] text-[var(--text-primary)]">
              <div className="flex items-center gap-2 text-[var(--text-secondary)] truncate">
                <Mail size={14} className="shrink-0" />
                <span className="truncate">{selectedClient.email}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Phone size={14} className="shrink-0" />
                <span>{selectedClient.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Calendar size={14} className="shrink-0" />
                <span>Member Since: {selectedClient.joinedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)] pt-2 border-t border-[var(--border-color)]">
                <CreditCard size={14} className="shrink-0" />
                <span>Total Orders: {selectedClient.totalOrders} • Preferred: {selectedClient.preferredCraft}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  toast.success(`Private atelier concierge message dispatched to ${selectedClient.email}`);
                  setSelectedClient(null);
                }}
                className="flex-1 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[11px] uppercase tracking-wider py-3 shadow-sm hover:opacity-90 cursor-pointer"
              >
                Send Concierge Note
              </button>
              <button
                onClick={() => setSelectedClient(null)}
                className="px-5 py-3 sm:py-0 border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--gold)] label-caps text-[11px] uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
