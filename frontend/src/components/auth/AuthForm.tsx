import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { authAPI } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';

const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login } = useAuthStore();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 4) {
      newErrors.username = 'Username must be more than 4 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation for signup
    if (isSignUp && !formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (isSignUp && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Display name validation for signup
    if (isSignUp && !formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Show validation errors as toast
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    setIsLoading(true);

    try {
      const response = isSignUp 
        ? await authAPI.register({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            displayName: formData.displayName
          })
        : await authAPI.login({
            username: formData.username,
            password: formData.password
          });

      if (response.data.success) {
        login(response.data.user, response.data.token);
        toast.success(isSignUp ? 'Account created successfully! Welcome!' : 'Welcome back!');
      } else {
        toast.error(response.data.message || 'Authentication failed');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Handle specific error responses
      if (error.response?.status === 400) {
        if (isSignUp) {
          // Handle signup errors
          const errorMessage = error.response.data?.message || 'Registration failed';
          if (errorMessage.toLowerCase().includes('username')) {
            toast.error('Username already exists or is invalid');
          } else if (errorMessage.toLowerCase().includes('email')) {
            toast.error('Email already exists or is invalid');
          } else {
            toast.error('Registration failed. Please check your details.');
          }
        } else {
          // Handle login errors - 400 typically means wrong credentials
          toast.error('Wrong username or password');
        }
      } else if (error.response?.status === 401) {
        toast.error('Wrong username or password');
      } else if (error.response?.status === 409) {
        toast.error('Username or email already exists');
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(isSignUp ? 'Registration failed. Please try again.' : 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      username: '',
      email: '',
      password: '',
      displayName: '',
    });
    setErrors({});
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-zinc-400">
          {isSignUp 
            ? 'Join our community and start chatting' 
            : 'Sign in to continue to your account'
          }
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-zinc-300 mb-2">
            Username *
          </label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleInputChange}
            className={`w-full ${errors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            disabled={isLoading}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-400">{errors.username}</p>
          )}
          {isSignUp && !errors.username && formData.username && formData.username.length >= 4 && (
            <p className="mt-1 text-sm text-green-400">✓ Username looks good</p>
          )}
        </div>

        {/* Email (signup only) */}
        {isSignUp && (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
              Email Address *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>
        )}

        {/* Display Name (signup only) */}
        {isSignUp && (
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-zinc-300 mb-2">
              Display Name *
            </label>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              placeholder="How others will see you"
              value={formData.displayName}
              onChange={handleInputChange}
              className={`w-full ${errors.displayName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              disabled={isLoading}
            />
            {errors.displayName && (
              <p className="mt-1 text-sm text-red-400">{errors.displayName}</p>
            )}
          </div>
        )}

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
            Password *
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">{errors.password}</p>
          )}
          {!isSignUp && (
            <div className="mt-2 text-right">
              <button
                type="button"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
              <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
            </div>
          ) : (
            isSignUp ? 'Create Account' : 'Sign In'
          )}
        </Button>

        {/* Mode Toggle */}
        <div className="text-center pt-4 border-t border-zinc-800">
          <p className="text-zinc-400 mb-3">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button
            type="button"
            onClick={toggleMode}
            disabled={isLoading}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors disabled:opacity-50"
          >
            {isSignUp ? 'Sign in instead' : 'Create account'}
          </button>
        </div>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-zinc-500">
          By continuing, you agree to our{' '}
          <button className="text-blue-400 hover:text-blue-300 transition-colors">
            Terms of Service
          </button>{' '}
          and{' '}
          <button className="text-blue-400 hover:text-blue-300 transition-colors">
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;