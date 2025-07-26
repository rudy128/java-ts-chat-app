import React, { useState, useEffect, useCallback } from 'react';
import Avatar from '../ui/Avatar';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { userAPI } from '../../services/api';
import { formatTime } from '../../utils';
import type { User } from '../../types';

interface SidebarProps {
  onSelectChat?: (user: User) => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectChat, isMobile }) => {
  const { user, logout } = useAuthStore();
  const { 
    users, 
    activeChat, 
    setActiveChat, 
    setUsers, 
    onlineUsers, 
    messages 
  } = useChatStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Debounce search to avoid excessive API calls
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const response = await userAPI.getUsers();
      const allUsers = response.data.filter(u => u.id !== user?.id);
      console.log('Fetched users:', allUsers);
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setIsSearchMode(false);
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setIsSearchMode(true);

    try {
      // First check if user exists in current users list
      const localResults = users.filter(u =>
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(query.toLowerCase())
      );

      if (localResults.length > 0) {
        setSearchResults(localResults);
        setSearching(false);
        return;
      }

      // If not found locally, query the API for fresh data
      console.log('Searching API for:', query);
      const response = await userAPI.searchUsers(query);
      const apiResults = response.data.filter(u => u.id !== user?.id);
      
      setSearchResults(apiResults);
      
      // If API returns results, update the main users list with new data
      if (apiResults.length > 0) {
        // Merge new results with existing users, avoiding duplicates
        const existingIds = new Set(users.map(u => u.id));
        const newUsers = apiResults.filter(u => !existingIds.has(u.id));
        if (newUsers.length > 0) {
          setUsers([...users, ...newUsers]);
        }
      }
      
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => searchUsers(query), 300),
    [users, user?.id]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      debouncedSearch(query);
    } else {
      setIsSearchMode(false);
      setSearchResults([]);
      setSearching(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    // Find the user to get their username for navigation
    const selectedUser = users.find(u => u.id === userId) || searchResults.find(u => u.id === userId);
    
    if (selectedUser) {
      setActiveChat(userId);
      // Navigate to the specific chat using username
      if (typeof onSelectChat === 'function') {
        onSelectChat(selectedUser); // Pass the full user object
      }
    }
  };

  // Determine which users to display - only show users with message history
  const getUsersWithMessages = () => {
    return users.filter(user => {
      const userMessages = messages[user.id];
      return userMessages && userMessages.length > 0;
    });
  };

  const displayUsers = isSearchMode ? searchResults : getUsersWithMessages();
  const showNoResults = isSearchMode && !searching && searchResults.length === 0;

  const getLastMessage = (userId: string) => {
    const userMessages = messages[userId] || [];
    return userMessages[userMessages.length - 1];
  };

  const getMediaPreview = (message: any) => {
    if (!message) return null;
    
    switch (message.type) {
      case 'IMAGE':
        return {
          icon: '🖼️',
          text: 'Photo'
        };
      case 'VIDEO':
        return {
          icon: '🎥',
          text: 'Video'
        };
      case 'AUDIO':
        return {
          icon: '🎵',
          text: 'Audio'
        };
      case 'DOCUMENT':
        return {
          icon: '📄',
          text: 'Document'
        };
      case 'FILE':
        return {
          icon: '📎',
          text: 'File'
        };
      default:
        return null;
    }
  };

  const getUnreadCount = (userId: string) => {
    const userMessages = messages[userId] || [];
    return userMessages.filter(msg => msg.senderId === userId && !msg.read).length;
  };

  const handleLogout = () => {
    logout();
  };

  const ContactItem: React.FC<{ user: User; isActive: boolean; onClick: () => void }> = ({ 
    user, 
    isActive, 
    onClick 
  }) => {
    const lastMessage = getLastMessage(user.id);
    const unreadCount = getUnreadCount(user.id);
    const isOnline = user.isOnline || user.online || onlineUsers.has(user.id);

    return (
      <button
        onClick={onClick}
        className={`w-full p-4 text-left rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
          isActive
            ? 'bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl'
            : 'hover:bg-white/10 backdrop-blur-sm'
        } group`}
      >
        <div className="flex items-center space-x-3">
          <div className="relative flex-shrink-0">
            <Avatar user={user} size={isMobile ? "md" : "lg"} />
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-lg animate-pulse"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-white truncate group-hover:text-blue-200 transition-colors">
                {user.displayName || user.username}
              </h3>
              <div className="flex items-center space-x-2">
                {lastMessage && (
                  <span className="text-xs text-white/60">
                    {formatTime(lastMessage.timestamp)}
                  </span>
                )}
                {unreadCount > 0 && (
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-medium shadow-lg">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className={`text-sm truncate transition-colors ${
                lastMessage ? 'text-white/70 group-hover:text-white/90' : 'text-white/50'
              }`}>
                {lastMessage ? (
                  <>
                    {lastMessage.senderId !== user?.id ? '' : 'You: '}
                    {(() => {
                      const mediaPreview = getMediaPreview(lastMessage);
                      if (mediaPreview) {
                        return (
                          <span className="flex items-center space-x-1">
                            <span>{mediaPreview.icon}</span>
                            <span>{mediaPreview.text}</span>
                          </span>
                        );
                      }
                      return lastMessage.content;
                    })()}
                  </>
                ) : (
                  'No messages yet'
                )}
              </p>
              <div className="flex items-center space-x-1 ml-2">
                {isOnline && (
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className={`${isMobile ? 'w-full' : 'w-80'} h-full backdrop-blur-2xl bg-white/10 border-r border-white/20 flex flex-col`}>
      {/* Header with glassy effect */}
      <div className="p-4 border-b border-white/20 backdrop-blur-lg bg-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {user && (
              <div className="relative">
                <Avatar user={user} size={isMobile ? "md" : "lg"} />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-lg animate-pulse"></div>
              </div>
            )}
            <div>
              <h2 className="font-bold text-white text-lg">
                {user?.displayName || user?.username}
              </h2>
              <p className="text-sm text-green-300 font-medium flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Online
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-3 text-white/70 hover:text-white rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 group"
            title="Logout"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        {/* Modern Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="search"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
            </div>
          )}
        </div>
        
        {/* Search status */}
        {isSearchMode && (
          <div className="mt-2 text-xs text-white/60 px-1">
            {searching ? 'Searching...' : `Found ${searchResults.length} user${searchResults.length !== 1 ? 's' : ''}`}
          </div>
        )}
      </div>

      {/* Users List with custom scrollbar */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30">
        {loading ? (
          <div className="p-6 text-center text-white/70">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white"></div>
              <span className="font-medium">Loading conversations...</span>
            </div>
          </div>
        ) : showNoResults ? (
          <div className="p-6 text-center text-white/70">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2">No users found</h3>
            <p className="text-sm text-white/50">Try searching with a different keyword</p>
          </div>
        ) : displayUsers.length === 0 ? (
          <div className="p-6 text-center text-white/70">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2">No conversations yet</h3>
            <p className="text-sm text-white/50">Start chatting with someone to see them here</p>
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {displayUsers
              .sort((a, b) => {
                // Sort by: online status first, then by last message time, then by username
                const aOnline = a.isOnline || a.online || onlineUsers.has(a.id);
                const bOnline = b.isOnline || b.online || onlineUsers.has(b.id);
                
                if (aOnline !== bOnline) {
                  return bOnline ? 1 : -1; // Online first
                }
                
                const aLastMsg = getLastMessage(a.id);
                const bLastMsg = getLastMessage(b.id);
                
                if (aLastMsg && bLastMsg) {
                  return new Date(bLastMsg.timestamp).getTime() - new Date(aLastMsg.timestamp).getTime();
                }
                
                if (aLastMsg && !bLastMsg) return -1;
                if (!aLastMsg && bLastMsg) return 1;
                
                return (a.displayName || a.username).localeCompare(b.displayName || b.username);
              })
              .map((user) => (
                <ContactItem
                  key={user.id}
                  user={user}
                  isActive={activeChat === user.id}
                  onClick={() => handleUserSelect(user.id)}
                />
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;