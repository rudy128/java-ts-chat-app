import React, { useEffect, useRef, useState } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

interface VideoPlayerProps {
  src: string;
  type: string;
  originalName: string;
  size: number;
  poster?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, type, originalName, size, poster }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useNativePlayer, setUseNativePlayer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isSupportedFormat = (mimeType: string) => {
    const video = document.createElement('video');
    const canPlay = video.canPlayType(mimeType);
    return canPlay === 'probably' || canPlay === 'maybe';
  };

  const initializePlyr = () => {
    if (videoRef.current && !playerRef.current && !useNativePlayer) {
      try {
        playerRef.current = new Plyr(videoRef.current, {
          // Minimal controls - play, mute, fullscreen, progress, and time
          controls: [
            'play-large',    // Large play button in center
            'play',          // Play/pause button
            'progress',      // Seek/progress bar
            'current-time',  // Current time display
            'duration',      // Total duration display
            'mute',          // Mute/unmute button
            'fullscreen'     // Fullscreen button
          ],
          autopause: false,
          hideControls: true, // Auto-hide controls
          clickToPlay: true,
          disableContextMenu: false,
          fullscreen: {
            enabled: true,
            fallback: true,
            iosNative: false
          },
          // When in fullscreen, show more controls
          listeners: {
            fullscreenchange: (event: any) => {
              const isFullscreen = event.detail.plyr.fullscreen.active;
              if (isFullscreen) {
                // Add more controls when in fullscreen
                event.detail.plyr.elements.controls.innerHTML = '';
                const fullscreenControls = [
                  'play-large',
                  'restart',
                  'rewind',
                  'play',
                  'fast-forward',
                  'progress',
                  'current-time',
                  'duration',
                  'mute',
                  'volume',
                  'settings',
                  'fullscreen'
                ];
                // Update controls for fullscreen
                playerRef.current?.destroy();
                setTimeout(() => {
                  if (videoRef.current) {
                    playerRef.current = new Plyr(videoRef.current, {
                      controls: fullscreenControls,
                      settings: ['speed'],
                      speed: {
                        selected: 1,
                        options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
                      }
                    });
                  }
                }, 100);
              }
            }
          }
        });

        // Add event listeners
        playerRef.current.on('ready', () => {
          console.log('Plyr player is ready');
          setIsLoading(false);
        });

        playerRef.current.on('error', (event) => {
          console.error('Plyr error:', event);
          setError('Failed to load video with Plyr. Switching to native player...');
          setUseNativePlayer(true);
          setIsLoading(false);
        });

      } catch (error) {
        console.error('Failed to initialize Plyr:', error);
        setUseNativePlayer(true);
        setIsLoading(false);
      }
    }
  };

  const handleVideoError = () => {
    console.error('Video playback error');
    if (!isSupportedFormat(type)) {
      setError('This video format may not be supported by your browser. Try downloading the video to play it locally.');
    } else {
      setError('Failed to load video. Please try refreshing or downloading the file.');
    }
    setIsLoading(false);
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMenu(false);
  };

  const openInNewTab = () => {
    window.open(src, '_blank');
    setShowMenu(false);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showMenu) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMenu]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Check if the format is supported
    if (!isSupportedFormat(type)) {
      console.warn(`Video format ${type} may not be supported`);
      setError('This video format may not be supported. Click to open in a new tab or download.');
      setIsLoading(false);
      return;
    }

    // Try to initialize Plyr first
    const timer = setTimeout(() => {
      initializePlyr();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [src, type, useNativePlayer]);

  // If there's an error, show error state with options
  if (error) {
    return (
      <div className="relative max-w-xs">
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-center">
          <svg className="w-8 h-8 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-300 text-sm mb-3">{error}</p>
          <div className="flex space-x-2 justify-center">
            <button
              onClick={openInNewTab}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
            >
              Open in New Tab
            </button>
            <button
              onClick={handleDownload}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
            >
              Download
            </button>
          </div>
        </div>
        
        {/* Video Info */}
        <div className="mt-2 flex items-center justify-between text-white/70 text-sm">
          <div className="flex items-center space-x-2">
            <span>📹</span>
            <span className="truncate max-w-[200px]">{originalName}</span>
            <span>({formatFileSize(size)})</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-xs">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white mb-4"></div>
          <p className="text-white text-sm">Loading video...</p>
        </div>
      )}

      {/* Video Player */}
      <div className="rounded-xl overflow-hidden bg-black">
        {useNativePlayer ? (
          // Native HTML5 video player as fallback with minimal controls
          <video
            ref={videoRef}
            className="w-full h-auto"
            controls
            preload="metadata"
            playsInline
            crossOrigin="anonymous"
            poster={poster}
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
            onCanPlay={() => setIsLoading(false)}
            controlsList="nodownload noremoteplayback"
          >
            <source src={src} type={type} />
            Your browser does not support the video tag.
            <p className="text-white p-4">
              Your browser doesn't support this video format. 
              <a href={src} download={originalName} className="text-blue-400 hover:text-blue-300 underline ml-1">
                Download the video
              </a>
            </p>
          </video>
        ) : (
          // Plyr enhanced player with minimal controls
          <video
            ref={videoRef}
            className="w-full h-auto"
            crossOrigin="anonymous"
            playsInline
            poster={poster}
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
            onCanPlay={() => setIsLoading(false)}
          >
            <source src={src} type={type} />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      
      {/* Video Info and Menu */}
      <div className="mt-2 flex items-center justify-between text-white/70 text-sm">
        <div className="flex items-center space-x-2">
          <span>📹</span>
          <span className="truncate max-w-[160px]">{originalName}</span>
          <span>({formatFileSize(size)})</span>
        </div>
        
        {/* Three Dots Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMenu();
            }}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="More options"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
          
          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 bottom-full mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg min-w-[140px] z-50">
              <div className="py-1">
                <button
                  onClick={openInNewTab}
                  className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="text-sm">Open in New Tab</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm">Download</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Plyr Styles for Minimal Controls */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Minimal controls styling */
          .plyr {
            border-radius: 12px;
          }
          
          .plyr--video {
            background: #000;
          }
          
          /* Large play button in center */
          .plyr__control--overlaid {
            background: rgba(0, 0, 0, 0.8);
            border: 3px solid rgba(255, 255, 255, 0.9);
            border-radius: 50%;
            width: 60px;
            height: 60px;
          }
          
          .plyr__control--overlaid svg {
            width: 24px;
            height: 24px;
          }
          
          /* Bottom controls bar - minimal */
          .plyr__controls {
            background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.9) 100%);
            padding: 8px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          /* Hide controls initially, show on hover */
          .plyr:not(.plyr--playing) .plyr__controls,
          .plyr:hover .plyr__controls {
            opacity: 1;
            transform: translateY(0);
          }
          
          .plyr__controls {
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
          }
          
          /* Style the minimal controls */
          .plyr__control {
            color: white;
            background: none;
            border: none;
            padding: 8px;
            margin: 0 4px;
            border-radius: 4px;
            transition: background-color 0.2s ease;
          }
          
          .plyr__control:hover {
            background: rgba(255, 255, 255, 0.2);
          }
          
          .plyr__control svg {
            width: 18px;
            height: 18px;
          }
          
          /* Show progress bar and time display in minimal view */
          .plyr__progress,
          .plyr__time {
            display: block;
          }
          
          /* Style time displays */
          .plyr__time {
            color: white;
            font-size: 12px;
            line-height: 1;
            margin: 0 4px;
          }
          
          /* Only show minimal controls outside fullscreen */
          .plyr:not(.plyr--fullscreen-active) .plyr__control:not([data-plyr="play"]):not([data-plyr="mute"]):not([data-plyr="fullscreen"]) {
            display: none;
          }
          
          /* In fullscreen, show all controls */
          .plyr--fullscreen-active .plyr__controls {
            opacity: 1;
            padding: 16px 20px;
          }
          
          .plyr--fullscreen-active .plyr__control {
            display: inline-flex;
          }
          
          .plyr--fullscreen-active .plyr__progress,
          .plyr--fullscreen-active .plyr__time {
            display: block;
          }
        `
      }} />
    </div>
  );
};

export default VideoPlayer;