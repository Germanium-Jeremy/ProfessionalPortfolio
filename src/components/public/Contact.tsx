'use client';

import React, { useState } from 'react';
import { Mail, Phone, Globe, GitBranch, Link, MessageSquare, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactChannel {
  id: string;
  kind: string;
  label: string;
  value: string | null; // revealed value
}

interface ContactProps {
  channels: ContactChannel[];
}

export function Contact({ channels }: ContactProps) {
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  async function handleReveal(id: string) {
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/public/reveal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (result.ok) {
        setRevealed(prev => ({ ...prev, [id]: result.data.value }));
      }
    } catch (err) {
      console.error('Reveal failed', err);
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  }

  const getIcon = (kind: string) => {
    switch (kind) {
      case 'email': return <Mail className="w-5 h-5" />;
      case 'phone': return <Phone className="w-5 h-5" />;
      case 'whatsapp': return <MessageSquare className="w-5 h-5" />;
      case 'linkedin': return <Link className="w-5 h-5" />;
      case 'github': return <GitBranch className="w-5 h-5" />;
      case 'x': return <MessageSquare className="w-5 h-5" />;
      case 'website': return <Globe className="w-5 h-5" />;
      default: return <ExternalLink className="w-5 h-5" />;
    }
  };

  return (
    <section id="contact" className="py-20 space-y-12 max-w-4xl mx-auto px-4">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">Get in Touch</h2>
        <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full" />
        <p className="text-slate-500 dark:text-slate-400">Feel free to reach out through any of these channels.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {channels.map((channel, i) => {
          const isRevealed = !!revealed[channel.id];
          const value = revealed[channel.id] || '••••••••';

          return (
            <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between group hover:border-blue-500 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:text-blue-500 transition-colors">
                  {getIcon(channel.kind)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{channel.label}</span>
                  <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">{value}</span>
                </div>
              </div>

              {!isRevealed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReveal(channel.id)}
                  disabled={loading[channel.id]}
                  className="h-8 px-3 text-xs"
                >
                  {loading[channel.id] ? '...' : 'Reveal'}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
