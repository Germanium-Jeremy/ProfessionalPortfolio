import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { projectLinkSchema } from '@/lib/validation/project';
import { revalidatePath } from 'next/cache';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    await requireSession();
    const body = await request.json();
    const { linkId } = await params;

    const result = projectLinkSchema.partial().safeParse(body);
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

    const link = await prisma.projectLink.update({
      where: { id: linkId },
      data: result.data,
    });

    revalidatePath('/configuration/projects');
    return NextResponse.json({ ok: true, data: link });
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
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    await requireSession();
    const { linkId } = await params;

    await prisma.projectLink.delete({
      where: { id: linkId },
    });

    revalidatePath('/configuration/projects');
    return NextResponse.json({ ok: true, data: { success: true } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
