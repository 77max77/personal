import React, { createContext, useContext, useState } from 'react';

// ProfileContext 생성
const ProfileContext = createContext();

// ProfileContext의 Provider 컴포넌트
export const ProfileProvider = ({ children }) => {
  const [profiles, setProfiles] = useState([]);

  // 프로필 추가 함수
  const addProfile = (profile) => {
    setProfiles([...profiles, profile]);
  };

  // 프로필 삭제 함수
  const removeProfile = (id) => {
    setProfiles(profiles.filter(profile => profile.id !== id));
  };

  return (
    <ProfileContext.Provider value={{ profiles, addProfile, removeProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

// ProfileContext 사용을 위한 커스텀 훅
export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
};
