'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppProvider, useApp } from '@/context/AppContext';
import { Sidebar, TabType } from '@/components/Sidebar';
import { TopNavbar } from '@/components/TopNavbar';
import { AuthModal } from '@/components/AuthModal';

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const {
    currentUser,
    userCredits,
    handleLogout,
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginUser,
  } = useApp();

  // Compute activeTab from pathname for TopNavbar & Sidebar
  let activeTab: TabType = 'text-to-voice';
  if (pathname === '/voice-cloning') activeTab = 'voice-cloning';
  else if (pathname === '/voice-library') activeTab = 'voice-library';
  else if (pathname === '/pricing') activeTab = 'pricing';
  else if (pathname === '/about') activeTab = 'about';
  else if (pathname === '/admin') activeTab = 'admin';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
          userCredits={userCredits}
          onOpenPricing={() => router.push('/pricing')}
        />

        <main className="flex-1 px-4 sm:px-8 py-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccessLogin={(user) => loginUser(user)}
      />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppShellInner>{children}</AppShellInner>
    </AppProvider>
  );
}
