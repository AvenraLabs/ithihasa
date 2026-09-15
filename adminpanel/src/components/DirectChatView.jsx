import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Sparkles,
  Paperclip,
  Clock,
  Check,
  CheckCheck,
  CheckCircle2,
  RotateCcw,
  User,
  Shield,
  Search,
  Diamond,
  X
} from 'lucide-react';
import { toast } from 'sonner';

import {
  fetchChatSessions,
  sendChatMessage,
  updateTicketStatus
} from '../api/support.js';

export function DirectChatView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryTicketId = searchParams.get('ticketId');

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'chat' on mobile
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const messagesEndRef = useRef(null);

  // ---------- initial load ----------
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchChatSessions().catch(() => null);
      if (data && Array.isArray(data)) {
        setSessions(data);
        // Only auto-select from URL param on FIRST load (when nothing is active yet)
        setActiveSessionId((prevActive) => {
          if (prevActive && data.some((s) => s.id === prevActive)) {
            return prevActive; // Stay on whatever the user already selected
          }
          if (queryTicketId) {
            const match = data.find(
              (s) => s.id === queryTicketId || s.ticketNumber === queryTicketId
            );
            if (match) {
              setMobileView('chat');
              return match.id;
            }
          }
          return data[0]?.id || null;
        });
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error('Chat sessions load error:', err);
      toast.error('Unable to fetch live concierge chat sessions.');
    } finally {
      setLoading(false);
    }
  }, [queryTicketId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // ---------- Socket.IO real-time connection ----------
  useEffect(() => {
    const socketUrl =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : window.location.origin;

    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });

    // Admin joins the global admin feed for new tickets & ticket list updates
    socket.emit('join_admin_feed');

    // A brand new ticket arrived — add it to the sessions list
    socket.on('new_ticket', (ticket) => {
      setSessions((prev) => {
        if (prev.some((s) => s.id === ticket.id)) return prev;
        return [ticket, ...prev];
      });
    });

    // A ticket was updated (status or last message preview)
    socket.on('ticket_updated', ({ ticketId, lastMessage, time, status, updatedAt }) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === ticketId
            ? {
                ...s,
                ...(lastMessage !== undefined ? { lastMessage, time, unread: true } : {}),
                ...(status !== undefined ? { status } : {}),
              }
            : s
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ---------- Per-ticket room: join when active session changes ----------
  const activeTicketSocketRef = useRef(null);
  useEffect(() => {
    if (!activeSessionId) return;

    const socketUrl =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : window.location.origin;

    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    activeTicketSocketRef.current = socket;

    socket.emit('join_ticket', activeSessionId);

    // Real-time incoming message for the active ticket
    socket.on('new_message', ({ ticketId, message }) => {
      if (ticketId === activeSessionId) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === ticketId
              ? {
                  ...s,
                  unread: false,
                  lastMessage: message.text,
                  time: 'Just now',
                  messages: s.messages?.some((m) => m.id === message.id)
                    ? s.messages
                    : [...(s.messages || []), message],
                }
              : s
          )
        );
      }
    });

    // Status change for the active ticket
    socket.on('status_changed', ({ ticketId, status }) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === ticketId ? { ...s, status } : s))
      );
    });

    return () => {
      socket.emit('leave_ticket', activeSessionId);
      socket.disconnect();
      activeTicketSocketRef.current = null;
    };
  }, [activeSessionId]);


  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;

  // Auto scroll to latest message
  useEffect(() => {
    if (activeSession?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSession?.messages?.length, activeSessionId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const isResolved = activeSession?.status === 'RESOLVED';
    if (!inputText.trim() || !activeSession || isResolved) return;

    const trimmedText = inputText.trim();
    setInputText(''); // Clear immediately for responsive UX

    try {
      await sendChatMessage(activeSession.id, trimmedText);
      // No optimistic update needed — the socket 'new_message' event
      // fires for everyone in the ticket room (including the sender)
      // and delivers the real DB message with the correct ID.
    } catch {
      toast.error('Failed to send message.');
    }
  };

  const handleToggleResolve = async () => {
    if (!activeSession || updatingStatus) return;

    const isCurrentlyResolved = activeSession.status === 'RESOLVED';
    const nextStatus = isCurrentlyResolved ? 'OPEN' : 'RESOLVED';

    setUpdatingStatus(true);
    try {
      await updateTicketStatus(activeSession.id, nextStatus);

      toast.success(
        isCurrentlyResolved
          ? 'Ticket reopened for active conversation.'
          : 'Ticket marked as resolved. Customer notified.'
      );

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                status: nextStatus,
                messages: isCurrentlyResolved
                  ? s.messages
                  : [
                      ...s.messages,
                      {
                        id: `sys_${Date.now()}`,
                        sender: 'concierge',
                        text: 'This conversation has been marked as resolved by the atelier concierge.',
                        time: 'Just now'
                      }
                    ]
              }
            : s
        )
      );
    } catch (err) {
      console.error('Status update failed:', err);
      toast.error('Failed to update ticket status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSelectSession = (id) => {
    setActiveSessionId(id);
    setMobileView('chat');
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, unread: false } : s))
    );
    // Clear the ?ticketId= URL param so it no longer interferes with session selection
    if (queryTicketId) {
      navigate('/support/chat', { replace: true });
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      (s.patronName && s.patronName.toLowerCase().includes(q)) ||
      (s.ticketNumber && s.ticketNumber.toLowerCase().includes(q)) ||
      (s.subject && s.subject.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {/* Top Header & Breadcrumb — fixed height, never scrolls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 md:px-8 py-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)] shrink-0">
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
            Live Feed • {sessions.filter((s) => s.status !== 'RESOLVED').length} Active Inquiries
          </span>
        </div>
      </div>

      {/* Main Chat Workspace — fills remaining height, no overflow */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 border-t-0 border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden">

        {/* Left Column: Patron Session List */}
        <div
          className={`md:col-span-4 border-r border-[var(--border-color)] bg-[var(--bg-secondary)]/30 flex flex-col h-full min-h-0 ${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search Header */}
          <div className="p-3.5 border-b border-[var(--border-color)] bg-[var(--bg-card)] shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket #, patron, or subject..."
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] text-[12.5px] pl-8 pr-3 py-2 text-[var(--text-primary)] outline-none font-manrope rounded-sm"
              />
            </div>
          </div>

          {/* Session Cards — scrollable list */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[var(--border-color)]">
            {filteredSessions.length === 0 ? (
              <div className="p-6 text-center text-[12px] text-[var(--text-secondary)]">
                No support conversations found.
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isSelected = activeSession && session.id === activeSession.id;

                return (
                  <div
                    key={session.id}
                    onClick={() => handleSelectSession(session.id)}
                    className={`p-4 transition-colors cursor-pointer flex gap-3.5 items-start ${
                      isSelected
                        ? 'bg-[var(--bg-card)] border-l-2 border-[var(--gold)]'
                        : 'hover:bg-[var(--bg-card)]/60 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30 flex items-center justify-center font-bold shrink-0">
                        <User size={18} />
                      </div>
                      {session.unread && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--gold)] border-2 border-[var(--bg-card)] absolute -top-0.5 -right-0.5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <h4 className="font-semibold text-[13px] text-[var(--text-primary)] truncate">
                          {session.patronName || session.ticketNumber}
                        </h4>
                        <span className="text-[10px] label-caps text-[var(--text-muted)] tracking-wider shrink-0 ml-2">
                          {session.time}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="label-caps text-[9px] font-mono text-[var(--text-secondary)]">
                          {session.ticketNumber}
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)]">•</span>
                        <span
                          className={`label-caps text-[8.5px] px-1.5 py-0.5 rounded-xs uppercase font-bold border ${
                            session.status === 'OPEN'
                              ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                              : session.status === 'PENDING'
                              ? 'bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/30'
                              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>

                      <p className="text-[11.5px] text-[var(--text-secondary)] truncate">
                        {session.lastMessage || session.subject}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation Canvas */}
        <div
          className={`md:col-span-8 flex flex-col h-full min-h-0 bg-[var(--bg-card)] ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeSession ? (
            <>
              {/* Conversation Header — fixed, never scrolls */}
              <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/20 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
                    aria-label="Back to Sessions List"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div className="w-9 h-9 rounded-full bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30 flex items-center justify-center shrink-0">
                    <User size={16} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-garamond text-[17px] sm:text-[18px] font-normal text-[var(--text-primary)] truncate">
                        {activeSession.patronName || 'Unknown Patron'}
                      </h3>
                      <span className="label-caps text-[9px] px-2 py-0.5 uppercase bg-black text-[#F4EFE6] dark:bg-white dark:text-black border border-[var(--border-color)] font-bold shrink-0">
                        {activeSession.ticketNumber}
                      </span>
                      <span
                        className={`label-caps text-[9px] px-2 py-0.5 uppercase font-bold border rounded-xs shrink-0 ${
                          activeSession.status === 'OPEN'
                            ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                            : activeSession.status === 'PENDING'
                            ? 'bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/30'
                            : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                        }`}
                      >
                        {activeSession.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--text-secondary)] block truncate">
                      {activeSession.subject || activeSession.email || ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleToggleResolve}
                    disabled={updatingStatus}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 border label-caps text-[10px] uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 ${
                      activeSession.status === 'RESOLVED'
                        ? 'border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)]/10'
                        : 'border-emerald-600/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    {activeSession.status === 'RESOLVED' ? (
                      <><RotateCcw size={13} /><span>Reopen</span></>
                    ) : (
                      <><CheckCircle2 size={13} /><span>Mark Resolved</span></>
                    )}
                  </button>

                  <button
                    onClick={() => setShowDetailsModal(true)}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--gold)] label-caps text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <User size={12} />
                    <span>Details</span>
                  </button>
                </div>
              </div>

              {/* Resolved Banner */}
              {activeSession.status === 'RESOLVED' && (
                <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[12px] flex items-center justify-between font-manrope shrink-0">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    This conversation has been resolved.
                  </span>
                  <button
                    onClick={handleToggleResolve}
                    className="underline hover:opacity-80 text-[11px] label-caps uppercase tracking-wider cursor-pointer ml-2"
                  >
                    Reopen Now
                  </button>
                </div>
              )}

              {/* ─── Message Feed ─── fills remaining height, scrolls internally ─── */}
              <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 font-manrope text-[13.5px] bg-[var(--bg-card)]">
                {(activeSession.messages || []).length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[var(--text-secondary)] text-[13px]">
                    No messages yet. Start the conversation.
                  </div>
                ) : (
                  (activeSession.messages || []).map((msg) => {
                    const isConcierge =
                      msg.senderRole === 'AGENT' ||
                      msg.sender === 'concierge' ||
                      msg.sender === 'Atelier Concierge';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isConcierge ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="label-caps text-[10px] text-[var(--text-muted)] uppercase">
                            {isConcierge ? 'Atelier Concierge' : (activeSession.patronName || 'Patron')}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">• {msg.time}</span>
                        </div>

                        <div
                          className={`max-w-[80%] sm:max-w-[65%] px-4 py-3 rounded-2xl leading-relaxed ${
                            isConcierge
                              ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-tr-sm'
                              : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-tl-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-[13px]">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ─── Input Bar ─── always pinned to bottom ─── */}
              <form
                onSubmit={handleSendMessage}
                className="shrink-0 px-3.5 py-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={activeSession.status === 'RESOLVED'}
                  placeholder={
                    activeSession.status === 'RESOLVED'
                      ? "Conversation resolved — click 'Reopen Now' to reply"
                      : 'Compose response...'
                  }
                  className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[var(--gold)] px-4 py-2.5 text-[13.5px] text-[var(--text-primary)] outline-none font-manrope rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <button
                  type="submit"
                  disabled={activeSession.status === 'RESOLVED' || !inputText.trim()}
                  aria-label="Send message"
                  className="w-10 h-10 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:opacity-90 flex items-center justify-center shadow-sm transition-all cursor-pointer shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[var(--text-secondary)] font-manrope">
              <MessageSquare size={32} strokeWidth={1.25} className="opacity-30" />
              <p className="text-[13px]">Select a conversation to begin</p>
            </div>
          )}
        </div>
      </div>

      {/* Patron Details Modal */}
      {showDetailsModal && activeSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] flex items-center justify-center">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="font-garamond text-[20px] text-[var(--text-primary)] font-normal leading-none">
                    Patron Details
                  </h3>
                  <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                    {activeSession.ticketNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-[13px] font-manrope">
              {activeSession.patronName && (
                <div className="flex justify-between items-center py-1.5 border-b border-[var(--border-color)]/50">
                  <span className="label-caps text-[10.5px] uppercase tracking-wider text-[var(--text-secondary)]">
                    Name
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {activeSession.patronName}
                  </span>
                </div>
              )}

              {activeSession.email && (
                <div className="flex justify-between items-center py-1.5 border-b border-[var(--border-color)]/50">
                  <span className="label-caps text-[10.5px] uppercase tracking-wider text-[var(--text-secondary)]">
                    Email
                  </span>
                  <span className="font-medium text-[var(--text-primary)] select-all">
                    {activeSession.email}
                  </span>
                </div>
              )}

              {activeSession.phone && (
                <div className="flex justify-between items-center py-1.5 border-b border-[var(--border-color)]/50">
                  <span className="label-caps text-[10.5px] uppercase tracking-wider text-[var(--text-secondary)]">
                    Mobile Number
                  </span>
                  <span className="font-medium text-[var(--text-primary)] select-all tabular-nums">
                    {activeSession.phone}
                  </span>
                </div>
              )}

              {activeSession.subject && (
                <div className="flex justify-between items-center py-1.5 border-b border-[var(--border-color)]/50">
                  <span className="label-caps text-[10.5px] uppercase tracking-wider text-[var(--text-secondary)]">
                    Inquiry Subject
                  </span>
                  <span className="font-medium text-[var(--text-primary)] text-right max-w-[220px] truncate">
                    {activeSession.subject}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-1.5">
                <span className="label-caps text-[10.5px] uppercase tracking-wider text-[var(--text-secondary)]">
                  Status
                </span>
                <span
                  className={`label-caps text-[9px] px-2 py-0.5 uppercase font-bold border rounded-xs ${
                    activeSession.status === 'OPEN'
                      ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                      : activeSession.status === 'PENDING'
                      ? 'bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/30'
                      : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  }`}
                >
                  {activeSession.status}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full py-2.5 bg-[var(--bg-secondary)] hover:bg-[var(--gold)] hover:text-black text-[var(--text-primary)] label-caps text-[11px] uppercase tracking-wider transition-colors cursor-pointer border border-[var(--border-color)] font-semibold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

