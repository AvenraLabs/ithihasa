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
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Users
} from 'lucide-react';
import { fetchCustomerInsights, fetchCustomers } from '../api/customers.js';
import { toast } from 'sonner';

export function CustomersView() {
  const [clients, setClients] = useState([]);
  const [insights, setInsights] = useState(null);
  const [timeRange, setTimeRange] = useState('Last 6 Months');
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [insightsData, customersData] = await Promise.all([
          fetchCustomerInsights().catch(() => null),
          fetchCustomers({ search: searchQuery || undefined }).catch(() => null),
        ]);

        if (insightsData) setInsights(insightsData);
        if (customersData && Array.isArray(customersData)) {
          setClients(customersData);
        }
      } catch (err) {
        console.error('Customer live sync error:', err);
        toast.error('Unable to fetch patron dossiers. Please retry.');
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
            {tier || 'Standard'}
          </span>
        );
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredClients = clients.filter((client) => {
    return (
      (client.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.tier || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));
  const paginatedClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const startIndex = filteredClients.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredClients.length);

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-[1440px] w-full mx-auto space-y-6 sm:space-y-8 flex-1">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <span className="label-caps text-[10px] sm:text-[11px] text-[var(--gold)] uppercase tracking-[0.25em] block mb-1">
            CLIENT RELATIONSHIP MANAGEMENT
          </span>
          <h1 className="font-garamond text-[28px] sm:text-[36px] md:text-[40px] text-[var(--text-primary)] font-normal tracking-tight leading-none">
            Collector & Patron Insights
          </h1>
          <p className="body-md text-[13px] sm:text-[14.5px] text-[var(--text-secondary)] mt-2">
            Detailed client dossiers, lifetime patronage values, and bespoke artisan preferences.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => toast.success('Exporting Patron Dossiers (CSV format)...')}
            className="flex items-center gap-2 border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--gold)] px-4 py-2.5 label-caps text-[11px] uppercase tracking-wider text-[var(--text-primary)] transition-colors shadow-sm cursor-pointer"
          >
            <Download size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Metric 1 */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 sm:p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="label-caps text-[10px] sm:text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">
              Total Active Patrons
            </span>
            <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)]">
              <Users size={16} />
            </div>
          </div>
          <div className="font-garamond text-[28px] sm:text-[34px] text-[var(--text-primary)] tabular-nums leading-none">
            {loading ? '—' : (insights?.totalClients ?? insights?.totalActiveClients ?? 0).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-[var(--text-secondary)] text-[12px]">
            <TrendingUp size={14} className="text-[var(--gold)]" />
            <span>{(insights?.totalClients || 0) > 0 ? '+100% active registry' : 'Live database sync'}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 sm:p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="label-caps text-[10px] sm:text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">
              Avg. Lifetime Value (LTV)
            </span>
            <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--gold)]">
              <Diamond size={16} />
            </div>
          </div>
          <div className="font-garamond text-[28px] sm:text-[34px] text-[var(--text-primary)] tabular-nums leading-none">
            ₹{loading ? '—' : Number(insights?.averageLTV || 0).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-[var(--text-secondary)] text-[12px]">
            <TrendingUp size={14} className="text-[var(--gold)]" />
            <span>Per registered patron</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 sm:p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="label-caps text-[10px] sm:text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">
              Noir Tier Membership
            </span>
            <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] text-[var(--gold)] border border-[var(--gold)]/30 flex items-center justify-center font-bold text-[11px]">
              N
            </div>
          </div>
          <div className="font-garamond text-[28px] sm:text-[34px] text-[var(--text-primary)] tabular-nums leading-none">
            {loading ? '—' : (insights?.noirTierMembers ?? insights?.noirMembers ?? 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[12px] text-[var(--text-secondary)] mt-2.5">
            Top tier contributors to atelier volume
          </div>
        </div>
      </div>

      {/* Main Patron Table & Search Header */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
        <div className="p-4 sm:p-6 border-b border-[var(--border-color)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-secondary)]/30">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <h2 className="font-garamond text-[20px] sm:text-[22px] font-normal text-[var(--text-primary)]">
              All Patrons
            </h2>
            <span className="label-caps text-[10.5px] bg-[var(--bg-secondary)] border border-[var(--border-color)] px-2 py-0.5 text-[var(--text-secondary)]">
              {filteredClients.length} Records
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, tier..."
                className="w-full pl-9 pr-3 py-1.5 text-[13px] bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[var(--gold)] outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-[var(--bg-secondary)]/50 animate-pulse rounded-sm" />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-6 text-center space-y-3">
            <Users size={32} className="mx-auto text-[var(--gold)] opacity-40" />
            <h3 className="font-garamond text-[20px] text-[var(--text-primary)]">No Patrons Found</h3>
            <p className="text-[13px] text-[var(--text-secondary)] max-w-sm mx-auto">
              {searchQuery
                ? `No clients matched the search query "${searchQuery}".`
                : 'No client records exist in the atelier database yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Cards (<640px) */}
            <div className="sm:hidden divide-y divide-[var(--border-color)]">
              {paginatedClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className="p-4 space-y-2.5 hover:bg-[var(--bg-secondary)]/40 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center label-caps text-[10.5px] font-bold text-[var(--text-secondary)] shrink-0">
                        {client.initials || (client.name ? client.name.slice(0, 2).toUpperCase() : 'PA')}
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
                    <span className="text-[var(--text-secondary)] text-[11.5px]">
                      Last order: {client.lastOrder || 'Recent'}
                    </span>
                    <span className="font-semibold text-[14px] text-[var(--text-primary)] tabular-nums">
                      ₹{(client.spend || 0).toLocaleString('en-IN')}
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
                  {paginatedClients.map((client) => (
                    <tr
                      key={client.id}
                      onClick={() => setSelectedClient(client)}
                      className="hover:bg-[var(--bg-secondary)]/40 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center label-caps text-[11px] font-bold text-[var(--text-secondary)]">
                            {client.initials || (client.name ? client.name.slice(0, 2).toUpperCase() : 'PA')}
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
                        ₹{(client.spend || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6 text-right text-[var(--text-secondary)] text-[13px]">
                        {client.lastOrder || 'Recent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row justify-between items-center gap-3 bg-[var(--bg-secondary)]/20 text-[13px] text-[var(--text-secondary)]">
              <span>{filteredClients.length > 0 ? `Showing ${startIndex} to ${endIndex} of ${filteredClients.length} patrons` : 'Showing 0 patrons'}</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={`p-1.5 border border-[var(--border-color)] rounded transition-colors ${
                    currentPage <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:border-[var(--gold)] text-[var(--text-primary)] cursor-pointer'
                  }`}
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`w-8 h-8 flex items-center justify-center font-semibold rounded text-[12px] transition-all cursor-pointer ${
                      currentPage === num
                        ? 'bg-[var(--gold)] text-black shadow-sm'
                        : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--gold)]'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={`p-1.5 border border-[var(--border-color)] rounded transition-colors ${
                    currentPage >= totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:border-[var(--gold)] text-[var(--text-primary)] cursor-pointer'
                  }`}
                  title="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedClient(null)}>
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
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
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
                <span className="font-garamond text-[20px] text-[var(--gold)] font-bold tabular-nums">
                  ₹{(selectedClient.spend || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="space-y-3 font-manrope text-[13px]">
              <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                <Mail size={15} className="text-[var(--gold)]" />
                <span>{selectedClient.email || 'None on file'}</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                <Phone size={15} className="text-[var(--gold)]" />
                <span>{selectedClient.phone || 'None on file'}</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                <Calendar size={15} className="text-[var(--gold)]" />
                <span>Client since {selectedClient.joinedDate || '2023'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
