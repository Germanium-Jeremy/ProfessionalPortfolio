"use client";

import Image from "next/image";
import { ArrowDownRight, Download } from "lucide-react";
import { motion } from "framer-motion";

interface HeroProps {
  profile: {
    fullName: string;
    headline: string;
    tagline?: string;
    avatarUrl?: string;
    availability?: string;
    resumeUrl?: string;
  };
  socials: { kind: string; url: string; iconKey?: string }[];
}

function splitDisplayName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? fullName;
  const rest = parts.slice(1);
  const longFirst = first.length > 10 && rest.length > 0;

  if (longFirst) {
    return {
      kicker: [first, ...rest.slice(0, -1)].join(" "),
      title: rest.at(-1) ?? first,
    };
  }

  return {
    kicker: rest.join(" "),
    title: first,
  };
}

export function Hero({ profile, socials }: HeroProps) {
  const { kicker, title } = splitDisplayName(profile.fullName);

  return (
    <section className="mx-auto grid max-w-360 items-center gap-8 px-5 pb-16 pt-28 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,24rem)] lg:gap-10 lg:pb-24 lg:pt-32">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="order-2 min-w-0 lg:order-1"
      >
        {profile.availability && (
          <p className="section-index mb-6">{profile.availability}</p>
        )}
        <h1 className="text-[var(--foreground)]">
          {kicker ? (
            <span className="mb-3 block text-sm font-bold uppercase tracking-[0.22em] text-[var(--muted)]">
              {kicker}
            </span>
          ) : null}
          <span className="type-display block max-w-[14ch] text-[clamp(2.5rem,6.2vw,4.6rem)] leading-[0.95] text-balance">
            {title}
          </span>
        </h1>
        <p className="type-body type-muted mt-6 max-w-xl">{profile.headline}</p>
        {profile.tagline ? (
          <p className="type-body type-muted mt-4 max-w-lg">{profile.tagline}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#work" className="btn-primary">
            Selected work
            <ArrowDownRight className="h-4 w-4" />
          </a>
          {profile.resumeUrl && (
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              <Download className="h-4 w-4" />
              Résumé
            </a>
          )}
        </div>
        {socials.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--rule)] pt-5">
            {socials.map((social) => (
              <a
                key={`${social.kind}-${social.url}`}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)] hover:text-[var(--accent)]"
              >
                {social.kind}
              </a>
            ))}
          </div>
        )}
      </motion.div>

      <motion.figure
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.08 }}
        className="hero-portrait order-1 mx-auto w-full max-w-md lg:order-2 lg:max-w-none"
      >
        <div className="hero-portrait-frame">
          <div className="hero-portrait-glow" aria-hidden="true" />
          <div className="hero-portrait-photo">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.fullName}
                fill
                priority
                sizes="(max-width: 1024px) 70vw, 24rem"
                className="object-cover object-[center_18%]"
              />
            ) : (
              <div className="grid h-full place-items-center text-8xl font-black text-[var(--accent)]/40">
                {profile.fullName.slice(0, 1)}
              </div>
            )}
          </div>
        </div>
      </motion.figure>
    </section>
  );
}
