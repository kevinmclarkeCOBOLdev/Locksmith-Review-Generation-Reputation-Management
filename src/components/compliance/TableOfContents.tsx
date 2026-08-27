'use client';

import React from 'react';
import { ListOrdered } from 'lucide-react';

export interface TocItem {
  id: string;
  title: string;
}

export interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Table of contents"
      className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] p-5 space-y-4 shadow-sm sticky top-8"
    >
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#383838] pb-3 text-slate-900 dark:text-white font-extrabold text-sm">
        <ListOrdered size={16} className="text-[#E76A0E]" />
        <span>Table of Contents</span>
      </div>

      <ol className="space-y-2 text-xs">
        {items.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => handleScroll(item.id)}
              className="w-full text-left flex items-start gap-2.5 text-slate-600 dark:text-neutral-400 hover:text-[#E76A0E] dark:hover:text-[#E76A0E] transition-colors py-1 cursor-pointer font-medium"
            >
              <span className="text-[10px] font-bold text-[#E76A0E] w-4 shrink-0 text-right">
                {index + 1}.
              </span>
              <span className="leading-snug">{item.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
