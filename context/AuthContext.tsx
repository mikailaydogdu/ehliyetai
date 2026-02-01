import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@fersa_onboarding_done';
const USER_KEY = '@fersa_user';

export interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  hasCompletedOnboarding: boolean | null;
  user: User | null;
  isLoading: boolean;
  completeOnboarding: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (name: string, email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [onboarding, userJson] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        setHasCompletedOnboardingState(onboarding === 'true');
        if (userJson) {
          const parsed = JSON.parse(userJson) as User;
          setUser(parsed);
        } else {
          setUser(null);
        }
      } catch {
        setHasCompletedOnboardingState(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setHasCompletedOnboardingState(true);
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    const userData: User = { email, name: email.split('@')[0] ?? 'Kullanıcı' };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string) => {
    const userData: User = { email, name };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (name: string, email: string) => {
    const userData: User = { email, name };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const deleteAccount = useCallback(async () => {
    await AsyncStorage.multiRemove([USER_KEY, ONBOARDING_KEY]);
    setUser(null);
    setHasCompletedOnboardingState(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        hasCompletedOnboarding,
        user,
        isLoading,
        completeOnboarding,
        login,
        register,
        logout,
        updateUser,
        deleteAccount,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
