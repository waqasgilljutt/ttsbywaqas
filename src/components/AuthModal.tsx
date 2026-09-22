'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Ban,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { OWNER_EMAIL } from '@/lib/user-store';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: { name: string; email: string }) => void;
  isRequired?: boolean;
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccessLogin,
  isRequired = false,
}: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setErrorMsg('');
    setIsLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    const isOwner = normalizedEmail === OWNER_EMAIL.toLowerCase();
    const userName = name.trim() || (isOwner ? 'Waqas Gill' : normalizedEmail.split('@')[0]);

    try {
      // 1. Check if user is blocked by administrator
      const checkRes = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check-status', email: normalizedEmail }),
      });
      const checkData = await checkRes.json();
      if (checkData.isBlocked) {
        setIsLoading(false);
        setErrorMsg(
          'Your account has been blocked by the administrator (Waqas Gill). Please contact muhammadwaqasmwg@gmail.com for assistance.'
        );
        return;
      }

      // 2. Register/Sync with server database
      await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          name: userName,
          email: normalizedEmail,
        }),
      }).catch(() => {});

      // 3. Store locally
      const user = {
        name: userName,
        email: normalizedEmail,
      };

      try {
        localStorage.setItem('empirenexs_user', JSON.stringify(user));

        // Maintain local registered accounts cache
        const existingAccountsStr = localStorage.getItem('empirenexs_registered_accounts');
        const existingAccounts = existingAccountsStr ? JSON.parse(existingAccountsStr) : [];
        if (!existingAccounts.some((a: { email: string }) => a.email.toLowerCase() === normalizedEmail)) {
          existingAccounts.unshift({
            id: `usr_${Date.now()}`,
            name: userName,
            email: normalizedEmail,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            voicesGenerated: 0,
            role: isOwner ? 'owner' : 'user',
            isBlocked: false,
          });
          localStorage.setItem('empirenexs_registered_accounts', JSON.stringify(existingAccounts));
        }
      } catch (e) {
        console.warn('LocalStorage write error:', e);
      }

      setIsLoading(false);
      setSuccessMsg(
        isSignUp
          ? `Welcome to TTS bY Waqas Gill, ${userName}!`
          : `Signed in successfully as ${userName}!`
      );

      setTimeout(() => {
        onSuccessLogin(user);
        onClose();
        setSuccessMsg('');
      }, 700);
    } catch {
      setIsLoading(false);
      setErrorMsg('Failed to process authentication. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={() => {
        if (!isRequired) onClose();
      }}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (only if not required) */}
        {!isRequired && (
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 p-[1px] shadow-lg shadow-brand-500/20 mb-3">
            <div className="w-full h-full bg-white rounded-[15px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-brand-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {isSignUp ? 'Create EmpireNexs Account' : 'Sign In to TTS bY Waqas Gill'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            {isRequired ? (
              <span className="text-amber-700 font-semibold">
                An active account is required to generate speech and clone voices.
              </span>
            ) : isSignUp ? (
              'Join TTS bY Waqas Gill for studio speech synthesis & AI voice cloning.'
            ) : (
              'Sign in to access your cloned voices, history, and studio features.'
            )}
          </p>

          {/* Perks pills */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap mt-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700">
              50,000 Words
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
              320+ Voices
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
              100% Free
            </span>
          </div>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <Ban className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg ? (
          <div className="py-8 flex flex-col items-center text-center gap-3 animate-in zoom-in-95">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <h3 className="text-base font-semibold text-slate-900">{successMsg}</h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Waqas Gill"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Free Account' : 'Sign In to Studio'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Switch between Sign In / Sign Up */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg('');
                }}
                className="text-xs text-slate-600 hover:text-brand-600 transition-colors"
              >
                {isSignUp ? (
                  <>
                    Already have an account?{' '}
                    <span className="font-semibold text-brand-600 underline">Sign In</span>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{' '}
                    <span className="font-semibold text-brand-600 underline">Sign Up Free</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Creator Footer with link to Waqas Gill Facebook */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Powered by EmpireNexs • Developed by{' '}
          <a
            href="https://www.facebook.com/mwaqasgillcs/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 hover:underline font-bold"
          >
            Waqas Gill
          </a>
        </div>
      </div>
    </div>
  );
}
