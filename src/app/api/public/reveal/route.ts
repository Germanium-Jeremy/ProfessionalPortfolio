import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: { code: 'BAD_REQUEST', message: 'ID is required' } }, { status: 400 });
    }

    const contact = await prisma.contactChannel.findUnique({
      where: { id },
    });

    if (!contact) {
      return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Contact not found' } }, { status: 404 });
    }

    if (!contact.isPublic) {
      return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'This channel is not public' } }, { status: 403 });
    }

    const value = decrypt({
      ciphertext: contact.valueCiphertext,
      iv: contact.valueIv,
      tag: contact.valueTag,
    });

    return NextResponse.json({ ok: true, data: { value } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
