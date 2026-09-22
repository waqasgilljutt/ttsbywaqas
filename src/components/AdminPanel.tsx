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
  CreditCard,
  Zap,
  Sliders,
  X,
  Check,
  Crown,
  Coins,
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
  const [otps, setOtps] = useState<Array<{ email: string; code: string; purpose: string; createdAt: string }>>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Plan & Credit Management Modal State
  const [selectedUserForPlan, setSelectedUserForPlan] = useState<StoredUser | null>(null);
  const [customCreditInput, setCustomCreditInput] = useState<string>('');
  const [customPlanNameInput, setCustomPlanNameInput] = useState<string>('');
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

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
        if (stored) {
          localUsers = JSON.parse(stored);
          // Purge any temporary/disposable/non-gmail accounts permanently
          const cleaned = localUsers.filter(
            (u) => u.email && /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(u.email.trim())
          );
          if (cleaned.length !== localUsers.length) {
            localStorage.setItem('empirenexs_registered_accounts', JSON.stringify(cleaned));
            localUsers = cleaned;
          }
        }
      } catch (e) {
        console.warn('Local storage error:', e);
      }

      // Sync local users to server (strictly @gmail.com only)
      for (const u of localUsers) {
        if (u.email && /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(u.email.trim())) {
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
      if (data.success) {
        if (data.users) {
          // Strict Gmail filter: do not display any temp mail under any condition
          const gmailUsers = (data.users as StoredUser[]).filter(
            (u) => u.email && /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(u.email.trim())
          );
          setUsers(gmailUsers);
        }
        if (data.otps) setOtps(data.otps);
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

  // Plan Assignment by Waqas Gill
  const handleAssignPlan = async (user: StoredUser, planKey: 'free' | '1m' | '3m' | '10m' | 'unlimited') => {
    setIsUpdatingPlan(true);
    try {
      const activePin = pin || sessionStorage.getItem('empirenexs_admin_pin') || '';
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set-plan',
          userId: user.id,
          planKey,
          pin: activePin,
        }),
      });
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
        showNotice(`Plan for ${user.name} successfully updated to ${planKey.toUpperCase()}!`);
        setSelectedUserForPlan(null);
      } else {
        showNotice(data.error || 'Failed to update plan.', 'error');
      }
    } catch {
      showNotice('Network error while updating plan.', 'error');
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  // Custom Credit Limit Adjustment by Waqas Gill
  const handleCustomCreditLimit = async (user: StoredUser) => {
    const limitNum = parseInt(customCreditInput.trim(), 10);
    if (isNaN(limitNum)) {
      showNotice('Please enter a valid credit number (e.g. 5000000 or -1 for Unlimited).', 'error');
      return;
    }
    setIsUpdatingPlan(true);
    try {
      const activePin = pin || sessionStorage.getItem('empirenexs_admin_pin') || '';
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adjust-credits',
          userId: user.id,
          newCreditLimit: limitNum,
          customPlanName: customPlanNameInput.trim() || undefined,
          pin: activePin,
        }),
      });
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
        showNotice(`Custom limit of ${limitNum === -1 ? 'Unlimited' : limitNum.toLocaleString()} credits set for ${user.name}!`);
        setSelectedUserForPlan(null);
      } else {
        showNotice(data.error || 'Failed to adjust credit limit.', 'error');
      }
    } catch {
      showNotice('Network error while adjusting credit limit.', 'error');
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  // Export users to CSV / Excel
  const handleExportCSV = () => {
    if (users.length === 0) return;

    const headers = [
      'ID',
      'Name',
      'Email',
      'Plan Name',
      'Credits Used',
      'Credit Limit',
      'Role',
      'Status',
      'Voices Generated',
      'Registration Date',
      'Last Active',
    ];
    const rows = users.map((u) => [
      `"${u.id}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.planName || 'Free Starter (30K)'}"`,
      u.creditsUsed || 0,
      u.creditLimit === -1 ? 'Unlimited' : (u.creditLimit || 30000),
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
  const totalCreditsProcessed = users.reduce((acc, u) => acc + (u.creditsUsed || 0), 0);
  const vipPaidUsers = users.filter((u) => u.isPaid || u.plan === 'unlimited').length;

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
            <h3 className="text-2xl font-extrabold text-slate-900">{totalUsers}</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Users</span>
            <h3 className="text-2xl font-extrabold text-slate-900">{totalUsers - blockedUsers}</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Paid VIP Users</span>
            <h3 className="text-2xl font-extrabold text-amber-600">{vipPaidUsers}</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Audios Made</span>
            <h3 className="text-2xl font-extrabold text-slate-900">{totalGenerations}</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Credits Processed</span>
            <h3 className="text-xl font-extrabold text-slate-900 truncate">
              {totalCreditsProcessed > 1000000 ? `${(totalCreditsProcessed / 1000000).toFixed(2)}M` : totalCreditsProcessed.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Blocked Users</span>
            <h3 className="text-2xl font-extrabold text-slate-900">{blockedUsers}</h3>
          </div>
        </div>
      </div>

      {/* Live Email OTP Verification Monitor */}
      {otps.length > 0 && (
        <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-md flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Live Email OTP Verification Monitor
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {otps.length} Recent Request{otps.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {otps.slice(0, 6).map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-slate-200 truncate block">
                    {item.email}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {item.purpose === 'signup' ? 'New Account Verification' : 'Password Reset'}
                  </span>
                </div>
                <div className="px-3 py-1 rounded-xl bg-brand-500/20 border border-brand-400/40 text-brand-300 font-mono text-base font-extrabold tracking-widest shrink-0">
                  {item.code}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <th className="py-3.5 px-6">Plan &amp; Credits Quota</th>
                <th className="py-3.5 px-6">Joined Date</th>
                <th className="py-3.5 px-6">Audios Created</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
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

                      {/* Plan & Credits Quota */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1.5 min-w-[150px]">
                          <div>
                            {isOwner || user.plan === 'unlimited' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-900 border border-amber-300 text-[10px] font-extrabold">
                                <Crown className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>Unlimited VIP (4,000 PKR)</span>
                              </span>
                            ) : user.plan === '10m' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold">
                                <span>💎 10M Studio (2,500 PKR)</span>
                              </span>
                            ) : user.plan === '3m' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">
                                <span>🚀 3M Creator (900 PKR)</span>
                              </span>
                            ) : user.plan === '1m' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px] font-bold">
                                <span>⚡ 1M Starter (300 PKR)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium">
                                <span>🌱 {user.planName || 'Free Starter (30K)'}</span>
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] font-mono text-slate-600 flex items-center justify-between">
                            <span>{(user.creditsUsed || 0).toLocaleString()}</span>
                            <span className="text-slate-400">/</span>
                            <span className="font-semibold text-slate-800">
                              {user.creditLimit === -1 || isOwner ? '∞ Unlimited' : (user.creditLimit || 30000).toLocaleString()}
                            </span>
                          </div>

                          {user.creditLimit !== -1 && !isOwner && (
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.round(((user.creditsUsed || 0) / (user.creditLimit || 30000)) * 100)
                                  )}%`,
                                }}
                                className={`h-full rounded-full transition-all ${
                                  (user.creditsUsed || 0) >= (user.creditLimit || 30000)
                                    ? 'bg-rose-500'
                                    : (user.creditsUsed || 0) >= (user.creditLimit || 30000) * 0.8
                                    ? 'bg-amber-500'
                                    : 'bg-brand-600'
                                }`}
                              />
                            </div>
                          )}
                        </div>
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
                            {/* Manage Plan & Credits */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUserForPlan(user);
                                setCustomCreditInput(
                                  String(user.creditLimit === -1 ? -1 : (user.creditLimit || 30000))
                                );
                                setCustomPlanNameInput(user.planName || '');
                              }}
                              title="Assign Plan or Adjust Credits"
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 hover:scale-[1.02] active:scale-95 transition-all shadow-xs"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-brand-600" />
                              <span>Plan / Quota</span>
                            </button>

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

      {/* WAQAS GILL'S PLAN & CREDIT MANAGEMENT MODAL */}
      {selectedUserForPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 flex flex-col gap-6 relative animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Assign Plan &amp; Quota
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedUserForPlan.name} • <span className="font-mono">{selectedUserForPlan.email}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUserForPlan(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Status Pill */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Plan</span>
                <span className="font-bold text-slate-800 text-sm">
                  {selectedUserForPlan.planName || 'Free Starter (30K)'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Usage / Quota</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {(selectedUserForPlan.creditsUsed || 0).toLocaleString()} /{' '}
                  {selectedUserForPlan.creditLimit === -1 ? 'Unlimited' : (selectedUserForPlan.creditLimit || 30000).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Section 1: Quick 1-Click Plan Assignment */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>1-Click Plan Assignment (PKR)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* 1M Starter - 300 PKR */}
                <button
                  type="button"
                  disabled={isUpdatingPlan}
                  onClick={() => handleAssignPlan(selectedUserForPlan, '1m')}
                  className="p-3 rounded-2xl border border-cyan-200 bg-cyan-50/50 hover:bg-cyan-100/70 text-left transition-all flex flex-col gap-0.5 hover:scale-[1.02] active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-cyan-950">⚡ Starter Pack</span>
                    <span className="text-[10px] font-extrabold bg-cyan-200/80 text-cyan-900 px-2 py-0.5 rounded-full">300 PKR</span>
                  </div>
                  <span className="text-[11px] text-cyan-700 font-mono font-bold">1,000,000 Credits</span>
                  <span className="text-[9px] text-cyan-600">1 Char = 1 Credit</span>
                </button>

                {/* 3M Creator - 900 PKR */}
                <button
                  type="button"
                  disabled={isUpdatingPlan}
                  onClick={() => handleAssignPlan(selectedUserForPlan, '3m')}
                  className="p-3 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-left transition-all flex flex-col gap-0.5 hover:scale-[1.02] active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-950">🚀 Creator Pack</span>
                    <span className="text-[10px] font-extrabold bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded-full">900 PKR</span>
                  </div>
                  <span className="text-[11px] text-blue-700 font-mono font-bold">3,000,000 Credits</span>
                  <span className="text-[9px] text-blue-600">Popular Creator Tier</span>
                </button>

                {/* 10M Studio - 2,500 PKR */}
                <button
                  type="button"
                  disabled={isUpdatingPlan}
                  onClick={() => handleAssignPlan(selectedUserForPlan, '10m')}
                  className="p-3 rounded-2xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 text-left transition-all flex flex-col gap-0.5 hover:scale-[1.02] active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-purple-950">💎 Pro Studio Pack</span>
                    <span className="text-[10px] font-extrabold bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded-full">2,500 PKR</span>
                  </div>
                  <span className="text-[11px] text-purple-700 font-mono font-bold">10,000,000 Credits</span>
                  <span className="text-[9px] text-purple-600">For Production Studios</span>
                </button>

                {/* Unlimited VIP - 4,000 PKR */}
                <button
                  type="button"
                  disabled={isUpdatingPlan}
                  onClick={() => handleAssignPlan(selectedUserForPlan, 'unlimited')}
                  className="p-3 rounded-2xl border border-amber-300 bg-gradient-to-tr from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-left transition-all flex flex-col gap-0.5 hover:scale-[1.02] active:scale-98 shadow-xs shadow-amber-500/10"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                      Unlimited VIP
                    </span>
                    <span className="text-[10px] font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">4,000 PKR</span>
                  </div>
                  <span className="text-[11px] text-amber-800 font-mono font-bold">∞ Lifetime Unlimited</span>
                  <span className="text-[9px] text-amber-700">Zero Limits Forever</span>
                </button>
              </div>

              {/* Reset to Free Tier */}
              <button
                type="button"
                disabled={isUpdatingPlan}
                onClick={() => handleAssignPlan(selectedUserForPlan, 'free')}
                className="w-full mt-1 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-dashed border-slate-200 transition-all text-center"
              >
                Reset User to Free Starter (30,000 Credits)
              </button>
            </div>

            {/* Section 2: Custom Limit Adjustment */}
            <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-brand-600" />
                <span>Custom Credits Limit Adjustment</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block mb-1">
                    Credit Limit (-1 for Unlimited)
                  </span>
                  <input
                    type="number"
                    value={customCreditInput}
                    onChange={(e) => setCustomCreditInput(e.target.value)}
                    placeholder="e.g. 5000000 or -1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-brand-600 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 block mb-1">
                    Custom Plan Label (Optional)
                  </span>
                  <input
                    type="text"
                    value={customPlanNameInput}
                    onChange={(e) => setCustomPlanNameInput(e.target.value)}
                    placeholder="e.g. VIP Partner 5M"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForPlan(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isUpdatingPlan || !customCreditInput.trim()}
                  onClick={() => handleCustomCreditLimit(selectedUserForPlan)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all"
                >
                  {isUpdatingPlan ? 'Saving Quota...' : 'Save Custom Quota'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
