import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";

const recentRequests = new Map<string, number[]>();

export function isRateLimited(ip: string, limit = 5, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const stamps = (recentRequests.get(ip) ?? []).filter((time) => now - time < windowMs);
  if (stamps.length >= limit) {
    recentRequests.set(ip, stamps);
    return true;
  }
  stamps.push(now);
  recentRequests.set(ip, stamps);
  return false;
}

async function resolveRecipient() {
  if (process.env.CONTACT_TO_EMAIL) return process.env.CONTACT_TO_EMAIL;

  const channel = await prisma.contactChannel.findFirst({
    where: { kind: "email" },
    orderBy: { sortOrder: "asc" },
  });
  if (!channel) return null;

  return decrypt({
    ciphertext: channel.valueCiphertext,
    iv: channel.valueIv,
    tag: channel.valueTag,
  });
}

export async function sendContactMessage(input: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Email delivery is not configured.");
  }

  const to = await resolveRecipient();
  if (!to) {
    throw new Error("No contact recipient is configured.");
  }

  const from =
    process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";
  const subject = input.subject?.trim()
    ? `Portfolio: ${input.subject.trim()}`
    : `Portfolio message from ${input.name}`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: input.email,
      subject,
      text: `Name: ${input.name}\nEmail: ${input.email}\n\n${input.message}`,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to send the message.");
  }
}
