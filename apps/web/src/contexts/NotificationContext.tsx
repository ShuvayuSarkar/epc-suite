import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type NotifType = 'info' | 'warning' | 'overdue' | 'escalation' | 'approval';

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  moduleId: string;
  recordId?: string;
  createdAt: Date;
  readAt?: Date;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  notify: (n: Omit<Notification, 'id' | 'createdAt'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const SEED: Notification[] = [
  { id: 'n1', type: 'overdue', title: 'Transmittal Response Overdue', message: 'APAR-TR-2026-003 response is overdue by 5 days', moduleId: '4.23', createdAt: new Date(Date.now() - 86400000 * 5) },
  { id: 'n2', type: 'approval', title: 'Document Review Required', message: 'ENG-ELE-002 Rev A is awaiting your approval in workflow stage', moduleId: '4.18', createdAt: new Date(Date.now() - 3600000 * 2) },
  { id: 'n3', type: 'warning', title: 'Budget Variance Alert', message: 'Civil works CBS node is 12% over budget this period', moduleId: '4.7', createdAt: new Date(Date.now() - 3600000 * 6) },
  { id: 'n4', type: 'info', title: 'MOM Published', message: 'Monthly Progress Review MOM-2026-003 has been published', moduleId: '4.22', createdAt: new Date(Date.now() - 86400000) },
  { id: 'n5', type: 'overdue', title: 'CRS Comment Overdue', message: 'CRS-2026-003: Comment C-001 response overdue by 3 days', moduleId: '4.25', createdAt: new Date(Date.now() - 86400000 * 3) },
];

const NOTIF_STORAGE_KEY = 'epc_notifications';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem(NOTIF_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            readAt: item.readAt ? new Date(item.readAt) : undefined,
          }));
        }
      }
    } catch { /* fallback to SEED */ }
    return SEED;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifications));
    } catch { /* ignore */ }
  }, [notifications]);

  const notify = useCallback((n: Omit<Notification, 'id' | 'createdAt'>) => {
    setNotifications(prev => [{ ...n, id: `n-${Date.now()}`, createdAt: new Date() }, ...prev]);
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date() } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, readAt: n.readAt ?? new Date() })));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter(n => !n.readAt).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, notify, markRead, markAllRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
