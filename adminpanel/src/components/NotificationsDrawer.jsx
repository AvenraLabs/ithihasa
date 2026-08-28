import React from 'react';
import {
  ShoppingBag,
  AlertTriangle,
  UserPlus,
  ArrowDownToLine,
  X,
  CheckCheck
} from 'lucide-react';

export function NotificationsDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onNotificationClick
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Invisible backdrop for click-away without any weird top blur */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Premium Anchored Popover Card */}
      <div
        className="absolute right-0 top-full mt-3 w-[calc(100vw-32px)] sm:w-[410px] max-h-[calc(100vh-90px)] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[0_20px_50px_rgba(0,0,0,0.18)] rounded-xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-secondary)]/40">
          <div className="flex items-center gap-2">
            <h3 className="font-garamond text-[20px] font-normal text-[var(--text-primary)] leading-none">
              Notifications
            </h3>
            {notifications.some(n => !n.read) && (
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
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 max-h-[480px]">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => onNotificationClick(item)}
              className={`p-3.5 rounded-lg border transition-all duration-200 cursor-pointer flex gap-3.5 items-start group relative ${
                !item.read
                  ? 'bg-[var(--bg-secondary)]/70 border-[var(--gold)]/40 hover:border-[var(--gold)] shadow-xs'
                  : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/40 hover:border-[var(--border-color)]'
              }`}
            >
              {/* Type Icon */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  item.type === 'order'
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                    : item.type === 'alert'
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    : item.type === 'user'
                    ? 'bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                }`}
              >
                {item.type === 'order' && <ShoppingBag size={16} />}
                {item.type === 'alert' && <AlertTriangle size={16} />}
                {item.type === 'user' && <UserPlus size={16} />}
                {item.type === 'system' && <ArrowDownToLine size={16} />}
              </div>

              {/* Text content */}
              <div className="flex-1 pr-3">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-manrope text-[13.5px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">
                    {item.title}
                  </h4>
                  <span className="label-caps text-[10px] text-[var(--text-muted)] tracking-wider">
                    {item.time}
                  </span>
                </div>
                <p className="font-manrope text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Unread indicator dot */}
              {!item.read && (
                <div className="w-2 h-2 rounded-full bg-[var(--gold)] absolute right-3 top-3.5 shadow-sm" />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
