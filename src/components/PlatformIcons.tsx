import React from 'react';
import { PlatformSource } from '../types';

export const PlatformBrandIcon: React.FC<{
  platform: PlatformSource;
  size?: number;
}> = ({ platform, size = 14 }) => {
  switch (platform) {
    case 'YouTube':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="1" y="2.8" width="14" height="10.4" rx="3" fill="#FF0000" />
          <path d="M6.6 5.6L10.8 8L6.6 10.4V5.6Z" fill="#FFFFFF" />
        </svg>
      );

    case 'TikTok':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="14" height="14" rx="3.5" fill="#141619" />
          <path
            d="M9.7 3.8C10 4.8 10.8 5.5 11.8 5.7V7.3C10.9 7.2 10.2 6.9 9.7 6.5V9.8C9.7 11.4 8.4 12.6 6.8 12.6C5.2 12.6 4 11.4 4 9.8C4 8.2 5.2 7 6.8 7C7.1 7 7.3 7 7.5 7.1V8.7C7.3 8.6 7.1 8.6 6.8 8.6C6.1 8.6 5.6 9.1 5.6 9.8C5.6 10.5 6.1 11 6.8 11C7.6 11 8.1 10.5 8.1 9.6V3.8H9.7Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'Instagram':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="1.2" y="1.2" width="13.6" height="13.6" rx="4" fill="#E1306C" />
          <rect x="3.8" y="3.8" width="8.4" height="8.4" rx="2.4" stroke="#FFFFFF" strokeWidth="1.2" />
          <circle cx="8" cy="8" r="1.9" stroke="#FFFFFF" strokeWidth="1.2" />
          <circle cx="10.4" cy="5.5" r="0.7" fill="#FFFFFF" />
        </svg>
      );

    case 'Facebook':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="7" fill="#1877F2" />
          <path
            d="M9.3 8.6H10.8L11.1 6.8H9.3V5.7C9.3 5.2 9.5 4.8 10.3 4.8H11.2V3.2C10.9 3.1 10.3 3.1 9.7 3.1C8.2 3.1 7.3 4 7.3 5.5V6.8H5.8V8.6H7.3V13.8H9.3V8.6Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'Reddit':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="7" fill="#FF4500" />
          <circle cx="8" cy="9" r="3.6" fill="#FFFFFF" />
          <circle cx="6.7" cy="8.7" r="0.65" fill="#FF4500" />
          <circle cx="9.3" cy="8.7" r="0.65" fill="#FF4500" />
          <path d="M6.6 10.3C7.1 10.8 8.9 10.8 9.4 10.3" stroke="#FF4500" strokeWidth="0.9" strokeLinecap="round" />
          <path d="M8 5.4L9 3.5L10.7 3.9" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="11.1" cy="4" r="0.8" fill="#FFFFFF" />
        </svg>
      );

    case 'Google Trends':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="1.2" y="1.2" width="13.6" height="13.6" rx="3.2" fill="#EFF3FD" stroke="#CBD5F5" strokeWidth="0.8" />
          <path d="M3.2 10.8L6.2 7.8L8.4 9.6L12.6 4.8" stroke="#2563EB" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10.2 4.8H12.6V7.2" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'Wattpad/Webtoon':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="1.2" y="1.2" width="13.6" height="13.6" rx="3.2" fill="#F97316" />
          <path d="M4 5.2L5.8 10.8L8 6.4L10.2 10.8L12 5.2" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'Roblox/Twitch':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="1.2" y="1.2" width="13.6" height="13.6" rx="3.2" fill="#6366F1" />
          <rect x="5" y="5" width="6" height="6" rx="1" transform="rotate(-14 8 8)" fill="#FFFFFF" />
          <rect x="7" y="7" width="2" height="2" transform="rotate(-14 8 8)" fill="#6366F1" />
        </svg>
      );
  }
};
