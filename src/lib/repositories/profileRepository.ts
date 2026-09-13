import { prisma } from "../db";
import { encrypt, decrypt } from "../crypto";

// Helper to decrypt a field if it exists
function decryptField(
  ciphertext: Uint8Array | null,
  iv: Uint8Array | null,
  tag: Uint8Array | null,
): string | null {
  if (!ciphertext || !iv || !tag) return null;
  try {
    return decrypt({ ciphertext, iv, tag });
  } catch (err) {
    console.error("Failed to decrypt field", err);
    return null;
  }
}

export async function getAdminProfile() {
  const profile = await prisma.profile.findFirst();
  if (!profile) return null;

  return {
    ...profile,
    funFacts: profile.funFacts ? JSON.parse(profile.funFacts) : [],
    legalName: decryptField(
      profile.legalNameCiphertext,
      profile.legalNameIv,
      profile.legalNameTag,
    ),
    privateNotes: decryptField(
      profile.privateNotesCiphertext,
      profile.privateNotesIv,
      profile.privateNotesTag,
    ),
  };
}

export async function getPublicProfile() {
  const profile = await prisma.profile.findFirst();
  if (!profile) return null;

  // Only return public-safe fields
  return {
    id: profile.id,
    fullName: profile.fullName,
    headline: profile.headline,
    tagline: profile.tagline,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    location: profile.location,
    availability: profile.availability,
    resumeUrl: profile.resumeUrl,
    funFacts: profile.funFacts ? JSON.parse(profile.funFacts as string) : [],
  };
}

export async function updateProfile(data: {
  fullName: string;
  headline: string;
  tagline?: string | null;
  bio: string;
  avatarUrl?: string | null;
  location?: string | null;
  availability?: string | null;
  resumeUrl?: string | null;
  funFacts?: string[] | null;
  legalName?: string | null;
  privateNotes?: string | null;
}) {
  const existing = await prisma.profile.findFirst();

  const legalNameEnc = data.legalName ? encrypt(data.legalName) : null;
  const privateNotesEnc = data.privateNotes ? encrypt(data.privateNotes) : null;

  const updateData = {
    fullName: data.fullName,
    headline: data.headline,
    tagline: data.tagline,
    bio: data.bio,
    avatarUrl: data.avatarUrl,
    location: data.location,
    availability: data.availability,
    resumeUrl: data.resumeUrl,
    funFacts: data.funFacts ? JSON.stringify(data.funFacts) : null,

    legalNameCiphertext: legalNameEnc
      ? Buffer.from(legalNameEnc.ciphertext)
      : null,
    legalNameIv: legalNameEnc ? Buffer.from(legalNameEnc.iv) : null,
    legalNameTag: legalNameEnc ? Buffer.from(legalNameEnc.tag) : null,

    privateNotesCiphertext: privateNotesEnc
      ? Buffer.from(privateNotesEnc.ciphertext)
      : null,
    privateNotesIv: privateNotesEnc ? Buffer.from(privateNotesEnc.iv) : null,
    privateNotesTag: privateNotesEnc ? Buffer.from(privateNotesEnc.tag) : null,
  };

  if (existing) {
    return prisma.profile.update({
      where: { id: existing.id },
      data: updateData,
    });
  } else {
    return prisma.profile.create({
      data: updateData,
    });
  }
}
