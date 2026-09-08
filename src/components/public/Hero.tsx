'use client';

import Image from 'next/image';
import { ArrowDownRight, Download, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
  profile: { fullName: string; headline: string; tagline?: string; avatarUrl?: string; availability?: string; resumeUrl?: string };
  socials: { kind: string; url: string; iconKey?: string }[];
}

export function Hero({ profile, socials }: HeroProps) {
  return (
    <section className="mx-auto grid min-h-[48rem] max-w-[90rem] items-center gap-10 px-5 pb-16 pt-32 md:px-10 lg:grid-cols-[1.04fr_.96fr] lg:pb-24 lg:pt-28">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 order-2 lg:order-1">
        <div className="mb-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200"><span className="h-px w-9 bg-cyan-300" />Independent digital builder</div>
        <h1 className="max-w-3xl text-[clamp(3.25rem,8vw,7.5rem)] font-black leading-[0.88] tracking-[-0.075em] text-white">
          {profile.fullName.split(' ').map((part, index) => <span className={index === 1 ? 'block text-transparent [-webkit-text-stroke:1px_rgb(165_243_252)]' : 'block'} key={`${part}-${index}`}>{part}</span>)}
        </h1>
        <p className="mt-7 max-w-xl text-xl leading-relaxed text-slate-300 md:text-2xl">{profile.headline}</p>
        {profile.tagline && <p className="mt-4 max-w-lg text-sm leading-7 text-slate-400 md:text-base">{profile.tagline}</p>}
        <div className="mt-9 flex flex-wrap gap-3">
          <a href="#work" className="group inline-flex items-center gap-3 rounded-full bg-cyan-200 px-5 py-3 text-sm font-bold text-[#07111f] transition-transform hover:-translate-y-0.5">Explore selected work <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-y-0.5 group-hover:translate-x-0.5" /></a>
          {profile.resumeUrl && <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-cyan-200 hover:text-cyan-100"><Download className="h-4 w-4" /> Résumé</a>}
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-5 border-t border-white/10 pt-5">
          {profile.availability && <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-300"><span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" /></span>{profile.availability}</span>}
          {socials.map((social) => <a key={social.kind} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.kind} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 transition-colors hover:text-cyan-200">{social.kind}</a>)}
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1 }} className="relative order-1 mx-auto w-full max-w-xl lg:order-2">
        <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-cyan-300/30 via-blue-600/15 to-violet-400/20 blur-2xl" />
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2.25rem] border border-white/15 bg-[#0d2139] shadow-2xl shadow-black/40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(103,232,249,.5),transparent_22%),linear-gradient(145deg,#162f51_0%,#0b1626_62%)]" />
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#07111f] via-[#07111f]/30 to-transparent" />
          {profile.avatarUrl ? <Image src={profile.avatarUrl} alt={profile.fullName} fill priority className="object-cover object-top mix-blend-luminosity opacity-90" /> : <div className="absolute inset-0 grid place-items-center text-[12rem] font-black tracking-[-0.15em] text-white/15">{profile.fullName.slice(0, 1)}</div>}
          <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-white/15 bg-[#07111f]/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur"><Sparkles className="h-3 w-3 text-cyan-200" /> Portfolio 2026</div>
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between"><span className="max-w-40 text-xs leading-5 text-slate-300">Turning complex ideas into useful, memorable products.</span><span className="text-5xl font-black tracking-[-0.1em] text-white/80">01</span></div>
        </div>
        <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-white/15 bg-[#102440]/90 px-4 py-3 text-xs text-slate-300 shadow-xl backdrop-blur sm:block">Design <span className="mx-1 text-cyan-200">×</span> Engineering</div>
      </motion.div>
    </section>
  );
}
