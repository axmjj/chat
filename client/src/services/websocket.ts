import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import type { WSMessage, PrivateChatReceived, UserStatusPayload, Message } from '../types';

const WS_URL = 'ws://localhost:8000/ws';

export const useWebSocket = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const isConnectingRef = useRef(false);
  
  const { token, user } = useAuthStore();
  const { 
    setOnlineUsers, 
    addMessage, 
    setConnected,
    currentChatUser 
  } = useChatStore();

  const connect = useCallback(() => {
    if (!token) {
      console.log('No token available, skipping WebSocket connection');
      return;
    }

    // 防止重复连接
    if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    isConnectingRef.current = true;
    const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      isConnectingRef.current = false;
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data: WSMessage = JSON.parse(event.data);
        handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      isConnectingRef.current = false;
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      wsRef.current = null;
      isConnectingRef.current = false;
      
      // 自动重连
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect();
      }, 3000);
    };
  }, [token, setConnected]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setConnected(false);
  }, [setConnected]);

  const sendMessage = useCallback((message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  const handleMessage = (data: WSMessage) => {
    console.log('Received WebSocket message:', data);

    switch (data.type) {
      case 'online_users':
        setOnlineUsers(data.payload.user_ids);
        break;

      case 'private_chat':
        const chatMsg: PrivateChatReceived = data.payload;
        const messageToAdd: Message = {
          id: chatMsg.message_id,
          sender_id: chatMsg.from_user_id,
          receiver_id: chatMsg.to_user_id,
          content: chatMsg.content,
          msg_type: chatMsg.msg_type,
          timestamp: chatMsg.timestamp,
        };
        addMessage(chatMsg.from_user_id, messageToAdd);
        break;

      case 'message_sent':
        // 消息已发送确认
        console.log('Message sent:', data.payload);
        break;

      case 'user_status':
        const statusPayload: UserStatusPayload = data.payload;
        console.log(`User ${statusPayload.user_id} is now ${statusPayload.status}`);
        // TODO: 更新在线用户列表
        break;

      case 'error':
        console.error('WebSocket error:', data.payload.message);
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  };

  useEffect(() => {
    if (token && user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, user, connect, disconnect]);

  const { isConnected } = useChatStore();

  return {
    sendMessage,
    isConnected,
    connect,
    disconnect,
  };
};
