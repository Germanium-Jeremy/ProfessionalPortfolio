import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { testimonialSchema } from "@/lib/validation/testimonial";
import { encrypt } from "@/lib/crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = testimonialSchema
      .pick({
        authorName: true,
        authorRole: true,
        authorCompany: true,
        authorAvatarUrl: true,
        quote: true,
        rating: true,
        sourceUrl: true,
        authorEmail: true,
      })
      .safeParse(body);

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

    const { authorEmail, ...data } = result.data;
    const emailEnc = authorEmail ? encrypt(authorEmail) : null;
    const testimonial = await prisma.testimonial.create({
      data: {
        ...data,
        isApproved: false,
        isFeatured: false,
        authorEmailCiphertext: emailEnc
          ? Buffer.from(emailEnc.ciphertext)
          : null,
        authorEmailIv: emailEnc ? Buffer.from(emailEnc.iv) : null,
        authorEmailTag: emailEnc ? Buffer.from(emailEnc.tag) : null,
      },
    });

    return NextResponse.json(
      { ok: true, data: { id: testimonial.id } },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Unable to submit testimonial",
        },
      },
      { status: 500 },
    );
  }
}
