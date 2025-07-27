import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/chat/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import { useWebSocket } from '../hooks/useWebSocket';

const ChatPage: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { user, token } = useAuthStore();
  const { activeChat, setActiveChat, users } = useChatStore();
  const navigate = useNavigate();
  const { username } = useParams<{ username?: string }>();

  // Initialize WebSocket connection
  useWebSocket();

  useEffect(() => {
    if (!user || !token) {
      navigate('/auth');
      return;
    }
  }, [user, token, navigate]);

  // Handle URL parameter changes - find user by username and set as active chat
  useEffect(() => {
    if (username && users.length > 0) {
      // Find user by username from the URL parameter
      const targetUser = users.find(u => u.username === username);
      if (targetUser && targetUser.id !== activeChat) {
        setActiveChat(targetUser.id);
      } else if (!targetUser) {
        // Username not found, redirect to dashboard
        console.warn(`User with username "${username}" not found`);
        navigate('/chat');
      }
    } else if (!username && activeChat) {
      // Clear active chat when going back to dashboard
      setActiveChat(null);
    }
  }, [username, users, activeChat, setActiveChat, navigate]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On mobile, manage sidebar visibility based on URL
      if (mobile) {
        // Show sidebar on dashboard (/chat), hide on specific chat (/chat/:username)
        setShowSidebar(!username);
      } else {
        // On desktop, always show sidebar
        setShowSidebar(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [username]);

  const handleBackToSidebar = () => {
    // Navigate back to dashboard
    navigate('/chat');
  };

  const handleChatSelect = (selectedUser: any) => {
    // Navigate to specific chat URL using username
    navigate(`/chat/${selectedUser.username}`);
  };

  if (!user || !token) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-600 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // On mobile, show either sidebar (dashboard) or chat area (specific chat)
  const showChatArea = username && (!isMobile || !showSidebar);
  const shouldShowSidebar = showSidebar && (!isMobile || !username);

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden mobile-safe-area">
      {/* Main layout */}
      <div className="relative z-10 h-full flex">
        {/* Sidebar */}
        <div className={`
          ${isMobile 
            ? `fixed inset-y-0 left-0 z-50 w-full bg-black transform transition-transform duration-300 ease-in-out ${shouldShowSidebar ? 'translate-x-0' : '-translate-x-full'}`
            : `relative z-10 ${shouldShowSidebar ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden`
          }
        `}>
          <Sidebar 
            onSelectChat={handleChatSelect}
            isMobile={isMobile}
          />
        </div>

        {/* Chat Area */}
        <div className={`
          flex-1 h-full relative z-0
          ${!showChatArea ? 'hidden' : 'flex'}
        `}>
          {username ? (
            <ChatArea 
              onBackClick={isMobile ? handleBackToSidebar : undefined}
              isMobile={isMobile}
            />
          ) : (
            // Dashboard view when no specific chat is selected
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-zinc-400">
                <div className="w-24 h-24 mx-auto mb-6 opacity-50">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4l4 4 4-4h4a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Welcome to Chat</h3>
                <p className="text-sm">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile overlay when sidebar is open */}
        {isMobile && shouldShowSidebar && username && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleBackToSidebar}
          />
        )}
      </div>

      {/* Mobile floating action button for sidebar toggle when chat is active */}
      {isMobile && username && (
        <button
          onClick={handleBackToSidebar}
          className="fixed top-4 left-4 z-30 p-3 bg-zinc-800 border border-zinc-700 rounded-full shadow-lg hover:bg-zinc-700 transition-all duration-200"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Connection status indicator */}
      <div className="fixed bottom-4 right-4 z-20">
        <div className="flex items-center space-x-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-full shadow-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-zinc-300 text-xs font-medium">Online</span>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;