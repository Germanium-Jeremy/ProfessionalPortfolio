"use client";

import { ExternalLink, Quote, Star } from "lucide-react";
import { useState } from "react";

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
      setSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      id="testimonials"
      className="mx-auto max-w-[90rem] px-5 py-20 md:px-10 lg:py-32"
    >
      <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="section-kicker">06 / Testimonials</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white md:text-6xl">
            Kind words from good people.
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            setSubmitted(false);
          }}
          className="text-left text-sm font-bold text-cyan-200 hover:text-white"
        >
          {isFormOpen ? "Close form" : "Leave a testimonial"}
        </button>
      </div>
      {isFormOpen && (
        <form
          onSubmit={submitTestimonial}
          className="mb-8 grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 md:grid-cols-2"
        >
          <input
            required
            placeholder="Your name"
            value={form.authorName}
            onChange={(event) =>
              setForm({ ...form, authorName: event.target.value })
            }
            className="rounded-md border border-white/15 bg-black/20 px-3 py-2 text-white placeholder:text-slate-500"
          />
          <input
            placeholder="Role"
            value={form.authorRole}
            onChange={(event) =>
              setForm({ ...form, authorRole: event.target.value })
            }
            className="rounded-md border border-white/15 bg-black/20 px-3 py-2 text-white placeholder:text-slate-500"
          />
          <input
            placeholder="Company"
            value={form.authorCompany}
            onChange={(event) =>
              setForm({ ...form, authorCompany: event.target.value })
            }
            className="rounded-md border border-white/15 bg-black/20 px-3 py-2 text-white placeholder:text-slate-500"
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={form.authorEmail}
            onChange={(event) =>
              setForm({ ...form, authorEmail: event.target.value })
            }
            className="rounded-md border border-white/15 bg-black/20 px-3 py-2 text-white placeholder:text-slate-500"
          />
          <textarea
            required
            placeholder="Your testimonial"
            value={form.quote}
            onChange={(event) =>
              setForm({ ...form, quote: event.target.value })
            }
            className="min-h-32 rounded-md border border-white/15 bg-black/20 px-3 py-2 text-white placeholder:text-slate-500 md:col-span-2"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-cyan-200 px-4 py-2 text-sm font-bold text-[#07111f] disabled:opacity-50 md:col-span-2"
          >
            {isSubmitting ? "Submitting..." : "Submit testimonial"}
          </button>
          {submitted && (
            <p className="text-sm text-cyan-200 md:col-span-2">
              Thanks. Your testimonial will appear after approval.
            </p>
          )}
        </form>
      )}
      <div className="grid gap-4 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <figure
            key={`${testimonial.authorName}-${testimonial.quote}`}
            className="relative flex min-h-72 flex-col rounded-[2rem] border border-white/10 bg-white/[0.045] p-7 md:p-8"
          >
            <Quote className="mb-5 h-7 w-7 text-cyan-200" />
            <blockquote className="text-lg leading-8 tracking-[-0.01em] text-slate-200">
              “{testimonial.quote}”
            </blockquote>
            <figcaption className="mt-auto flex items-end justify-between gap-3 pt-8">
              <div className="flex items-center gap-3">
                {testimonial.authorAvatarUrl ? (
                  <img
                    src={testimonial.authorAvatarUrl}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-cyan-200/10 text-sm font-bold text-cyan-100">
                    {testimonial.authorName[0]}
                  </span>
                )}
                <div>
                  <p className="text-sm font-bold text-white">
                    {testimonial.authorName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {[testimonial.authorRole, testimonial.authorCompany]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>
              <div>
                {testimonial.rating && (
                  <div className="flex gap-0.5 text-cyan-200">
                    {Array.from({ length: testimonial.rating }, (_, index) => (
                      <Star key={index} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                )}
                {testimonial.sourceUrl && (
                  <a
                    href={testimonial.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View testimonial source"
                    className="mt-2 inline-flex text-slate-400 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
