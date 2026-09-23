"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, GitBranch } from "lucide-react";
import { SectionHeading } from "@/components/public/SectionHeading";

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
  const [active, setActive] = useState(0);
  const project = projects[active];

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        setActive((current) => (current + 1) % Math.max(projects.length, 1));
      }
      if (event.key === "ArrowLeft") {
        setActive((current) =>
          current === 0 ? Math.max(projects.length - 1, 0) : current - 1,
        );
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [projects.length]);

  if (!project) {
    return null;
  }

  const primaryLink =
    project.links.find((link) => link.isPrimary) ??
    project.links.find((link) => link.kind === "live") ??
    project.links.find((link) => link.kind === "github");
  const githubLink = project.links.find(
    (link) => link.kind === "github" && link.url !== primaryLink?.url,
  );

  function go(direction: -1 | 1) {
    setActive((current) => {
      const next = current + direction;
      if (next < 0) return projects.length - 1;
      if (next >= projects.length) return 0;
      return next;
    });
  }

  return (
    <section
      id="work"
      style={{
        background: "var(--section-work)",
        color: "var(--section-work-fg)",
      }}
    >
      <div className="mx-auto max-w-360 px-5 py-20 md:px-10 lg:py-28">
        <SectionHeading index="05" title="Selected work" invert>
          Browse the set like a deck — arrows, keyboard, or the film strip.
        </SectionHeading>

        <div className="slide-stage mb-8 overflow-hidden">
          {projects.map((item, index) => {
            const offset = index - active;
            const image = item.coverImageUrl ?? item.gallery?.[0];
            const visible = Math.abs(offset) <= 2;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setActive(index)}
                aria-label={`Show ${item.title}`}
                aria-current={index === active}
                className="slide-card overflow-hidden border border-white/12 bg-[#1a1d24] text-left"
                style={{
                  opacity: visible ? (offset === 0 ? 1 : 0.45) : 0,
                  transform: `translateX(${offset * 58}%) scale(${offset === 0 ? 1 : 0.82})`,
                  zIndex: 20 - Math.abs(offset),
                  pointerEvents: visible ? "auto" : "none",
                }}
              >
                <div className="relative aspect-16/10">
                  {image ? (
                    <Image
                      src={image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 80vw, 48vw"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-6xl font-black text-white/10">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(projects.length).padStart(2, "0")}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              className="btn-ghost border-white/20"
              aria-label="Previous project"
            >
              <ArrowLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="btn-ghost border-white/20"
              aria-label="Next project"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div>
            <h3 className="type-display text-4xl leading-tight md:text-5xl">
              {project.title}
            </h3>
            <p className="type-body mt-5 opacity-80">{project.summary}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={`/projects/${project.slug}`} className="btn-primary">
                Case notes
              </Link>
              {primaryLink && (
                <a
                  href={primaryLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost border-white/20"
                >
                  {primaryLink.label} <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {githubLink && (
                <a
                  href={githubLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold"
                >
                  <GitBranch className="h-4 w-4" />
                  {githubLink.label || "Repository"}
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-wrap content-start gap-2 lg:justify-end">
            {project.skills.slice(0, 8).map(({ skill }) => (
              <span
                key={skill.name}
                className="h-fit border border-white/15 px-3 py-1 text-sm opacity-80"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>

        <ol className="mt-12 flex gap-2 overflow-x-auto pb-2">
          {projects.map((item, index) => (
            <li key={item.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(index)}
                className={`border px-3 py-2 text-sm ${
                  index === active
                    ? "border-[var(--accent)]"
                    : "border-white/15 text-white/50 hover:text-white"
                }`}
              >
                {String(index + 1).padStart(2, "0")} {item.title}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
