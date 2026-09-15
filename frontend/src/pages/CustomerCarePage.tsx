import React, { useState } from 'react';
import {
  PhoneCall,
  MessageSquare,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  Truck,
  RotateCcw,
  PackageCheck,
  Plus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchCustomerTickets,
  createSupportTicket,
  type SupportTicketItem,
} from '../api/support.js';
import { toast } from 'sonner';
import { useAvatar } from '../context/AvatarContext.js';

export const CustomerCarePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Accordion open states
  const [openFaq, setOpenFaq] = useState<string | null>('care');

  const { profileData } = useAvatar();

  // Modals & Sheets state
  const [activeModal, setActiveModal] = useState<'order_issue' | 'returns' | 'shipping' | null>(null);
  const [isStartingChat, setIsStartingChat] = useState(false);

  // Query live tickets
  const { data: tickets = [], isLoading: isLoadingTickets } = useQuery<SupportTicketItem[]>({
    queryKey: ['support-tickets'],
    queryFn: fetchCustomerTickets,
    refetchInterval: 4000,
  });

  // Active ongoing ticket (not resolved/closed)
  const activeTicket = tickets.find(
    (t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED'
  );

  const toggleFaq = (id: string) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  // Instant 1-click Chat Flow: continue active ticket or start new conversation directly
  const handleStartOrContinueChat = async () => {
    if (activeTicket) {
      navigate(`/care/chat/${activeTicket.id}`);
      return;
    }

    try {
      setIsStartingChat(true);

      // Read profile from localStorage as a reliable fallback —
      // AvatarContext reactive state may still be hydrating when this runs.
      let resolvedName = profileData?.fullName;
      let resolvedEmail = profileData?.email;
      let resolvedPhone = profileData?.phone;

      if (!resolvedName || !resolvedPhone) {
        try {
          const saved = localStorage.getItem('ithihasa_user_profile');
          if (saved) {
            const stored = JSON.parse(saved);
            resolvedName = resolvedName || stored.fullName;
            resolvedEmail = resolvedEmail || stored.email;
            resolvedPhone = resolvedPhone || stored.phone;
          }
        } catch (_) { /* ignore */ }
      }

      const newTicket = await createSupportTicket({
        customerName: resolvedName || undefined,
        email: resolvedEmail || undefined,
        phone: resolvedPhone || undefined,
        subject: 'Concierge Assistance',
      });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      navigate(`/care/chat/${newTicket.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Unable to start conversation');
    } finally {
      setIsStartingChat(false);
    }
  };


  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors antialiased selection:bg-[var(--gold)] selection:text-[#0A0A0A]">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10 md:py-16 space-y-12">
        {/* Concierge Header matching Stitch Screen */}
        <section className="text-center space-y-3">
          <span className="label-caps text-[11px] text-[var(--gold)] tracking-[0.2em] uppercase block">
            PATRON SERVICES
          </span>
          <h1
            className="font-garamond text-[36px] sm:text-[46px] font-normal tracking-tight text-[var(--text-primary)] leading-tight"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            Atelier Concierge
          </h1>
          <p className="body-md text-[14px] sm:text-[16px] text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            How may we assist you today? Our dedicated team is here to ensure your experience is nothing short of exceptional.
          </p>
        </section>

        {/* Direct Support Options (Bento 2 Cards: Start Chat + Direct Call) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
          {/* Card 1: Start or Continue Chat */}
          <div
            onClick={handleStartOrContinueChat}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 flex flex-col items-center text-center hover:border-[var(--gold)] transition-all duration-300 cursor-pointer group relative overflow-hidden shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4 text-[var(--text-primary)] group-hover:text-[var(--gold)] group-hover:bg-[var(--bg-primary)] transition-colors">
              <MessageSquare size={22} strokeWidth={1.5} />
            </div>
            <h3 className="font-garamond text-[20px] font-medium text-[var(--text-primary)] mb-1 group-hover:text-[var(--gold)] transition-colors">
              {activeTicket ? 'Continue Chat' : 'Start a Chat'}
            </h3>
            <p className="body-sm text-[13px] text-[var(--text-secondary)]">
              {isStartingChat
                ? 'Connecting to concierge...'
                : activeTicket
                ? `Active ticket ${activeTicket.ticketNumber} • Tap to continue`
                : 'Dedicated concierge messaging.'}
            </p>
          </div>

          {/* Card 2: Direct Call */}
          <a
            href="tel:+918005550199"
            className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 flex flex-col items-center text-center hover:border-[var(--gold)] transition-all duration-300 cursor-pointer group shadow-sm block"
          >
            <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4 text-[var(--text-primary)] group-hover:text-[var(--gold)] group-hover:bg-[var(--bg-primary)] transition-colors">
              <PhoneCall size={22} strokeWidth={1.5} />
            </div>
            <h3 className="font-garamond text-[20px] font-medium text-[var(--text-primary)] mb-1 group-hover:text-[var(--gold)] transition-colors">
              Direct Call
            </h3>
            <p className="body-sm text-[13px] text-[var(--text-secondary)]">
              Speak directly with an artisan advisor.
            </p>
          </a>
        </section>

        {/* Active & Past Concierge Inquiries */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
            <div>
              <h2
                className="font-garamond text-[24px] font-normal text-[var(--text-primary)] m-0"
                style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
              >
                Concierge Conversations
              </h2>
              <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">
                {activeTicket
                  ? 'You have an active ongoing concierge inquiry. Tap to continue.'
                  : 'Connect with an artisan specialist for sizing, alterations, or bespoke orders.'}
              </p>
            </div>
            {!activeTicket && tickets.length > 0 && (
              <button
                onClick={handleStartOrContinueChat}
                disabled={isStartingChat}
                className="w-fit bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[10px] px-4 py-2 uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus size={13} />
                <span>{isStartingChat ? 'Connecting...' : 'New Conversation'}</span>
              </button>
            )}
          </div>

          {isLoadingTickets ? (
            <div className="p-8 text-center text-[var(--text-secondary)] text-[13px]">
              Loading your inquiries...
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 border border-dashed border-[var(--border-color)] bg-[var(--bg-card)] text-center space-y-2">
              <MessageSquare size={28} className="mx-auto text-[var(--gold)] opacity-50" />
              <p className="text-[13.5px] text-[var(--text-primary)] font-medium m-0">No Active Conversations</p>
              <p className="text-[12.5px] text-[var(--text-secondary)] max-w-sm mx-auto">
                Have questions about bespoke fabrics, order alterations, or styling advice? Start a concierge chat.
              </p>
              <button
                onClick={handleStartOrContinueChat}
                disabled={isStartingChat}
                className="inline-flex items-center gap-1.5 border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-primary)] label-caps text-[10px] px-5 py-2.5 uppercase tracking-wider transition-colors cursor-pointer mt-2 disabled:opacity-50"
              >
                <MessageSquare size={13} />
                <span>{isStartingChat ? 'Connecting...' : 'Start Conversation'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tickets.map((t) => {
                const isTicketResolved = t.status === 'RESOLVED' || t.status === 'CLOSED';
                return (
                  <div
                    key={t.id}
                    onClick={() => navigate(`/care/chat/${t.id}`)}
                    className={`p-5 bg-[var(--bg-card)] border transition-all cursor-pointer group shadow-sm flex flex-col justify-between space-y-3 ${
                      !isTicketResolved
                        ? 'border-[var(--gold)]/60 bg-[var(--bg-secondary)]/20'
                        : 'border-[var(--border-color)] hover:border-[var(--gold)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[12px] font-bold text-[var(--gold)]">
                            {t.ticketNumber}
                          </span>
                          <span
                            className={`label-caps text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold ${
                              isTicketResolved
                                ? 'bg-black/40 text-[var(--gold)] border border-[var(--gold)]/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {isTicketResolved ? 'Resolved' : 'Active'}
                          </span>
                        </div>
                        <h3 className="font-garamond text-[18px] text-[var(--text-primary)] leading-tight group-hover:text-[var(--gold)] transition-colors m-0">
                          {t.subject}
                        </h3>
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono shrink-0">
                        {t.date}
                      </span>
                    </div>

                    <p className="text-[12.5px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed m-0">
                      {t.lastMessage}
                    </p>

                    <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--gold)]">
                      <span className="text-[var(--text-muted)] font-mono">
                        {t.messagesCount} {t.messagesCount === 1 ? 'message' : 'messages'}
                      </span>
                      <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform font-medium">
                        <span>{!isTicketResolved ? 'Continue Chat' : 'View History'}</span>
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Order Assistance Section matching Stitch */}
        <section className="space-y-4 pt-4">
          <h2
            className="font-garamond text-[24px] font-normal text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            Order Assistance
          </h2>

          <div className="divide-y divide-[var(--border-color)]">
            <button
              onClick={() => setActiveModal('order_issue')}
              className="w-full flex justify-between items-center py-4 text-left group hover:text-[var(--gold)] transition-colors"
            >
              <span className="font-manrope text-[15px] text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors font-medium">
                Order Issues
              </span>
              <ArrowRight size={18} className="text-[var(--text-secondary)] group-hover:text-[var(--gold)] group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => setActiveModal('returns')}
              className="w-full flex justify-between items-center py-4 text-left group hover:text-[var(--gold)] transition-colors"
            >
              <span className="font-manrope text-[15px] text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors font-medium">
                Returns &amp; Exchanges
              </span>
              <ArrowRight size={18} className="text-[var(--text-secondary)] group-hover:text-[var(--gold)] group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => setActiveModal('shipping')}
              className="w-full flex justify-between items-center py-4 text-left group hover:text-[var(--gold)] transition-colors"
            >
              <span className="font-manrope text-[15px] text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors font-medium">
                Shipping Inquiries
              </span>
              <ArrowRight size={18} className="text-[var(--text-secondary)] group-hover:text-[var(--gold)] group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </section>

        {/* Curated Knowledge Section (Accordion) matching Stitch */}
        <section className="space-y-4 pt-4">
          <h2
            className="font-garamond text-[24px] font-normal text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            Curated Knowledge
          </h2>

          <div className="divide-y divide-[var(--border-color)]">
            {/* FAQ 1: Care for your Heirloom */}
            <div className="py-4">
              <button
                onClick={() => toggleFaq('care')}
                className="w-full flex justify-between items-center text-left group"
              >
                <span className="font-manrope text-[15px] text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors font-medium">
                  Care for your Heirloom
                </span>
                {openFaq === 'care' ? (
                  <ChevronUp size={18} className="text-[var(--gold)]" />
                ) : (
                  <ChevronDown size={18} className="text-[var(--text-secondary)] group-hover:text-[var(--gold)]" />
                )}
              </button>
              {openFaq === 'care' && (
                <div className="pt-3 pr-6 text-[13.5px] leading-relaxed text-[var(--text-secondary)] space-y-2 animate-in fade-in">
                  <p>
                    All Ithihasa garments are woven with authentic natural fibers—including Mulberry silk, pure Pashmina wool, and genuine metallic zari.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[13px]">
                    <li>Dry clean only by specialists experienced in delicate zari embroidery.</li>
                    <li>Store in breathable muslin bags; never in synthetic plastic wraps.</li>
                    <li>Avoid direct perfume or cosmetic spray on metallic zari borders.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* FAQ 2: Sustainability Report */}
            <div className="py-4">
              <button
                onClick={() => toggleFaq('sustainability')}
                className="w-full flex justify-between items-center text-left group"
              >
                <span className="font-manrope text-[15px] text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors font-medium">
                  Sustainability Report
                </span>
                {openFaq === 'sustainability' ? (
                  <ChevronUp size={18} className="text-[var(--gold)]" />
                ) : (
                  <ChevronDown size={18} className="text-[var(--text-secondary)] group-hover:text-[var(--gold)]" />
                )}
              </button>
              {openFaq === 'sustainability' && (
                <div className="pt-3 pr-6 text-[13.5px] leading-relaxed text-[var(--text-secondary)] space-y-2 animate-in fade-in">
                  <p>
                    Our 2026 Sustainability Roadmap guarantees 100% biodegradable packaging, zero-chemical natural vegetable dye extraction, and fair-wage ethical artisan co-operatives across Varanasi and Kanchipuram.
                  </p>
                  <Link
                    to="/sustainability"
                    className="inline-flex items-center gap-1.5 text-[var(--gold)] font-medium text-[13px] hover:underline pt-1"
                  >
                    <span>Read full Sustainability Report</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              )}
            </div>

            {/* FAQ 3: Membership Benefits */}
            <div className="py-4">
              <button
                onClick={() => toggleFaq('membership')}
                className="w-full flex justify-between items-center text-left group"
              >
                <span className="font-manrope text-[15px] text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors font-medium">
                  Membership Benefits
                </span>
                {openFaq === 'membership' ? (
                  <ChevronUp size={18} className="text-[var(--gold)]" />
                ) : (
                  <ChevronDown size={18} className="text-[var(--text-secondary)] group-hover:text-[var(--gold)]" />
                )}
              </button>
              {openFaq === 'membership' && (
                <div className="pt-3 pr-6 text-[13.5px] leading-relaxed text-[var(--text-secondary)] space-y-2 animate-in fade-in">
                  <p>
                    Patrons enrolled in the Noir and Gold Tiers enjoy private preview access 48 hours before general release, complimentary bespoke master-tailor alterations, and direct white-glove concierge dispatch.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Atelier Hours Card matching Stitch */}
        <section className="text-center py-8 px-6 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-1.5">
          <p className="label-caps text-[11px] text-[var(--text-secondary)] tracking-widest uppercase">
            ATELIER HOURS
          </p>
          <p className="font-manrope text-[15px] font-medium text-[var(--text-primary)]">
            Monday - Friday, 9am - 6pm EST
          </p>
          <p
            className="text-[13px] text-[var(--text-muted)] italic pt-1"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            Exceptional service takes time.
          </p>
        </section>
      </div>





      {/* Order Issue Sheet / Modal */}
      {activeModal === 'order_issue' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2.5">
                <PackageCheck size={20} className="text-[var(--gold)]" />
                <h3 className="font-garamond text-[22px] font-normal text-[var(--text-primary)]">
                  Order Resolution
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
              >
                <X size={20} />
              </button>
            </div>
            <p className="body-sm text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
              If you experienced an issue with transit, package damage, or item variation, our priority concierge team will resolve it immediately with complimentary bespoke replacement.
            </p>
            <div className="p-4 border border-[var(--border-color)] bg-[var(--bg-secondary)]/30 space-y-1 text-[13px]">
              <p className="font-medium text-[var(--text-primary)]">Direct Priority Helpline:</p>
              <p className="text-[var(--gold)] font-semibold">+1 (800) 555-0199 (Ext. 2)</p>
              <p className="text-[var(--text-muted)] text-[11px]">Email: orders@ithihasa.com</p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[11px] uppercase tracking-wider py-3 shadow-sm hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Returns & Exchanges Modal */}
      {activeModal === 'returns' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2.5">
                <RotateCcw size={20} className="text-[var(--gold)]" />
                <h3 className="font-garamond text-[22px] font-normal text-[var(--text-primary)]">
                  Returns &amp; Exchanges
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
              >
                <X size={20} />
              </button>
            </div>
            <p className="body-sm text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
              We offer 14-day complimentary insured returns on all unworn heirloom garments in original packaging with authentic artisanal tags attached.
            </p>
            <div className="p-4 border border-[var(--border-color)] bg-[var(--bg-secondary)]/30 space-y-1 text-[13px]">
              <p className="font-medium text-[var(--text-primary)]">Complimentary Courier Pickup:</p>
              <p className="text-[var(--text-secondary)]">Insured doorstep collection available worldwide.</p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[11px] uppercase tracking-wider py-3 shadow-sm hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Shipping Inquiries Modal */}
      {activeModal === 'shipping' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2.5">
                <Truck size={20} className="text-[var(--gold)]" />
                <h3 className="font-garamond text-[22px] font-normal text-[var(--text-primary)]">
                  White-Glove Shipping
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
              >
                <X size={20} />
              </button>
            </div>
            <p className="body-sm text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
              All dispatches are handled via climate-controlled express courier with full tamper-evident insurance and real-time tracking from the master atelier to your doorstep.
            </p>
            <div className="p-4 border border-[var(--border-color)] bg-[var(--bg-secondary)]/30 space-y-1 text-[13px]">
              <p className="font-medium text-[var(--text-primary)]">Estimated Delivery Windows:</p>
              <p className="text-[var(--text-secondary)]">Domestic (India): 2-3 Business Days</p>
              <p className="text-[var(--text-secondary)]">International (Global Express): 4-6 Business Days</p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[11px] uppercase tracking-wider py-3 shadow-sm hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
