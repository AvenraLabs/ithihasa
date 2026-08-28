import React, { useState } from 'react';
import {
  PhoneCall,
  MessageSquare,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  Send,
  Sparkles,
  Truck,
  RotateCcw,
  PackageCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendConciergeMessage, submitSupportInquiry } from '../api/support';

export const CustomerCarePage: React.FC = () => {
  // Accordion open states
  const [openFaq, setOpenFaq] = useState<string | null>('care');

  // Modals & Sheets state
  const [activeModal, setActiveModal] = useState<'chat' | 'callback' | 'order_issue' | 'returns' | 'shipping' | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'concierge',
      text: 'Greetings. I am Priya from the Ithihasa Atelier Concierge. How may I assist you with your heritage collection today?',
      time: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Callback Form State
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackTime, setCallbackTime] = useState('Morning (9 AM - 12 PM)');
  const [callbackSuccess, setCallbackSuccess] = useState(false);

  const toggleFaq = (id: string) => {
    setOpenFaq(prev => (prev === id ? null : id));
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const messageText = chatInput.trim();
    const userMsg = {
      sender: 'user',
      text: messageText,
      time: 'Just now'
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Dispatch to backend live support queue
    try {
      await sendConciergeMessage(messageText).catch(() => null);
    } catch {}

    // Concierge automatic realistic response
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'concierge',
          text: 'Thank you for your message. An artisan specialist has been assigned to your inquiry and will review the fabric details immediately.',
          time: 'Just now'
        }
      ]);
    }, 1000);
  };

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackName || !callbackPhone) return;
    setCallbackSuccess(true);

    try {
      await submitSupportInquiry({
        customer: callbackName,
        subject: `Private Callback Request (${callbackTime})`,
        message: `Phone: ${callbackPhone}. Requested callback during ${callbackTime}.`,
        priority: 'High'
      }).catch(() => null);
    } catch {}

    setTimeout(() => {
      setCallbackSuccess(false);
      setActiveModal(null);
      setCallbackName('');
      setCallbackPhone('');
    }, 2000);
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

        {/* Direct Support Options (Bento 3 Cards) matching Stitch */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Direct Call */}
          <a
            href="tel:+18005550199"
            className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 flex flex-col items-center text-center hover:border-[var(--gold)] transition-all duration-300 cursor-pointer group shadow-sm block"
          >
            <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4 text-[var(--text-primary)] group-hover:text-[var(--gold)] group-hover:bg-[var(--bg-primary)] transition-colors">
              <PhoneCall size={22} strokeWidth={1.5} />
            </div>
            <h3 className="font-garamond text-[20px] font-medium text-[var(--text-primary)] mb-1 group-hover:text-[var(--gold)] transition-colors">
              Direct Call
            </h3>
            <p className="body-sm text-[13px] text-[var(--text-secondary)]">
              Speak directly with an artisan.
            </p>
          </a>

          {/* Card 2: Start a Chat */}
          <div
            onClick={() => setActiveModal('chat')}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 flex flex-col items-center text-center hover:border-[var(--gold)] transition-all duration-300 cursor-pointer group relative overflow-hidden shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4 text-[var(--text-primary)] group-hover:text-[var(--gold)] group-hover:bg-[var(--bg-primary)] transition-colors">
              <MessageSquare size={22} strokeWidth={1.5} />
            </div>
            <h3 className="font-garamond text-[20px] font-medium text-[var(--text-primary)] mb-1 group-hover:text-[var(--gold)] transition-colors">
              Start a Chat
            </h3>
            <p className="body-sm text-[13px] text-[var(--text-secondary)]">
              Instant assistance via messaging.
            </p>
          </div>

          {/* Card 3: Request Callback */}
          <div
            onClick={() => setActiveModal('callback')}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 flex flex-col items-center text-center hover:border-[var(--gold)] transition-all duration-300 cursor-pointer group shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4 text-[var(--text-primary)] group-hover:text-[var(--gold)] group-hover:bg-[var(--bg-primary)] transition-colors">
              <Clock size={22} strokeWidth={1.5} />
            </div>
            <h3 className="font-garamond text-[20px] font-medium text-[var(--text-primary)] mb-1 group-hover:text-[var(--gold)] transition-colors">
              Request Callback
            </h3>
            <p className="body-sm text-[13px] text-[var(--text-secondary)]">
              We'll call you at your convenience.
            </p>
          </div>
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

      {/* Live Concierge Chat Modal */}
      {activeModal === 'chat' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] max-w-lg w-full h-[520px] max-h-[90vh] flex flex-col shadow-2xl">
            {/* Chat Header */}
            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-secondary)]/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)]/40 flex items-center justify-center text-[var(--gold)]">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-garamond text-[17px] font-medium text-[var(--text-primary)]">
                    Atelier Concierge Desk
                  </h3>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Artisan Specialist Online
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 font-manrope text-[13px]">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-sm ${
                      msg.sender === 'user'
                        ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-medium'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-[var(--border-color)] flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about fabrics, sizing, or orders..."
                className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none"
              />
              <button
                type="submit"
                className="px-4 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Callback Request Modal */}
      {activeModal === 'callback' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="label-caps text-[10px] text-[var(--gold)] uppercase tracking-widest">
                  CONCIERGE SCHEDULING
                </span>
                <h3 className="font-garamond text-[24px] font-normal text-[var(--text-primary)] mt-0.5">
                  Request a Callback
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
              >
                <X size={20} />
              </button>
            </div>

            {callbackSuccess ? (
              <div className="py-8 text-center space-y-3 animate-in fade-in">
                <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
                <h4 className="font-garamond text-[20px] text-[var(--text-primary)]">Callback Scheduled</h4>
                <p className="body-sm text-[13px] text-[var(--text-secondary)]">
                  An artisan advisor will contact you at your preferred time window.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCallbackSubmit} className="space-y-4 font-manrope text-[13px]">
                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1">
                    YOUR NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={callbackName}
                    onChange={(e) => setCallbackName(e.target.value)}
                    placeholder="Eleanor Vance"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none"
                  />
                </div>

                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1">
                    PHONE NUMBER *
                  </label>
                  <input
                    type="tel"
                    required
                    value={callbackPhone}
                    onChange={(e) => setCallbackPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none"
                  />
                </div>

                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1">
                    PREFERRED TIME WINDOW
                  </label>
                  <select
                    value={callbackTime}
                    onChange={(e) => setCallbackTime(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none cursor-pointer"
                  >
                    <option>Morning (9 AM - 12 PM EST)</option>
                    <option>Afternoon (12 PM - 3 PM EST)</option>
                    <option>Evening (3 PM - 6 PM EST)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[11px] uppercase tracking-wider py-3 shadow-sm hover:opacity-90"
                  >
                    Confirm Callback
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-5 border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--gold)] label-caps text-[11px] uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
