'use client';

import React from 'react';
import { AdminPanel } from '@/components/AdminPanel';
import { useApp } from '@/context/AppContext';

export default function AdminRoutePage() {
  const { currentUser } = useApp();
  const isOwner = currentUser?.email?.toLowerCase() === 'muhammadwaqasmwg@gmail.com';

  if (!isOwner) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-rose-200 text-rose-700 text-sm font-bold animate-in fade-in duration-200">
        Access Denied: Owner credentials required to access the Owner Command Center.
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-200">
      <AdminPanel currentUser={currentUser} />
    </div>
  );
}
