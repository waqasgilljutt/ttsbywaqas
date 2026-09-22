'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: { name: string; email: string }) => void;
}

export function AuthModal({ isOpen, onClose, onSuccessLogin }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const user = {
        name: name || (isSignUp ? 'Waqas User' : email.split('@')[0]),
        email,
      };
      setSuccessMsg(isSignUp ? 'Account created successfully!' : 'Signed in successfully!');
      setTimeout(() => {
        onSuccessLogin(user);
        onClose();
      }, 700);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 p-[1px] shadow-lg shadow-brand-500/20 mb-3">
            <div className="w-full h-full bg-white rounded-[15px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-brand-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {isSignUp ? 'Create EmpireNexs Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            {isSignUp
              ? 'Join TTS bY Waqas Gill for unlimited speech synthesis and voice cloning.'
              : 'Sign in to access your cloned voices, history, and studio preferences.'}
          </p>
        </div>

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
              className="mt-2 w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-slate-600 hover:text-brand-600 transition-colors"
              >
                {isSignUp ? (
                  <>Already have an account? <span className="font-semibold text-brand-600 underline">Sign In</span></>
                ) : (
                  <>Don&apos;t have an account? <span className="font-semibold text-brand-600 underline">Sign Up Free</span></>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
