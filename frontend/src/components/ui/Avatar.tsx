import React from 'react';
import { cn, getInitials, generateAvatarColor } from '../../utils';
import type { User } from '../../types';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showOnlineStatus?: boolean;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  user,
  size = 'md',
  showOnlineStatus = false,
  className
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const onlineIndicatorSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  const displayName = user.displayName || user.username;
  const initials = getInitials(displayName);
  const avatarColor = generateAvatarColor(user.id);

  return (
    <div className={cn('relative', className)}>
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={displayName}
          className={cn(
            'rounded-full object-cover',
            sizeClasses[size]
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center text-white font-semibold',
            sizeClasses[size],
            avatarColor
          )}
        >
          {initials}
        </div>
      )}
      
      {showOnlineStatus && (
        <div
          className={cn(
            'absolute -bottom-0 -right-0 rounded-full border-2 border-white',
            onlineIndicatorSizes[size],
            user.isOnline ? 'bg-green-400' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  );
};

export default Avatar;