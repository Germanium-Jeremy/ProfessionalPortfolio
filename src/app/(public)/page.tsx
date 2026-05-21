import { prisma } from '@/lib/db';
import { Hero } from '@/components/public/Hero';
import { About } from '@/components/public/About';
import { Skills } from '@/components/public/Skills';
import { Experience } from '@/components/public/Experience';
import { Projects } from '@/components/public/Projects';
import { Testimonials } from '@/components/public/Testimonials';
import { Contact } from '@/components/public/Contact';
import { ThemeToggle } from '@/components/theme-toggle';

export default async function PortfolioPage() {
  // Fetch all data server-side for best performance (RSC)
  const [profile, skills, experiences, projects, testimonials, contacts] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.skill.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.experience.findMany({
      include: { skills: { include: { skill: true } } },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.project.findMany({
      where: { status: 'published' },
      include: {
        skills: { include: { skill: true } },
        links: { orderBy: { sortOrder: 'asc' } },
        facts: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.testimonial.findMany({
      where: { isApproved: true, isFeatured: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.contactChannel.findMany({
      where: { isPublic: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  if (!profile) {
    return <div className="p-20 text-center">Profile not found. Please seed the database.</div>;
  }

  // Transform data for components
  const formattedSkills = skills.map(s => ({
    name: s.name,
    category: s.category,
    level: s.level,
  }));

  const formattedExperiences = experiences.map(e => ({
    role: e.role,
    company: e.company,
    companyUrl: e.companyUrl ?? undefined,
    employmentType: e.employmentType ?? undefined,
    location: e.location ?? undefined,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate?.toISOString() ?? undefined,
    description: e.description,
    highlights: (e.highlights as string[] | null) ?? undefined,
    skills: e.skills.map(s => ({ skill: { name: s.skill.name } })),
  }));

  const formattedProjects = projects.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    coverImageUrl: p.coverImageUrl ?? undefined,
    status: p.status,
    isFeatured: p.isFeatured,
    skills: p.skills.map(s => ({ skill: { name: s.skill.name } })),
    links: p.links.map(l => ({
      kind: l.kind,
      label: l.label,
      url: l.url,
      isPrimary: l.isPrimary,
    })),
  }));

  const formattedTestimonials = testimonials.map(t => ({
    authorName: t.authorName,
    authorRole: t.authorRole,
    authorCompany: t.authorCompany,
    authorAvatarUrl: t.authorAvatarUrl,
    quote: t.quote,
    rating: t.rating,
    sourceUrl: t.sourceUrl,
  }));

  const formattedContacts = contacts.map(c => ({
    id: c.id,
    kind: c.kind,
    label: c.label,
    value: null, // revealed via client-side API
  }));

  const publicSocials = contacts
    .filter(c => c.kind !== 'email' && c.kind !== 'phone')
    .map(c => ({
      kind: c.kind,
      url: 'https://github.com', // This is a placeholder; actual URL would be decrypted or handled
      iconKey: c.iconKey ?? undefined,
    }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 selection:bg-blue-500/30">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
        <div className="font-bold text-xl tracking-tighter">
          {profile.fullName}
        </div>
        <ThemeToggle />
      </header>

      <main className="pt-16">
        <Hero
          profile={{
            fullName: profile.fullName,
            headline: profile.headline,
            tagline: profile.tagline ?? undefined,
            avatarUrl: profile.avatarUrl ?? undefined,
            availability: profile.availability ?? undefined,
            resumeUrl: profile.resumeUrl ?? undefined,
          }}
          socials={publicSocials}
        />
        <About
          profile={{
            bio: profile.bio,
            funFacts: profile.funFacts ? JSON.parse(profile.funFacts) : [],
          }}
        />
        <Skills skills={formattedSkills} />
        <Experience experiences={formattedExperiences} />
        <Projects projects={formattedProjects} />
        <Testimonials testimonials={formattedTestimonials} />
        <Contact channels={formattedContacts} />
      </main>

      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} {profile.fullName}. Built with Next.js 15.</p>
      </footer >
    </div>
  );
}
