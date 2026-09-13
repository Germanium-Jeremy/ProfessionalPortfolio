'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTimeout(() => setDark(isDark), 0);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    document.cookie = `theme=${next ? 'dark' : 'light'}; path=/; max-age=31536000; SameSite=Lax`;
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
