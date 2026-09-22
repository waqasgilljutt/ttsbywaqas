'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Users,
  Download,
  Search,
  Trash2,
  Ban,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Volume2,
  Clock,
  UserX,
} from 'lucide-react';
import { StoredUser, OWNER_EMAIL } from '@/lib/user-store';

interface AdminPanelProps {
  currentUser: { name: string; email: string } | null;
}

export function AdminPanel({ currentUser }: AdminPanelProps) {
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  const [users, setUsers] = useState<StoredUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Check if session PIN was already verified in this session
  useEffect(() => {
    const savedPin = sessionStorage.getItem('empirenexs_admin_pin');
    if (savedPin) {
      setPin(savedPin);
      verifyPin(savedPin);
    }
  }, []);

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackNotice({ type, message });
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const verifyPin = async (pinToTest: string) => {
    setIsVerifyingPin(true);
    setPinError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-pin', pin: pinToTest }),
      });
      const data = await res.json();
      if (data.success) {
        setIsUnlocked(true);
        sessionStorage.setItem('empirenexs_admin_pin', pinToTest);
        loadUsers(pinToTest);
      } else {
        setPinError(data.error || 'Incorrect secret PIN.');
        setIsUnlocked(false);
      }
    } catch {
      setPinError('Failed to verify PIN. Please try again.');
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    verifyPin(pin.trim());
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPin('');
    sessionStorage.removeItem('empirenexs_admin_pin');
  };

  const loadUsers = useCallback(async (activePin: string) => {
    setIsLoadingUsers(true);
    try {
      // Also sync any registered users from localStorage into server store
      let localUsers: StoredUser[] = [];
      try {
        const stored = localStorage.getItem('empirenexs_registered_accounts');
        if (stored) localUsers = JSON.parse(stored);
      } catch (e) {
        console.warn('Local storage error:', e);
      }

      // Sync local users to server
      for (const u of localUsers) {
        if (u.email) {
          await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'sync', name: u.name, email: u.email }),
          }).catch(() => {});
        }
      }

      const res = await fetch('/api/admin/users', {
        headers: {
          'x-admin-pin': activePin,
          'x-user-email': currentUser?.email || OWNER_EMAIL,
        },
      });
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.warn('Failed to fetch users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [currentUser]);

  const handleToggleBlock = async (user: StoredUser) => {
    if (user.email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
      showNotice('Owner account cannot be blocked.', 'error');
      return;
    }

    try {
      const activePin = pin || sessionStorage.getItem('empirenexs_admin_pin') || '';
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle-block',
          userId: user.id,
          pin: activePin,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const newStatus = !user.isBlocked;
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isBlocked: newStatus } : u))
        );

        // Also update local registered accounts mirror
        try {
          const stored = localStorage.getItem('empirenexs_registered_accounts');
          if (stored) {
            const list: StoredUser[] = JSON.parse(stored);
            const updated = list.map((u) => (u.id === user.id ? { ...u, isBlocked: newStatus } : u));
            localStorage.setItem('empirenexs_registered_accounts', JSON.stringify(updated));
          }
        } catch (e) {
          console.warn('Local storage error:', e);
        }

        showNotice(
          newStatus
            ? `User "${user.name}" has been BLOCKED.`
            : `User "${user.name}" has been UNBLOCKED.`
        );
      } else {
        showNotice(data.error || 'Failed to update user status.', 'error');
      }
    } catch {
      showNotice('Network error while updating user status.', 'error');
    }
  };

  const handleDeleteUser = async (user: StoredUser) => {
    if (user.email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
      showNotice('Owner account cannot be deleted.', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete user "${user.name}" (${user.email})?`)) {
      return;
    }

    try {
      const activePin = pin || sessionStorage.getItem('empirenexs_admin_pin') || '';
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          userId: user.id,
          pin: activePin,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));

        // Update local storage
        try {
          const stored = localStorage.getItem('empirenexs_registered_accounts');
          if (stored) {
            const list: StoredUser[] = JSON.parse(stored);
            const updated = list.filter((u) => u.id !== user.id && u.email !== user.email);
            localStorage.setItem('empirenexs_registered_accounts', JSON.stringify(updated));
          }
        } catch (e) {
          console.warn('Local storage error:', e);
        }

        showNotice(`User "${user.name}" deleted successfully.`);
      } else {
        showNotice(data.error || 'Failed to delete user.', 'error');
      }
    } catch {
      showNotice('Network error while deleting user.', 'error');
    }
  };

  // Export users to CSV / Excel
  const handleExportCSV = () => {
    if (users.length === 0) return;

    const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Voices Generated', 'Registration Date', 'Last Active'];
    const rows = users.map((u) => [
      `"${u.id}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.isBlocked ? 'BLOCKED' : 'ACTIVE'}"`,
      u.voicesGenerated || 0,
      `"${new Date(u.createdAt).toLocaleString()}"`,
      `"${new Date(u.lastActive).toLocaleString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tts-waqas-gill-users-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotice('User list exported to CSV for Excel successfully!');
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === 'active') return !u.isBlocked;
    if (statusFilter === 'blocked') return u.isBlocked;
    return true;
  });

  const totalUsers = users.length;
  const blockedUsers = users.filter((u) => u.isBlocked).length;
  const totalGenerations = users.reduce((acc, u) => acc + (u.voicesGenerated || 0), 0);

  // SCREEN 1: SECRET PIN LOCK SCREEN
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 flex flex-col items-center text-center relative overflow-hidden">
          {/* Top Brand Glow */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 mb-5">
            <Lock className="w-8 h-8" />
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider mb-2">
            Owner Command Center
          </span>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Security PIN Required
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            This section is restricted strictly to <strong>Waqas Gill</strong> ({OWNER_EMAIL}). Enter your master security PIN to continue.
          </p>

          {pinError && (
            <div className="w-full mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in shake">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{pinError}</span>
            </div>
          )}

          <form onSubmit={handlePinSubmit} className="w-full mt-6 flex flex-col gap-4">
            <div>
              <label className="block text-left text-xs font-semibold text-slate-700 mb-1.5">
                Master PIN
              </label>
              <input
                type="password"
                maxLength={8}
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4-digit PIN..."
                className="w-full text-center tracking-[0.4em] font-mono text-xl bg-slate-50 border border-slate-200 rounded-2xl py-3 text-slate-900 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifyingPin || !pin.trim()}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-brand-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
            >
              {isVerifyingPin ? (
                <span>Verifying PIN...</span>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Admin Panel</span>
                </>
              )}
            </button>
          </form>

          <p className="text-[10px] text-slate-400 mt-5">
            EmpireNexs Cloud Security • 256-bit Protected
          </p>
        </div>
      </div>
    );
  }

  // SCREEN 2: UNLOCKED ADMIN STUDIO DASHBOARD
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-16">
      {/* Toast Notification */}
      {feedbackNotice && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2 ${
            feedbackNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedbackNotice.message}</span>
          </div>
          <button onClick={() => setFeedbackNotice(null)} className="hover:opacity-75 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold w-fit">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Owner Command Center</span>
            <span className="text-slate-300">•</span>
            <span className="text-brand-600">Waqas Gill</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Registered Users & Access Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Real-time control over all registered users, speech synthesis activity, blocking, and data export.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export to Excel (CSV)</span>
          </button>

          <button
            type="button"
            onClick={handleLock}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Lock className="w-4 h-4" />
            <span>Lock Panel</span>
          </button>
        </div>
      </div>

      {/* Analytics Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
            <h3 className="text-2xl font-extrabold text-slate-900">{totalUsers}</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Users</span>
            <h3 className="text-2xl font-extrabold text-slate-900">{totalUsers - blockedUsers}</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Blocked Users</span>
            <h3 className="text-2xl font-extrabold text-slate-900">{blockedUsers}</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Audios Created</span>
            <h3 className="text-2xl font-extrabold text-slate-900">{totalGenerations}</h3>
          </div>
        </div>
      </div>

      {/* Users Management Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
        {/* Table Controls Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user name or email address..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs self-start sm:self-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'active' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Active ({users.length - blockedUsers})
            </button>
            <button
              onClick={() => setStatusFilter('blocked')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'blocked' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Blocked ({blockedUsers})
            </button>

            <button
              type="button"
              title="Refresh users list"
              onClick={() => {
                const activePin = pin || sessionStorage.getItem('empirenexs_admin_pin') || '';
                loadUsers(activePin);
              }}
              className="p-1.5 ml-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin text-brand-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">User Profile</th>
                <th className="py-3.5 px-6">Email Address</th>
                <th className="py-3.5 px-6">Joined Date</th>
                <th className="py-3.5 px-6">Audios Created</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    {searchQuery ? `No users match "${searchQuery}"` : 'No registered users found.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isOwner = user.email.toLowerCase() === OWNER_EMAIL.toLowerCase();

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        user.isBlocked ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                              isOwner
                                ? 'bg-gradient-to-tr from-amber-500 to-brand-600 shadow-sm shadow-amber-500/20'
                                : user.isBlocked
                                ? 'bg-slate-400'
                                : 'bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-sm shadow-brand-500/20'
                            }`}
                          >
                            {user.name ? user.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              {user.name}
                              {isOwner && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-extrabold border border-amber-300">
                                  OWNER
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              ID: {user.id.slice(0, 10)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6 font-mono text-slate-700">
                        <a
                          href={`mailto:${user.email}`}
                          className="hover:text-brand-600 hover:underline"
                        >
                          {user.email}
                        </a>
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-6 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(user.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </td>

                      {/* Audios Created */}
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-mono font-bold text-slate-700 text-xs">
                          {user.voicesGenerated || 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {user.isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                            <Ban className="w-3 h-3" />
                            <span>Blocked</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        {isOwner ? (
                          <span className="text-[10px] text-slate-400 italic">Protected</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Toggle Block/Unblock */}
                            <button
                              type="button"
                              onClick={() => handleToggleBlock(user)}
                              title={user.isBlocked ? 'Unblock User' : 'Block User'}
                              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                                user.isBlocked
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                              }`}
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>{user.isBlocked ? 'Unblock' : 'Block'}</span>
                            </button>

                            {/* Delete User */}
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user)}
                              title="Permanently Delete User"
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
