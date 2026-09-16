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
  phone_verified?: boolean;
  tier?: string;
  is_google_auth?: boolean;
  has_password?: boolean;
  avatar_url?: string;
}

interface AvatarContextType {
  selectedAvatar: string; // 'auto' or specific src
  currentAvatar: string; // resolved image URL based on active theme
  setAvatar: (srcOrAuto: string) => void;
  avatarOptions: AvatarOption[];
  profileData: UserProfileData;
  setProfileData: (data: Partial<UserProfileData>) => void;
  clearProfileData: () => void;
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
      fullName: '',
      email: '',
      phone: '',
      phone_verified: false,
      tier: 'Novice',
    };
  });

  // Hydrate from live backend profile whenever user token exists
  useEffect(() => {
    async function hydrateProfile() {
      const token = localStorage.getItem('ithihasa_access_token');
      if (!token) return;

      try {
        const user = await fetchUserProfile();
        if (user) {
          const updated: UserProfileData = {
            fullName: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            phone_verified: Boolean(user.phone_verified),
            tier: user.tier || 'Novice',
            is_google_auth: Boolean(user.is_google_auth),
            has_password: Boolean(user.has_password),
            avatar_url: user.avatar_url || undefined,
          };
          setProfileDataState(updated);
          localStorage.setItem('ithihasa_user_profile', JSON.stringify(updated));

          if (user.avatar_url) {
            setSelectedAvatarState(user.avatar_url);
            localStorage.setItem('ithihasa_selected_avatar', user.avatar_url);
          }
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
    setProfileDataState((prev) => {
      const updated: UserProfileData = { ...prev, avatar_url: srcOrAuto };
      localStorage.setItem('ithihasa_user_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const setProfileData = (data: Partial<UserProfileData>) => {
    setProfileDataState((prev) => {
      const updated: UserProfileData = { ...prev, ...data };
      localStorage.setItem('ithihasa_user_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const clearProfileData = () => {
    const blank: UserProfileData = {
      fullName: '',
      email: '',
      phone: '',
      phone_verified: false,
      tier: 'Novice',
      is_google_auth: false,
      has_password: false,
      avatar_url: undefined,
    };
    setProfileDataState(blank);
    localStorage.removeItem('ithihasa_user_profile');
    localStorage.removeItem('ithihasa_selected_avatar');
    setSelectedAvatarState('auto');
  };

  // Resolve current avatar:
  // 1. Explicitly selected avatar (if not 'auto')
  // 2. Saved avatar_url in profile data
  // 3. Theme-based default (Cat for dark mode, Princess for light mode)
  const currentAvatar =
    selectedAvatar && selectedAvatar !== 'auto'
      ? selectedAvatar
      : profileData.avatar_url
      ? profileData.avatar_url
      : theme === 'dark'
      ? '/avatar1/screen.png' // Cat for Dark Mode
      : '/avatar/screen.png'; // Girl for Light Mode

  return (
    <AvatarContext.Provider
      value={{
        selectedAvatar,
        currentAvatar,
        setAvatar,
        avatarOptions: AVATAR_OPTIONS,
        profileData,
        setProfileData,
        clearProfileData,
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
        fullName: '',
        email: '',
        phone: '',
      },
      setProfileData: () => {},
      clearProfileData: () => {},
    };
  }
  return context;
};

