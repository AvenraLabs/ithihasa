import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Sparkles,
  Paperclip,
  Clock,
  Check,
  CheckCheck,
  MoreVertical,
  User,
  Shield,
  Search,
  Diamond,
  X
} from 'lucide-react';
import { toast } from 'sonner';

import { fetchChatSessions, sendChatMessage } from '../api/support.js';

export function DirectChatView() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'chat' on mobile
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      try {
        setLoading(true);
        const data = await fetchChatSessions().catch(() => null);
        if (data && Array.isArray(data)) {
          setSessions(data);
          if (data.length > 0) {
            setActiveSessionId(data[0].id);
          }
        } else {
          setSessions([]);
        }
      } catch (err) {
        console.error('Chat sessions load error:', err);
        toast.error('Unable to fetch live concierge chat sessions.');
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || null;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeSession) return;

    const newMessage = {
      id: `m_${Date.now()}`,
      sender: 'concierge',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSessions(prev =>
      prev.map(s =>
        s.id === activeSession.id
          ? {
              ...s,
              unread: false,
              lastMessage: newMessage.text,
              time: 'Just now',
              messages: [...s.messages, newMessage]
            }
          : s
      )
    );

    try {
      await sendChatMessage(activeSession.id, inputText.trim(), 'concierge').catch(() => null);
    } catch {}

    setInputText('');
  };

  const handleSelectSession = (id) => {
    setActiveSessionId(id);
    setMobileView('chat');
    setSessions(prev =>
      prev.map(s => (s.id === id ? { ...s, unread: false } : s))
    );
  };

  const filteredSessions = sessions.filter(s =>
    s.patronName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.activeOrder.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1440px] w-full mx-auto flex-1 flex flex-col min-w-0 h-[calc(100vh-64px)] overflow-hidden">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)] shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/support')}
            className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors flex items-center gap-1.5 label-caps text-[11px] uppercase tracking-widest cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Support Center</span>
          </button>
          <span className="text-[var(--border-color)]">/</span>
          <span className="font-garamond text-[20px] sm:text-[22px] text-[var(--text-primary)] font-normal">
            Direct Concierge Console
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="label-caps text-[10.5px] uppercase tracking-wider text-[var(--text-secondary)]">
            Live Session Feed • 2 Patrons Active
          </span>
        </div>
      </div>

      {/* Main Chat Workspace Grid (Left Sidebar + Right Chat Canvas) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 border border-[var(--border-color)] bg-[var(--bg-card)] mt-4 shadow-sm overflow-hidden min-h-0">
        {/* Left Column: Patron Chat List */}
        <div
          className={`md:col-span-4 border-r border-[var(--border-color)] bg-[var(--bg-secondary)]/30 flex flex-col min-h-0 ${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search Header */}
          <div className="p-3.5 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search active patron sessions..."
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] text-[12.5px] pl-8 pr-3 py-2 text-[var(--text-primary)] outline-none font-manrope rounded-sm"
              />
            </div>
          </div>

          {/* Session Cards List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-color)] no-scrollbar">
            {filteredSessions.map((session) => {
              const isSelected = session.id === activeSession.id;

              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`p-4 transition-colors cursor-pointer flex gap-3.5 items-start ${
                    isSelected
                      ? 'bg-[var(--bg-card)] border-l-2 border-[var(--gold)] shadow-xs'
                      : 'hover:bg-[var(--bg-card)]/50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={session.avatar}
                      alt={session.patronName}
                      className="w-10 h-10 rounded-full object-cover border border-[var(--border-color)]"
                    />
                    {session.unread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--gold)] border-2 border-[var(--bg-card)] absolute -top-0.5 -right-0.5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="font-semibold text-[13.5px] text-[var(--text-primary)] truncate">
                        {session.patronName}
                      </h4>
                      <span className="text-[10px] label-caps text-[var(--text-muted)] tracking-wider">
                        {session.time}
                      </span>
                    </div>

                    <span className="label-caps text-[9.5px] uppercase text-[var(--gold)] font-bold block mb-1">
                      {session.tier} Tier • {session.activeOrder}
                    </span>

                    <p className="body-sm text-[12px] text-[var(--text-secondary)] line-clamp-1">
                      {session.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Conversation Canvas */}
        <div
          className={`md:col-span-8 flex flex-col bg-[var(--bg-card)] min-h-0 ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeSession ? (
            <>
              {/* Conversation Header */}
              <div className="p-3.5 sm:p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/20 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
                    aria-label="Back to Sessions List"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <img
                    src={activeSession.avatar}
                    alt={activeSession.patronName}
                    className="w-9 h-9 rounded-full object-cover border border-[var(--border-color)] shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-garamond text-[17px] sm:text-[19px] font-normal text-[var(--text-primary)] truncate">
                        {activeSession.patronName}
                      </h3>
                      <span className="label-caps text-[9px] px-2 py-0.5 uppercase bg-black text-[#F4EFE6] dark:bg-white dark:text-black border border-[var(--border-color)] font-bold">
                        {activeSession.tier}
                      </span>
                    </div>
                    <span className="text-[11.5px] text-[var(--text-secondary)] block truncate">
                      {activeSession.activeOrder} • {activeSession.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast.info(`Patron Dossier: ${activeSession.patronName} • Tier: ${activeSession.tier} • Location: ${activeSession.location}`)}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--gold)] label-caps text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <User size={12} />
                    <span>Dossier</span>
                  </button>
                </div>
              </div>

              {/* Message Feed Canvas */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 font-manrope text-[13.5px] bg-[var(--bg-card)]">
                {activeSession.messages.map((msg) => {
                  const isConcierge = msg.sender === 'concierge';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isConcierge ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="label-caps text-[10px] text-[var(--text-muted)] uppercase">
                          {isConcierge ? 'Atelier Concierge' : activeSession.patronName}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">• {msg.time}</span>
                      </div>

                      <div
                        className={`max-w-[85%] sm:max-w-[70%] p-3.5 sm:p-4 rounded-lg leading-relaxed shadow-2xs ${
                          isConcierge
                            ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border border-transparent'
                            : 'bg-[var(--bg-secondary)]/80 text-[var(--text-primary)] border border-[var(--border-color)]'
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Macro Shortcut Chips */}
              <div className="px-4 py-2 bg-[var(--bg-secondary)]/30 border-t border-[var(--border-color)] flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                <button
                  onClick={() => setInputText('We have confirmed your bespoke gift packaging request with our atelier packaging team.')}
                  className="px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full whitespace-nowrap cursor-pointer transition-colors"
                >
                  + Gift Packaging Note
                </button>
                <button
                  onClick={() => setInputText('Your shipment has been prioritized with our premium courier partner for scheduled delivery.')}
                  className="px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full whitespace-nowrap cursor-pointer transition-colors"
                >
                  + Express Courier Update
                </button>
                <button
                  onClick={() => setInputText('Master artisan Siddharth has received your bespoke garment dimensions and tailored the pattern.')}
                  className="px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full whitespace-nowrap cursor-pointer transition-colors"
                >
                  + Bespoke Tailor Confirmation
                </button>
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3.5 sm:p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/20 flex items-center gap-2.5 shrink-0"
              >
                <button
                  type="button"
                  onClick={() => toast.info('Attaching atelier garment lookbook / swatch asset...')}
                  className="text-[var(--text-secondary)] hover:text-[var(--gold)] p-2 cursor-pointer transition-colors"
                  aria-label="Attach File"
                >
                  <Paperclip size={18} />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Compose response to patron..."
                  className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[var(--gold)] px-4 py-2.5 text-[13.5px] text-[var(--text-primary)] outline-none font-manrope rounded-sm"
                />

                <button
                  type="submit"
                  className="bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:opacity-90 label-caps text-[11px] uppercase tracking-wider px-5 py-2.5 flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <span>Send</span>
                  <Send size={13} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-[var(--text-secondary)]">
              Select an active patron session to begin live concierge dialogue.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
