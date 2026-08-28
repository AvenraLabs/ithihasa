import React from 'react';
import { useAvatar } from '../../context/AvatarContext.js';

interface ProfileAvatarProps {
  size?: number | string;
  src?: string;
  className?: string;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  size = 64,
  src,
  className = '',
}) => {
  const { currentAvatar } = useAvatar();

  const effectiveSrc = src || currentAvatar || '/avatar/screen.png';
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      className={`relative inline-block shrink-0 select-none ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize,
        borderRadius: '50%',
        clipPath: 'circle(50% at 50% 50%)',
        WebkitClipPath: 'circle(50% at 50% 50%)',
        overflow: 'hidden',
      }}
    >
      <img
        src={effectiveSrc}
        alt="Client Profile Avatar"
        className="w-full h-full object-cover block"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          clipPath: 'circle(50% at 50% 50%)',
          WebkitClipPath: 'circle(50% at 50% 50%)',
        }}
        loading="eager"
      />
    </div>
  );
};
