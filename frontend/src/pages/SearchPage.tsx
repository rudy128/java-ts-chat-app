import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { userAPI } from '../services/api';
import type { User } from '../types';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Load search results based on URL parameter
  useEffect(() => {
    const query = searchParams.get('q');
    if (query && query !== searchQuery) {
      setSearchQuery(query);
      performSearch(query);
    } else if (!query) {
      // Clear results if no query parameter
      setSearchResults([]);
      setSearchQuery('');
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await userAPI.searchUsers(query);
      setSearchResults(response.data.filter((u: User) => u.id !== user?.id));
    } catch (err) {
      setError('Failed to search users');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Update URL with search query
      setSearchParams({ q: searchQuery.trim() });
    } else {
      // Clear URL parameters
      setSearchParams({});
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // If input is cleared, clear URL parameters immediately
    if (!value.trim()) {
      setSearchParams({});
    }
  };

  const handleUserSelect = async (selectedUser: User) => {
    try {
      // Navigate to the specific chat using username
      navigate(`/chat/${selectedUser.username}`);
    } catch (err) {
      setError('Failed to start chat');
    }
  };

  const handleBackToChat = () => {
    navigate('/chat');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchParams({});
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden mobile-safe-area">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-1/2 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-lg border-b border-white/10">
          <button
            onClick={handleBackToChat}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors duration-200"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-white">Search Users</h1>
          <div className="w-10"></div>
        </div>

        {/* Search form */}
        <div className="p-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search by username or display name..."
                className="w-full pl-12 pr-16 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 text-white/50 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                disabled={!searchQuery.trim() || loading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-white/20 rounded-xl transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
            </div>
          </form>
          
          {/* Search status */}
          {loading && (
            <div className="mt-3 text-center text-white/60 text-sm">
              Searching for users...
            </div>
          )}
          
          {searchParams.get('q') && !loading && (
            <div className="mt-3 text-white/60 text-sm">
              {searchResults.length === 0 ? (
                error ? (
                  <span className="text-red-300">{error}</span>
                ) : (
                  `No users found for "${searchParams.get('q')}"`
                )
              ) : (
                `Found ${searchResults.length} user${searchResults.length !== 1 ? 's' : ''} for "${searchParams.get('q')}"`
              )}
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {!searchParams.get('q') && !loading && (
            <div className="text-center text-white/50 mt-20">
              <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-white/70 mb-2">Search for users</h3>
              <p className="text-white/50">Enter a username or display name to start searching</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((resultUser) => (
                <button
                  key={resultUser.id}
                  onClick={() => handleUserSelect(resultUser)}
                  className="w-full p-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-left group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {resultUser.displayName?.[0]?.toUpperCase() || resultUser.username[0].toUpperCase()}
                        </span>
                      </div>
                      {(resultUser.isOnline || resultUser.online) && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white group-hover:text-blue-300 transition-colors truncate">
                        {resultUser.displayName || resultUser.username}
                      </h4>
                      <p className="text-sm text-white/60 truncate">@{resultUser.username}</p>
                    </div>
                    <svg className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;