import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  ArrowRight,
  Plus,
  Filter,
  MoreHorizontal,
  X,
  Send,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

import {
  fetchSupportMetrics,
  fetchSupportTickets,
  createSupportTicket
} from '../api/support.js';

export function SupportView() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupport() {
      try {
        setLoading(true);
        const [metricsData, ticketsData] = await Promise.all([
          fetchSupportMetrics().catch(() => null),
          fetchSupportTickets().catch(() => null),
        ]);
        if (metricsData) setMetrics(metricsData);
        if (ticketsData && Array.isArray(ticketsData)) {
          setTickets(ticketsData);
        } else {
          setTickets([]);
        }
      } catch (err) {
        console.error('Support load error:', err);
        toast.error('Unable to fetch concierge support tickets. Please check connection.');
      } finally {
        setLoading(false);
      }
    }
    loadSupport();
  }, []);

  const openTicketsCount =
    metrics?.openTickets ??
    tickets.filter((t) => t.status === 'OPEN' || t.status === 'PENDING').length;
  const avgResponseTime = metrics?.avgResponseHours ?? 0;
  const urgentCount =
    metrics?.urgentEscalations ??
    tickets.filter((t) => (t.priority === 'High' || t.priority === 'HIGH') && t.status !== 'RESOLVED').length;

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'ALL') return true;
    return t.status?.toUpperCase() === statusFilter.toUpperCase();
  });

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-[1440px] w-full mx-auto space-y-6 md:space-y-8 flex-1">
      {/* Page Header matching Stitch */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 border-b border-[var(--border-color)] pb-3">
        <div>
          <h1
            className="font-garamond text-[28px] sm:text-[34px] md:text-[44px] text-[var(--text-primary)] font-normal tracking-tight leading-tight m-0"
          >
            Support Center
          </h1>
          <p className="body-md text-[13px] sm:text-[14px] md:text-[15px] text-[var(--text-secondary)] mt-1">
            Manage customer inquiries and knowledge base resources to maintain exemplary atelier service.
          </p>
        </div>
      </div>

      {/* Top 12-Column Grid (Quick Stats & Direct Chat) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Quick Stats (Col Span 8) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Stat 1: Open Tickets */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 sm:p-6 flex flex-col justify-between shadow-sm">
            <span className="label-caps text-[11px] text-[var(--text-secondary)] uppercase tracking-widest mb-3">
              Open Inquiries
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-garamond text-[32px] sm:text-[38px] text-[var(--text-primary)] font-normal leading-none tabular-nums">
                {openTicketsCount}
              </span>
              <span className="text-[11px] label-caps text-emerald-500 font-semibold uppercase tracking-wider">
                Active Desk
              </span>
            </div>
          </div>

          {/* Stat 2: Avg Response Time */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 sm:p-6 flex flex-col justify-between shadow-sm">
            <span className="label-caps text-[11px] text-[var(--text-secondary)] uppercase tracking-widest mb-3">
              Avg Response Time
            </span>
            <div className="flex items-baseline">
              <span className="font-garamond text-[32px] sm:text-[38px] text-[var(--text-primary)] font-normal leading-none tabular-nums">
                {avgResponseTime}
              </span>
              <span className="font-garamond text-[22px] sm:text-[24px] text-[var(--text-secondary)] ml-0.5">h</span>
            </div>
          </div>

          {/* Stat 3: Urgent Escalations */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 sm:p-6 flex flex-col justify-between shadow-sm bg-[var(--bg-secondary)]/30">
            <span className="label-caps text-[11px] text-[var(--text-primary)] uppercase tracking-widest mb-3">
              Urgent Escalations
            </span>
            <div>
              <span className="font-garamond text-[32px] sm:text-[38px] text-rose-600 dark:text-rose-400 font-normal leading-none tabular-nums">
                {urgentCount}
              </span>
            </div>
          </div>
        </div>

        {/* Direct Chat Card (Col Span 4) */}
        <div className="lg:col-span-4">
          <div
            onClick={() => navigate('/support/chat')}
            className="bg-[var(--bg-card)] text-[var(--text-primary)] p-5 sm:p-7 h-full flex flex-col justify-between relative overflow-hidden group cursor-pointer border border-[var(--border-color)] shadow-sm hover:border-[var(--gold)] transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] flex items-center justify-center mb-3">
                <MessageSquare size={20} />
              </div>
              <h3 className="font-garamond text-[22px] sm:text-[24px] font-normal text-[var(--text-primary)]">
                Direct Chat
              </h3>
              <p className="body-sm text-[13px] text-[var(--text-secondary)] mt-1">
                {openTicketsCount} active session{openTicketsCount === 1 ? '' : 's'} requiring attention.
              </p>
            </div>

            <div className="flex items-center gap-1.5 label-caps text-[11px] uppercase tracking-widest text-[var(--gold)] pt-5 group-hover:translate-x-1 transition-transform">
              <span>Enter Console</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Support Tickets Container */}
      <div className="border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30 gap-3">
          <div>
            <h2 className="font-garamond text-[20px] sm:text-[22px] font-normal text-[var(--text-primary)]">
              Recent Inquiries & Tickets
            </h2>
            <p className="text-[12px] text-[var(--text-secondary)] font-manrope">
              Click any ticket to enter its dedicated direct chat session.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="label-caps text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">Status:</span>
            <div className="flex rounded border border-[var(--border-color)] overflow-hidden text-[11px] font-manrope">
              {['ALL', 'OPEN', 'PENDING', 'RESOLVED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 cursor-pointer transition-colors ${
                    statusFilter === status
                      ? 'bg-[var(--gold)] text-black font-semibold'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile View: Ticket Cards (< 640px) */}
        <div className="block sm:hidden divide-y divide-[var(--border-color)]">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-secondary)] text-[13px]">
              No tickets match the selected status.
            </div>
          ) : (
            filteredTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => navigate(`/support/chat?ticketId=${t.id}`)}
                className="p-4 space-y-2.5 cursor-pointer active:bg-[var(--bg-secondary)]/40 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[12px] font-mono text-[var(--text-secondary)]">{t.ticketNumber || t.id}</span>
                    <h4 className="font-semibold text-[14px] text-[var(--text-primary)]">{t.customer}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 label-caps text-[9px] uppercase tracking-wider border rounded-sm font-semibold ${
                      t.status === 'OPEN'
                        ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        : t.status === 'PENDING'
                        ? 'bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/30'
                        : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2">
                  {t.subject}
                </p>

                <div className="flex justify-between items-center pt-2 border-t border-[var(--border-color)]/60 text-[12px]">
                  <span
                    className={`inline-flex items-center gap-1 label-caps text-[10px] uppercase font-bold ${
                      t.priority === 'High' || t.priority === 'HIGH'
                        ? 'text-rose-500'
                        : t.priority === 'Med' || t.priority === 'MEDIUM'
                        ? 'text-[var(--gold)]'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {t.priority} Priority
                  </span>
                  <span className="text-[var(--gold)] font-medium text-[11px] flex items-center gap-1 hover:underline">
                    Open Chat <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table (>= 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] label-caps text-[11px] uppercase tracking-widest bg-[var(--bg-secondary)]/50">
                <th className="py-4 px-6 font-medium w-28">Ticket ID</th>
                <th className="py-4 px-6 font-medium">Customer</th>
                <th className="py-4 px-6 font-medium w-1/3">Subject</th>
                <th className="py-4 px-6 font-medium">Priority</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] font-manrope text-[14px]">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--text-secondary)]">
                    No tickets found for this filter.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => navigate(`/support/chat?ticketId=${t.id}`)}
                    className="hover:bg-[var(--bg-secondary)]/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6 text-[var(--text-secondary)] font-mono text-[13px]">
                      {t.ticketNumber || t.id}
                    </td>
                    <td className="py-4 px-6 font-semibold text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">
                      {t.customer}
                    </td>
                    <td className="py-4 px-6 text-[var(--text-secondary)] truncate max-w-[240px]">
                      {t.subject}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 label-caps text-[10px] uppercase font-bold ${
                          t.priority === 'High' || t.priority === 'HIGH'
                            ? 'text-rose-500'
                            : t.priority === 'Med' || t.priority === 'MEDIUM'
                            ? 'text-[var(--gold)]'
                            : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 label-caps text-[10px] uppercase tracking-wider border rounded-sm font-semibold ${
                          t.status === 'OPEN'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                            : t.status === 'PENDING'
                            ? 'bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/30'
                            : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center gap-1 text-[12px] text-[var(--gold)] group-hover:underline">
                        <span>Open Chat</span>
                        <ArrowRight size={13} />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Knowledge Base Section matching Stitch */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <h2 className="font-garamond text-[22px] sm:text-[24px] font-normal text-[var(--text-primary)]">
            Knowledge Base
          </h2>
          <button
            onClick={() => toast.info('Loading complete atelier heritage knowledge base...')}
            className="label-caps text-[11px] uppercase tracking-widest text-[var(--text-primary)] hover:text-[var(--gold)] underline transition-colors cursor-pointer"
          >
            View All Articles
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Article 1 */}
          <div
            onClick={() => toast.info('Opening Bespoke Fitting Guide editor.')}
            className="group cursor-pointer space-y-2"
          >
            <div className="aspect-video bg-[var(--bg-secondary)] relative overflow-hidden border border-[var(--border-color)] shadow-sm">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB52ZqzTy0lZYpBYHJ7xnxOeKPd-456kp7xZu9QnjSqOBKSMj6k71OsFb11uFygOZI6yUsONUJ0VWP35dZcMS_1ulNFdcl8S8VikFp1kVV7D7YQ4KNEgpTNZLq5AtIos5EALXhrev_KJbzsY0JT-IT9DU94u9sdMBq6MuxMTyEXVAUCa1RxSiM2fnx1qIJPGv8gmCwDhfctKpUaZKf3O5d9hBBknFnQJHSFMxY1OaQo4BQ49JAffND6ww"
                alt="Bespoke Fitting Guide"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-[var(--bg-card)] text-[var(--text-primary)] label-caps text-[10px] px-3 py-1.5 uppercase tracking-wider font-bold">
                  Edit Article
                </span>
              </div>
            </div>
            <h4 className="font-manrope text-[15px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">
              Bespoke Fitting Guide
            </h4>
            <p className="body-sm text-[12px] text-[var(--text-secondary)]">
              Updated 2 days ago • 14 views this week
            </p>
          </div>

          {/* Article 2 */}
          <div
            onClick={() => toast.info('Opening Material Care Guide editor.')}
            className="group cursor-pointer space-y-2"
          >
            <div className="aspect-video bg-[var(--bg-secondary)] relative overflow-hidden border border-[var(--border-color)] shadow-sm">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcgk-_hF4VomNabKHyB4leqjKKewQGsYa6i9C0fPce-eOeTQGusRD8JDu0vhPDSTEXyFNh0pbjtsgSQgc7FRbbNx--ute7gUZiSVCkiiBOA2oHciVhuA1E4c2u7mc1dadUmUShipqIKwAP6PQ_5Pc_7RD5Nd0A5w2wBq6ZamTsTgTYBjeU4tOcCp_uMevDYnFy7zP23KlkKmvGPlXhQNrwPmNAvNaCqCA77ODHF-g5Zzv-sMQgficNgQ"
                alt="Material Care: Heritage Cottons"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-[var(--bg-card)] text-[var(--text-primary)] label-caps text-[10px] px-3 py-1.5 uppercase tracking-wider font-bold">
                  Edit Article
                </span>
              </div>
            </div>
            <h4 className="font-manrope text-[15px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">
              Material Care: Heritage Cottons
            </h4>
            <p className="body-sm text-[12px] text-[var(--text-secondary)]">
              Updated 1 week ago • 45 views this week
            </p>
          </div>

          {/* Draft New Article Action */}
          <div
            onClick={() => toast.info('Drafting new atelier knowledge article...')}
            className="aspect-video border border-dashed border-[var(--border-color)] hover:border-[var(--gold)] bg-[var(--bg-secondary)]/20 flex flex-col items-center justify-center text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors cursor-pointer group"
          >
            <BookOpen size={28} className="mb-2 group-hover:scale-110 transition-transform" />
            <span className="label-caps text-[11px] uppercase tracking-wider font-bold">
              Draft New Article
            </span>
          </div>
        </div>
      </div>



    </div>
  );
}
