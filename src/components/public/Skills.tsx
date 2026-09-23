"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/public/SectionHeading";

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
      className="skills-sheet"
      style={{ background: "var(--section-skills)" }}
    >
      <div className="mx-auto max-w-360 px-5 py-20 md:px-10 lg:py-28">
        <SectionHeading index="03" title="Expertise">
          A pragmatic toolkit shaped by curiosity, product thinking, and a love
          of shipping.
        </SectionHeading>
        <div className="grid gap-10 md:grid-cols-2">
          {categories.map((category, categoryIndex) => (
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: categoryIndex * 0.05 }}
              key={category}
              className="border-t border-[var(--foreground)]/20 pt-5"
            >
              <h3 className="type-display mb-6 text-2xl md:text-3xl">
                {categoryLabels[category] ?? category}
              </h3>
              <ul className="space-y-4">
                {skills
                  .filter((skill) => skill.category === category)
                  .sort((a, b) => b.level - a.level)
                  .map((skill) => (
                    <li key={skill.name}>
                      <div className="mb-1 flex items-baseline justify-between gap-3">
                        <span>{skill.name}</span>
                        <span className="text-sm text-[var(--muted)]">
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
                                ? "h-1.5 flex-1 bg-[var(--secondary)]"
                                : "h-1.5 flex-1 bg-[var(--foreground)]/12"
                            }
                            key={index}
                          />
                        ))}
                      </div>
                    </li>
                  ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
