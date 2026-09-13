import { prisma } from '../db';
import { encrypt, decrypt } from '../crypto';

export async function getAdminTestimonials() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return testimonials.map(t => {
    let authorEmail = null;
    if (t.authorEmailCiphertext && t.authorEmailIv && t.authorEmailTag) {
      try {
        authorEmail = decrypt({
          ciphertext: t.authorEmailCiphertext,
          iv: t.authorEmailIv,
          tag: t.authorEmailTag,
        });
      } catch {
        authorEmail = '*** DECRYPTION FAILED ***';
      }
    }
    return { ...t, authorEmail };
  });
}

export async function getPublicTestimonials() {
  const testimonials = await prisma.testimonial.findMany({
    where: {
      isApproved: true,
      isFeatured: true,
    },
    orderBy: { sortOrder: 'asc' },
  });

  return testimonials.map(t => ({
    id: t.id,
    authorName: t.authorName,
    authorRole: t.authorRole,
    authorCompany: t.authorCompany,
    authorAvatarUrl: t.authorAvatarUrl,
    quote: t.quote,
    rating: t.rating,
    sourceUrl: t.sourceUrl,
  }));
}

export async function createTestimonial(data: {
  authorName: string;
  authorRole?: string | null;
  authorCompany?: string | null;
  authorAvatarUrl?: string | null;
  quote: string;
  rating?: number | null;
  sourceUrl?: string | null;
  isApproved?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  authorEmail?: string | null;
}) {
  const emailEnc = data.authorEmail ? encrypt(data.authorEmail) : null;

  return prisma.testimonial.create({
    data: {
      authorName: data.authorName,
      authorRole: data.authorRole,
      authorCompany: data.authorCompany,
      authorAvatarUrl: data.authorAvatarUrl,
      quote: data.quote,
      rating: data.rating,
      sourceUrl: data.sourceUrl,
      isApproved: data.isApproved ?? false,
      isFeatured: data.isFeatured ?? false,
      sortOrder: data.sortOrder ?? 0,
      authorEmailCiphertext: emailEnc ? Buffer.from(emailEnc.ciphertext) : null,
      authorEmailIv: emailEnc ? Buffer.from(emailEnc.iv) : null,
      authorEmailTag: emailEnc ? Buffer.from(emailEnc.tag) : null,
    },
  });
}
