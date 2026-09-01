import React from 'react';
import {
  ShoppingBag,
  AlertTriangle,
  UserPlus,
  ArrowDownToLine,
  X,
  Package,
  MessageSquare,
  Sparkles,
  Bell
} from 'lucide-react';

export function NotificationsDrawer({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllAsRead,
  onNotificationClick
}) {
  if (!isOpen) return null;

  const renderIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingBag size={16} />;
      case 'inventory':
        return <Package size={16} />;
      case 'support':
        return <MessageSquare size={16} />;
      case 'bespoke':
        return <Sparkles size={16} />;
      case 'alert':
        return <AlertTriangle size={16} />;
      case 'user':
        return <UserPlus size={16} />;
      case 'system':
      default:
        return <ArrowDownToLine size={16} />;
    }
  };

  const getIconColorClass = (type) => {
    switch (type) {
      case 'order':
        return 'bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30';
      case 'inventory':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'support':
      case 'bespoke':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20';
      case 'alert':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      case 'user':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      default:
        return 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]';
    }
  };

  return (
    <>
      {/* Invisible backdrop for click-away */}
      <div className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent backdrop-blur-[1px] sm:backdrop-blur-none" onClick={onClose} />

      {/* Responsive Anchored Popover Card (Fixed center-clamped on mobile, absolute right on desktop) */}
      <div
        className="fixed inset-x-3.5 top-16 z-50 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[420px] max-w-[calc(100vw-28px)] sm:max-w-none max-h-[calc(100vh-90px)] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:shadow-[0_20px_50px_rgba(0,0,0,0.18)] rounded-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-4.5 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-secondary)]/40">
          <div className="flex items-center gap-2">
            <h3 className="font-garamond text-[20px] font-normal text-[var(--text-primary)] leading-none">
              Notifications
            </h3>
            {notifications.some((n) => !n.read) && (
              <span className="w-2 h-2 rounded-full bg-[var(--gold)]" />
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onMarkAllAsRead}
              className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--gold)] font-medium transition-colors cursor-pointer"
            >
              Mark all as read
            </button>
            <button
              onClick={onClose}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 transition-colors cursor-pointer"
              aria-label="Close Notifications"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-2.5 max-h-[480px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center space-y-2 text-[var(--text-secondary)]">
              <Bell size={24} className="mx-auto opacity-40 text-[var(--gold)]" />
              <p className="font-garamond text-[17px] text-[var(--text-primary)]">All Caught Up</p>
              <p className="text-[12px]">No unread atelier dispatches or alerts.</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => onNotificationClick?.(item)}
                className={`p-3.5 rounded-lg border transition-all duration-200 cursor-pointer flex gap-3.5 items-start group relative ${
                  !item.read
                    ? 'bg-[var(--bg-secondary)]/70 border-[var(--gold)]/40 hover:border-[var(--gold)] shadow-xs'
                    : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/40 hover:border-[var(--border-color)]'
                }`}
              >
                {/* Type Icon */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${getIconColorClass(
                    item.type
                  )}`}
                >
                  {renderIcon(item.type)}
                </div>

                {/* Text content */}
                <div className="flex-1 pr-3 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h4 className="font-manrope text-[13.5px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors truncate">
                      {item.title}
                    </h4>
                    <span className="label-caps text-[9.5px] text-[var(--text-muted)] tracking-wider shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <p className="font-manrope text-[12px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Unread indicator dot */}
                {!item.read && (
                  <div className="w-2 h-2 rounded-full bg-[var(--gold)] absolute right-3 top-3.5 shadow-sm" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
