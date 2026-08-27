'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Send,
  MessageSquareWarning,
  Sliders,
  BarChart3,
  LogOut,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeProvider';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  target?: string;
  rel?: string;
  badge?: string | number;
}

function SidebarLink({ href, icon, children, target, rel, badge }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={`flex items-center justify-between px-4 py-3 text-sm font-semibold transition-all duration-150 ${
        isActive
          ? 'bg-[#E76A0E] text-white font-bold shadow-sm'
          : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#282828]'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{children}</span>
      </div>
      {badge !== undefined && (
        <span
          className={`text-[10px] px-2 py-0.5 font-bold ${
            isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-[#333] text-slate-700 dark:text-neutral-300'
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [tenantName, setTenantName] = useState<string>('DEMO Locksmith');
  const [userEmail, setUserEmail] = useState<string>('support@atypikalstudio.dev');

  useEffect(() => {
    // Fetch current verified session context
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          if (data.data.tenant?.name) setTenantName(data.data.tenant.name);
          if (data.data.user?.email) setUserEmail(data.data.user.email);
        }
      })
      .catch((err) => console.warn('Failed to load session info:', err));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/?login=true');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#1c1c1c] text-slate-900 dark:text-neutral-100 font-sans transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-[#333333] bg-white dark:bg-[#161616] flex flex-col justify-between shrink-0 hidden md:flex h-screen overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Logo & Ecosystem Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 relative shrink-0 flex items-center justify-center">
              <Image
                src="/lockreview-icon-lt-sq.webp"
                alt="LockReview"
                width={36}
                height={36}
                priority
                className="w-9 h-9 block dark:hidden object-contain"
              />
              <Image
                src="/lockreview-icon-dk-sq.webp"
                alt="LockReview"
                width={36}
                height={36}
                priority
                className="w-9 h-9 hidden dark:block object-contain"
              />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                LockReview
              </h1>
              <span className="text-[10px] text-[#E76A0E] uppercase tracking-widest font-bold">
                Reputation Suite
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="pb-1">
              <span className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                Reputation
              </span>
            </div>
            <SidebarLink href="/dashboard" icon={<LayoutDashboard size={18} />}>
              Dashboard
            </SidebarLink>
            <SidebarLink href="/dashboard/requests" icon={<Send size={18} />}>
              Review Requests
            </SidebarLink>
            <SidebarLink href="/dashboard/feedback" icon={<MessageSquareWarning size={18} />}>
              Feedback Inbox
            </SidebarLink>
            <SidebarLink href="/dashboard/analytics" icon={<BarChart3 size={18} />}>
              Analytics
            </SidebarLink>

            <div className="pt-4 pb-1">
              <span className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                Configuration
              </span>
            </div>
            <SidebarLink href="/dashboard/settings" icon={<Sliders size={18} />}>
              Platforms & Settings
            </SidebarLink>

            <div className="pt-4 pb-1">
              <span className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                Cross-App Ecosystem
              </span>
            </div>
            <SidebarLink
              href="https://lockquote.atypikalstudio.dev"
              icon={<ExternalLink size={18} />}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open LockQuote
            </SidebarLink>
          </nav>
        </div>

        {/* Footer info with Theme Toggle, Tenant Badge & Logout */}
        <div className="p-5 border-t border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#121212] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">Appearance</span>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-[#262626]">
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                {tenantName}
              </p>
              <span className="text-[10px] text-slate-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5 truncate">
                <ShieldCheck size={11} className="text-[#E76A0E] shrink-0" />
                <span className="truncate">{userEmail}</span>
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-[#282828] transition-all cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-slate-200 dark:border-[#333333] bg-white dark:bg-[#161616] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 relative shrink-0 flex items-center justify-center">
              <Image
                src="/lockreview-icon-lt-sq.webp"
                alt="LockReview"
                width={28}
                height={28}
                priority
                className="w-7 h-7 block dark:hidden object-contain"
              />
              <Image
                src="/lockreview-icon-dk-sq.webp"
                alt="LockReview"
                width={28}
                height={28}
                priority
                className="w-7 h-7 hidden dark:block object-contain"
              />
            </div>
            <h1 className="font-extrabold text-sm text-slate-900 dark:text-white">LockReview</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main scrollable view */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
