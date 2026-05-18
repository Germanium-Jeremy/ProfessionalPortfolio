'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SortableItem<T> {
  id: string;
  content: React.ReactNode;
}

interface SortableListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onReorder: (items: T[]) => void;
  className?: string;
}

export function SortableList<T extends { id: string }>({
  items,
  renderItem,
  onReorder,
  className,
}: SortableListProps<T>) {
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const moveItem = (fromIndex: number, toIndex: number) => {
    const result = [...items];
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    onReorder(result);
  };

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const result = [...items];
    const [removed] = result.splice(draggedItemIndex, 1);
    result.splice(index, 0, removed);

    setDraggedItemIndex(index);
    onReorder(result);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => {
            e.preventDefault();
            handleDragOver(index);
          }}
          onDragEnd={handleDragEnd}
          className={cn(
            "flex items-center gap-3 p-3 rounded-md border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 transition-colors",
            draggedItemIndex === index ? "opacity-50 border-blue-500" : "hover:border-slate-300 dark:hover:border-slate-600"
          )}
        >
          <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
            <GripVertical className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex-1">
            {renderItem(item)}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => index > 0 && moveItem(index, index - 1)}
              disabled={index === 0}
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => index < items.length - 1 && moveItem(index, index + 1)}
              disabled={index === items.length - 1}
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
