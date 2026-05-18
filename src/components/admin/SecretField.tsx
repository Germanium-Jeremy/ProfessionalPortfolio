'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SecretFieldProps {
  label: string;
  value?: string; // The masked or decrypted value
  defaultValue?: string;
  onChange?: (value: string) => void;
  onReveal?: () => Promise<string | null>;
  className?: string;
}

export function SecretField({
  label,
  value,
  defaultValue,
  onChange,
  onReveal,
  className,
}: SecretFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [revealedValue, setRevealedValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleReveal = async () => {
    if (!onReveal) return;
    setIsLoading(true);
    try {
      const val = await onReveal();
      setRevealedValue(val);
      setIsVisible(true);
    } catch (err) {
      console.error('Failed to reveal secret:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentDisplayValue = revealedValue ?? value ?? defaultValue ?? '';

  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type={isVisible ? 'text' : 'password'}
            value={currentDisplayValue}
            onChange={(e) => onChange?.(e.target.value)}
            className={cn(
              "pr-10",
              !isVisible && !revealedValue && "font-mono tracking-widest"
            )}
            placeholder={isVisible ? '' : '••••••••'}
          />
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {onReveal && !revealedValue && (
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-1"
            onClick={handleReveal}
            disabled={isLoading}
          >
            <Lock className="w-3 h-3" />
            {isLoading ? '...' : 'Reveal'}
          </Button>
        )}
      </div>
    </div>
  );
}
