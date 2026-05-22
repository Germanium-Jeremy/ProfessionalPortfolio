'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, GitBranch, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImageUrl?: string;
  status: string;
  isFeatured: boolean;
  skills: { skill: { name: string } }[];
  links: {
    kind: string;
    label: string;
    url: string;
    isPrimary: boolean;
  }[];
}

interface ProjectsProps {
  projects: Project[];
}

export function Projects({ projects }: ProjectsProps) {
  return (
    <section id="projects" className="py-20 space-y-12 max-w-6xl mx-auto px-4">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">Projects</h2>
        <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, i) => {
          const primaryLink = project.links.find(l => l.isPrimary) ||
                               project.links.find(l => l.kind === 'live') ||
                               project.links.find(l => l.kind === 'github') ||
                               null;

          return (
            <div key={project.id} className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="aspect-video relative overflow-hidden bg-slate-200 dark:bg-slate-700">
                {project.coverImageUrl ? (
                  <Image
                    src={project.coverImageUrl}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Layout className="w-12 h-12 opacity-20" />
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold group-hover:text-blue-500 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {project.summary}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.skills.slice(0, 4).map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {s.skill.name}
                    </span>
                  ))}
                  {project.skills.length > 4 && (
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      +{project.skills.length - 4} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Details <ExternalLink className="w-3 h-3" />
                  </Link>
                  {primaryLink && (
                    <a
                      href={primaryLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                      aria-label={primaryLink.label}
                    >
                      {primaryLink.kind === 'github' ? <GitBranch className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
