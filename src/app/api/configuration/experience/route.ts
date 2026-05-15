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

    const { skillIds, ...data } = result.data;

    const experience = await prisma.experience.create({
      data: {
        ...data,
        skills: {
          connect: skillIds?.map(id => ({ skillId: id })) || []
        }
      },
    });

    revalidatePath('/configuration/experience');
    return NextResponse.json({ ok: true, data: experience });
  } catch (err: any) {
    if (err.message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
