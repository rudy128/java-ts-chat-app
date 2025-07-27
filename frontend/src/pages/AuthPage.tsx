import React from 'react';
import { Toaster } from 'react-hot-toast';
import AuthForm from '../components/auth/AuthForm';

const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/20 via-transparent to-zinc-900/20"></div>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <AuthForm />
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f1f1f',
            color: '#ffffff',
            border: '1px solid #404040',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  );
};

export default AuthPage;