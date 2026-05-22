'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Save, GripVertical } from 'lucide-react';

interface Settings {
  seoTitle: string;
  seoDescription: string;
  accentColor: string;
  siteTitle: string;
  siteDescription: string;
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
}

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero',
  about: 'About',
  skills: 'Skills',
  experience: 'Experience',
  projects: 'Projects',
  testimonials: 'Testimonials',
  contact: 'Contact',
};

const DEFAULT_SETTINGS: Settings = {
  seoTitle: '',
  seoDescription: '',
  accentColor: '#3b82f6',
  siteTitle: 'Portfolio',
  siteDescription: 'Personal portfolio and project showcase',
  sectionOrder: ['hero', 'about', 'skills', 'experience', 'projects', 'testimonials', 'contact'],
  sectionVisibility: {
    hero: true,
    about: true,
    skills: true,
    experience: true,
    projects: true,
    testimonials: true,
    contact: true,
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/configuration/settings');
        const result = await res.json();
        if (result.ok && result.data) {
          setSettings({
            seoTitle: result.data.seoTitle ?? DEFAULT_SETTINGS.seoTitle,
            seoDescription: result.data.seoDescription ?? DEFAULT_SETTINGS.seoDescription,
            accentColor: result.data.accentColor ?? DEFAULT_SETTINGS.accentColor,
            siteTitle: result.data.siteTitle ?? DEFAULT_SETTINGS.siteTitle,
            siteDescription: result.data.siteDescription ?? DEFAULT_SETTINGS.siteDescription,
            sectionOrder: result.data.sectionOrder ?? DEFAULT_SETTINGS.sectionOrder,
            sectionVisibility: result.data.sectionVisibility ?? DEFAULT_SETTINGS.sectionVisibility,
          });
        }
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch('/api/configuration/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const result = await res.json();
      if (result.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error(result.error?.message || 'Failed to save settings');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  }

  function moveSection(index: number, direction: -1 | 1) {
    const newOrder = [...settings.sectionOrder];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setSettings({ ...settings, sectionOrder: newOrder });
  }

  function toggleSectionVisibility(key: string) {
    setSettings({
      ...settings,
      sectionVisibility: {
        ...settings.sectionVisibility,
        [key]: !settings.sectionVisibility[key],
      },
    });
  }

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <p className="text-slate-500">Configure SEO, theme accent, and section layout.</p>
      </div>

      {/* SEO Settings */}
      <section className="space-y-4 p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold">SEO</h2>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Site Title</label>
          <Input
            value={settings.seoTitle}
            onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
            placeholder="e.g. Jeremy Germanium — Portfolio"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Site Description</label>
          <textarea
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent min-h-[80px]"
            value={settings.seoDescription}
            onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
            placeholder="A short description for search engines"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Site Title (branding)</label>
            <Input
              value={settings.siteTitle}
              onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
              placeholder="Portfolio"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Site Description (branding)</label>
            <Input
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              placeholder="Personal portfolio and project showcase"
            />
          </div>
        </div>
      </section>

      {/* Theme Accent */}
      <section className="space-y-4 p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold">Theme Accent</h2>
        <div className="flex items-center gap-4">
          <label className="block text-sm font-medium">Accent Color</label>
          <input
            type="color"
            value={settings.accentColor}
            onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
            className="w-10 h-10 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
          />
          <Input
            value={settings.accentColor}
            onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
            className="w-32"
            placeholder="#3b82f6"
          />
        </div>
      </section>

      {/* Section Order & Visibility */}
      <section className="space-y-4 p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold">Section Layout</h2>
        <p className="text-sm text-slate-500">Drag to reorder sections. Toggle visibility on/off.</p>
        <div className="space-y-2">
          {settings.sectionOrder.map((key, index) => (
            <div
              key={key}
              className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700"
            >
              <GripVertical className="w-4 h-4 text-slate-400" />
              <span className="flex-1 text-sm font-medium">
                {SECTION_LABELS[key] ?? key}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-slate-500"
                  onClick={() => moveSection(index, -1)}
                  disabled={index === 0}
                >
                  ▲
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-slate-500"
                  onClick={() => moveSection(index, 1)}
                  disabled={index === settings.sectionOrder.length - 1}
                >
                  ▼
                </Button>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sectionVisibility[key] ?? true}
                  onChange={() => toggleSectionVisibility(key)}
                  className="w-4 h-4"
                />
                <span className="text-xs text-slate-500">Visible</span>
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 px-8">
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
