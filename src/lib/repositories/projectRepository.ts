import { prisma } from '../db';

export async function getAdminProjects() {
  const projects = await prisma.project.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      links: { orderBy: { sortOrder: 'asc' } },
      facts: { orderBy: { sortOrder: 'asc' } },
      skills: { include: { skill: true } },
    }
  });

  return projects.map(p => ({
    ...p,
    gallery: p.gallery ? JSON.parse(p.gallery) : [],
  }));
}

export async function getPublicProjects() {
  const projects = await prisma.project.findMany({
    where: { status: 'published' },
    orderBy: { sortOrder: 'asc' },
    include: {
      links: {
        where: { isPublic: true },
        orderBy: { sortOrder: 'asc' },
      },
      facts: { orderBy: { sortOrder: 'asc' } },
      skills: { include: { skill: true } },
    }
  });

  return projects.map(p => ({
    ...p,
    gallery: p.gallery ? JSON.parse(p.gallery) : [],
  }));
}

export async function getPublicProjectBySlug(slug: string) {
  const project = await prisma.project.findFirst({
    where: { slug, status: 'published' },
    include: {
      links: {
        where: { isPublic: true },
        orderBy: { sortOrder: 'asc' },
      },
      facts: { orderBy: { sortOrder: 'asc' } },
      skills: { include: { skill: true } },
    }
  });

  if (!project) return null;

  return {
    ...project,
    gallery: project.gallery ? JSON.parse(project.gallery) : [],
  };
}
