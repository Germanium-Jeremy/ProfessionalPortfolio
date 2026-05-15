import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { contactSchema } from '@/lib/validation/contact';
import { encrypt } from '@/lib/crypto';
import { revalidatePath } from 'next/cache';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireSession();
    const body = await request.json();
    const { id } = params;

    const result = contactSchema.partial().safeParse(body);
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
    let enc = null;
    if (value) {
      enc = encrypt(value);
    }

    const contact = await prisma.contactChannel.update({
      where: { id },
      data: {
        ...data,
        valueCiphertext: enc?.ciphertext || null,
        valueIv: enc?.iv || null,
        valueTag: enc?.tag || null,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireSession();
    const { id } = params;

    await prisma.contactChannel.delete({
      where: { id },
    });

    revalidatePath('/configuration/contacts');
    return NextResponse.json({ ok: true, data: { success: true } });
  } catch (err: any) {
    if (err.message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
