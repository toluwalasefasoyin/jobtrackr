import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { Notification } from '../hooks/useWebSocket';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080';

const typeIcons: Record<string, string> = {
  CREATED: 'add_circle',
  UPDATED: 'update',
  DELETED: 'delete_sweep',
};

const typeColors: Record<string, string> = {
  CREATED: 'text-primary bg-primary/10',
  UPDATED: 'text-tertiary bg-tertiary-container/10',
  DELETED: 'text-error bg-error/10',
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<Client | null>(null);
  const { username, token } = useAuth();

  const connectWebSocket = useCallback(() => {
    if (!username || !token) return;
    if (clientRef.current) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/user/${username}/queue/notifications`, message => {
          const notification: Notification = JSON.parse(message.body);
          setNotifications(prev => [notification, ...prev].slice(0, 10));
          setUnreadCount(notification.unreadCount || 0);
        });
      },
      onDisconnect: () => {
        clientRef.current = null;
      },
      onStompError: frame => {
        console.error('STOMP error', frame);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [username, token]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [connectWebSocket]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = async () => {
    setOpen(!open);
    if (!open) {
      setLoading(true);
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.slice(0, 10));
        await api.put('/notifications/mark-all-read');
        setUnreadCount(0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatTime = (createdAt: string) => {
    try {
      if (!createdAt) return 'unknown time';
      const date = new Date(createdAt + 'Z');
      if (isNaN(date.getTime())) return 'unknown time';
      const now = new Date();
      const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
      if (diff < 0) return 'just now';
      if (diff < 60) return 'just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
      return date.toLocaleDateString();
    } catch {
      return 'unknown time';
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="relative scale-95 active:scale-90 transition-transform cursor-pointer p-2 rounded-full bg-white/5 hover:bg-white/10"
      >
        <span className="material-symbols-outlined text-slate-400">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-tertiary-container rounded-full ring-2 ring-surface"></span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-4 w-[380px] bg-surface-container-highest rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl overflow-hidden z-50">
          <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-surface-container-high/50">
            <h3 className="text-sm font-bold tracking-tight text-white uppercase">
              Activity Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="max-h-[440px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-on-surface-variant/50 text-sm">
                <span className="material-symbols-outlined animate-spin text-2xl block mb-2">progress_activity</span>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant/50 text-sm">
                <span className="material-symbols-outlined text-2xl block mb-2">notifications_none</span>
                No notifications yet
              </div>
            ) : (
              notifications.map((n: any, i: number) => (
                <div
                  key={n.id || i}
                  className="p-4 hover:bg-white/5 transition-colors cursor-default border-b border-white/5 flex gap-4 items-start"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[n.type] || 'text-outline bg-white/5'}`}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {typeIcons[n.type] || 'info'}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm text-on-surface leading-snug">
                      {n.message}
                    </p>
                    <span className="text-[11px] text-on-surface-variant font-medium mt-1 inline-block">
                      {formatTime(n.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button className="block w-full text-center py-3 bg-surface-container-high/50 hover:bg-surface-container-highest border-t border-white/5 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest transition-colors">
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
