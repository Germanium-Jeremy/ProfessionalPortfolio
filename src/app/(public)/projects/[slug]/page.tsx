import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { ChevronLeft, ExternalLink, Layout } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
  });

  if (!project) return { title: "Project Not Found" };

  return {
    title: `${project.title} | Portfolio`,
    description: project.summary,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      skills: { include: { skill: true } },
      links: { orderBy: { sortOrder: "asc" } },
      facts: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!project) notFound();

  const gallery = project.gallery
    ? (JSON.parse(project.gallery) as string[])
    : [];
  const previewImage = project.coverImageUrl ?? gallery[0];

  return (
    <div className="portfolio-shell min-h-screen">
      <div className="mx-auto max-w-5xl space-y-10 px-5 py-12 md:px-10">
        <Link
          href="/#work"
          className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--accent)]"
        >
          <ChevronLeft className="h-4 w-4" /> Back to projects
        </Link>

        <div>
          <h1 className="type-display text-4xl md:text-6xl">{project.title}</h1>
          <p className="type-body type-muted mt-5 max-w-3xl">{project.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {project.skills.map((item) => (
              <span
                key={item.skill.id}
                className="border border-[var(--rule)] px-3 py-1 text-sm text-[var(--muted)]"
              >
                {item.skill.name}
              </span>
            ))}
          </div>
        </div>

        <div className="relative aspect-video overflow-hidden border border-[var(--rule)] bg-[var(--paper)]">
          {previewImage ? (
            <Image
              src={previewImage}
              alt={project.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
              <Layout className="h-16 w-16 opacity-20" />
            </div>
          )}
        </div>

        {gallery.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {gallery.map((imageUrl, index) => (
              <div
                key={`${imageUrl}-${index}`}
                className="relative aspect-video overflow-hidden border border-[var(--rule)]"
              >
                <Image
                  src={imageUrl}
                  alt={`${project.title} gallery image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="portfolio-prose type-muted lg:col-span-2">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
            >
              {project.description || "No description provided."}
            </ReactMarkdown>
          </div>

          <div className="space-y-8">
            <div className="space-y-4 border border-[var(--rule)] bg-[var(--paper)] p-6">
              <h3 className="type-display text-2xl">Project Links</h3>
              <div className="space-y-3">
                {project.links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between border border-[var(--rule)] p-3 text-sm hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {project.facts.length > 0 && (
              <div className="space-y-4 border border-[var(--rule)] bg-[var(--paper)] p-6">
                <h3 className="type-display text-2xl">Key Facts</h3>
                <div className="space-y-3">
                  {project.facts.map((fact) => (
                    <div
                      key={fact.id}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span className="type-muted">{fact.label}</span>
                      <span className="font-medium">{fact.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
