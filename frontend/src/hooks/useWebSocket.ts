import { useEffect } from 'react';
import type { WebSocketMessage } from '../types';
import { MessageType } from '../types';
import websocketService from '../services/websocket';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';

export const useWebSocket = () => {
  const { isAuthenticated, token, user } = useAuthStore();
  const { addMessage, updateUserOnlineStatus, setWebSocket } = useChatStore();

  useEffect(() => {
    if (isAuthenticated && token && user) {
      console.log('Initializing WebSocket connection for user:', user.username);
      
      // Connect to WebSocket
      websocketService.connect(token);

      // Set up message handler
      websocketService.onMessage((data: WebSocketMessage) => {
        console.log('WebSocket message received:', data);

        switch (data.type) {
          case 'CONNECTION_ESTABLISHED':
            console.log('WebSocket connection established for user:', data.userId);
            // Store the websocket reference in the chat store
            setWebSocket(websocketService as any);
            break;

          case 'NEW_MESSAGE':
            if (data.message) {
              console.log('New message received:', data.message);
              addMessage(data.message);
            }
            break;

          case 'MESSAGE_SENT':
            if (data.message) {
              console.log('Message sent confirmation:', data.message);
              addMessage(data.message);
            }
            break;

          case 'USER_ONLINE':
            if (data.userId) {
              updateUserOnlineStatus(data.userId, true);
            }
            break;

          case 'USER_OFFLINE':
            if (data.userId) {
              updateUserOnlineStatus(data.userId, false);
            }
            break;

          case 'ERROR':
            console.error('WebSocket error message:', data);
            break;

          case 'TYPING':
            // Handle typing indicator if needed
            break;

          default:
            console.log('Unknown WebSocket message type:', data.type);
        }
      });

      // Set up connection handlers
      websocketService.onConnect(() => {
        console.log('WebSocket connected successfully - ready to send messages');
        setWebSocket(websocketService as any);
      });

      websocketService.onDisconnect(() => {
        console.log('WebSocket disconnected');
        setWebSocket(null);
      });

      websocketService.onError((error) => {
        console.error('WebSocket error:', error);
        setWebSocket(null);
      });

      // Cleanup on unmount or when authentication changes
      return () => {
        console.log('Cleaning up WebSocket connection');
        websocketService.disconnect();
        setWebSocket(null);
      };
    } else {
      console.log('Not authenticated, skipping WebSocket connection');
    }
  }, [isAuthenticated, token, user, addMessage, updateUserOnlineStatus, setWebSocket]);

  const sendMessage = (receiverId: string, content: string, type: MessageType) => {
    console.log('Attempting to send message:', { receiverId, content, type });
    console.log('WebSocket connection state:', websocketService.isConnected());
    
    const result = websocketService.sendMessage(receiverId, content, type);
    if (!result) {
      console.error('Failed to send message - WebSocket not ready');
    }
    return result;
  };

  return {
    isConnected: websocketService.isConnected(),
    sendMessage,
  };
};