'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppProvider, useApp } from '@/context/AppContext';
import { Sidebar, TabType } from '@/components/Sidebar';
import { TopNavbar } from '@/components/TopNavbar';
import { AuthModal } from '@/components/AuthModal';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';

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

        {/* Warning Banner: Plan Expiring Soon (3 days prior) */}
        {currentUser && userCredits?.isExpiringSoon && !userCredits.isExpired && (
          <div className="bg-amber-500 text-slate-950 px-4 sm:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs border-b border-amber-600/30 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Clock className="w-4 h-4 text-slate-950 shrink-0 animate-pulse" />
              <span>
                Plan Expiring Soon: Your {userCredits.planName} expires in{' '}
                <span className="underline decoration-slate-950 underline-offset-2">
                  {userCredits.daysRemaining} day{userCredits.daysRemaining === 1 ? '' : 's'}
                </span>
                . Renew early to maintain uninterrupted synthesis and credit balance!
              </span>
            </div>
            <button
              type="button"
              onClick={() => router.push('/pricing')}
              className="px-3.5 py-1 rounded-xl bg-slate-950 text-white hover:bg-slate-900 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <span>Renew Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Danger Banner: Plan Expired */}
        {currentUser && userCredits?.isExpired && (
          <div className="bg-rose-600 text-white px-4 sm:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs border-b border-rose-700 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-white shrink-0 animate-bounce" />
              <span>
                Monthly Plan Expired: Your 30-day subscription cycle has completed. Recharge your monthly credits to continue generating high-capacity speech.
              </span>
            </div>
            <button
              type="button"
              onClick={() => router.push('/pricing')}
              className="px-3.5 py-1 rounded-xl bg-white text-rose-700 hover:bg-rose-50 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <span>Recharge / Reactivate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
