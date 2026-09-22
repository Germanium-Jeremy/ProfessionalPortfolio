import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { encrypt } from "../src/lib/crypto";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
      name: "Site Admin",
    },
  });

  console.log(`Admin user seeded: ${admin.email}`);

  // Seed initial profile
  await prisma.profile.upsert({
    where: { id: "seed-profile-id" },
    update: {},
    create: {
      id: "seed-profile-id",
      fullName: "Jeremy Germanium",
      headline: "Full-Stack Developer & Game Dev",
      tagline: "Building immersive digital experiences",
      bio: "Passionate developer with a focus on high-performance applications and interactive systems.",
      location: "Remote",
      availability: "Open to freelance",
      funFacts: JSON.stringify([
        "Coffee enthusiast",
        "Indie game jammer",
        "Keyboard collector",
      ]),
    },
  });

  // Seed Skills
  const skillData = [
    { name: "TypeScript", category: "languages", level: 5, isFeatured: true },
    { name: "C#", category: "languages", level: 5, isFeatured: true },
    {
      name: "React",
      category: "frameworks-libraries",
      level: 4,
      isFeatured: true,
    },
    {
      name: "Next.js",
      category: "frameworks-libraries",
      level: 4,
      isFeatured: true,
    },
    {
      name: "PostgreSQL",
      category: "databases-backend",
      level: 4,
      isFeatured: false,
    },
    { name: "Docker", category: "devops-tools", level: 3, isFeatured: false },
    { name: "CI/CD", category: "devops-tools", level: 3, isFeatured: false },
    {
      name: "Unity",
      category: "specialized-domains",
      level: 5,
      isFeatured: true,
    },
    {
      name: "CSS",
      category: "frameworks-libraries",
      level: 4,
      isFeatured: false,
    },
    {
      name: "Tailwind CSS",
      category: "frameworks-libraries",
      level: 5,
      isFeatured: false,
    },
    { name: "Git", category: "devops-tools", level: 5, isFeatured: false },
    {
      name: "Zod",
      category: "frameworks-libraries",
      level: 4,
      isFeatured: false,
    },
  ];

  const skills = await Promise.all(
    skillData.map((s) =>
      prisma.skill.upsert({
        where: { name: s.name },
        update: s,
        create: s,
      }),
    ),
  );

  // Seed Experience
  await prisma.experience.upsert({
    where: { id: "exp-1" },
    update: {},
    create: {
      id: "exp-1",
      role: "Senior Software Engineer",
      company: "Tech Corp",
      companyUrl: "https://techcorp.example.com",
      employmentType: "Full-time",
      location: "Remote",
      startDate: new Date("2021-01-01"),
      description: "Leading the development of core platform features.",
      highlights: JSON.stringify([
        "Reduced latency by 40%",
        "Mentored 5 junior devs",
      ]),
      skills: {
        create: skills
          .filter((s) => ["TypeScript", "React", "PostgreSQL"].includes(s.name))
          .map((s) => ({ skillId: s.id })),
      },
    },
  });

  await prisma.experience.upsert({
    where: { id: "exp-2" },
    update: {},
    create: {
      id: "exp-2",
      role: "Game Developer",
      company: "Indie Studio",
      employmentType: "Freelance",
      location: "Remote",
      startDate: new Date("2018-06-01"),
      endDate: new Date("2020-12-31"),
      description: "Developed multiple indie titles for PC and Console.",
      highlights: JSON.stringify([
        "Shipped 3 titles on Steam",
        "Implemented custom physics engine",
      ]),
      skills: {
        create: skills
          .filter((s) => ["C#", "Unity"].includes(s.name))
          .map((s) => ({ skillId: s.id })),
      },
    },
  });

  await prisma.experience.upsert({
    where: { id: "exp-3" },
    update: {},
    create: {
      id: "exp-3",
      role: "Web Developer Intern",
      company: "Web Agency",
      employmentType: "Internship",
      location: "London",
      startDate: new Date("2017-01-01"),
      endDate: new Date("2017-12-31"),
      description: "Built responsive websites for various clients.",
      highlights: JSON.stringify([
        "Learned modern CSS techniques",
        "Integrated 3rd party APIs",
      ]),
      skills: {
        create: skills
          .filter((s) => ["CSS", "Git"].includes(s.name))
          .map((s) => ({ skillId: s.id })),
      },
    },
  });

  // Seed Projects
  await prisma.project.upsert({
    where: { slug: "e-commerce-platform" },
    update: {},
    create: {
      slug: "e-commerce-platform",
      title: "E-Commerce Platform",
      summary: "A high-performance e-commerce solution built with Next.js.",
      description:
        "Full-featured store with payment integration and admin dashboard.",
      status: "published",
      isFeatured: true,
      links: {
        create: [
          {
            kind: "live",
            label: "Live Site",
            url: "https://shop.example.com",
            isPrimary: true,
          },
          {
            kind: "github",
            label: "Source Code",
            url: "https://github.com/user/shop",
          },
        ],
      },
      skills: {
        create: skills
          .filter((s) =>
            ["TypeScript", "Next.js", "PostgreSQL"].includes(s.name),
          )
          .map((s) => ({ skillId: s.id })),
      },
    },
  });

  await prisma.project.upsert({
    where: { slug: "open-source-lib" },
    update: {},
    create: {
      slug: "open-source-lib",
      title: "Awesome Open Source Lib",
      summary: "A utility library for functional TypeScript.",
      description: "Lightweight and type-safe utility functions.",
      status: "published",
      links: {
        create: [
          {
            kind: "github",
            label: "GitHub",
            url: "https://github.com/user/lib",
            isPrimary: true,
          },
        ],
      },
      skills: {
        create: skills
          .filter((s) => ["TypeScript", "Zod"].includes(s.name))
          .map((s) => ({ skillId: s.id })),
      },
    },
  });

  await prisma.project.upsert({
    where: { slug: "unity-simulation" },
    update: {},
    create: {
      slug: "unity-simulation",
      title: "Unity Physics Simulation",
      summary: "A realistic simulation of fluid dynamics in Unity.",
      description: "Research project exploring GPU-accelerated fluids.",
      status: "published",
      facts: {
        create: [
          { label: "Engine", value: "Unity 6" },
          { label: "API", value: "Compute Shaders" },
        ],
      },
      links: {
        create: [
          {
            kind: "gdrive",
            label: "Assets",
            url: "https://drive.google.com/abc",
          },
          {
            kind: "unity_cloud",
            label: "Build",
            url: "https://unitycloud.example.com",
            isPrimary: true,
          },
        ],
      },
      skills: {
        create: skills
          .filter((s) => ["C#", "Unity"].includes(s.name))
          .map((s) => ({ skillId: s.id })),
      },
    },
  });

  await prisma.project.upsert({
    where: { slug: "secret-project" },
    update: {},
    create: {
      slug: "secret-project",
      title: "Confidential Enterprise Tool",
      summary: "Internal tool for a Fortune 500 company.",
      description: "Detailed description hidden due to NDA.",
      status: "published",
      skills: {
        create: skills
          .filter((s) => ["TypeScript", "Docker"].includes(s.name))
          .map((s) => ({ skillId: s.id })),
      },
    },
  });

  // Seed Testimonials
  const testimonials = [
    {
      name: "Alice Smith",
      role: "CTO",
      company: "Startup X",
      quote: "Jeremy is a brilliant developer!",
      featured: true,
    },
    {
      name: "Bob Jones",
      role: "Founder",
      company: "Web Agency",
      quote: "Highly professional and delivers on time.",
      featured: true,
    },
    {
      name: "Charlie Brown",
      role: "Manager",
      company: "Enterprise Y",
      quote: "A great addition to any team.",
      featured: true,
    },
    {
      name: "Diana Prince",
      role: "Lead Dev",
      company: "Tech Co",
      quote: "Technical skills are top-notch.",
      featured: false,
    },
  ];

  for (const t of testimonials) {
    const encryptedEmail = encrypt(
      `${t.name.toLowerCase().replace(" ", ".")}@example.com`,
    );
    await prisma.testimonial.upsert({
      where: { id: `test-${t.name.toLowerCase().replace(" ", "-")}` },
      update: {},
      create: {
        id: `test-${t.name.toLowerCase().replace(" ", "-")}`,
        authorName: t.name,
        authorRole: t.role,
        authorCompany: t.company,
        quote: t.quote,
        isFeatured: t.featured,
        isApproved: true,
        authorEmailCiphertext: Buffer.from(encryptedEmail.ciphertext),
        authorEmailIv: Buffer.from(encryptedEmail.iv),
        authorEmailTag: Buffer.from(encryptedEmail.tag),
      },
    });
  }

  // Seed Contacts
  const contacts = [
    {
      kind: "email",
      label: "Work Email",
      value: "jeremy@example.com",
      isPublic: true,
    },
    {
      kind: "github",
      label: "GitHub",
      value: "https://github.com/jeremy",
      isPublic: true,
    },
    {
      kind: "phone",
      label: "Private Phone",
      value: "+1234567890",
      isPublic: false,
    },
  ];

  for (const c of contacts) {
    const encrypted = encrypt(c.value);
    await prisma.contactChannel.upsert({
      where: { id: `contact-${c.kind}` },
      update: {},
      create: {
        id: `contact-${c.kind}`,
        kind: c.kind,
        label: c.label,
        isPublic: c.isPublic,
        valueCiphertext: Buffer.from(encrypted.ciphertext),
        valueIv: Buffer.from(encrypted.iv),
        valueTag: Buffer.from(encrypted.tag),
      },
    });
  }

  // Seed Site Settings
  await prisma.siteSetting.upsert({
    where: { key: "accent" },
    update: { value: { color: "#3b82f6" } },
    create: { key: "accent", value: { color: "#3b82f6" } },
  });

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
