import type { WebSocketMessage } from '../types';
import { MessageType } from '../types';

class WebSocketService {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private messageHandler: ((data: WebSocketMessage) => void) | null = null;
  private connectHandler: (() => void) | null = null;
  private disconnectHandler: (() => void) | null = null;
  private errorHandler: ((error: Event) => void) | null = null;
  private isConnectionEstablished = false; // Add this to track server confirmation

  connect(authToken: string) {
    this.token = authToken;
    this.isConnectionEstablished = false; // Reset connection state
    this.connectWebSocket();
  }

  private connectWebSocket() {
    if (!this.token) return;

    try {
      const wsUrl = `ws://localhost:8080/ws/chat?token=${this.token}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected to server');
        this.reconnectAttempts = 0;
        // Don't call connectHandler yet - wait for CONNECTION_ESTABLISHED
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);

          // Handle CONNECTION_ESTABLISHED specially
          if (data.type === 'CONNECTION_ESTABLISHED') {
            console.log('WebSocket connection established for user:', data.userId);
            this.isConnectionEstablished = true;
            this.connectHandler?.(); // Now call the connect handler
          }

          this.messageHandler?.(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnectionEstablished = false;
        this.disconnectHandler?.();
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnectionEstablished = false;
        this.errorHandler?.(error);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.isConnectionEstablished = false;
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        this.connectWebSocket();
      }, this.reconnectInterval);
    }
  }

  sendMessage(receiverId: string, content: string, type: MessageType) {
    if (this.isConnected()) {
      const message: WebSocketMessage = {
        type: 'SEND_MESSAGE',
        content,
        receiverId,
        messageType: type,
      };
      console.log('Sending WebSocket message:', message);
      this.ws!.send(JSON.stringify(message));
      return true;
    } else {
      console.error('WebSocket is not ready. Connection state:', {
        wsReadyState: this.ws?.readyState,
        isConnectionEstablished: this.isConnectionEstablished,
        wsOpen: this.ws?.readyState === WebSocket.OPEN
      });
      return false;
    }
  }

  onMessage(handler: (data: WebSocketMessage) => void) {
    this.messageHandler = handler;
  }

  onConnect(handler: () => void) {
    this.connectHandler = handler;
  }

  onDisconnect(handler: () => void) {
    this.disconnectHandler = handler;
  }

  onError(handler: (error: Event) => void) {
    this.errorHandler = handler;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.token = null;
    this.reconnectAttempts = 0;
    this.isConnectionEstablished = false;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this.isConnectionEstablished;
  }
}

const websocketService = new WebSocketService();
export default websocketService;