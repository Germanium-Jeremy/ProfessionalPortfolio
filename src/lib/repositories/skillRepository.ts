import { prisma } from '../db';

export async function getSkills() {
  return prisma.skill.findMany({
    orderBy: [
      { category: 'asc' },
      { sortOrder: 'asc' },
    ],
  });
}

export async function getFeaturedSkills() {
  return prisma.skill.findMany({
    where: { isFeatured: true },
    orderBy: { sortOrder: 'asc' },
  });
}
