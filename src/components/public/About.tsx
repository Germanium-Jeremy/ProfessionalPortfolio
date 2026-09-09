'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { motion } from 'framer-motion';

interface AboutProps { profile: { bio: string; funFacts?: string[] } }

export function About({ profile }: AboutProps) {
  return (
    <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} id="about" className="mx-auto grid max-w-[90rem] gap-10 px-5 py-20 md:px-10 lg:grid-cols-[.7fr_1.3fr] lg:py-32">
      <div><p className="section-kicker">02 / About</p><h2 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white md:text-6xl">A sharp eye for the details that make work matter.</h2></div>
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-7 shadow-2xl shadow-black/10 backdrop-blur-sm md:p-10">
        <div className="portfolio-prose text-base leading-8 text-slate-300 md:text-lg"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{profile.bio}</ReactMarkdown></div>
        {profile.funFacts && profile.funFacts.length > 0 && <div className="mt-9 border-t border-white/10 pt-6"><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">A few quick facts</p><div className="flex flex-wrap gap-2">{profile.funFacts.map((fact) => <span key={fact} className="rounded-full border border-cyan-200/15 bg-cyan-200/[0.06] px-3 py-2 text-xs text-cyan-50">{fact}</span>)}</div></div>}
      </div>
    </motion.section>
  );
}
