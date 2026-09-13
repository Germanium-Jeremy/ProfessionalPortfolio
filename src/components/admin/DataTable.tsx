'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  onFilter?: (query: string) => void;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onSort,
  onFilter,
  className,
}: DataTableProps<T>) {
  const [localFilter, setLocalFilter] = useState('');

  const handleSort = (column: Column<T>) => {
    if (column.sortable && onSort) {
      // Simplified sorting toggle: this is just a trigger,
      // the actual sorting logic should be handled by the parent/repository
      // but we'll pass a generic key if accessor is a keyof T
      if (typeof column.accessor === 'string') {
        onSort(column.accessor as keyof T, 'asc'); // Simple toggle for demo
      }
    }
  };

  const filteredData = localFilter
    ? data.filter(item =>
        JSON.stringify(item).toLowerCase().includes(localFilter.toLowerCase())
      )
    : data;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Filter records..."
            className="pl-9"
            value={localFilter}
            onChange={(e) => {
              setLocalFilter(e.target.value);
              onFilter?.(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp className="w-3 h-3 opacity-30" />
                        <ChevronDown className="w-3 h-3 opacity-30" />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  {columns.map((col, i) => (
                    <td key={i} className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {typeof col.accessor === 'function'
                        ? col.accessor(item)
                        : (item[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
