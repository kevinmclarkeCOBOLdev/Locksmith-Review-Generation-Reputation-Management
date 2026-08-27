import React from 'react';
import { ShieldCheck, Calendar, FileCode, CheckCircle2 } from 'lucide-react';

export interface PolicyHeaderProps {
  title: string;
  subtitle: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  badgeText?: string;
  badgeIcon?: React.ReactNode;
  versionLabel?: string;
}

export function PolicyHeader({
  title,
  subtitle,
  version,
  effectiveDate,
  lastUpdated,
  badgeText = 'UK GDPR & Data Protection Act Compliant',
  badgeIcon,
  versionLabel = 'Policy Version',
}: PolicyHeaderProps) {
  return (
    <header className="space-y-6 text-left border-b border-slate-200 dark:border-[#383838] pb-8">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E76A0E]/10 border border-[#E76A0E]/30 text-xs font-bold text-[#E76A0E] uppercase tracking-wider">
        {badgeIcon || <ShieldCheck size={14} />} {badgeText}
      </div>

      {/* Main Title & Subtitle */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-neutral-400 max-w-3xl font-medium leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Policy Metadata Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#E76A0E]/15 border border-[#E76A0E]/30 flex items-center justify-center text-[#E76A0E] shrink-0">
            <FileCode size={18} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider block">
              {versionLabel}
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              v{version} <CheckCircle2 size={14} className="text-emerald-500" />
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#E76A0E]/15 border border-[#E76A0E]/30 flex items-center justify-center text-[#E76A0E] shrink-0">
            <Calendar size={18} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider block">
              Effective Date
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {effectiveDate}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#E76A0E]/15 border border-[#E76A0E]/30 flex items-center justify-center text-[#E76A0E] shrink-0">
            <Calendar size={18} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider block">
              Last Updated
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {lastUpdated}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
