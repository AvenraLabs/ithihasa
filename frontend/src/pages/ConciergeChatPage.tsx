import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  MessageSquare,
  HelpCircle,
  Plus,
} from 'lucide-react';
import {
  fetchTicketById,
  sendTicketMessage,
  createSupportTicket,
  type SupportTicketItem
} from '../api/support.js';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { useAvatar } from '../context/AvatarContext.js';

export const ConciergeChatPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profileData } = useAvatar();
  const [inputText, setInputText] = useState('');
  const [isStartingNew, setIsStartingNew] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    data: ticket,
    isLoading,
    isError,
  } = useQuery<SupportTicketItem>({
    queryKey: ['support-ticket', ticketId],
    queryFn: () => fetchTicketById(ticketId!),
    enabled: !!ticketId,
    // No refetchInterval — Socket.IO handles real-time updates.
    // Only do a one-time stale refresh when window refocuses.
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const isResolved = ticket?.status === 'RESOLVED' || ticket?.status === 'CLOSED';

  // WebSocket real-time connection for instant bidirectional messages
  useEffect(() => {
    if (!ticketId) return;

    const socketUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000'
      : window.location.origin;

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    socket.emit('join_ticket', ticketId);

    socket.on('new_message', ({ ticketId: msgTicketId, message }: any) => {
      if (msgTicketId === ticketId) {
        queryClient.setQueryData<SupportTicketItem>(['support-ticket', ticketId], (prev) => {
          if (!prev) return prev;
          const alreadyExists = prev.messages?.some((m) => m.id === message.id);
          if (alreadyExists) return prev;
          return {
            ...prev,
            status: prev.status === 'PENDING' ? 'OPEN' : prev.status,
            messages: [...prev.messages, message],
          };
        });
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }
    });

    socket.on('status_changed', ({ ticketId: statTicketId, status }: any) => {
      if (statTicketId === ticketId) {
        queryClient.setQueryData<SupportTicketItem>(['support-ticket', ticketId], (prev) => {
          if (!prev) return prev;
          return { ...prev, status };
        });
      }
    });

    return () => {
      socket.emit('leave_ticket', ticketId);
      socket.disconnect();
    };
  }, [ticketId, queryClient]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages?.length]);

  const sendMutation = useMutation({
    mutationFn: (text: string) => sendTicketMessage(ticketId!, text),
    onSuccess: (newMsg) => {
      queryClient.setQueryData<SupportTicketItem>(['support-ticket', ticketId], (prev) => {
        if (!prev) return prev;
        // Dedup: socket may have already delivered this same message before HTTP response
        const alreadyExists = prev.messages?.some((m) => m.id === newMsg.id);
        if (alreadyExists) return prev;
        return {
          ...prev,
          status: prev.status === 'PENDING' ? 'OPEN' : prev.status,
          messages: [...prev.messages, newMsg],
        };
      });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Unable to send message');
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || sendMutation.isPending || isResolved) return;
    setInputText(''); // Clear immediately for snappy UX
    sendMutation.mutate(text);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
          <span className="label-caps text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">
            Connecting to Atelier Concierge...
          </span>
        </div>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <HelpCircle size={40} className="text-[var(--gold)] opacity-70" />
        <h2 className="font-garamond text-[24px] text-[var(--text-primary)]">
          Conversation Not Found
        </h2>
        <p className="text-[13px] text-[var(--text-secondary)] max-w-sm">
          We couldn't retrieve this concierge inquiry. It may have been archived or does not exist.
        </p>
        <Link
          to="/care"
          className="bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[11px] px-6 py-3 uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          Return to Customer Care
        </Link>
      </div>
    );
  }

  const handleStartNewConversation = async () => {
    try {
      setIsStartingNew(true);
      const newTicket = await createSupportTicket({
        customerName: profileData?.fullName || undefined,
        email: profileData?.email || undefined,
        phone: profileData?.phone || undefined,
        subject: 'Concierge Assistance',
      });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('Connected with atelier concierge.');
      navigate(`/care/chat/${newTicket.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Unable to start new conversation');
    } finally {
      setIsStartingNew(false);
    }
  };

  return (
    <div className="h-screen h-dvh max-h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col">
      {/* Sticky App Bar Header */}
      <header className="shrink-0 z-40 bg-[var(--bg-primary)]/95 backdrop-blur-md border-b border-[var(--border-color)] px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/care')}
            className="p-2 -ml-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Back to Customer Care"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[13px] font-bold text-[var(--gold)]">
                {ticket.ticketNumber}
              </span>
              <span
                className={`label-caps text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold ${
                  isResolved
                    ? 'bg-black/60 text-[var(--gold)] border border-[var(--gold)]/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {ticket.status}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] truncate max-w-[220px] sm:max-w-md">
              {ticket.subject}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Artisan Specialist Live</span>
          </div>
        </div>
      </header>

      {/* Subject Context Banner */}
      <div className="shrink-0 bg-[var(--bg-secondary)]/60 border-b border-[var(--border-color)] px-4 sm:px-6 py-2.5 flex items-center justify-between text-[12px] text-[var(--text-secondary)]">
        <div className="flex items-center gap-2 truncate">
          <Sparkles size={14} className="text-[var(--gold)] shrink-0" />
          <span className="font-medium text-[var(--text-primary)] truncate">{ticket.subject}</span>
        </div>
        <span className="shrink-0 text-[11px] text-[var(--text-muted)] font-mono">
          Opened {ticket.date}
        </span>
      </div>

      {/* Messages Timeline */}
      <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-4xl w-full mx-auto space-y-4">
        {ticket.messages.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3 max-w-md mx-auto my-auto animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mx-auto text-[var(--gold)]">
              <MessageSquare size={22} strokeWidth={1.5} />
            </div>
            <h3 className="font-garamond text-[22px] text-[var(--text-primary)] font-normal m-0">
              Direct Concierge Connected
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              Speak with our atelier concierge regarding bespoke styling, sizing questions, or order inquiries. Type your message below to begin.
            </p>
          </div>
        ) : (
          ticket.messages.map((msg, idx) => {
            const isConcierge = msg.senderRole === 'AGENT' || msg.sender.includes('Concierge');

            return (
              <div
                key={msg.id || idx}
                className={`flex flex-col ${isConcierge ? 'items-start' : 'items-end'} animate-in fade-in duration-200`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="label-caps text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
                    {isConcierge ? 'Atelier Concierge' : 'You'}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">· {msg.time}</span>
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[70%] p-4 text-[13.5px] leading-relaxed shadow-sm ${
                    isConcierge
                      ? 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-tl-none'
                      : 'bg-[var(--gold)]/15 border border-[var(--gold)]/30 text-[var(--text-primary)] rounded-tr-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}

        {/* Resolved State Notice */}
        {isResolved && (
          <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center space-y-2 my-4 rounded-sm">
            <CheckCircle2 size={22} className="mx-auto text-[var(--gold)]" />
            <h4 className="font-garamond text-[18px] text-[var(--text-primary)] font-normal m-0">
              Inquiry Marked as Resolved
            </h4>
            <p className="text-[12.5px] text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
              This concierge conversation has been concluded by the atelier specialist. If you require further assistance with your heritage piece or new orders, you can begin a new inquiry.
            </p>
            <div className="pt-2">
              <button
                onClick={handleStartNewConversation}
                disabled={isStartingNew}
                className="inline-flex items-center gap-1.5 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[10px] uppercase tracking-wider px-4 py-2 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                <Plus size={13} />
                <span>{isStartingNew ? 'Connecting...' : 'Start New Conversation'}</span>
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Chat Input Bar */}
      <footer className="shrink-0 bg-[var(--bg-primary)]/95 border-t border-[var(--border-color)] p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
        <div className="max-w-4xl mx-auto">
          {isResolved ? (
            <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center text-[12.5px] text-[var(--text-secondary)] font-manrope flex items-center justify-center gap-2">
              <Clock size={14} className="text-[var(--gold)]" />
              <span>This ticket is resolved. New messages are disabled.</span>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex gap-2.5 items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Reply to the atelier concierge specialist..."
                disabled={sendMutation.isPending}
                className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[var(--gold)] px-4 py-3 text-[13.5px] text-[var(--text-primary)] outline-none rounded-full transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sendMutation.isPending}
                className="w-11 h-11 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:opacity-90 disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0"
                aria-label="Send Message"
              >
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </footer>
    </div>
  );
};
