import React, { useState, useRef, useEffect } from 'react';
import Avatar from '../ui/Avatar';
import MediaPicker from '../ui/MediaPicker';
import MediaMessage from '../ui/MediaMessage';
import EmojiPicker from '../ui/EmojiPicker';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { formatTime } from '../../utils';
import { MessageType } from '../../types';
import type { Message } from '../../types';

interface ChatAreaProps {
  onBackClick?: () => void;
  isMobile: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ onBackClick, isMobile }) => {
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);  
  const [isTyping, setIsTyping] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages, activeChat, users } = useChatStore();
  const { user } = useAuthStore();
  const { sendMessage, isConnected } = useWebSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-focus input on desktop
    if (!isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeChat, isMobile]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && activeChat && user) {
      console.log('Attempting to send message. Connection state:', isConnected);
      
      if (!isConnected) {
        console.error('Cannot send message - WebSocket not connected');
        return;
      }
      
      setIsLoading(true);
      try {
        const success = await sendMessage(activeChat, messageInput.trim(), MessageType.TEXT);
        if (success) {
          setMessageInput('');
        } else {
          console.error('Failed to send message');
        }
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleMediaSelect = async (content: string, type: MessageType) => {
    if (activeChat && user && isConnected) {
      setIsLoading(true);
      try {
        const success = await sendMessage(activeChat, content, type);
        if (!success) {
          console.error('Failed to send media message');
        }
      } catch (error) {
        console.error('Error sending media message:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    
    // Simple typing indicator logic
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  if (!activeChat) {
    return (
      <div className="flex-1 h-full backdrop-blur-2xl bg-white/5 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-lg border border-white/20 flex items-center justify-center">
              <svg className="w-16 h-16 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to Your Chat</h2>
          <p className="text-white/70 text-lg mb-2">
            Select a conversation to start messaging
          </p>
          <p className="text-white/50 text-sm">
            Choose someone from the sidebar to begin chatting
          </p>
        </div>
      </div>
    );
  }

  // Find the selected user
  const selectedUser = users.find((u) => u.id === activeChat);
  if (!selectedUser) {
    return (
      <div className="flex-1 h-full backdrop-blur-2xl bg-white/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 backdrop-blur-lg border border-red-500/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-white/70 font-medium">User not found</p>
          <p className="text-white/50 text-sm mt-1">This user may no longer exist</p>
        </div>
      </div>
    );
  }

  // Get messages for the active chat
  const conversationMessages = messages[activeChat] || [];

  return (
    <div className="flex-1 h-full backdrop-blur-2xl bg-white/5 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/20 backdrop-blur-lg bg-white/10 flex items-center space-x-3 shadow-lg">
        {/* Mobile back button */}
        {isMobile && onBackClick && (
          <button
            onClick={onBackClick}
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 mr-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div className="relative">
          <Avatar user={selectedUser} size={isMobile ? "md" : "lg"} />
          {(selectedUser.isOnline || selectedUser.online) && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-lg animate-pulse"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg truncate">
            {selectedUser.displayName || selectedUser.username}
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${(selectedUser.isOnline || selectedUser.online) ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            <p className="text-sm text-white/70">
              {(selectedUser.isOnline || selectedUser.online) ? 'Online' : selectedUser.lastSeen ? `Last seen ${formatTime(selectedUser.lastSeen)}` : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Connection status */}
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
            isConnected ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>

          {/* More options button */}
          <button className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30">
        {conversationMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-sm mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-lg border border-white/20 flex items-center justify-center">
                <svg className="w-12 h-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 8h10M7 12h10M7 16h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No messages yet</h3>
              <p className="text-white/60 mb-4">Start the conversation by sending a message!</p>
              <div className="text-white/40 text-sm">
                Say hello to {selectedUser.displayName || selectedUser.username} 👋
              </div>
            </div>
          </div>
        ) : (
          conversationMessages.map((message: Message, index) => {
            const isOwnMessage = message.senderId === user?.id;
            const showAvatar = !isOwnMessage && (index === 0 || conversationMessages[index - 1]?.senderId !== message.senderId);
            const showTimestamp = index === 0 || 
              new Date(message.timestamp).getTime() - new Date(conversationMessages[index - 1]?.timestamp).getTime() > 5 * 60 * 1000; // 5 minutes
            
            return (
              <div key={message.id} className="space-y-2">
                {/* Timestamp separator */}
                {showTimestamp && (
                  <div className="flex justify-center">
                    <span className="text-xs text-white/40 bg-white/10 backdrop-blur-lg px-3 py-1 rounded-full border border-white/20">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                )}

                <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'}`}>
                  {!isOwnMessage && showAvatar && (
                    <div className="mr-3 flex-shrink-0">
                      <Avatar user={selectedUser} size="sm" />
                    </div>
                  )}
                  {!isOwnMessage && !showAvatar && (
                    <div className="w-8 mr-3 flex-shrink-0" />
                  )}
                  
                  <div className={`group max-w-xs lg:max-w-md ${isOwnMessage ? 'ml-12' : 'mr-12'}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl rounded-br-md backdrop-blur-lg'
                          : 'bg-white/20 text-white border border-white/30 rounded-bl-md shadow-lg hover:shadow-xl backdrop-blur-lg'
                      }`}
                    >
                      {message.type === MessageType.TEXT ? (
                        <p className="break-words leading-relaxed">{message.content}</p>
                      ) : (
                        <MediaMessage 
                          content={message.content}
                          type={message.type}
                        />
                      )}
                    </div>
                    
                    <div className={`flex items-center mt-1 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <p className="text-xs text-white/50">
                        {formatTime(message.timestamp)}
                      </p>
                      {isOwnMessage && (
                        <div className="flex items-center space-x-1">
                          <span className={`text-xs ${message.delivered ? 'text-blue-300' : 'text-white/40'}`}>
                            {message.delivered ? '✓✓' : '✓'}
                          </span>
                          {message.read && (
                            <span className="text-xs text-blue-300" title="Read">
                              👁
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-white/20 backdrop-blur-lg bg-white/10">
        <form onSubmit={handleSendMessage} className="space-y-3">
          <div className="flex items-end space-x-3">
            {/* Attachment button */}
            <button
              type="button"
              className="p-3 text-white/70 hover:text-white rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 group"
              title="Attach file"
              onClick={() => setShowMediaPicker(!showMediaPicker)}
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            {/* Message input */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                placeholder={isConnected ? "Type your message..." : "Connecting..."}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 pr-20"
                disabled={!isConnected || isLoading}
              />
              
              {/* Emoji button */}
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-white/50 hover:text-white transition-colors"
                title="Add emoji"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Emoji Picker */}
              <EmojiPicker
                isOpen={showEmojiPicker}
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={!messageInput.trim() || !isConnected || isLoading}
              className={`p-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                messageInput.trim() && isConnected && !isLoading
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-white/10 text-white/40 backdrop-blur-sm'
              }`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>

          {/* Media Picker */}
          <MediaPicker
            isOpen={showMediaPicker}
            onMediaSelect={handleMediaSelect}
            onClose={() => setShowMediaPicker(false)}
          />

          {/* Connection warning */}
          {!isConnected && (
            <div className="flex items-center space-x-2 text-xs text-red-300 bg-red-500/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-red-500/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>Connection lost. Trying to reconnect...</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatArea;