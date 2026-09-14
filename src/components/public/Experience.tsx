"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import Image from "next/image";

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
      className="mx-auto max-w-360 px-5 py-20 md:px-10 lg:py-32"
    >
      <div className="mb-12">
        <p className="section-kicker">04 / Experience</p>
        <h2 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white md:text-6xl">
          Where I’ve made an impact.
        </h2>
      </div>
      <div className="border-t border-white/10">
        {experiences.map((experience, index) => (
          <article
            key={`${experience.company}-${experience.role}`}
            className="grid gap-5 border-b border-white/10 py-8 md:grid-cols-[.35fr_1.15fr_.5fr] md:gap-8 md:py-11"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/80">
              {date(experience.startDate)}
              <br />
              {experience.endDate ? date(experience.endDate) : "Present"}
            </p>
            <div>
              <p className="mb-2 text-xs text-slate-500">0{index + 1}</p>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-white/5">
                  {experience.companyLogoUrl ? (
                    <Image
                      src={experience.companyLogoUrl}
                      alt=""
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-sm font-bold text-cyan-200">
                      {experience.company.slice(0, 1)}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold tracking-[-0.04em] text-white">
                  {experience.role}
                </h3>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-2 text-sm text-slate-400">
                {experience.companyUrl ? (
                  <a
                    className="font-medium text-cyan-100 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={experience.companyUrl}
                  >
                    {experience.company}
                  </a>
                ) : (
                  <span>{experience.company}</span>
                )}
                {experience.employmentType && (
                  <span>· {experience.employmentType}</span>
                )}
                {experience.location && <span>· {experience.location}</span>}
              </div>
              <div className="portfolio-prose mt-5 text-sm leading-7 text-slate-300">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                >
                  {experience.description}
                </ReactMarkdown>
              </div>
              {experience.highlights && (
                <ul className="mt-5 space-y-2 text-sm text-slate-400">
                  {experience.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-2">
                      <span className="text-cyan-200">↗</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-wrap content-start gap-2 md:justify-end">
              {experience.skills.map(({ skill }) => (
                <span
                  className="h-fit rounded-full border border-white/10 px-3 py-1 text-[11px] text-slate-400"
                  key={skill.name}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
