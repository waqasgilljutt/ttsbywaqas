'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { VoiceLibrary } from '@/components/VoiceLibrary';
import { useApp } from '@/context/AppContext';

export default function VoiceLibraryPage() {
  const router = useRouter();
  const {
    currentUser,
    setIsAuthModalOpen,
    setActiveLoadedClone,
  } = useApp();

  return (
    <div className="animate-in fade-in duration-200">
      <VoiceLibrary
        onUseVoice={(clone) => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
            return;
          }
          setActiveLoadedClone(clone);
          router.push('/voice-cloning');
        }}
        onNavigateToCloner={() => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
            return;
          }
          router.push('/voice-cloning');
        }}
        currentUser={currentUser}
        onRequireAuth={() => setIsAuthModalOpen(true)}
      />
    </div>
  );
}
