import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type {
  User,
  Message,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  SendMessageRequest
} from '../types';

// Configure axios with base URL
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: LoginRequest): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/login', data),
  
  register: (data: RegisterRequest): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/register', data),
  
  logout: (): Promise<AxiosResponse<void>> =>
    api.post('/auth/logout'),
  
  getCurrentUser: (): Promise<AxiosResponse<User>> =>
    api.get('/auth/me'),
};

// User API
export const userAPI = {
  getUsers: (): Promise<AxiosResponse<User[]>> =>
    api.get('/users'),
  
  searchUsers: (query: string): Promise<AxiosResponse<User[]>> =>
    api.get(`/users/search?q=${encodeURIComponent(query)}`),
  
  getUserById: (id: string): Promise<AxiosResponse<User>> =>
    api.get(`/users/${id}`),
  
  updateProfile: (data: Partial<User>): Promise<AxiosResponse<User>> =>
    api.put('/users/profile', data),
};

// Message API
export const messageAPI = {
  getChatMessages: (userId: string, page = 0, size = 50): Promise<AxiosResponse<Message[]>> =>
    api.get(`/messages/chat/${userId}?page=${page}&size=${size}`),
  
  sendMessage: (data: SendMessageRequest): Promise<AxiosResponse<Message>> =>
    api.post('/messages/send', data),
  
  markAsRead: (messageId: string): Promise<AxiosResponse<void>> =>
    api.put(`/messages/${messageId}/read`),
  
  deleteMessage: (messageId: string): Promise<AxiosResponse<void>> =>
    api.delete(`/messages/${messageId}`),
  
  editMessage: (messageId: string, content: string): Promise<AxiosResponse<Message>> =>
    api.put(`/messages/${messageId}`, { content }),
};

// File upload API
export const fileAPI = {
  uploadFile: (file: File, type: string): Promise<AxiosResponse<any>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getFileUrl: (filename: string): string => {
    return `${API_BASE_URL}/files/${filename}`;
  },
};

export default api;