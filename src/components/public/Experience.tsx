"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Download } from "lucide-react";
import { SectionHeading } from "@/components/public/SectionHeading";

interface ExperienceItem {
  role: string;
  company: string;
  companyUrl?: string;
  companyLogoUrl?: string;
  employmentType?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description: string;
  highlights?: string[];
  skills: { skill: { name: string } }[];
}

interface ExperienceProps {
  experiences: ExperienceItem[];
  resumeUrl?: string;
}

const date = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

function railLabel(experience: ExperienceItem, experiences: ExperienceItem[]) {
  const sameCompany = experiences.filter(
    (item) => item.company === experience.company,
  ).length;
  return sameCompany > 1
    ? `${experience.company} · ${experience.role}`
    : experience.company;
}

export function Experience({ experiences, resumeUrl }: ExperienceProps) {
  const [active, setActive] = useState(0);
  const selected = experiences[active];

  return (
    <section
      id="experience"
      style={{ background: "var(--section-experience)" }}
    >
      <div className="mx-auto max-w-360 px-5 py-20 md:px-10 lg:py-28">
        <SectionHeading index="04" title="Experience">
          A short record of the roles I have held — pick an entry to read more.
        </SectionHeading>

        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
          <aside className="flex flex-col gap-3 lg:sticky lg:top-28">
            {experiences.map((experience, index) => (
              <button
                type="button"
                key={`${experience.company}-${experience.role}-${experience.startDate}`}
                className="experience-rail-link"
                aria-current={index === active}
                onClick={() => setActive(index)}
              >
                {railLabel(experience, experiences)}
              </button>
            ))}
            {resumeUrl ? (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="experience-rail-link mt-2 inline-flex items-center align-items justify-content gap-2 border border-[var(--accent)] bg-transparent text-[var(--accent)]"
              >
                <Download className="h-4 w-4" />
                View résumé
              </a>
            ) : null}
          </aside>

          {selected ? (
            <div>
              <article className="experience-card">
                <p className="text-sm font-bold text-[var(--accent)]">
                  {date(selected.startDate)} —{" "}
                  {selected.endDate ? date(selected.endDate) : "Present"}
                </p>
                <h3 className="type-display mt-3 text-2xl leading-tight md:text-3xl">
                  {selected.role}
                </h3>
                <p className="type-muted mt-2">
                  <span className="mr-1 text-[var(--accent)]" aria-hidden="true">
                    ›
                  </span>
                  {selected.company}
                  {selected.employmentType
                    ? ` · ${selected.employmentType}`
                    : ""}
                  {selected.location ? ` · ${selected.location}` : ""}
                </p>
              </article>

              <div className="mt-8 border-t border-[var(--rule)] pt-8">
                <div className="portfolio-prose type-muted">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                  >
                    {selected.description}
                  </ReactMarkdown>
                </div>
                {selected.highlights && selected.highlights.length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {selected.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-2">
                        <span className="text-[var(--accent)]">→</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {selected.companyUrl ? (
                  <a
                    className="mt-5 inline-block font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={selected.companyUrl}
                  >
                    {selected.company}
                  </a>
                ) : null}
                <div className="mt-6 flex flex-wrap gap-2">
                  {selected.skills.map(({ skill }) => (
                    <span
                      className="border border-[var(--rule)] bg-[var(--paper)] px-3 py-1 text-sm text-[var(--muted)]"
                      key={skill.name}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
