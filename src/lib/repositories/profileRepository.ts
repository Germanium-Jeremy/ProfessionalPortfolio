import { Profile } from '@prisma/client';
import { prisma } from '../db';
import { encrypt, decrypt, blindIndex } from '../crypto';

// Helper to encrypt a string field if it exists
function encryptField(text: string | null | undefined) {
  if (!text) return null;
  return encrypt(text);
}

// Helper to decrypt a field if it exists
function decryptField(ciphertext: Buffer | null, iv: Buffer | null, tag: Buffer | null): string | null {
  if (!ciphertext || !iv || !tag) return null;
  try {
    return decrypt({ ciphertext, iv, tag });
  } catch (err) {
    console.error('Failed to decrypt field', err);
    return null;
  }
}

export async function getAdminProfile() {
  const profile = await prisma.profile.findFirst();
  if (!profile) return null;

  return {
    ...profile,
    legalName: decryptField(profile.legalNameCiphertext, profile.legalNameIv, profile.legalNameTag),
    privateNotes: decryptField(profile.privateNotesCiphertext, profile.privateNotesIv, profile.privateNotesTag),
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
    funFacts: profile.funFacts ? JSON.parse(profile.funFacts) : [],
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
  funFacts?: string[];
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
    
    legalNameCiphertext: legalNameEnc?.ciphertext || null,
    legalNameIv: legalNameEnc?.iv || null,
    legalNameTag: legalNameEnc?.tag || null,
    
    privateNotesCiphertext: privateNotesEnc?.ciphertext || null,
    privateNotesIv: privateNotesEnc?.iv || null,
    privateNotesTag: privateNotesEnc?.tag || null,
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
