'use client';

import React, { useEffect, useState } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Experience {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
  skills: { skill: { id: string; name: string } }[];
}

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newExp, setNewExp] = useState({
    role: '',
    company: '',
    startDate: '',
    endDate: '',
    description: '',
    skillIds: [] as string[],
  });
  const [editExp, setEditExp] = useState({
    id: '',
    role: '',
    company: '',
    startDate: '',
    endDate: '',
    description: '',
    skillIds: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [expRes, skillRes] = await Promise.all([
        fetch('/api/configuration/experience'),
        fetch('/api/configuration/skills'),
      ]);
      const expData = await expRes.json();
      const skillData = await skillRes.json();
      if (expData.ok) setExperiences(expData.data);
      if (skillData.ok) setSkills(skillData.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEditExperience(e: Experience) {
    const skillIds = e.skills.map(s => s.skill.id);
    setEditExp({
      id: e.id,
      role: e.role,
      company: e.company,
      startDate: e.startDate,
      endDate: e.endDate || '',
      description: e.description,
      skillIds,
    });
    setIsEditing(true);
    setIsAdding(false);
  }

  async function handleUpdateExperience() {
    try {
      const res = await fetch(`/api/configuration/experience/${editExp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editExp),
      });
      const result = await res.json();
      if (result.ok) {
        toast.success('Experience updated');
        setIsEditing(false);
        loadData();
      } else {
        toast.error(result.error?.message || 'Failed to update experience');
      }
    } catch {
      toast.error('An unexpected error occurred');
    }
  }

  async function handleAddExperience() {
    try {
      const res = await fetch('/api/configuration/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExp),
      });
      const result = await res.json();
      if (result.ok) {
        toast.success('Experience added');
        setNewExp({ role: '', company: '', startDate: '', endDate: '', description: '', skillIds: [] });
        setIsAdding(false);
        loadData();
      } else {
        toast.error(result.error?.message || 'Failed to add experience');
      }
    } catch {
      toast.error('An unexpected error occurred');
    }
  }

  async function handleDeleteExperience(id: string) {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    try {
      const res = await fetch(`/api/configuration/experience/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Experience deleted');
        loadData();
      }
    } catch {
      toast.error('Failed to delete experience');
    }
  }

  const columns: Column<Experience>[] = [
    { header: 'Role', accessor: 'role', sortable: true },
    { header: 'Company', accessor: 'company', sortable: true },
    { header: 'Period', accessor: (e) => `${e.startDate} - ${e.endDate || 'Present'}` },
    {
      header: 'Skills',
      accessor: (e) => (
        <div className="flex flex-wrap gap-1">
          {e.skills.map(s => (
            <span key={s.skill.id} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">
              {s.skill.name}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (e) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handleEditExperience(e)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
            onClick={() => handleDeleteExperience(e.id)}
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
        <h1 className="text-2xl font-bold">Experience Management</h1>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          {isAdding ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Experience</>}
        </Button>
      </div>

      {isAdding && (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Role</label>
              <Input
                value={newExp.role}
                onChange={e => setNewExp({ ...newExp, role: e.target.value })}
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Company</label>
              <Input
                value={newExp.company}
                onChange={e => setNewExp({ ...newExp, company: e.target.value })}
                placeholder="e.g. Tech Corp"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={newExp.startDate}
                onChange={e => setNewExp({ ...newExp, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">End Date (Optional)</label>
              <Input
                type="date"
                value={newExp.endDate}
                onChange={e => setNewExp({ ...newExp, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Description (Markdown)</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent min-h-[100px]"
              value={newExp.description}
              onChange={e => setNewExp({ ...newExp, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Skills</label>
              <div className="flex gap-2">
                <Input
                  placeholder="New skill name..."
                  className="h-8 w-48 text-xs"
                  id="exp-new-skill-input"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={async () => {
                    const input = document.getElementById('exp-new-skill-input') as HTMLInputElement;
                    const name = input.value.trim();
                    if (!name) return;

                    try {
                      const res = await fetch('/api/configuration/skills', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, category: 'tool', level: 3, isFeatured: false }),
                      });
                      const result = await res.json();
                      if (result.ok) {
                        const newSkill = result.data;
                        setSkills(prev => [...prev, newSkill]);
                        setNewExp(prev => ({ ...prev, skillIds: [...prev.skillIds, newSkill.id] }));
                        input.value = '';
                        toast.success(`Skill "${name}" added`);
                      } else {
                        toast.error(result.error?.message || 'Failed to add skill');
                      }
                    } catch {
                      toast.error('An unexpected error occurred');
                    }
                  }}
                >
                  Add New
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 p-3 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-900">
              {skills.map(s => (
                <label key={s.id} className="flex items-center gap-2 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={newExp.skillIds.includes(s.id)}
                    onChange={e => {
                      const ids = e.target.checked
                        ? [...newExp.skillIds, s.id]
                        : newExp.skillIds.filter(id => id !== s.id);
                      setNewExp({ ...newExp, skillIds: ids });
                    }}
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button onClick={handleAddExperience}>Save Experience</Button>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Role</label>
              <Input
                value={editExp.role}
                onChange={e => setEditExp({ ...editExp, role: e.target.value })}
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Company</label>
              <Input
                value={editExp.company}
                onChange={e => setEditExp({ ...editExp, company: e.target.value })}
                placeholder="e.g. Tech Corp"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={editExp.startDate}
                onChange={e => setEditExp({ ...editExp, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">End Date (Optional)</label>
              <Input
                type="date"
                value={editExp.endDate}
                onChange={e => setEditExp({ ...editExp, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Description (Markdown)</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent min-h-[100px]"
              value={editExp.description}
              onChange={e => setEditExp({ ...editExp, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Skills</label>
              <div className="flex gap-2">
                <Input
                  placeholder="New skill name..."
                  className="h-8 w-48 text-xs"
                  id="edit-exp-new-skill-input"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={async () => {
                    const input = document.getElementById('edit-exp-new-skill-input') as HTMLInputElement;
                    const name = input.value.trim();
                    if (!name) return;

                    try {
                      const res = await fetch('/api/configuration/skills', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, category: 'tool', level: 3, isFeatured: false }),
                      });
                      const result = await res.json();
                      if (result.ok) {
                        const newSkill = result.data;
                        setSkills(prev => [...prev, newSkill]);
                        setEditExp(prev => ({ ...prev, skillIds: [...prev.skillIds, newSkill.id] }));
                        input.value = '';
                        toast.success(`Skill "${name}" added`);
                      } else {
                        toast.error(result.error?.message || 'Failed to add skill');
                      }
                    } catch {
                      toast.error('An unexpected error occurred');
                    }
                  }}
                >
                  Add New
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 p-3 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-900">
              {skills.map(s => (
                <label key={s.id} className="flex items-center gap-2 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={editExp.skillIds.includes(s.id)}
                    onChange={e => {
                      const ids = e.target.checked
                        ? [...editExp.skillIds, s.id]
                        : editExp.skillIds.filter(id => id !== s.id);
                      setEditExp({ ...editExp, skillIds: ids });
                    }}
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleUpdateExperience}>Update Experience</Button>
          </div>
        </div>
      )}

      <DataTable
        data={experiences}
        columns={columns}
        onSort={(key, dir) => console.log(`Sorting by ${key} ${dir}`)}
      />
    </div>
  );
}
