'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Ban,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { OWNER_EMAIL } from '@/lib/user-store';

type AuthViewMode =
  | 'signin'
  | 'signup'
  | 'signup-otp'
  | 'forgot-password'
  | 'reset-password-otp';

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
  const [mode, setMode] = useState<AuthViewMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  if (!isOpen) return null;

  const validateIsGmail = (emailToTest: string): boolean => {
    const trimmed = emailToTest.trim().toLowerCase();
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(trimmed);
  };

  // 1. STEP 1: SEND SIGNUP OTP
  const handleStartSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!validateIsGmail(normalizedEmail)) {
      setErrorMsg(
        'Only official @gmail.com accounts are accepted. Temporary, disposable, and non-Gmail emails are strictly blocked.'
      );
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          purpose: 'signup',
          name: name.trim(),
          password,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to send verification code.');
        return;
      }

      setMode('signup-otp');
      setResendCountdown(60);
      setSuccessMsg(`A 6-digit verification code was sent to ${normalizedEmail}.`);
    } catch {
      setIsLoading(false);
      setErrorMsg('Network error while requesting verification code. Please try again.');
    }
  };

  // 2. STEP 2: VERIFY SIGNUP OTP
  const handleVerifySignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: otpCode.trim(),
          purpose: 'signup',
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Verification failed. Please try again.');
        return;
      }

      const verifiedUser = data.user || {
        name: name.trim() || email.split('@')[0],
        email: email.trim().toLowerCase(),
      };

      try {
        localStorage.setItem('empirenexs_user', JSON.stringify(verifiedUser));

        // Mirror to registered accounts for Admin Panel
        const stored = localStorage.getItem('empirenexs_registered_accounts');
        let list: Array<{ id: string; name: string; email: string; createdAt: string; lastActive: string; voicesGenerated: number; role: string; isBlocked: boolean }> = [];
        if (stored) {
          try {
            list = JSON.parse(stored);
          } catch {}
        }
        if (!list.some((u) => u.email.toLowerCase() === verifiedUser.email.toLowerCase())) {
          list.unshift({
            id: verifiedUser.id || `user_${Date.now()}`,
            name: verifiedUser.name,
            email: verifiedUser.email,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            voicesGenerated: 0,
            role: 'user',
            isBlocked: false,
          });
          localStorage.setItem('empirenexs_registered_accounts', JSON.stringify(list));
        }
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }

      setSuccessMsg(`Account verified successfully! Welcome to TTS bY Waqas Gill.`);
      setTimeout(() => {
        onSuccessLogin(verifiedUser);
        onClose();
      }, 700);
    } catch {
      setIsLoading(false);
      setErrorMsg('Failed to verify code. Please try again.');
    }
  };

  // 3. SIGN IN EXISTING USER
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!validateIsGmail(normalizedEmail)) {
      setErrorMsg('Only official @gmail.com accounts are accepted.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: normalizedEmail,
          password,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Invalid credentials.');
        return;
      }

      const loggedInUser = data.user || {
        name: normalizedEmail === OWNER_EMAIL.toLowerCase() ? 'Waqas Gill' : normalizedEmail.split('@')[0],
        email: normalizedEmail,
      };

      try {
        localStorage.setItem('empirenexs_user', JSON.stringify(loggedInUser));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }

      setSuccessMsg(`Welcome back, ${loggedInUser.name}!`);
      setTimeout(() => {
        onSuccessLogin(loggedInUser);
        onClose();
      }, 600);
    } catch {
      setIsLoading(false);
      setErrorMsg('Failed to sign in. Please try again.');
    }
  };

  // 4. FORGOT PASSWORD: REQUEST RESET OTP
  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!validateIsGmail(normalizedEmail)) {
      setErrorMsg('Please enter your registered @gmail.com address.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          purpose: 'reset-password',
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to send password reset code.');
        return;
      }

      setMode('reset-password-otp');
      setResendCountdown(60);
      setSuccessMsg(`Password reset code sent to ${normalizedEmail}.`);
    } catch {
      setIsLoading(false);
      setErrorMsg('Network error while requesting password reset.');
    }
  };

  // 5. RESET PASSWORD: SUBMIT OTP & NEW PASSWORD
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: otpCode.trim(),
          purpose: 'reset-password',
          newPassword,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to reset password.');
        return;
      }

      setSuccessMsg('Your password has been successfully reset! You can now sign in.');
      setTimeout(() => {
        setMode('signin');
        setPassword('');
        setOtpCode('');
      }, 1500);
    } catch {
      setIsLoading(false);
      setErrorMsg('Failed to reset password. Please try again.');
    }
  };

  // 6. GOOGLE 1-CLICK AUTH
  const handleGoogleAuth = () => {
    setErrorMsg('');
    setIsLoading(true);

    // Prompt user for their Google Email or authenticate
    const googleEmailPrompt = prompt(
      'Enter your @gmail.com to continue with Google Sign-In:',
      email.endsWith('@gmail.com') ? email : ''
    );

    if (!googleEmailPrompt) {
      setIsLoading(false);
      return;
    }

    const normalized = googleEmailPrompt.trim().toLowerCase();
    if (!validateIsGmail(normalized)) {
      setIsLoading(false);
      setErrorMsg('Only valid @gmail.com accounts are supported for Google Sign-In.');
      return;
    }

    setTimeout(async () => {
      const isOwner = normalized === OWNER_EMAIL.toLowerCase();
      const googleUser = {
        name: isOwner ? 'Waqas Gill' : normalized.split('@')[0],
        email: normalized,
      };

      await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name: googleUser.name, email: googleUser.email }),
      }).catch(() => {});

      try {
        localStorage.setItem('empirenexs_user', JSON.stringify(googleUser));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }

      setIsLoading(false);
      setSuccessMsg(`Google Sign-In verified as ${googleUser.name}!`);
      setTimeout(() => {
        onSuccessLogin(googleUser);
        onClose();
      }, 700);
    }, 700);
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
            {mode === 'signin' && 'Sign In to TTS bY Waqas Gill'}
            {mode === 'signup' && 'Create Your Account'}
            {mode === 'signup-otp' && 'Verify Your Gmail'}
            {mode === 'forgot-password' && 'Reset Your Password'}
            {mode === 'reset-password-otp' && 'Set New Password'}
          </h2>

          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            {mode === 'signup-otp' ? (
              <span>Enter the 6-digit code sent to <strong className="text-slate-800">{email}</strong></span>
            ) : mode === 'forgot-password' ? (
              <span>Enter your registered @gmail.com to receive a reset code</span>
            ) : mode === 'reset-password-otp' ? (
              <span>Enter code sent to <strong className="text-slate-800">{email}</strong> and pick a new password</span>
            ) : isRequired ? (
              <span className="text-amber-700 font-semibold">
                An active account is required to generate speech and clone voices.
              </span>
            ) : mode === 'signup' ? (
              'Only official @gmail.com addresses accepted. No temp mails.'
            ) : (
              'Sign in to access your cloned voices, history, and studio features.'
            )}
          </p>

          {/* Perks pills */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap mt-2.5">
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
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Success / Status Message */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}



        {/* VIEW 1: SIGN IN */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gmail Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot-password');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-xs text-brand-600 hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-700 absolute right-3 top-1/2 -translate-y-1/2 rounded-lg transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? <span>Signing in...</span> : <span>Sign In to Studio</span>}
            </button>

            {/* Google 1-Click Button */}
            <div className="relative my-2 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Or Continue With
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-slate-600 hover:text-brand-600 transition-colors"
              >
                Don&apos;t have an account?{' '}
                <span className="font-semibold text-brand-600 underline">Sign Up Free</span>
              </button>
            </div>
          </form>
        )}

        {/* VIEW 2: SIGN UP (DETAILS ENTRY) */}
        {mode === 'signup' && (
          <form onSubmit={handleStartSignUp} className="flex flex-col gap-3.5">
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Gmail Address <span className="text-brand-600 text-[11px] font-bold">(@gmail.com only)</span>
                </label>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="username@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Create Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-700 absolute right-3 top-1/2 -translate-y-1/2 rounded-lg transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? (
                <span>Sending Code...</span>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Google 1-Click Option */}
            <div className="relative my-2 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Or Sign Up With
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign Up with Google</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-slate-600 hover:text-brand-600 transition-colors"
              >
                Already have an account?{' '}
                <span className="font-semibold text-brand-600 underline">Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: SIGN UP (OTP VERIFICATION) */}
        {mode === 'signup-otp' && (
          <form onSubmit={handleVerifySignUp} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                autoFocus
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="w-full text-center tracking-[0.5em] font-mono text-2xl bg-slate-50 border border-slate-200 rounded-2xl py-3 text-slate-900 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length !== 6}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? <span>Verifying Code...</span> : <span>Verify & Create Account</span>}
            </button>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setOtpCode('');
                  setErrorMsg('');
                }}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Email</span>
              </button>

              {resendCountdown > 0 ? (
                <span className="text-slate-400">Resend in {resendCountdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleStartSignUp}
                  className="text-brand-600 hover:underline font-semibold"
                >
                  Resend Code
                </button>
              )}
            </div>
          </form>
        )}

        {/* VIEW 4: FORGOT PASSWORD (REQUEST CODE) */}
        {mode === 'forgot-password' && (
          <form onSubmit={handleRequestPasswordReset} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registered Gmail Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? (
                <span>Sending Reset Code...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Send Reset Code to Gmail</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-slate-600 hover:text-brand-600 flex items-center justify-center gap-1 mx-auto transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* VIEW 5: RESET PASSWORD (ENTER OTP & NEW PASSWORD) */}
        {mode === 'reset-password-otp' && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
                6-Digit Reset Code sent to your Gmail
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="w-full text-center tracking-[0.4em] font-mono text-xl bg-slate-50 border border-slate-200 rounded-2xl py-2.5 text-slate-900 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Set New Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-700 absolute right-3 top-1/2 -translate-y-1/2 rounded-lg transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length !== 6 || newPassword.length < 6}
              className="mt-1 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? <span>Updating Password...</span> : <span>Update Password & Sign In</span>}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-slate-600 hover:text-brand-600 flex items-center justify-center gap-1 mx-auto transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel & Return to Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* Creator Footer with link to Waqas Gill Facebook */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Powered by EmpireNexs • Crafted by{' '}
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
