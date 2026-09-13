'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RepeatableFieldProps<T> {
  label: string;
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function RepeatableField<T>({
  label,
  items,
  onAdd,
  onRemove,
  renderItem,
  className,
}: RepeatableFieldProps<T>) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</h3>
        <Button type="button" variant="outline" size="sm" onClick={onAdd} className="h-8 gap-1">
          <Plus className="w-3 h-3" />
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1">
              {renderItem(item, index)}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => onRemove(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-slate-500 italic">No items added yet.</p>
        )}
      </div>
    </div>
  );
}
