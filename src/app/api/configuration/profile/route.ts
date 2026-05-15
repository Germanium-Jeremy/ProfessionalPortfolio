import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getAdminProfile, updateProfile } from '@/lib/repositories/profileRepository';
import { profileSchema } from '@/lib/validation/profile';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    await requireSession();
    const profile = await getAdminProfile();

    if (!profile) {
      return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Profile not found' } }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: profile });
  } catch (err: any) {
    if (err.message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireSession();
    const body = await request.json();

    const result = profileSchema.safeParse(body);
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

    await updateProfile(result.data);
    revalidatePath('/');

    return NextResponse.json({ ok: true, data: { success: true } });
  } catch (err: any) {
    if (err.message === 'Unauthenticated') {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthorized access' } }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
