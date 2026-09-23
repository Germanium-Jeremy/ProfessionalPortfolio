import { prisma } from "@/lib/db";
import { Hero } from "@/components/public/Hero";
import { About } from "@/components/public/About";
import { Skills } from "@/components/public/Skills";
import { Experience } from "@/components/public/Experience";
import { Projects } from "@/components/public/Projects";
import { Testimonials } from "@/components/public/Testimonials";
import { Contact } from "@/components/public/Contact";
import { ThemeToggle } from "@/components/theme-toggle";
import { getPublicContacts } from "@/lib/repositories/contactRepository";

const parseJsonArray = (value: string | null): string[] | undefined => {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as string[]) : undefined;
  } catch {
    return undefined;
  }
};

const hrefForChannel = (kind: string, value: string) => {
  if (kind === "email") return `mailto:${value}`;
  if (kind === "phone") return `tel:${value}`;
  if (kind === "whatsapp") return `https://wa.me/${value.replace(/\D/g, "")}`;
  return value;
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
      getPublicContacts(),
    ]);

  if (!profile) {
    return (
      <div className="grid min-h-screen place-items-center p-8 text-center">
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
  const publicContacts = contacts.filter(
    (contact): contact is NonNullable<typeof contact> => Boolean(contact),
  );
  const formattedContacts = publicContacts.map((contact) => ({
    id: contact.id,
    kind: contact.kind,
    label: contact.label,
    value: contact.value,
  }));
  const publicSocials = publicContacts
    .filter((contact) => contact.kind !== "email" && contact.kind !== "phone")
    .map((contact) => ({
      kind: contact.kind,
      url: hrefForChannel(contact.kind, contact.value),
      iconKey: contact.iconKey ?? undefined,
    }));
  const funFacts = parseJsonArray(profile.funFacts) ?? [];

  return (
    <div className="portfolio-shell min-h-screen selection:bg-[var(--accent)] selection:text-[#fffaf3]">
      <header className="site-header fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-20 max-w-360 items-center justify-between px-5 md:px-10">
          <a
            href="#top"
            className="text-sm font-bold tracking-[0.08em] uppercase"
            aria-label="Back to top"
          >
            {profile.fullName}
          </a>
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-6 text-sm font-medium text-[var(--muted)] lg:flex"
          >
            <a className="hover:text-[var(--accent)]" href="#about">
              About
            </a>
            <a className="hover:text-[var(--accent)]" href="#skills">
              Expertise
            </a>
            <a className="hover:text-[var(--accent)]" href="#experience">
              Experience
            </a>
            <a className="hover:text-[var(--accent)]" href="#work">
              Work
            </a>
            <a className="hover:text-[var(--accent)]" href="#contact">
              Contact
            </a>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main id="top">
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

      <footer className="mx-auto flex max-w-360 flex-col gap-4 border-t border-[var(--rule)] px-5 py-8 text-base text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between md:px-10">
        <p>
          © {new Date().getFullYear()} {profile.fullName}
        </p>
        <a href="#top" className="font-medium text-[var(--accent)]">
          Back to top ↑
        </a>
      </footer>
    </div>
  );
}
