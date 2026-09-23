"use client";

import { ExternalLink, Star } from "lucide-react";
import { useState } from "react";
import { SectionHeading } from "@/components/public/SectionHeading";

interface Testimonial {
  authorName: string;
  authorRole: string | null;
  authorCompany: string | null;
  authorAvatarUrl: string | null;
  quote: string;
  rating: number | null;
  sourceUrl: string | null;
}
interface TestimonialsProps {
  testimonials: Testimonial[];
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [form, setForm] = useState({
    authorName: "",
    authorRole: "",
    authorCompany: "",
    authorEmail: "",
    quote: "",
    rating: 5,
  });

  async function submitTestimonial(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(false);
    try {
      const response = await fetch("/api/public/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          authorEmail: form.authorEmail || undefined,
        }),
      });
      if (!response.ok) throw new Error();
      setSubmitted(true);
      setForm({
        authorName: "",
        authorRole: "",
        authorCompany: "",
        authorEmail: "",
        quote: "",
        rating: 5,
      });
    } catch {
      setError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="testimonials" style={{ background: "var(--section-quotes)" }}>
      <div className="mx-auto max-w-360 px-5 py-20 md:px-10 lg:py-28">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <SectionHeading index="06" title="Testimonials">
            Kind words from people I’ve worked with.
          </SectionHeading>
          <button
            type="button"
            onClick={() => {
              setIsFormOpen(!isFormOpen);
              setSubmitted(false);
              setError(false);
            }}
            className="mb-10 text-left font-bold text-[var(--accent)]"
          >
            {isFormOpen ? "Close form" : "Leave a testimonial"}
          </button>
        </div>

        {isFormOpen && (
          <form
            onSubmit={submitTestimonial}
            className="mb-12 grid gap-4 border border-[var(--rule)] bg-[var(--paper)] p-6 md:grid-cols-2"
          >
            <input
              required
              placeholder="Your name"
              value={form.authorName}
              onChange={(event) =>
                setForm({ ...form, authorName: event.target.value })
              }
              className="contact-field"
            />
            <input
              placeholder="Role"
              value={form.authorRole}
              onChange={(event) =>
                setForm({ ...form, authorRole: event.target.value })
              }
              className="contact-field"
            />
            <input
              placeholder="Company"
              value={form.authorCompany}
              onChange={(event) =>
                setForm({ ...form, authorCompany: event.target.value })
              }
              className="contact-field"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={form.authorEmail}
              onChange={(event) =>
                setForm({ ...form, authorEmail: event.target.value })
              }
              className="contact-field"
            />
            <textarea
              required
              placeholder="Your testimonial"
              value={form.quote}
              onChange={(event) =>
                setForm({ ...form, quote: event.target.value })
              }
              className="contact-field min-h-32 md:col-span-2"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary md:col-span-2"
            >
              {isSubmitting ? "Submitting..." : "Submit testimonial"}
            </button>
            {submitted && (
              <p className="text-[var(--secondary)] md:col-span-2">
                Thanks for sharing your testimonial.
              </p>
            )}
            {error && (
              <p className="text-[var(--accent)] md:col-span-2">
                Couldn’t submit just now. Please try again.
              </p>
            )}
          </form>
        )}

        <div className="space-y-10">
          {testimonials.map((testimonial, index) => (
            <figure
              key={`${testimonial.authorName}-${testimonial.quote}`}
              className="border-t border-[var(--foreground)]/15 pt-8"
            >
              <blockquote className="type-display text-3xl leading-snug md:text-4xl">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold">{testimonial.authorName}</p>
                  <p className="type-muted text-base">
                    {[testimonial.authorRole, testimonial.authorCompany]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {testimonial.rating && (
                    <div className="flex gap-0.5 text-[var(--accent)]">
                      {Array.from(
                        { length: testimonial.rating },
                        (_, starIndex) => (
                          <Star
                            key={starIndex}
                            className="h-3.5 w-3.5 fill-current"
                          />
                        ),
                      )}
                    </div>
                  )}
                  {testimonial.sourceUrl && (
                    <a
                      href={testimonial.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View testimonial source"
                      className="text-[var(--muted)] hover:text-[var(--accent)]"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <span className="text-sm tracking-[0.16em] text-[var(--muted)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
