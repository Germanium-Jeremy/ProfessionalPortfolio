'use client';

import React, { useEffect, useState } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: string;
  isFeatured: boolean;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const res = await fetch('/api/configuration/projects');
      const result = await res.json();
      if (result.ok) {
        setProjects(result.data);
      }
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteProject(id: string) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/configuration/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Project deleted');
        loadProjects();
      }
    } catch (err) {
      toast.error('Failed to delete project');
    }
  }

  const columns: Column<Project>[] = [
    { header: 'Title', accessor: 'title', sortable: true },
    { header: 'Slug', accessor: 'slug', sortable: true },
    { header: 'Status', accessor: (p) => (
      <span className={cn(
        "px-2 py-0.5 rounded-full text-xs font-medium",
        p.status === 'published' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
      )}>
        {p.status}
      </span>
    )},
    { header: 'Featured', accessor: (p) => (p.isFeatured ? '✅' : '❌') },
    {
      header: 'Actions',
      accessor: (p) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => router.push(`/configuration/projects/${p.id}`)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
            onClick={() => handleDeleteProject(p.id)}
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
        <h1 className="text-2xl font-bold">Projects Management</h1>
        <Button onClick={() => router.push('/configuration/projects/new')} className="gap-2">
          <Plus className="w-4 h-4" /> Add Project
        </Button>
      </div>

      <DataTable
        data={projects}
        columns={columns}
        onSort={(key, dir) => console.log(`Sorting by ${key} ${dir}`)}
      />
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
