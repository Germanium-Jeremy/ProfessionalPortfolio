import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { projectSchema } from "@/lib/validation/project";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    await requireSession();
    const projects = await prisma.project.findMany({
      include: {
        skills: { include: { skill: true } },
        links: { orderBy: { sortOrder: "asc" } },
        facts: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ ok: true, data: projects });
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

    const result = projectSchema.safeParse(body);
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

    const { skillIds, links, facts, gallery, ...rawData } = result.data;
    const selectedCoverImage =
      rawData.coverImageUrl ||
      (gallery?.length
        ? gallery[Math.floor(Math.random() * gallery.length)]
        : null);
    const data = {
      ...rawData,
      coverImageUrl: selectedCoverImage,
      startDate: rawData.startDate ? new Date(rawData.startDate) : null,
      endDate: rawData.endDate ? new Date(rawData.endDate) : null,
      gallery: gallery?.length ? JSON.stringify(gallery) : null,
    };

    const project = await prisma.project.create({
      data: {
        ...data,
        skills: skillIds
          ? {
              create: skillIds.map((skillId) => ({ skillId })),
            }
          : undefined,
        links: links
          ? {
              create: links.map((l) => ({ ...l })),
            }
          : undefined,
        facts: facts
          ? {
              create: facts.map((f) => ({ ...f })),
            }
          : undefined,
      },
    });

    revalidatePath("/configuration/projects");
    return NextResponse.json({ ok: true, data: project });
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
    if (err instanceof Error && (err as { code?: string }).code === "P2002") {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "CONFLICT", message: "Project slug already exists" },
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 },
    );
  }
}
