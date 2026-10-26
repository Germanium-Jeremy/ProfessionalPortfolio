import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { certificateSchema } from "@/lib/validation/certificate";
import { getCertificates } from "@/lib/repositories/certificateRepository";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    await requireSession();
    const certificates = await getCertificates();
    return NextResponse.json({ ok: true, data: certificates });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "Unauthenticated") {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "UNAUTHENTICATED", message: "Unauthorized access" },
        },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireSession();
    const body = await request.json();

    const result = certificateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            fields: result.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    const { sortOrder, issuedAt, expiresAt, ...rawData } = result.data;
    const certificateCount = await prisma.certificate.count();

    const certificate = await prisma.certificate.create({
      data: {
        ...rawData,
        issuedAt: new Date(issuedAt),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        sortOrder: sortOrder > 0 ? sortOrder : certificateCount,
      },
    });

    revalidatePath("/configuration/certificates");
    revalidatePath("/");
    return NextResponse.json({ ok: true, data: certificate });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "Unauthenticated") {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "UNAUTHENTICATED", message: "Unauthorized access" },
        },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 },
    );
  }
}
