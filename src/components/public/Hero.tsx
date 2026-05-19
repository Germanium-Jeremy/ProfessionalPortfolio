'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroProps {
  profile: {
    fullName: string;
    headline: string;
    tagline?: string;
    avatarUrl?: string;
    availability?: string;
    resumeUrl?: string;
  };
  socials: {
    kind: string;
    url: string;
    iconKey?: string;
  }[];
}

export function Hero({ profile, socials }: HeroProps) {
  return (
    <section className="py-20 lg:py-32 flex flex-col items-center text-center space-y-8">
      <div className="relative w-32 h-32 md:w-48 md:h-48 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-slate-900">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.fullName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-4xl font-bold text-slate-400">
              {profile.fullName[0]}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 max-w-3xl px-4">
        <div className="flex justify-center">
          {profile.availability && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              {profile.availability}
            </span>
          )}
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          {profile.fullName}
        </h1>
        <p className="text-2xl md:text-3xl font-semibold text-slate-600 dark:text-slate-300">
          {profile.headline}
        </p>
        {profile.tagline && (
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {profile.tagline}
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Button size="lg" className="gap-2" onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}>
          View projects <ArrowRight className="w-4 h-4" />
        </Button>
        {profile.resumeUrl && (
          <Button size="lg" variant="outline" className="gap-2">
            Download résumé <Download className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="flex justify-center gap-6 pt-4">
        {socials.map((social, i) => (
          <a
            key={i}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
            aria-label={social.kind}
          >
            {/* In a real app, map social.kind to specific Lucide icons */}
            <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold">
              {social.kind[0].toUpperCase()}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
