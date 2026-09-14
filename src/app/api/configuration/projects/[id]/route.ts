import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { projectSchema } from "@/lib/validation/project";
import { revalidatePath } from "next/cache";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession();
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        skills: { include: { skill: true } },
        links: { orderBy: { sortOrder: "asc" } },
        facts: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "NOT_FOUND", message: "Project not found" },
        },
        { status: 404 },
      );
    }

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
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession();
    const body = await request.json();
    const { id } = await params;

    const result = projectSchema.partial().safeParse(body);
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
        : undefined);
    const data = {
      ...rawData,
      ...(selectedCoverImage !== undefined
        ? { coverImageUrl: selectedCoverImage }
        : {}),
      ...(rawData.startDate !== undefined && rawData.startDate !== null
        ? { startDate: new Date(rawData.startDate) }
        : {}),
      ...(rawData.endDate !== undefined
        ? { endDate: rawData.endDate ? new Date(rawData.endDate) : null }
        : {}),
      ...(gallery !== undefined
        ? { gallery: gallery?.length ? JSON.stringify(gallery) : null }
        : {}),
    };

    const oldProject = await prisma.project.findUnique({
      where: { id },
      select: { slug: true },
    });

    await prisma.project.update({
      where: { id },
      data: {
        ...data,
        skills: skillIds
          ? {
              deleteMany: {},
              create: skillIds.map((skillId) => ({ skillId })),
            }
          : undefined,
        links: links
          ? {
              deleteMany: {},
              create: links.map((l) => ({ ...l })),
            }
          : undefined,
        facts: facts
          ? {
              deleteMany: {},
              create: facts.map((f) => ({ ...f })),
            }
          : undefined,
      },
    });

    const newSlug = data.slug || oldProject?.slug;
    revalidatePath("/configuration/projects");
    revalidatePath("/");
    if (oldProject?.slug) revalidatePath(`/projects/${oldProject.slug}`);
    if (newSlug) revalidatePath(`/projects/${newSlug}`);
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession();
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      select: { slug: true },
    });

    await prisma.project.delete({
      where: { id },
    });

    revalidatePath("/configuration/projects");
    revalidatePath("/");
    if (project?.slug) revalidatePath(`/projects/${project.slug}`);
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
