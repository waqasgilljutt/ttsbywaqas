'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SavedClone } from '@/components/VoiceCloner';

export interface UserCredits {
  isUnlimited: boolean;
  creditsUsed: number;
  creditLimit: number;
  remainingCredits: number;
  planName: string;
}

export interface AuthUser {
  name: string;
  email: string;
}

interface AppContextType {
  currentUser: AuthUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  userCredits: UserCredits | null;
  setUserCredits: React.Dispatch<React.SetStateAction<UserCredits | null>>;
  refreshUserCredits: (email?: string) => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  activeLoadedClone: SavedClone | null;
  setActiveLoadedClone: (clone: SavedClone | null) => void;
  handleLogout: () => void;
  loginUser: (user: AuthUser) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeLoadedClone, setActiveLoadedClone] = useState<SavedClone | null>(null);

  const currentUserRef = useRef<AuthUser | null>(null);
  currentUserRef.current = currentUser;

  const refreshUserCredits = useCallback(async (email?: string) => {
    const targetEmail = email || currentUserRef.current?.email;
    if (!targetEmail) return;

    const emailKey = targetEmail.toLowerCase();
    const isOwner = emailKey === 'muhammadwaqasmwg@gmail.com';

    // Load instantly from localStorage cache so user never sees blank/stale credits
    let cachedCreditsUsed = 0;
    try {
      const stored = localStorage.getItem(`empirenexs_credits_${emailKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        cachedCreditsUsed = parsed.creditsUsed || 0;
        setUserCredits(parsed);
      }
    } catch {}

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get-credits',
          email: targetEmail,
          clientCreditsUsed: cachedCreditsUsed,
        }),
      });
      const data = await res.json();
      if (data.success && data.balance) {
        const higherUsed = Math.max(data.balance.creditsUsed || 0, cachedCreditsUsed);
        const isUnlimited = isOwner || data.balance.isUnlimited || data.balance.creditLimit === -1;
        const currentLimit = data.balance.creditLimit || 30000;
        const mergedBalance: UserCredits = {
          ...data.balance,
          isUnlimited,
          creditLimit: currentLimit,
          creditsUsed: higherUsed,
          remainingCredits: isUnlimited
            ? Infinity
            : Math.max(0, currentLimit - higherUsed),
          planName: data.balance.planName || (isUnlimited ? 'Unlimited VIP Lifetime' : 'Free Starter (30k)'),
        };
        setUserCredits(mergedBalance);
        try {
          localStorage.setItem(
            `empirenexs_credits_${emailKey}`,
            JSON.stringify(mergedBalance)
          );
        } catch {}
      }
    } catch (e) {
      console.warn('Failed to load user credits:', e);
    }
  }, []);

  // Restore authenticated session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('empirenexs_user');
      if (savedUser) {
        const parsed: AuthUser = JSON.parse(savedUser);
        if (parsed?.email) {
          setCurrentUser(parsed);
          refreshUserCredits(parsed.email);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved user:', e);
    }
  }, [refreshUserCredits]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('empirenexs_user');
    setCurrentUser(null);
    setUserCredits(null);
  }, []);

  const loginUser = useCallback(
    (user: AuthUser) => {
      try {
        localStorage.setItem('empirenexs_user', JSON.stringify(user));
      } catch {}
      setCurrentUser(user);
      refreshUserCredits(user.email);
    },
    [refreshUserCredits]
  );

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        userCredits,
        setUserCredits,
        refreshUserCredits,
        isAuthModalOpen,
        setIsAuthModalOpen,
        activeLoadedClone,
        setActiveLoadedClone,
        handleLogout,
        loginUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
