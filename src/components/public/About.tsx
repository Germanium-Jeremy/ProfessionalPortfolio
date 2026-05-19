'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface AboutProps {
  profile: {
    bio: string;
    funFacts?: string[];
  };
}

export function About({ profile }: AboutProps) {
  return (
    <section id="about" className="py-20 space-y-12 max-w-4xl mx-auto px-4">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">About Me</h2>
        <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full" />
      </div>

      <div className="prose dark:prose-invert max-w-none text-lg text-slate-600 dark:text-slate-300">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
        >
          {profile.bio}
        </ReactMarkdown>
      </div>

      {profile.funFacts && profile.funFacts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-center">Fun Facts</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {profile.funFacts.map((fact, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium"
              >
                {fact}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
