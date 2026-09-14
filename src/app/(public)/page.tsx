import { prisma } from "@/lib/db";
import { Hero } from "@/components/public/Hero";
import { About } from "@/components/public/About";
import { Skills } from "@/components/public/Skills";
import { Experience } from "@/components/public/Experience";
import { Projects } from "@/components/public/Projects";
import { Testimonials } from "@/components/public/Testimonials";
import { Contact } from "@/components/public/Contact";
import { ThemeToggle } from "@/components/theme-toggle";

const parseJsonArray = (value: string | null): string[] | undefined => {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as string[]) : undefined;
  } catch {
    return undefined;
  }
};

export default async function PortfolioPage() {
  const [profile, skills, experiences, projects, testimonials, contacts] =
    await Promise.all([
      prisma.profile.findFirst(),
      prisma.skill.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.experience.findMany({
        include: { skills: { include: { skill: true } } },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.project.findMany({
        where: { status: "published" },
        include: {
          skills: { include: { skill: true } },
          links: { orderBy: { sortOrder: "asc" } },
          facts: { orderBy: { sortOrder: "asc" } },
        },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.testimonial.findMany({
        where: { isApproved: true, isFeatured: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.contactChannel.findMany({
        where: { isPublic: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

  if (!profile) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#07111f] p-8 text-center text-white">
        Profile not found. Please seed the database.
      </div>
    );
  }

  const formattedSkills = skills.map((skill) => ({
    name: skill.name,
    category: skill.category,
    level: skill.level,
  }));
  const formattedExperiences = experiences.map((experience) => ({
    role: experience.role,
    company: experience.company,
    companyUrl: experience.companyUrl ?? undefined,
    companyLogoUrl: experience.companyLogoUrl ?? undefined,
    employmentType: experience.employmentType ?? undefined,
    location: experience.location ?? undefined,
    startDate: experience.startDate.toISOString(),
    endDate: experience.endDate?.toISOString() ?? undefined,
    description: experience.description,
    highlights: parseJsonArray(experience.highlights),
    skills: experience.skills.map((item) => ({
      skill: { name: item.skill.name },
    })),
  }));
  const formattedProjects = projects.map((project) => ({
    id: project.id,
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    coverImageUrl:
      project.coverImageUrl ?? parseJsonArray(project.gallery)?.[0],
    gallery: parseJsonArray(project.gallery) ?? [],
    status: project.status,
    isFeatured: project.isFeatured,
    skills: project.skills.map((item) => ({
      skill: { name: item.skill.name },
    })),
    links: project.links.map((link) => ({
      kind: link.kind,
      label: link.label,
      url: link.url,
      isPrimary: link.isPrimary,
    })),
  }));
  const formattedTestimonials = testimonials.map((testimonial) => ({
    authorName: testimonial.authorName,
    authorRole: testimonial.authorRole,
    authorCompany: testimonial.authorCompany,
    authorAvatarUrl: testimonial.authorAvatarUrl,
    quote: testimonial.quote,
    rating: testimonial.rating,
    sourceUrl: testimonial.sourceUrl,
  }));
  const formattedContacts = contacts.map((contact) => ({
    id: contact.id,
    kind: contact.kind,
    label: contact.label,
    value: null,
  }));
  const publicSocials = contacts
    .filter((contact) => contact.kind !== "email" && contact.kind !== "phone")
    .map((contact) => ({
      kind: contact.kind,
      url: "https://github.com",
      iconKey: contact.iconKey ?? undefined,
    }));
  const funFacts = parseJsonArray(profile.funFacts) ?? [];

  return (
    <div className="portfolio-shell min-h-screen overflow-hidden bg-[#07111f] text-[#ecf4ff] selection:bg-cyan-300 selection:text-[#07111f]">
      <div className="portfolio-grid pointer-events-none fixed inset-0 z-0 opacity-40" />
      <div className="pointer-events-none fixed -left-52 top-0 z-0 h-[38rem] w-[38rem] rounded-full bg-blue-500/20 blur-[150px]" />
      <div className="pointer-events-none fixed -right-52 top-[32rem] z-0 h-[32rem] w-[32rem] rounded-full bg-violet-500/15 blur-[140px]" />

      <header className="fixed inset-x-0 top-0 z-50 mx-auto flex h-24 max-w-[90rem] items-center justify-between px-5 md:px-10">
        <a
          href="#top"
          className="group flex items-center gap-2 text-sm font-bold tracking-[-0.04em] text-white"
          aria-label="Back to top"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-cyan-200 transition-transform duration-300 group-hover:rotate-12">
            ✦
          </span>
          <span className="hidden sm:block">{profile.fullName}</span>
        </a>
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-6 rounded-full border border-white/10 bg-[#0c1a2d]/70 px-6 py-3 text-xs font-medium text-slate-300 backdrop-blur-xl lg:flex"
        >
          <a className="transition-colors hover:text-cyan-200" href="#about">
            About
          </a>
          <a className="transition-colors hover:text-cyan-200" href="#skills">
            Expertise
          </a>
          <a className="transition-colors hover:text-cyan-200" href="#work">
            Selected work
          </a>
          <a className="transition-colors hover:text-cyan-200" href="#contact">
            Contact
          </a>
        </nav>
        <ThemeToggle />
      </header>

      <main id="top" className="relative z-10">
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
        <About profile={{ bio: profile.bio, funFacts }} />
        <Skills skills={formattedSkills} />
        <Experience experiences={formattedExperiences} />
        <Projects projects={formattedProjects} />
        <Testimonials testimonials={formattedTestimonials} />
        <Contact channels={formattedContacts} />
      </main>

      <footer className="relative z-10 mx-auto flex max-w-[90rem] flex-col gap-4 border-t border-white/10 px-5 py-8 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between md:px-10">
        <p>
          © {new Date().getFullYear()} {profile.fullName}. Built with care and
          Next.js.
        </p>
        <a
          href="#top"
          className="font-medium text-cyan-200 transition-colors hover:text-white"
        >
          Back to top ↑
        </a>
      </footer>
    </div>
  );
}
