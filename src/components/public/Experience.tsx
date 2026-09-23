"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import Image from "next/image";
import { SectionHeading } from "@/components/public/SectionHeading";

interface ExperienceProps {
  experiences: {
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
  }[];
}

const date = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

export function Experience({ experiences }: ExperienceProps) {
  return (
    <section
      id="experience"
      className="lined-paper"
      style={{ background: "var(--section-experience)" }}
    >
      <div className="mx-auto max-w-360 px-5 py-20 md:px-10 lg:py-28">
        <SectionHeading index="04" title="Experience">
          The roles that shaped how I build, collaborate, and ship.
        </SectionHeading>

        <ol>
          {experiences.map((experience) => (
            <li
              key={`${experience.company}-${experience.role}`}
              className="grid gap-6 border-t border-[var(--foreground)]/15 py-10 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-12 lg:grid-cols-[13rem_minmax(0,1fr)_14rem]"
            >
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
                {date(experience.startDate)}
                <span className="mt-1 block text-[var(--muted)]">
                  {experience.endDate ? date(experience.endDate) : "Present"}
                </span>
              </p>

              <div>
                <div className="flex items-start gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-[var(--rule)] bg-[var(--paper)]">
                    {experience.companyLogoUrl ? (
                      <Image
                        src={experience.companyLogoUrl}
                        alt=""
                        fill
                        className="object-contain p-1.5"
                      />
                    ) : (
                      <span className="grid h-full place-items-center text-lg font-bold text-[var(--accent)]">
                        {experience.company.slice(0, 1)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="type-display text-3xl leading-tight md:text-4xl">
                      {experience.role}
                    </h3>
                    <p className="mt-2">
                      {experience.companyUrl ? (
                        <a
                          className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={experience.companyUrl}
                        >
                          {experience.company}
                        </a>
                      ) : (
                        <span className="font-semibold">{experience.company}</span>
                      )}
                      {experience.employmentType || experience.location ? (
                        <span className="type-muted">
                          {" "}
                          ·{" "}
                          {[experience.employmentType, experience.location]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      ) : null}
                    </p>
                  </div>
                </div>

                <div className="portfolio-prose type-muted mt-5">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                  >
                    {experience.description}
                  </ReactMarkdown>
                </div>
                {experience.highlights && experience.highlights.length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {experience.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-2">
                        <span className="text-[var(--accent)]">→</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-wrap content-start gap-2 lg:justify-end">
                {experience.skills.map(({ skill }) => (
                  <span
                    className="h-fit border border-[var(--rule)] bg-[var(--paper)] px-3 py-1 text-sm text-[var(--muted)]"
                    key={skill.name}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
