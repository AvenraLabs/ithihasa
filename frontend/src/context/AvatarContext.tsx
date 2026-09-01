import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTheme } from './ThemeContext.js';
import { fetchUserProfile } from '../api/auth.js';

export interface AvatarOption {
  id: string;
  name: string;
  src: string;
  modeDescription?: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'avatar-girl',
    name: 'Atelier Princess',
    src: '/avatar/screen.png',
    modeDescription: 'Light Mode Default',
  },
  {
    id: 'avatar-cat',
    name: 'Royal Panther',
    src: '/avatar1/screen.png',
    modeDescription: 'Dark Mode Default',
  },
  {
    id: 'avatar-warrior',
    name: 'Heritage Guardian',
    src: '/avatar2/screen.png',
    modeDescription: 'Mythic Persona',
  },
];

export interface UserProfileData {
  fullName: string;
  email: string;
  phone: string;
}

interface AvatarContextType {
  selectedAvatar: string; // 'auto' or specific src
  currentAvatar: string; // resolved image URL based on active theme
  setAvatar: (srcOrAuto: string) => void;
  avatarOptions: AvatarOption[];
  profileData: UserProfileData;
  setProfileData: (data: UserProfileData) => void;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export const AvatarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();

  const [selectedAvatar, setSelectedAvatarState] = useState<string>(() => {
    const saved = localStorage.getItem('ithihasa_selected_avatar');
    return saved || 'auto';
  });

  const [profileData, setProfileDataState] = useState<UserProfileData>(() => {
    const saved = localStorage.getItem('ithihasa_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      fullName: 'Atelier Patron',
      email: 'patron@ithihasa.com',
      phone: '+91 98765 43210',
    };
  });

  // Hydrate from live backend profile whenever user token exists
  useEffect(() => {
    async function hydrateProfile() {
      const token = localStorage.getItem('ithihasa_access_token');
      if (!token) return;

      try {
        const user = await fetchUserProfile();
        if (user && user.name) {
          const updated = {
            fullName: user.name,
            email: user.email,
            phone: user.phone || '+91 98765 43210',
          };
          setProfileDataState(updated);
          localStorage.setItem('ithihasa_user_profile', JSON.stringify(updated));
        }
      } catch (err) {
        console.warn('Profile hydration note:', err);
      }
    }
    hydrateProfile();
  }, []);

  const setAvatar = (srcOrAuto: string) => {
    setSelectedAvatarState(srcOrAuto);
    localStorage.setItem('ithihasa_selected_avatar', srcOrAuto);
  };

  const setProfileData = (data: UserProfileData) => {
    setProfileDataState(data);
    localStorage.setItem('ithihasa_user_profile', JSON.stringify(data));
  };

  // Resolve current avatar:
  // If 'auto', use cat for dark mode and girl for light mode
  // Otherwise use the user's explicitly selected avatar
  const currentAvatar =
    selectedAvatar === 'auto'
      ? theme === 'dark'
        ? '/avatar1/screen.png' // Cat for Dark Mode
        : '/avatar/screen.png' // Girl for Light Mode
      : selectedAvatar;

  return (
    <AvatarContext.Provider
      value={{
        selectedAvatar,
        currentAvatar,
        setAvatar,
        avatarOptions: AVATAR_OPTIONS,
        profileData,
        setProfileData,
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = (): AvatarContextType => {
  const context = useContext(AvatarContext);
  if (!context) {
    return {
      selectedAvatar: 'auto',
      currentAvatar: '/avatar/screen.png',
      setAvatar: () => {},
      avatarOptions: AVATAR_OPTIONS,
      profileData: {
        fullName: 'Eleanor Vance',
        email: 'eleanor.v@example.com',
        phone: '+1 (555) 123-4567',
      },
      setProfileData: () => {},
    };
  }
  return context;
};
