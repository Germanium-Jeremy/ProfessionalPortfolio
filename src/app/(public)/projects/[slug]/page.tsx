import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { ChevronLeft, ExternalLink, GitBranch, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
  });

  if (!project) return { title: 'Project Not Found' };

  return {
    title: `${project.title} | Portfolio`,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      skills: { include: { skill: true } },
      links: { orderBy: { sortOrder: 'asc' } },
      facts: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!project) notFound();

  const primaryLink = project.links.find(l => l.isPrimary) ||
                      project.links.find(l => l.kind === 'live') ||
                      project.links.find(l => l.kind === 'github');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-500 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to projects
        </Link>

        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{project.title}</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl">{project.summary}</p>
          <div className="flex flex-wrap gap-2">
            {project.skills.map(s => (
              <span key={s.skill.id} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400">
                {s.skill.name}
              </span>
            ))}
          </div>
        </div>

        <div className="aspect-video relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800">
          {project.coverImageUrl ? (
            <Image src={project.coverImageUrl} alt={project.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Layout className="w-16 h-16 opacity-20" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="prose dark:prose-invert max-w-none text-lg text-slate-600 dark:text-slate-300">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {project.description || 'No description provided.'}
              </ReactMarkdown>
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-6">
              <h3 className="font-bold text-lg">Project Links</h3>
              <div className="space-y-3">
                {project.links.map(link => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors",
                      link.isPrimary
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-medium"
                        : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    )}
                  >
                    <span className="text-sm">{link.label}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {project.facts.length > 0 && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="font-bold text-lg">Key Facts</h3>
                <div className="space-y-3">
                  {project.facts.map(fact => (
                    <div key={fact.id} className="flex justify-between text-sm">
                      <span className="text-slate-500">{fact.label}</span>
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

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
