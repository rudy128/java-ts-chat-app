// User related types
export interface User {
  id: string;
  avatar: string;
  username: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  lastSeen?: string;
  isOnline?: boolean;
  online?: boolean; // Backend uses 'online' field
  createdAt?: string;
  updatedAt?: string;
  contacts?: any;
}

// Message related types - Updated to match backend response
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  chatId: string; // Added chatId from backend
  content: string;
  type: MessageType;
  timestamp: string; // Backend returns ISO string
  read: boolean;
  delivered: boolean; // Added delivered from backend
  edited?: boolean;
  editedAt?: string;
}

export const MessageType = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  FILE: 'FILE',
  VOICE: 'VOICE' // Keep VOICE as alias for AUDIO for backward compatibility
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];

// API DTOs
export interface AuthResponse {
  token: string;
  user: User;
  success: boolean;
  message?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface SendMessageRequest {
  receiverId: string;
  content: string;
  type: MessageType;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// WebSocket message types - Updated to match backend
export interface WebSocketMessage {
  type: 'NEW_MESSAGE' | 'MESSAGE_SENT' | 'CONNECTION_ESTABLISHED' | 'ERROR' | 'USER_ONLINE' | 'USER_OFFLINE' | 'TYPING' | 'SEND_MESSAGE';
  message?: Message;
  userId?: string;
  content?: string;
  receiverId?: string;
  messageType?: MessageType;
}

// Store types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, authToken: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export interface ChatState {
  messages: Record<string, Message[]>;
  activeChat: string | null;
  users: User[];
  onlineUsers: Set<string>;
  websocket: WebSocket | null;
  setActiveChat: (userId: string | null) => void;
  addMessage: (message: Message) => void;
  setMessages: (userId: string, messages: Message[]) => void;
  setUsers: (users: User[]) => void;
  setOnlineUsers: (onlineUsers: string[]) => void;
  updateUserOnlineStatus: (userId: string, isOnline: boolean) => void;
  setWebSocket: (ws: WebSocket | null) => void;
  loadChatHistory: (userId: string) => Promise<void>; // Added method for loading chat history
  clearChat: () => void;
}

// Component prop types
export interface SearchResult {
  users: User[];
  loading: boolean;
  error?: string;
}