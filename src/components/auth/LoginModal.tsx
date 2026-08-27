'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, X, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        throw new Error(`Server status ${response.status}: Unable to process response. Please try again.`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials. Please check your email and password.');
      }

      onClose();
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
    setEmail('admin@yoursite.co.uk');
    setPassword('password123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div 
        className="absolute inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#191919] border border-slate-200 dark:border-[#2e2e2e] shadow-2xl p-6 sm:p-8 space-y-6 z-10 transition-colors duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close login modal"
          title="Close modal"
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#282828] transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-3 pt-2">
          {/* Long LockReview Logo (Light & Dark versions) */}
          <div className="flex items-center justify-center h-11 max-h-11">
            <Image
              src="/lockreview-icon-lt-lg.webp"
              alt="LockReview Review Generation & Reputation Management"
              width={240}
              height={42}
              priority
              style={{ height: '40px', width: 'auto', maxHeight: '40px' }}
              className="block dark:hidden h-[40px] max-h-[40px] w-auto object-contain"
            />
            <Image
              src="/lockreview-icon-dk-lg.webp"
              alt="LockReview Review Generation & Reputation Management"
              width={240}
              height={42}
              priority
              style={{ height: '40px', width: 'auto', maxHeight: '40px' }}
              className="hidden dark:block h-[40px] max-h-[40px] w-auto object-contain"
            />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Secure Reputation & Review Management Platform
            </p>
            <div className="mt-2.5 inline-block px-3 py-1 bg-red-500/10 border border-red-500/40 text-red-600 dark:text-red-400 text-[10px] font-extrabold tracking-wider uppercase">
              TEST DATA WILL BE RESET EVERY 24 HOURS
            </div>
          </div>
        </div>

        {/* Card Title & Desc */}
        <div className="space-y-1 border-t border-slate-200 dark:border-[#282828] pt-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sign In</h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            Access your business dashboard and reputation suite.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-200 text-xs">
            <AlertCircle size={16} className="text-rose-500 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label htmlFor="modal-email" className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider block">
              EMAIL ADDRESS
            </label>
            <div className="relative shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail size={16} />
              </div>
              <input
                id="modal-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yoursite.co.uk"
                className="block w-full pl-10 pr-4 py-2.5 bg-[#EAF1F8] border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E76A0E]/30 focus:border-[#E76A0E] transition-all font-medium"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label htmlFor="modal-password" className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider block">
              PASSWORD
            </label>
            <div className="relative shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock size={16} />
              </div>
              <input
                id="modal-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
                className="block w-full pl-10 pr-10 py-2.5 bg-[#EAF1F8] border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E76A0E]/30 focus:border-[#E76A0E] transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#E76A0E] hover:bg-[#d15d0b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg transition-all duration-200 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Authenticate Session</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Visitor Login Credentials Helper */}
        <div className="pt-3 border-t border-slate-200 dark:border-[#282828] text-center">
          <span className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase tracking-wider block font-bold">
            DEFAULT VISITOR LOGIN:
          </span>
          <code 
            onClick={handleAutoFill}
            title="Click to auto-fill visitor credentials"
            className="text-[11px] text-[#E76A0E] hover:text-[#d15d0b] block mt-1 select-all cursor-pointer font-mono font-bold"
          >
            admin@yoursite.co.uk / password123
          </code>
        </div>
      </div>
    </div>
  );
}
