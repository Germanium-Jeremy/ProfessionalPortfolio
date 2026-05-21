import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { experienceSchema } from '@/lib/validation/experience';
import { revalidatePath } from 'next/cache';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSession();
    const body = await request.json();
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

    const { skillIds, ...rawData } = result.data;
    const data = {
      ...rawData,
      ...(rawData.startDate !== undefined && rawData.startDate !== null ? { startDate: new Date(rawData.startDate) } : {}),
      ...(rawData.endDate !== undefined ? { endDate: rawData.endDate ? new Date(rawData.endDate) : null } : {}),
    };

    await prisma.experience.update({
      where: { id },
      data: {
        ...data,
        skills: skillIds ? {
          deleteMany: {},
          create: skillIds.map(skillId => ({ skillId }))
        } : undefined
      } as any,
    });

    revalidatePath('/configuration/experience');
    return NextResponse.json({ ok: true, data: { success: true } });
  } catch (err: any) {
    if (err.message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
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
  } catch (err: any) {
    if (err.message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
