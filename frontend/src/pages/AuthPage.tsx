import React from 'react';
import AuthForm from '../components/auth/AuthForm';

const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-1/2 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse delay-700"></div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header section */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-8">
            {/* App logo/icon */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl backdrop-blur-lg border border-white/20">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
              ChatFlow
            </h1>
            <p className="text-white/70 text-lg font-medium">
              Connect • Chat • Collaborate
            </p>
            <p className="mt-3 text-white/50 text-sm max-w-sm mx-auto">
              Experience seamless communication with our modern, secure messaging platform
            </p>
          </div>
        </div>

        {/* Auth form container */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="backdrop-blur-2xl bg-white/10 py-8 px-6 shadow-2xl rounded-3xl border border-white/20 relative overflow-hidden">
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
            
            {/* Form content */}
            <div className="relative z-10">
              <AuthForm />
            </div>
          </div>
          
          {/* Footer text */}
          <div className="mt-6 text-center">
            <p className="text-white/40 text-xs">
              Built with ❤️ for seamless communication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;