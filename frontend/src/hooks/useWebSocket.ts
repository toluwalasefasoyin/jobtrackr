import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080';

interface Notification {
  id: number;
  message: string;
  type: string;
  createdAt: string;
  unreadCount: number;
}

interface UseWebSocketProps {
  username: string | null;
  token: string | null;
  onNotification?: (notification: Notification) => void;
}

export const useWebSocket = ({ username, token, onNotification }: UseWebSocketProps) => {
  const clientRef = useRef<Client | null>(null);

  const connect = useCallback(() => {
    if (!username || !token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('WebSocket connected');
        client.subscribe(`/user/${username}/queue/notifications`, message => {
          const notification: Notification = JSON.parse(message.body);
          if (onNotification) {
            onNotification(notification);
          }
        });
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
      },
      onStompError: frame => {
        console.error('STOMP error', frame);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [username, token, onNotification]);

  useEffect(() => {
    connect();
    return () => {
      clientRef.current?.deactivate();
    };
  }, [connect]);
};

export type { Notification };
