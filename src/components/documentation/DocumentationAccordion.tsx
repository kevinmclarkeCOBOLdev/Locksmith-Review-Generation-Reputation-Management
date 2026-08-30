'use client';

import React, { useState } from 'react';
import { ListOrdered, ChevronDown } from 'lucide-react';

export interface DocSubItem {
  number: string;
  title: string;
}

export interface DocTocItem {
  number: string;
  title: string;
  subItems?: DocSubItem[];
}

export interface DocumentationAccordionProps {
  features: DocTocItem[];
}

export function DocumentationAccordion({ features }: DocumentationAccordionProps) {
  // First item ('1') is open by default, all following items closed
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    '1': true,
  });

  const toggleSection = (number: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [number]: !prev[number],
    }));
  };

  return (
    <nav
      aria-label="Documentation Table of Contents"
      className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] p-6 space-y-4 shadow-sm sticky top-8"
    >
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#383838] pb-3.5 text-slate-900 dark:text-white font-extrabold text-sm">
        <div className="flex items-center gap-2">
          <ListOrdered size={18} className="text-[#00d492]" />
          <span>Feature &amp; Architecture Index</span>
        </div>
      </div>

      <ol className="space-y-3 text-xs">
        {features.map((item) => {
          const isOpen = Boolean(openSections[item.number]);

          return (
            <li key={item.number} className="space-y-1.5">
              {/* Primary Feature Header Button (Accordion Trigger) */}
              <button
                type="button"
                onClick={() => toggleSection(item.number)}
                className="w-full group flex items-center justify-between gap-2 text-slate-800 dark:text-neutral-200 hover:text-[#00d492] dark:hover:text-[#00d492] transition-colors font-bold text-xs py-1 cursor-pointer text-left"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <span className="font-mono text-[#00d492] w-5 shrink-0 font-extrabold">
                    {item.number}.
                  </span>
                  <span className="leading-snug group-hover:underline underline-offset-2">
                    {item.title}
                  </span>
                </div>
                <ChevronDown
                  size={15}
                  className={`shrink-0 transition-transform duration-200 text-slate-400 dark:text-neutral-500 group-hover:text-[#00d492] ${
                    isOpen ? 'rotate-180 text-[#00d492]' : ''
                  }`}
                />
              </button>

              {/* Sub-Features Hierarchical List (Displayed when open) */}
              {isOpen && item.subItems && item.subItems.length > 0 && (
                <ul className="pl-6 space-y-1.5 border-l-2 border-slate-100 dark:border-[#282828] ml-2.5 pt-1 pb-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {item.subItems.map((sub) => (
                    <li key={sub.number}>
                      <a
                        href="#"
                        className="group flex items-start gap-2 text-slate-500 dark:text-neutral-400 hover:text-[#00d492] dark:hover:text-[#00d492] transition-colors py-0.5 text-[11px]"
                      >
                        <span className="font-mono text-[10px] text-slate-400 dark:text-neutral-500 group-hover:text-[#00d492] w-6 shrink-0">
                          {sub.number}
                        </span>
                        <span className="leading-tight group-hover:underline underline-offset-2">
                          {sub.title}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>

      <div className="pt-3 border-t border-slate-200 dark:border-[#383838] text-[11px] text-slate-500 dark:text-neutral-400 text-center">
        LockReview SaaS v1.0 • © {new Date().getFullYear()} Atypikal Studio
      </div>
    </nav>
  );
}
