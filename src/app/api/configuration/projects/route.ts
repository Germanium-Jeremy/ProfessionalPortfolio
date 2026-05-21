import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { projectSchema } from '@/lib/validation/project';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    await requireSession();
    const projects = await prisma.project.findMany({
      include: {
        skills: { include: { skill: true } },
        links: { orderBy: { sortOrder: 'asc' } },
        facts: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ ok: true, data: projects });
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

    const result = projectSchema.safeParse(body);
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
      startDate: rawData.startDate ? new Date(rawData.startDate) : null,
      endDate: rawData.endDate ? new Date(rawData.endDate) : null,
    };

    const project = await prisma.project.create({
      data: {
        ...data,
        skills: skillIds ? {
          create: skillIds.map(skillId => ({ skillId }))
        } : undefined,
      } as any,
    });

    revalidatePath('/configuration/projects');
    return NextResponse.json({ ok: true, data: project });
  } catch (err: any) {
    if (err.message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    if (err.code === 'P2002') {
      return NextResponse.json({ ok: false, error: { code: 'CONFLICT', message: 'Project slug already exists' } }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
