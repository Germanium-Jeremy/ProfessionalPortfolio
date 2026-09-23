"use client";

import { useState, type ReactNode } from "react";
import {
  Globe2,
  Mail,
  MessageCircle,
  Phone,
  GitBranch,
} from "lucide-react";
import { SectionHeading } from "@/components/public/SectionHeading";

interface ContactChannel {
  id: string;
  kind: string;
  label: string;
  value: string | null;
}
interface ContactProps {
  channels: ContactChannel[];
}

const icons: Record<string, ReactNode> = {
  email: <Mail className="h-5 w-5" />,
  phone: <Phone className="h-5 w-5" />,
  github: <GitBranch className="h-5 w-5" />,
  website: <Globe2 className="h-5 w-5" />,
  whatsapp: <MessageCircle className="h-5 w-5" />,
};

export function Contact({ channels }: ContactProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "",
  });

  const socials = channels.filter(
    (channel) => channel.kind !== "email" && channel.value,
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});
    setSubmitted(false);
    try {
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject || undefined,
          message: form.message,
          website: form.website,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        if (result.error?.fields) {
          setFieldErrors(result.error.fields);
        }
        throw new Error(result.error?.message ?? "Unable to send");
      }
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "", website: "" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send your message right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      id="contact"
      style={{
        background: "var(--section-contact)",
        color: "var(--section-contact-fg)",
      }}
    >
      <div className="mx-auto grid max-w-360 gap-12 px-5 py-20 md:px-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:py-28">
        <div>
          <SectionHeading index="07" title="Contact" invert>
            Write with a project, an opportunity, or a question. I’ll reply by
            email.
          </SectionHeading>
          {socials.length > 0 && (
            <ul className="mt-8 space-y-3">
              {socials.map((channel) => (
                <li key={channel.id}>
                  <a
                    href={
                      channel.kind === "phone"
                        ? `tel:${channel.value}`
                        : channel.kind === "whatsapp"
                          ? `https://wa.me/${channel.value?.replace(/\D/g, "")}`
                          : channel.value ?? "#"
                    }
                    target={channel.kind === "phone" ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-[var(--section-contact-fg)] hover:text-[var(--accent)]"
                  >
                    {icons[channel.kind] ?? <Globe2 className="h-5 w-5" />}
                    <span>{channel.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={onSubmit} className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-bold uppercase tracking-[0.16em]">
              Name
            </span>
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              className="contact-field bg-transparent"
            />
            {fieldErrors.name?.[0] && (
              <span className="text-sm text-[var(--secondary)]">
                {fieldErrors.name[0]}
              </span>
            )}
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold uppercase tracking-[0.16em]">
              Email
            </span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              className="contact-field bg-transparent"
            />
            {fieldErrors.email?.[0] && (
              <span className="text-sm text-[var(--secondary)]">
                {fieldErrors.email[0]}
              </span>
            )}
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold uppercase tracking-[0.16em]">
              Subject
            </span>
            <input
              value={form.subject}
              onChange={(event) =>
                setForm({ ...form, subject: event.target.value })
              }
              className="contact-field bg-transparent"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold uppercase tracking-[0.16em]">
              Message
            </span>
            <textarea
              required
              minLength={20}
              value={form.message}
              onChange={(event) =>
                setForm({ ...form, message: event.target.value })
              }
              className="contact-field min-h-40 bg-transparent"
            />
            {fieldErrors.message?.[0] && (
              <span className="text-sm text-[var(--secondary)]">
                {fieldErrors.message[0]}
              </span>
            )}
          </label>
          <div className="hidden" aria-hidden="true">
            <input
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(event) =>
                setForm({ ...form, website: event.target.value })
              }
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Sending..." : "Send message"}
          </button>
          {submitted && <p>Thanks — I’ll get back to you by email.</p>}
          {error && <p className="text-[var(--secondary)]">{error}</p>}
        </form>
      </div>
    </section>
  );
}
