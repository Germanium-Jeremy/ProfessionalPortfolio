"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/public/SectionHeading";

interface AboutProps {
  profile: { bio: string; funFacts?: string[] };
}

export function About({ profile }: AboutProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      id="about"
      className="border-y border-[var(--rule)]"
      style={{ background: "var(--section-about)" }}
    >
      <div className="mx-auto grid max-w-360 gap-10 px-5 py-20 md:px-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:py-28">
        <SectionHeading index="02" title="About" />
        <div>
          <div className="portfolio-prose type-muted border-l-2 border-[var(--accent)] pl-6 md:pl-8">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
            >
              {profile.bio}
            </ReactMarkdown>
          </div>
          {profile.funFacts && profile.funFacts.length > 0 && (
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {profile.funFacts.map((fact) => (
                <li
                  key={fact}
                  className="type-body border border-[var(--rule)] bg-[var(--paper)] px-4 py-3"
                >
                  {fact}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.section>
  );
}
