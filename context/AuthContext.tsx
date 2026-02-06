import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getOnboardingDone, getProfileName, setOnboardingDone, setProfileName } from '@/lib/localStorage';

export interface User {
  uid: string;
  email: string | null;
  name: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean | null;
  updateUser: (name: string) => Promise<void>;
  setHasCompletedOnboarding: (value: boolean) => Promise<void>;
  reloadFromStorage: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const LOCAL_UID = 'local';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState<boolean | null>(null);

  useEffect(() => {
    Promise.all([getOnboardingDone(), getProfileName()]).then(([onboarding, name]) => {
      setHasCompletedOnboardingState(onboarding);
      setUser({ uid: LOCAL_UID, email: null, name: name ?? 'Kullanıcı' });
      setIsLoading(false);
    });
  }, []);

  const setHasCompletedOnboarding = useCallback(async (value: boolean) => {
    await setOnboardingDone(value);
    setHasCompletedOnboardingState(value);
  }, []);

  const updateUser = useCallback(async (name: string) => {
    const trimmed = name.trim() || 'Kullanıcı';
    await setProfileName(trimmed);
    setUser((prev) => (prev ? { ...prev, name: trimmed } : { uid: LOCAL_UID, email: null, name: trimmed }));
  }, []);

  const reloadFromStorage = useCallback(async () => {
    const name = await getProfileName();
    setUser({ uid: LOCAL_UID, email: null, name: name ?? 'Kullanıcı' });
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    hasCompletedOnboarding,
    updateUser,
    setHasCompletedOnboarding,
    reloadFromStorage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
