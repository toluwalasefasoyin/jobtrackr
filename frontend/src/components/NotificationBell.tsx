import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { Notification } from '../hooks/useWebSocket';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080';

const typeColors: Record<string, string> = {
  CREATED: '#10b981',
  UPDATED: '#f59e0b',
  DELETED: '#ef4444',
};

const typeIcons: Record<string, string> = {
  CREATED: '✨',
  UPDATED: '⟳',
  DELETED: '✕',
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<Client | null>(null);
  const { username, token } = useAuth();

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    if (!username || !token) return;
    if (clientRef.current) return; // Already connected

    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('NotificationBell WebSocket connected');
        client.subscribe(`/user/${username}/queue/notifications`, message => {
          const notification: Notification = JSON.parse(message.body);
          setNotifications(prev => [notification, ...prev].slice(0, 10));
          setUnreadCount(notification.unreadCount || 0);
        });
      },
      onDisconnect: () => {
        console.log('NotificationBell WebSocket disconnected');
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

  // Handle click outside
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
      
      // Parse as ISO format (backend sends as "2026-04-02T10:30:45")
      const date = new Date(createdAt + 'Z'); // Add Z for UTC
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', createdAt);
        return 'unknown time';
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diff = Math.floor(diffMs / 1000); // Convert to seconds
      
      if (diff < 0) return 'just now'; // Future date or parsing issue
      if (diff < 60) return 'just now';
      if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return `${minutes}m ago`;
      }
      if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return `${hours}h ago`;
      }
      if (diff < 604800) {
        const days = Math.floor(diff / 86400);
        return `${days}d ago`;
      }
      
      return date.toLocaleDateString();
    } catch (err) {
      console.error('Error parsing date:', createdAt, err);
      return 'unknown time';
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        style={{
          position: 'relative',
          background: 'rgba(168,85,247,0.1)',
          border: '1px solid rgba(168,85,247,0.3)',
          borderRadius: '12px',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontSize: '1.2rem',
          padding: 0,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(168,85,247,0.2)';
          e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(168,85,247,0.1)';
          e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)';
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: 'linear-gradient(135deg, #ec4899, #a855f7)',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 700,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 2s infinite',
            border: '2px solid rgba(0,0,0,0.5)',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          width: '380px',
          maxHeight: '500px',
          background: 'rgba(15,23,42,0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(168,85,247,0.3)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.6), 0 0 1px rgba(168,85,247,0.5)',
          zIndex: 9999,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid rgba(168,85,247,0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(59,130,246,0.1))',
          }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e9d5ff' }}>
              Notifications
            </span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(233,213,255,0.5)' }}>
              {notifications.length} recent
            </span>
          </div>

          {/* List */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(233,213,255,0.4)', fontSize: '0.85rem' }}>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(233,213,255,0.4)', fontSize: '0.85rem' }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n: any, i) => (
                <div
                  key={n.id || i}
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid rgba(168,85,247,0.1)',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                    background: n.read === false ? 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(59,130,246,0.05))' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: `${typeColors[n.type] || '#999'}30`,
                    border: `1.5px solid ${typeColors[n.type] || '#999'}60`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    color: typeColors[n.type] || '#999',
                    flexShrink: 0,
                    fontWeight: 'bold',
                  }}>
                    {typeIcons[n.type] || '•'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.82rem', color: '#e9d5ff', lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
                      {n.message}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(233,213,255,0.4)', marginTop: '0.35rem' }}>
                      {formatTime(n.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
