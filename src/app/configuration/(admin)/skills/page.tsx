'use client';

import React, { useEffect, useState } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  isFeatured: boolean;
  sortOrder: number;
}

export default function SkillsPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'language',
    level: 3,
    isFeatured: false,
  });

  useEffect(() => {
    loadSkills();
  }, []);

  async function loadSkills() {
    try {
      const res = await fetch('/api/configuration/skills');
      const result = await res.json();
      if (result.ok) {
        setSkills(result.data);
      }
    } catch (err) {
      toast.error('Failed to load skills');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddSkill() {
    try {
      const res = await fetch('/api/configuration/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSkill),
      });
      const result = await res.json();
      if (result.ok) {
        toast.success('Skill added');
        setNewSkill({ name: '', category: 'language', level: 3, isFeatured: false });
        setIsAdding(false);
        loadSkills();
      } else {
        toast.error(result.error?.message || 'Failed to add skill');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  }

  async function handleDeleteSkill(id: string) {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    try {
      const res = await fetch(`/api/configuration/skills/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Skill deleted');
        loadSkills();
      }
    } catch (err) {
      toast.error('Failed to delete skill');
    }
  }

  const columns: Column<Skill>[] = [
    { header: 'Name', accessor: 'name', sortable: true },
    { header: 'Category', accessor: 'category', sortable: true },
    {
      header: 'Level',
      accessor: (s) => (
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full",
                i < s.level ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700"
              )}
            />
          ))}
        </div>
      ),
    },
    { header: 'Featured', accessor: (s) => (s.isFeatured ? '✅' : '❌') },
    {
      header: 'Actions',
      accessor: (s) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
            onClick={() => handleDeleteSkill(s.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Skills Management</h1>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          {isAdding ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Skill</>}
        </Button>
      </div>

      {isAdding && (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Name</label>
              <Input
                value={newSkill.name}
                onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                placeholder="e.g. TypeScript"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Category</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                value={newSkill.category}
                onChange={e => setNewSkill({ ...newSkill, category: e.target.value })}
              >
                <option value="language">Language</option>
                <option value="framework">Framework</option>
                <option value="tool">Tool</option>
                <option value="devops">DevOps</option>
                <option value="design">Design</option>
                <option value="soft">Soft Skill</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Level (1-5)</label>
              <Input
                type="number"
                min="1"
                max="5"
                value={newSkill.level}
                onChange={e => setNewSkill({ ...newSkill, level: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-2 py-8">
              <input
                type="checkbox"
                id="featured"
                checked={newSkill.isFeatured}
                onChange={e => setNewSkill({ ...newSkill, isFeatured: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="featured" className="text-sm font-medium cursor-pointer">Featured</label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button onClick={handleAddSkill}>Save Skill</Button>
          </div>
        </div>
      )}

      <DataTable
        data={skills}
        columns={columns}
        onSort={(key, dir) => console.log(`Sorting by ${key} ${dir}`)}
      />
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
