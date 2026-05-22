import { prisma } from '../db';
import { encrypt, decrypt, blindIndex } from '../crypto';

export async function getAdminContacts() {
  const contacts = await prisma.contactChannel.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return contacts.map(contact => {
    try {
      const value = decrypt({
        ciphertext: contact.valueCiphertext,
        iv: contact.valueIv,
        tag: contact.valueTag,
      });
      return { ...contact, value };
    } catch (e) {
      return { ...contact, value: '*** DECRYPTION FAILED ***' };
    }
  });
}

export async function getPublicContacts() {
  const contacts = await prisma.contactChannel.findMany({
    where: { isPublic: true },
    orderBy: { sortOrder: 'asc' },
  });

  return contacts.map(contact => {
    try {
      const value = decrypt({
        ciphertext: contact.valueCiphertext,
        iv: contact.valueIv,
        tag: contact.valueTag,
      });
      return {
        id: contact.id,
        kind: contact.kind,
        label: contact.label,
        iconKey: contact.iconKey,
        sortOrder: contact.sortOrder,
        value, // Revealed only for public channels
      };
    } catch (e) {
      return null;
    }
  }).filter(Boolean);
}

export async function createContact(data: {
  kind: string;
  label: string;
  iconKey?: string | null;
  isPublic: boolean;
  value: string;
  sortOrder?: number;
}) {
  const encrypted = encrypt(data.value);
  const bIndex = blindIndex(data.value);

  return prisma.contactChannel.create({
    data: {
      kind: data.kind,
      label: data.label,
      iconKey: data.iconKey,
      isPublic: data.isPublic,
      sortOrder: data.sortOrder ?? 0,
      valueCiphertext: Buffer.from(encrypted.ciphertext),
      valueIv: Buffer.from(encrypted.iv),
      valueTag: Buffer.from(encrypted.tag),
      valueBlindIndex: bIndex,
    },
  });
}

export async function updateContact(id: string, data: {
  kind?: string;
  label?: string;
  iconKey?: string | null;
  isPublic?: boolean;
  value?: string;
  sortOrder?: number;
}) {
  const updateData: any = { ...data };

  if (data.value !== undefined) {
    const encrypted = encrypt(data.value);
    updateData.valueCiphertext = Buffer.from(encrypted.ciphertext);
    updateData.valueIv = Buffer.from(encrypted.iv);
    updateData.valueTag = Buffer.from(encrypted.tag);
    updateData.valueBlindIndex = blindIndex(data.value);
    delete updateData.value;
  }

  return prisma.contactChannel.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteContact(id: string) {
  return prisma.contactChannel.delete({ where: { id } });
}
