'use client';

import React from 'react';

interface Skill {
  name: string;
  category: string;
  level: number;
}

interface SkillsProps {
  skills: Skill[];
}

export function Skills({ skills }: SkillsProps) {
  const categories = Array.from(new Set(skills.map(s => s.category)));

  return (
    <section id="skills" className="py-20 space-y-12 max-w-5xl mx-auto px-4">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">Skills</h2>
        <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map(cat => (
          <div key={cat} className="space-y-4 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-bold capitalize text-slate-800 dark:text-slate-100">
              {cat}
            </h3>
            <div className="space-y-4">
              {skills
                .filter(s => s.category === cat)
                .sort((a, b) => b.level - a.level)
                .map((skill, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>{skill.name}</span>
                      <span className="text-slate-500">{skill.level}/5</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "h-1.5 flex-1 rounded-full transition-colors",
                            idx < skill.level ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
