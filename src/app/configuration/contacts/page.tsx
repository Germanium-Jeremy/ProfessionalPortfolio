'use client';

import React, { useEffect, useState } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { SecretField } from '@/components/admin/SecretField';

interface Contact {
  id: string;
  kind: string;
  label: string;
  isPublic: boolean;
  sortOrder: number;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newC, setNewC] = useState({
    kind: 'email',
    label: '',
    isPublic: false,
    value: '',
  });

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    try {
      const res = await fetch('/api/configuration/contacts');
      const result = await res.json();
      if (result.ok) {
        setContacts(result.data);
      }
    } catch (err) {
      toast.error('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddContact() {
    try {
      const res = await fetch('/api/configuration/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newC),
      });
      const result = await res.json();
      if (result.ok) {
        toast.success('Contact added');
        setNewC({ kind: 'email', label: '', isPublic: false, value: '' });
        setIsAdding(false);
        loadContacts();
      } else {
        toast.error(result.error?.message || 'Failed to add contact');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  }

  async function handleDeleteContact(id: string) {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      const res = await fetch(`/api/configuration/contacts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Contact deleted');
        loadContacts();
      }
    } catch (err) {
      toast.error('Failed to delete contact');
    }
  }

  const columns: Column<Contact>[] = [
    { header: 'Kind', accessor: 'kind', sortable: true },
    { header: 'Label', accessor: 'label', sortable: true },
    { header: 'Public', accessor: (c) => (c.isPublic ? '✅' : '❌') },
    {
      header: 'Value',
      accessor: (c) => (
        <SecretField
          label=""
          value="••••••••"
          onReveal={async () => {
            const res = await fetch(`/api/configuration/contacts/${c.id}/reveal`, { method: 'POST' });
            const result = await res.json();
            return result.ok ? result.data.value : null;
          }}
          className="w-40"
        />
      ),
    },
    {
      header: 'Actions',
      accessor: (c) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
            onClick={() => handleDeleteContact(c.id)}
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
        <h1 className="text-2xl font-bold">Contacts Management</h1>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          {isAdding ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Contact</>}
        </Button>
      </div>

      {isAdding && (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Kind</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent text-sm"
                value={newC.kind}
                onChange={e => setNewC({ ...newC, kind: e.target.value })}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="linkedin">LinkedIn</option>
                <option value="github">GitHub</option>
                <option value="x">X</option>
                <option value="discord">Discord</option>
                <option value="website">Website</option>
                <option value="youtube">YouTube</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Label</label>
              <Input
                value={newC.label}
                onChange={e => setNewC({ ...newC, label: e.target.value })}
                placeholder="e.g. Work Email"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Value</label>
              <Input
                value={newC.value}
                onChange={e => setNewC({ ...newC, value: e.target.value })}
                placeholder="e.g. jeremy@example.com"
              />
            </div>
            <div className="flex items-center gap-4 py-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newC.isPublic}
                  onChange={e => setNewC({ ...newC, isPublic: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Publicly Visible</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button onClick={handleAddContact}>Save Contact</Button>
          </div>
        </div>
      )}

      <DataTable
        data={contacts}
        columns={columns}
        onSort={(key, dir) => console.log(`Sorting by ${key} ${dir}`)}
      />
    </div>
  );
}
