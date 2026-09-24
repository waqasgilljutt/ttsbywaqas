'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { VoiceCloner } from '@/components/VoiceCloner';
import { useApp } from '@/context/AppContext';

export default function VoiceCloningPage() {
  const router = useRouter();
  const {
    currentUser,
    userCredits,
    refreshUserCredits,
    setIsAuthModalOpen,
    activeLoadedClone,
    setActiveLoadedClone,
  } = useApp();

  return (
    <div className="animate-in fade-in duration-200">
      <VoiceCloner
        initialClone={activeLoadedClone}
        onClearInitialClone={() => setActiveLoadedClone(null)}
        onNavigateToLibrary={() => router.push('/voice-library')}
        currentUser={currentUser}
        onRequireAuth={() => setIsAuthModalOpen(true)}
        userCredits={userCredits}
        onRefreshCredits={() => currentUser?.email && refreshUserCredits(currentUser.email)}
        onOpenPricing={() => router.push('/pricing')}
      />
    </div>
  );
}
