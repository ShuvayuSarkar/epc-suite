import React, { useState, useRef, useEffect } from 'react';
import { Bell, AlertCircle, CheckCircle, Info, AlertTriangle, X, CheckCheck } from 'lucide-react';
import { useNotifications, Notification, NotifType } from '../../contexts/NotificationContext';

function timeAgo(d: Date): string {
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

const typeIcon: Record<NotifType, React.ReactNode> = {
  overdue:    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />,
  escalation: <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />,
  approval:   <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />,
  warning:    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
  info:       <Info className="w-4 h-4 text-blue-500 shrink-0" />,
};

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 text-slate-400 hover:text-slate-600 focus:outline-none rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <span className="text-sm font-semibold text-slate-700">
              Notifications {unreadCount > 0 && <span className="ml-1 text-xs text-indigo-600">({unreadCount} new)</span>}
            </span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 && (
              <div className="py-10 text-center text-slate-400 text-sm">No notifications</div>
            )}
            {notifications.map((n: Notification) => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-slate-50 transition-colors ${
                  !n.readAt ? 'border-l-2 border-indigo-500 bg-indigo-50/30' : ''
                }`}
              >
                <div className="mt-0.5">{typeIcon[n.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${!n.readAt ? 'text-slate-800' : 'text-slate-600'}`}>{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
              </button>
            ))}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2 bg-slate-50">
              <button onClick={clearAll} className="text-xs text-slate-400 hover:text-slate-600">Clear all</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
