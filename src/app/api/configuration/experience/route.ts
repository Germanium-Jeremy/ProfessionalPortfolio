import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { experienceSchema } from '@/lib/validation/experience';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    await requireSession();
    const experiences = await prisma.experience.findMany({
      include: {
        skills: {
          include: { skill: true }
        }
      },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ ok: true, data: experiences });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireSession();
    const body = await request.json();

    const result = experienceSchema.safeParse(body);
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
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
    };

    const experience = await prisma.experience.create({
      data: {
        ...data,
        skills: skillIds ? {
          create: skillIds.map(skillId => ({ skillId }))
        } : undefined,
      },
    });

    revalidatePath('/configuration/experience');
    return NextResponse.json({ ok: true, data: experience });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
