import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { projectFactSchema } from '@/lib/validation/project';
import { revalidatePath } from 'next/cache';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; factId: string }> }
) {
  try {
    await requireSession();
    const body = await request.json();
    const { factId } = await params;

    const result = projectFactSchema.partial().safeParse(body);
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

    const fact = await prisma.projectFact.update({
      where: { id: factId },
      data: result.data,
    });

    revalidatePath('/configuration/projects');
    return NextResponse.json({ ok: true, data: fact });
  } catch (err: any) {
    if (err.message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; factId: string }> }
) {
  try {
    await requireSession();
    const { factId } = await params;

    await prisma.projectFact.delete({
      where: { id: factId },
    });

    revalidatePath('/configuration/projects');
    return NextResponse.json({ ok: true, data: { success: true } });
  } catch (err: any) {
    if (err.message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
