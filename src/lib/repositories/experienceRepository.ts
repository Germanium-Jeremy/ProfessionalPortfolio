import { prisma } from '../db';

export async function getAdminExperiences() {
  const experiences = await prisma.experience.findMany({
    orderBy: [
      { endDate: 'desc' },
      { startDate: 'desc' },
    ],
    include: {
      skills: { include: { skill: true } },
    }
  });

  return experiences.map(e => ({
    ...e,
    highlights: e.highlights ? JSON.parse(e.highlights) : [],
  }));
}

export async function getPublicExperiences() {
  const experiences = await prisma.experience.findMany({
    where: { isVisible: true },
    orderBy: [
      { endDate: 'desc' },
      { startDate: 'desc' },
    ],
    include: {
      skills: { include: { skill: true } },
    }
  });

  return experiences.map(e => ({
    ...e,
    highlights: e.highlights ? JSON.parse(e.highlights) : [],
  }));
}
