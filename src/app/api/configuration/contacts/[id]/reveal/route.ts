import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSession();
    const { id } = await params;

    const contact = await prisma.contactChannel.findUnique({
      where: { id },
    });

    if (!contact) {
      return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Contact not found' } }, { status: 404 });
    }

    const value = decrypt({
      ciphertext: contact.valueCiphertext,
      iv: contact.valueIv,
      tag: contact.valueTag,
    });

    return NextResponse.json({ ok: true, data: { value } });
  } catch (err: any) {
    if (err.message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
