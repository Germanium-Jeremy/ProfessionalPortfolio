import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { contactSchema } from '@/lib/validation/contact';
import { encrypt } from '@/lib/crypto';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    await requireSession();
    const contacts = await prisma.contactChannel.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ ok: true, data: contacts });
  } catch (err: any) {
    if (err.message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireSession();
    const body = await request.json();

    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          fields: result.error.flatten().fieldErrors
        }
      }, { status: 400 });
    }

    const { value, ...data } = result.data;
    const enc = encrypt(value);

    const contact = await prisma.contactChannel.create({
      data: {
        ...data,
        valueCiphertext: enc.ciphertext,
        valueIv: enc.iv,
        valueTag: enc.tag,
      },
    });

    revalidatePath('/configuration/contacts');
    return NextResponse.json({ ok: true, data: contact });
  } catch (err: any) {
    if (err.message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
