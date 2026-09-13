import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await requireSession();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 });
    }

    const blob = await put(file.name, file, {
      access: 'public',
    });

    return NextResponse.json({ ok: true, data: { url: blob.url } });
  } catch (err: unknown) {
    console.error('Upload error:', err);
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
