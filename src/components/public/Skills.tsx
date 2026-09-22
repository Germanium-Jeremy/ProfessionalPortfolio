"use client";

import { motion } from "framer-motion";

interface Skill {
  name: string;
  category: string;
  level: number;
}
interface SkillsProps {
  skills: Skill[];
}

const categoryLabels: Record<string, string> = {
  languages: "Languages",
  "frameworks-libraries": "Frameworks & Libraries",
  "databases-backend": "Databases & Backend",
  "devops-tools": "DevOps & Tools",
  "specialized-domains": "Specialized Domains (AI & IoT)",
};
const categoryOrder = Object.keys(categoryLabels);

export function Skills({ skills }: SkillsProps) {
  const categories = Array.from(
    new Set(skills.map((skill) => skill.category)),
  ).sort((a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b));
  return (
    <section
      id="skills"
      className="mx-auto max-w-[90rem] px-5 py-20 md:px-10 lg:py-32"
    >
      <div className="mb-10 flex flex-col justify-between gap-4 md:mb-14 md:flex-row md:items-end">
        <div>
          <p className="section-kicker">03 / Expertise</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white md:text-6xl">
            Tools of the trade.
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-400">
          A pragmatic toolkit shaped by curiosity, product thinking, and a love
          of shipping.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category, categoryIndex) => (
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: categoryIndex * 0.06 }}
            key={category}
            className="group rounded-[1.75rem] border border-white/10 bg-[#0c1a2d]/70 p-6 transition-colors hover:border-cyan-200/30 md:p-7"
          >
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {categoryLabels[category] ?? category}
              </h3>
              <span className="text-xs text-cyan-200/70">
                0{categoryIndex + 1}
              </span>
            </div>
            <div className="space-y-5">
              {skills
                .filter((skill) => skill.category === category)
                .sort((a, b) => b.level - a.level)
                .map((skill) => (
                  <div key={skill.name}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium text-slate-200">
                        {skill.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {skill.level}/5
                      </span>
                    </div>
                    <div
                      aria-label={`${skill.name}: ${skill.level} out of 5`}
                      className="flex gap-1"
                    >
                      {Array.from({ length: 5 }, (_, index) => (
                        <span
                          className={
                            index < skill.level
                              ? "h-1 flex-1 rounded-full bg-gradient-to-r from-cyan-300 to-blue-400"
                              : "h-1 flex-1 rounded-full bg-white/10"
                          }
                          key={index}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
