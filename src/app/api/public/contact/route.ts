import { NextRequest, NextResponse } from "next/server";
import { contactMessageSchema } from "@/lib/validation/contactMessage";
import {
  isRateLimited,
  sendContactMessage,
} from "@/lib/email/sendContactMessage";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "RATE_LIMITED", message: "Please try again later." },
        },
        { status: 429 },
      );
    }

    const body = await request.json();
    const result = contactMessageSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Please check the form and try again.",
            fields: result.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    const { website, ...message } = result.data;
    if (website) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    await sendContactMessage(message);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const missingConfig = /not configured|no contact recipient/i.test(
      message,
    );
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: missingConfig ? "NOT_CONFIGURED" : "INTERNAL_ERROR",
          message: missingConfig
            ? "Email delivery is not configured yet."
            : "Unable to send your message right now.",
        },
      },
      { status: missingConfig ? 503 : 500 },
    );
  }
}
