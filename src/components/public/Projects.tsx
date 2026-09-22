"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Code2, ExternalLink, GitBranch } from "lucide-react";

interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImageUrl?: string;
  gallery?: string[];
  status: string;
  isFeatured: boolean;
  skills: { skill: { name: string } }[];
  links: { kind: string; label: string; url: string; isPrimary: boolean }[];
}
interface ProjectsProps {
  projects: Project[];
}

export function Projects({ projects }: ProjectsProps) {
  return (
    <section
      id="work"
      className="mx-auto max-w-360 px-5 py-20 md:px-10 lg:py-32"
    >
      <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="section-kicker">05 / Selected work</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white md:text-6xl">
            Things I’ve brought to life.
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-400">
          A small, considered selection of products, experiments, and shipped
          ideas.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project, index) => {
          const primaryLink =
            project.links.find((link) => link.isPrimary) ??
            project.links.find((link) => link.kind === "live") ??
            project.links.find((link) => link.kind === "github");
          const githubLink = project.links.find(
            (link) => link.kind === "github" && link.url !== primaryLink?.url,
          );
          return (
            <article
              key={project.id}
              className={`group relative overflow-hidden rounded-4xl border border-white/10 bg-[#0c1a2d] ${index === 0 ? "md:col-span-2" : ""}`}
            >
              <div
                className={`relative overflow-hidden ${index === 0 ? "aspect-16/7" : "aspect-4/3"}`}
              >
                {project.coverImageUrl ? (
                  <Image
                    src={project.coverImageUrl}
                    alt=""
                    fill
                    className="object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-90"
                  />
                ) : (
                  <div
                    className={`h-full w-full bg-[linear-gradient(135deg,rgba(34,211,238,.18),rgba(37,99,235,.18),rgba(139,92,246,.2))] ${index % 2 ? "bg-[radial-gradient(circle_at_70%_20%,rgba(34,211,238,.28),transparent_30%),linear-gradient(135deg,#122744,#0c1a2d)]" : ""}`}
                  >
                    <Code2 className="absolute right-8 top-8 h-16 w-16 text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-[#091323] via-[#091323]/30 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                    0{index + 1} / Project
                  </span>
                  <Link
                    href={primaryLink?.url ?? "#"}
                    aria-label={`View ${project.title} details`}
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/20 text-white transition hover:bg-cyan-200 hover:text-[#07111f]"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
                <h3 className="text-2xl font-bold tracking-[-0.04em] text-white md:text-3xl">
                  {project.title}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                  {project.summary}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {project.skills.slice(0, 6).map(({ skill }) => (
                    <span
                      className="rounded-full border border-white/15 bg-black/15 px-3 py-1 text-[10px] font-medium text-slate-200"
                      key={skill.name}
                    >
                      {skill.name}
                    </span>
                  ))}
                  {primaryLink && (
                    <a
                      href={primaryLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-cyan-200 hover:text-white"
                    >
                      {primaryLink.label} <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {githubLink && (
                    <a
                      href={githubLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-cyan-200 hover:text-white"
                    >
                      <GitBranch className="h-3 w-3" />{" "}
                      {githubLink.label || "Repository"}
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
