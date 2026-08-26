'use client';

import React, { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { LoginForm } from './LoginForm';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark & Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-white dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#383838] shadow-2xl z-10 transition-all animate-in zoom-in-95 duration-200 my-8 p-6 sm:p-8 flex flex-col"
      >
        {/* Close Button X */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close login dialog"
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6 pr-6 pl-6">
          <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-orange-50 dark:bg-orange-950/40 text-[#E76A0E] border border-orange-200 dark:border-orange-900/40 text-[10px] font-bold uppercase tracking-widest mx-auto mb-3">
            <Sparkles size={12} />
            Review & Reputation Suite
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Locksmith Sign In
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
            Authenticate using your shared LockQuote locksmith credentials.
          </p>
        </div>

        {/* Form Body */}
        <LoginForm />
      </div>
    </div>
  );
}
