import { create } from 'zustand';
import type { ChatState, Message, User } from '../types';
import { messageAPI } from '../services/api';

export const useChatStore = create<ChatState>((set, get) => ({
  messages: {},
  activeChat: null,
  users: [],
  onlineUsers: new Set(),
  websocket: null,

  setActiveChat: (userId: string | null) => {
    set({ activeChat: userId });
    // Load chat history when selecting a user
    if (userId) {
      get().loadChatHistory(userId);
    }
  },

  addMessage: (message: Message) => {
    const { messages } = get();
    
    // Determine the chat partner (the other user in the conversation)
    const currentUserId = JSON.parse(localStorage.getItem('userData') || '{}').id;
    const chatPartnerId = message.senderId === currentUserId ? message.receiverId : message.senderId;
    
    const chatMessages = messages[chatPartnerId] || [];
    
    // Avoid duplicate messages
    const existingMessage = chatMessages.find(m => m.id === message.id);
    if (!existingMessage) {
      const newMessages = [...chatMessages, message].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      set({
        messages: {
          ...messages,
          [chatPartnerId]: newMessages,
        },
      });
    }
  },

  setMessages: (userId: string, newMessages: Message[]) => {
    const { messages } = get();
    set({
      messages: {
        ...messages,
        [userId]: newMessages.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ),
      },
    });
  },

  loadChatHistory: async (userId: string) => {
    try {
      console.log('Loading chat history for user:', userId);
      const response = await messageAPI.getChatMessages(userId);
      const chatMessages = response.data;
      
      console.log('Loaded chat messages:', chatMessages.length);
      get().setMessages(userId, chatMessages);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  },

  setUsers: (users: User[]) => {
    // Update users and sync online status
    const updatedUsers = users.map(user => ({
      ...user,
      isOnline: user.online || false // Map backend 'online' field to 'isOnline'
    }));
    
    set({ users: updatedUsers });
    
    // Update online users set
    const onlineUserIds = updatedUsers.filter(user => user.isOnline).map(user => user.id);
    set({ onlineUsers: new Set(onlineUserIds) });
  },

  setOnlineUsers: (onlineUserIds: string[]) => {
    set({ onlineUsers: new Set(onlineUserIds) });
  },

  updateUserOnlineStatus: (userId: string, isOnline: boolean) => {
    const { onlineUsers, users } = get();
    const newOnlineUsers = new Set(onlineUsers);
    
    if (isOnline) {
      newOnlineUsers.add(userId);
    } else {
      newOnlineUsers.delete(userId);
    }
    
    // Update users array with new online status
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, isOnline } : user
    );
    
    set({ 
      onlineUsers: newOnlineUsers,
      users: updatedUsers 
    });
  },

  setWebSocket: (ws: WebSocket | null) => {
    set({ websocket: ws });
  },

  clearChat: () => {
    set({
      messages: {},
      activeChat: null,
      users: [],
      onlineUsers: new Set(),
      websocket: null,
    });
  },
}));