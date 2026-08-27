import React from 'react';

export interface PolicySectionProps {
  id: string;
  number: number;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function PolicySection({ id, number, title, icon, children }: PolicySectionProps) {
  return (
    <section id={id} className="scroll-mt-28 space-y-4 text-left">
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 bg-[#E76A0E]/15 border border-[#E76A0E]/30 text-[#E76A0E] font-extrabold text-xs flex items-center justify-center shrink-0">
          {number}
        </span>
        <div className="flex items-center gap-2">
          {icon && <span className="text-[#E76A0E]">{icon}</span>}
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
        </div>
      </div>

      <div className="text-sm text-slate-700 dark:text-neutral-300 leading-relaxed space-y-3 font-normal pl-11">
        {children}
      </div>
    </section>
  );
}
