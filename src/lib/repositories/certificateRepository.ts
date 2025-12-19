import { prisma } from '../db';

export async function getCertificates() {
  return prisma.certificate.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getPublicCertificates() {
  return prisma.certificate.findMany({
    where: { isVisible: true },
    orderBy: { sortOrder: 'asc' },
  });
}
