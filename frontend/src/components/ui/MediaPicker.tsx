import React, { useRef, useState } from 'react';
import { fileAPI } from '../../services/api';
import { MessageType } from '../../types';

interface MediaPickerProps {
  onMediaSelect: (content: string, type: MessageType) => void;
  onClose: () => void;
  isOpen: boolean;
}

const MediaPicker: React.FC<MediaPickerProps> = ({ onMediaSelect, onClose, isOpen }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File, mediaType: string) => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await fileAPI.uploadFile(file, mediaType);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create message content with file info
      const fileInfo = {
        filename: response.data.filename,
        originalName: response.data.originalName,
        url: response.data.url,
        size: response.data.size,
        type: response.data.type
      };

      // For media files, we'll send the file URL as content
      const messageType = mediaType.toUpperCase() as MessageType;
      onMediaSelect(JSON.stringify(fileInfo), messageType);
      
      onClose();
    } catch (error) {
      console.error('File upload failed:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleImageSelect = () => imageInputRef.current?.click();
  const handleVideoSelect = () => videoInputRef.current?.click();
  const handleAudioSelect = () => audioInputRef.current?.click();
  const handleFileSelect = () => fileInputRef.current?.click();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Media Picker Modal */}
      <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl">
          {uploading ? (
            // Upload Progress
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${uploadProgress * 1.75} 175.84`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{uploadProgress}%</span>
                </div>
              </div>
              <p className="text-white/70 text-sm">Uploading...</p>
            </div>
          ) : (
            <>
              <h3 className="text-white font-semibold text-lg mb-4 text-center">Send Media</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Photo Button */}
                <button
                  onClick={handleImageSelect}
                  className="flex flex-col items-center p-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-2xl transition-all duration-300 group"
                >
                  <div className="w-12 h-12 mb-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-white/70 text-sm font-medium">Photo</span>
                </button>

                {/* Video Button */}
                <button
                  onClick={handleVideoSelect}
                  className="flex flex-col items-center p-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-2xl transition-all duration-300 group"
                >
                  <div className="w-12 h-12 mb-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-white/70 text-sm font-medium">Video</span>
                </button>

                {/* Audio Button */}
                <button
                  onClick={handleAudioSelect}
                  className="flex flex-col items-center p-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-2xl transition-all duration-300 group"
                >
                  <div className="w-12 h-12 mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <span className="text-white/70 text-sm font-medium">Audio</span>
                </button>

                {/* File Button */}
                <button
                  onClick={handleFileSelect}
                  className="flex flex-col items-center p-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-2xl transition-all duration-300 group"
                >
                  <div className="w-12 h-12 mb-2 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-white/70 text-sm font-medium">File</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full mt-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white/70 hover:text-white transition-all duration-300"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, 'IMAGE');
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, 'VIDEO');
        }}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, 'AUDIO');
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, 'FILE');
        }}
      />
    </>
  );
};

export default MediaPicker;