'use client';

import React from 'react';

interface Testimonial {
  authorName: string;
  authorRole: string | null;
  authorCompany: string | null;
  authorAvatarUrl: string | null;
  quote: string;
  rating: number | null;
  sourceUrl: string | null;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-20 space-y-12 max-w-6xl mx-auto px-4">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">Testimonials</h2>
        <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <div key={i} className="p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative">
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <span key={idx} className={cn(
                  "text-sm",
                  idx < (t.rating || 0) ? "text-yellow-500" : "text-slate-300 dark:text-slate-600"
                )}>★</span>
              ))}
            </div>
            <p className="text-slate-600 dark:text-slate-300 italic mb-6">"{t.quote}"</p>
            <div className="flex items-center gap-4">
              {t.authorAvatarUrl ? (
                <img src={t.authorAvatarUrl} alt={t.authorName} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-400">
                  {t.authorName[0]}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-bold text-sm">{t.authorName}</span>
                <span className="text-xs text-slate-500">{t.authorRole} @ {t.authorCompany}</span>
              </div>
            </div>
            {t.sourceUrl && (
              <a
                href={t.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 right-4 text-slate-400 hover:text-blue-500 transition-colors"
                aria-label="View source"
              >
                <ExternalLinkIcon />
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ExternalLinkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="16" y1="3" x2="16" y2="9"/></svg>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
