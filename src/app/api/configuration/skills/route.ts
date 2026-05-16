import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { skillSchema } from '@/lib/validation/skill';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    await requireSession();
    const skills = await prisma.skill.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ ok: true, data: skills });
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

    const result = skillSchema.safeParse(body);
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

    const skill = await prisma.skill.create({
      data: result.data,
    });

    revalidatePath('/configuration/skills');
    return NextResponse.json({ ok: true, data: skill });
  } catch (err: any) {
    if (err.message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    if (err.code === 'P2002') {
      return NextResponse.json({ ok: false, error: { code: 'CONFLICT', message: 'Skill name already exists' } }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
