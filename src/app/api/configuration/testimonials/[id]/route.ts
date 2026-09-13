import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { testimonialSchema } from '@/lib/validation/testimonial';
import { encrypt } from '@/lib/crypto';
import { revalidatePath } from 'next/cache';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSession();
    const body = await request.json();
    const { id } = await params;

    const result = testimonialSchema.partial().safeParse(body);
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

    const { authorEmail, ...data } = result.data;
    let emailEnc = null;
    if (authorEmail) {
      emailEnc = encrypt(authorEmail);
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        ...data,
        authorEmailCiphertext: emailEnc ? Buffer.from(emailEnc.ciphertext) : null,
        authorEmailIv: emailEnc ? Buffer.from(emailEnc.iv) : null,
        authorEmailTag: emailEnc ? Buffer.from(emailEnc.tag) : null,
      },
    });

    revalidatePath('/configuration/testimonials');
    return NextResponse.json({ ok: true, data: testimonial });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSession();
    const { id } = await params;

    await prisma.testimonial.delete({
      where: { id },
    });

    revalidatePath('/configuration/testimonials');
    return NextResponse.json({ ok: true, data: { success: true } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
