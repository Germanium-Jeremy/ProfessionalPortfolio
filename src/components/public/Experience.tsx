'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface ExperienceProps {
  experiences: {
    role: string;
    company: string;
    companyUrl?: string;
    employmentType?: string;
    location?: string;
    startDate: string;
    endDate?: string;
    description: string;
    highlights?: string[];
    skills: { skill: { name: string } }[];
  }[];
}

export function Experience({ experiences }: ExperienceProps) {
  return (
    <section id="experience" className="py-20 space-y-12 max-w-4xl mx-auto px-4">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">Experience</h2>
        <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full" />
      </div>

      <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent">
        {experiences.map((exp, i) => (
          <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 text-slate-500 shrink-0 md:absolute md:left-1/2 md:-translate-x-1/2 z-10">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col mb-4">
                <h3 className="text-xl font-bold">{exp.role}</h3>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  {exp.companyUrl ? (
                    <a href={exp.companyUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">{exp.company}</a>
                  ) : (
                    <span>{exp.company}</span>
                  )}
                  {exp.employmentType && <span>• {exp.employmentType}</span>}
                  {exp.location && <span>• {exp.location}</span>}
                </div>
                <div className="text-xs font-medium text-slate-400 mt-1">
                  {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} — {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                </div>
              </div>

              <div className="prose dark:prose-invert text-sm text-slate-600 dark:text-slate-300 mb-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                  {exp.description}
                </ReactMarkdown>
              </div>

              {exp.highlights && exp.highlights.length > 0 && (
                <ul className="space-y-2 mb-4">
                  {exp.highlights.map((h, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2 text-slate-600 dark:text-slate-400">
                      <span className="text-blue-500 mt-1">•</span>
                      {h}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap gap-2">
                {exp.skills.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    {s.skill.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
