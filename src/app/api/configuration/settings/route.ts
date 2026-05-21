import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { settingsSchema } from '@/lib/validation/settings';
import { revalidatePath } from 'next/cache';

const DEFAULT_SETTINGS: Record<string, unknown> = {
  seoTitle: '',
  seoDescription: '',
  accentColor: '#3b82f6',
  siteTitle: 'Portfolio',
  siteDescription: 'Personal portfolio and project showcase',
  sectionOrder: ['hero', 'about', 'skills', 'experience', 'projects', 'testimonials', 'contact'],
  sectionVisibility: {
    hero: true,
    about: true,
    skills: true,
    experience: true,
    projects: true,
    testimonials: true,
    contact: true,
  },
};

export async function GET() {
  try {
    await requireSession();

    const rows = await prisma.siteSetting.findMany();
    const settings: Record<string, unknown> = { ...DEFAULT_SETTINGS };

    for (const row of rows) {
      settings[row.key] = row.value;
    }

    return NextResponse.json({ ok: true, data: settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireSession();
    const body = await request.json();

    const result = settingsSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          fields: result.error.flatten().fieldErrors,
        },
      }, { status: 400 });
    }

    const data = result.data;

    // Upsert each setting key individually
    const upserts = Object.entries(data).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: value as any },
        create: { key, value: value as any },
      })
    );

    await Promise.all(upserts);

    revalidatePath('/');
    revalidatePath('/configuration/settings');

    return NextResponse.json({ ok: true, data: { success: true } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
