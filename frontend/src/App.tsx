import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useWebSocket } from './hooks/useWebSocket';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import SearchPage from './pages/SearchPage';

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  // Initialize WebSocket connection for authenticated users
  useWebSocket();

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/auth"
            element={!isAuthenticated ? <AuthPage /> : <Navigate to="/chat" replace />}
          />
          
          {/* Chat routes - all require authentication */}
          <Route
            path="/chat"
            element={isAuthenticated ? <ChatPage /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/chat/:username"
            element={isAuthenticated ? <ChatPage /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/search"
            element={isAuthenticated ? <SearchPage /> : <Navigate to="/auth" replace />}
          />
          
          {/* Default redirect */}
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? "/chat" : "/auth"} replace />}
          />
          
          {/* Catch all - redirect to appropriate page */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/chat" : "/auth"} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
