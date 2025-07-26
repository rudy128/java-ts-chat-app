import React, { useState } from 'react';
import { MessageType } from '../../types';
import VideoPlayer from './VideoPlayer';

interface MediaMessageProps {
  content: string;
  type: MessageType;
}

interface FileInfo {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  type: string;
}

const MediaMessage: React.FC<MediaMessageProps> = ({ content, type }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Parse file info from content
  let fileInfo: FileInfo | null = null;
  try {
    fileInfo = JSON.parse(content);
  } catch {
    // If parsing fails, treat as plain text
    return <p className="break-words leading-relaxed">{content}</p>;
  }

  if (!fileInfo) {
    return <p className="break-words leading-relaxed">{content}</p>;
  }

  const fullUrl = `http://localhost:8080${fileInfo.url}`;
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = fileInfo.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMediaContent = () => {
    switch (type) {
      case MessageType.IMAGE:
        return (
          <div className="relative max-w-xs">
            {!imageLoaded && !imageError && (
              <div className="w-full h-48 bg-white/10 rounded-xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white"></div>
              </div>
            )}
            {imageError ? (
              <div className="w-full h-48 bg-white/10 rounded-xl flex flex-col items-center justify-center">
                <svg className="w-8 h-8 text-white/50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-white/50 text-sm">Failed to load image</p>
              </div>
            ) : (
              <img
                src={fullUrl}
                alt={fileInfo.originalName}
                className={`max-w-full h-auto rounded-xl transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                onClick={() => window.open(fullUrl, '_blank')}
                style={{ cursor: 'pointer' }}
              />
            )}
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
              <span className="text-white text-xs">{formatFileSize(fileInfo.size)}</span>
            </div>
          </div>
        );

      case MessageType.VIDEO:
        return (
          <VideoPlayer
            src={fullUrl}
            type={fileInfo.type}
            originalName={fileInfo.originalName}
            size={fileInfo.size}
          />
        );

      case MessageType.AUDIO:
      case MessageType.VOICE:
        return (
          <div className="flex items-center space-x-3 bg-white/10 rounded-xl p-3 max-w-xs">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <audio controls className="w-full">
                <source src={fullUrl} type={fileInfo.type} />
                Your browser does not support the audio element.
              </audio>
              <div className="text-white/70 text-xs mt-1 truncate">
                {fileInfo.originalName} ({formatFileSize(fileInfo.size)})
              </div>
            </div>
          </div>
        );

      case MessageType.FILE:
        return (
          <div
            onClick={handleDownload}
            className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 rounded-xl p-3 max-w-xs cursor-pointer transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm truncate">
                {fileInfo.originalName}
              </div>
              <div className="text-white/70 text-xs">
                {formatFileSize(fileInfo.size)}
              </div>
            </div>
            <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );

      default:
        return <p className="break-words leading-relaxed">{content}</p>;
    }
  };

  return <div>{renderMediaContent()}</div>;
};

export default MediaMessage;