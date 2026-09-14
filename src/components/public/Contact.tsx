"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Globe2,
  Mail,
  MessageCircle,
  Phone,
  GitBranch,
} from "lucide-react";

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
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  async function reveal(id: string) {
    setLoading((current) => ({ ...current, [id]: true }));
    try {
      const response = await fetch("/api/public/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (result.ok)
        setRevealed((current) => ({ ...current, [id]: result.data.value }));
    } finally {
      setLoading((current) => ({ ...current, [id]: false }));
    }
  }
  return (
    <section
      id="contact"
      className="mx-auto max-w-360 min-w-0 px-5 py-20 md:px-10 lg:py-32"
    >
      <div className="contact-panel relative min-w-0 overflow-hidden rounded-4xl border border-cyan-200/20 bg-[radial-gradient(circle_at_85%_12%,rgba(34,211,238,.2),transparent_24%),linear-gradient(125deg,#102d4b,#101936)] p-7 md:p-12">
        <div className="absolute -bottom-24 -right-20 text-[16rem] font-black leading-none tracking-[-.15em] text-white/[.035]">
          Hi
        </div>
        <div className="relative grid min-w-0 gap-10 lg:grid-cols-[1fr_.8fr]">
          <div className="min-w-0">
            <p className="section-kicker text-cyan-100">07 / Contact</p>
            <h2 className="mt-4 max-w-xl wrap-break-word text-4xl font-black tracking-[-0.07em] text-white md:text-6xl">
              Let’s make the next thing memorable.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300 md:text-base">
              Have a project, an opportunity, or just a good idea? I’d love to
              hear about it.
            </p>
          </div>
          <div className="grid min-w-0 content-start gap-3">
            {channels.map((channel) => {
              const value = revealed[channel.id];
              return (
                <div
                  key={channel.id}
                  className="contact-channel group flex min-w-0 items-start justify-between gap-3 rounded-2xl border border-white/10 bg-[#07111f]/35 p-4 backdrop-blur"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-200/10 text-cyan-100">
                      {icons[channel.kind] ?? (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                        {channel.label}
                      </p>
                      <p className="text-sm font-medium text-slate-100 wrap-anywhere">
                        {value ?? "••••••••••••"}
                      </p>
                    </div>
                  </div>
                  {value ? (
                    <span className="shrink-0 text-xs text-emerald-200">
                      Ready
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => reveal(channel.id)}
                      disabled={loading[channel.id]}
                      className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:border-cyan-100 disabled:opacity-50"
                    >
                      {loading[channel.id] ? "Loading" : "Reveal"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
