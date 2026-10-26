import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { certificateUpdateSchema } from "@/lib/validation/certificate";
import { revalidatePath } from "next/cache";

const DATE_FIELDS = ["issuedAt", "expiresAt"] as const;

function toUpdateData(data: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (!DATE_FIELDS.includes(key as (typeof DATE_FIELDS)[number])) {
        return [key, value];
      }
      return [key, value ? new Date(value as string) : null];
    }),
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession();
    const body = await request.json();
    const { id } = await params;

    const result = certificateUpdateSchema.safeParse(body);
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

    const certificate = await prisma.certificate.update({
      where: { id },
      data: toUpdateData(result.data),
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
    if (err instanceof Error && (err as { code?: string }).code === "P2025") {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Certificate not found" } },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession();
    const { id } = await params;

    await prisma.certificate.delete({
      where: { id },
    });

    revalidatePath("/configuration/certificates");
    revalidatePath("/");
    return NextResponse.json({ ok: true, data: { success: true } });
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
