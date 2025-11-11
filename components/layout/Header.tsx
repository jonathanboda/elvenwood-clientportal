import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, Check, ChevronDown, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { User, Notification, View } from '../../types.ts';

interface HeaderProps {
    user: User;
    setActiveView: (view: View) => void;
}

type NotificationFilter = 'All' | 'Unread' | 'Read';

interface NotificationWithType extends Notification {
  type?: 'version' | 'comment' | 'acceptance';
  icon?: React.ReactNode;
}

const NotificationItem: React.FC<{ notification: NotificationWithType; onMarkAsRead?: (id: string) => void }> = ({ notification, onMarkAsRead }) => {
  const formatDate = (date: string) => {
    try {
      const d = new Date(date);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor(diff / 60000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 60) {
        return `${minutes}m ago`;
      } else if (hours < 24) {
        return `${hours}h ago`;
      } else if (days < 7) {
        return `${days}d ago`;
      } else {
        return d.toLocaleDateString();
      }
    } catch {
      return date;
    }
  };

  return (
    <div
      className={`px-4 py-3 border-b border-light-border dark:border-dark-border transition-colors ${
        !notification.isRead
          ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
          : 'hover:bg-light-bg-secondary dark:hover:bg-dark-border'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-light-text dark:text-dark-text">{notification.text}</p>
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
            {formatDate(notification.date)}
          </p>
        </div>
        {!notification.isRead && (
          <button
            onClick={() => onMarkAsRead?.(notification.id)}
            className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-brand-accent hover:opacity-80 transition-opacity mt-1"
            title="Mark as read"
          />
        )}
      </div>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({ user, setActiveView }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>('All');
  // Placeholder for notifications. In a real app, this would be fetched.
  const [notifications, setNotifications] = useState<NotificationWithType[]>([
    {
      id: '1',
      text: 'Designer uploaded a new design version',
      date: new Date(Date.now() - 1800000).toISOString(),
      isRead: false,
      type: 'version',
    },
    {
      id: '2',
      text: 'Comment added to your design',
      date: new Date(Date.now() - 3600000).toISOString(),
      isRead: false,
      type: 'comment',
    },
    {
      id: '3',
      text: 'Design has been accepted',
      date: new Date(Date.now() - 86400000).toISOString(),
      isRead: true,
      type: 'acceptance',
    },
  ]);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    if (filter === 'All') return notifications;
    if (filter === 'Unread') return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.isRead);
  }, [notifications, filter]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: NotificationWithType[] } = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'Older': [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    filteredNotifications.forEach(notif => {
      const notifDate = new Date(notif.date);
      const notifDateOnly = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());

      if (notifDateOnly.getTime() === today.getTime()) {
        groups['Today'].push(notif);
      } else if (notifDateOnly.getTime() === yesterday.getTime()) {
        groups['Yesterday'].push(notif);
      } else if (notifDate > weekAgo) {
        groups['This Week'].push(notif);
      } else {
        groups['Older'].push(notif);
      }
    });

    return Object.entries(groups).filter(([_, notifs]) => notifs.length > 0);
  }, [filteredNotifications]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-light-bg dark:bg-dark-bg-secondary shadow-sm h-16 flex items-center justify-end px-6 lg:px-8 flex-shrink-0 z-50">
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-light-bg-secondary dark:hover:bg-dark-border focus:outline-none focus:ring-2 focus:ring-brand-accent transition-colors"
          >
            <Bell className="h-6 w-6 text-light-text-secondary dark:text-dark-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border-2 border-light-bg dark:border-dark-bg-secondary">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-96 bg-light-bg dark:bg-dark-bg-secondary rounded-xl shadow-2xl border border-light-border dark:border-dark-border overflow-hidden max-h-[32rem] flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-light-border dark:border-dark-border bg-light-bg-secondary/50 dark:bg-dark-bg/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-light-text dark:text-dark-text">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-brand-accent hover:text-brand-dark dark:hover:text-brand-light font-medium flex items-center gap-1 transition-colors"
                    >
                      <Check size={14} />
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2">
                  {(['All', 'Unread', 'Read'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        filter === f
                          ? 'bg-brand-accent text-white shadow-md'
                          : 'bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {filteredNotifications.length > 0 ? (
                  <div>
                    {groupedNotifications.map(([group, notifs]) => (
                      <div key={group}>
                        <div className="sticky top-0 px-4 py-2 bg-light-bg-secondary/80 dark:bg-dark-bg/50 backdrop-blur-sm border-b border-light-border dark:border-dark-border">
                          <p className="text-xs font-semibold uppercase text-light-text-secondary dark:text-dark-text-secondary tracking-wider">
                            {group}
                          </p>
                        </div>
                        {notifs.map(n => (
                          <NotificationItem
                            key={n.id}
                            notification={n}
                            onMarkAsRead={markAsRead}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48">
                    <Bell size={32} className="text-light-text-secondary dark:text-dark-text-secondary mb-2 opacity-50" />
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      {filter === 'All' ? 'No notifications yet' : `No ${filter.toLowerCase()} notifications`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-light-bg-secondary dark:hover:bg-dark-border transition-colors"
          >
            <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
            <div className="hidden md:flex flex-col items-start">
              <span className="font-semibold text-sm text-light-text dark:text-dark-text">{user.name}</span>
              <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{user.role}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-light-text-secondary dark:text-dark-text-secondary hidden md:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-light-bg dark:bg-dark-bg-secondary rounded-lg shadow-xl border border-light-border dark:border-dark-border overflow-hidden">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-light-border dark:border-dark-border bg-light-bg-secondary/50 dark:bg-dark-bg/30">
                <p className="text-sm font-semibold text-light-text dark:text-dark-text">{user.name}</p>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5">{user.email}</p>
              </div>

              {/* Menu Items */}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView('profile');
                  setShowUserMenu(false);
                }}
                className="block px-4 py-3 text-sm text-light-text dark:text-dark-text hover:bg-light-bg-secondary dark:hover:bg-dark-border transition-colors"
              >
                Your Profile
              </a>
              <a
                href="#"
                className="block px-4 py-3 text-sm text-light-text dark:text-dark-text hover:bg-light-bg-secondary dark:hover:bg-dark-border transition-colors"
              >
                Settings
              </a>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  alert('Logout functionality removed.');
                }}
                className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-light-border dark:border-dark-border"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};