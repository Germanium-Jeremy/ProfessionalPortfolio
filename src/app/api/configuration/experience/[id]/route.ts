import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { experienceSchema } from '@/lib/validation/experience';
import { revalidatePath } from 'next/cache';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSession();
    const body = await _request.json();
    const { id } = await params;

    const result = experienceSchema.partial().safeParse(body);
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

    const { skillIds, startDate, endDate, ...rawData } = result.data;
    const data = {
      ...rawData,
      ...(startDate !== undefined && startDate !== null ? { startDate: new Date(startDate) } : {}),
      ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
    };

    await prisma.experience.update({
      where: { id },
      data: {
        ...data,
        skills: skillIds ? {
          deleteMany: {},
          create: skillIds.map(skillId => ({ skillId }))
        } : undefined
      },
    });

    revalidatePath('/configuration/experience');
    return NextResponse.json({ ok: true, data: { success: true } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSession();
    const { id } = await params;

    await prisma.experience.delete({
      where: { id },
    });

    revalidatePath('/configuration/experience');
    return NextResponse.json({ ok: true, data: { success: true } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
