"use client";

import React, { useEffect, useState } from "react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string | null;
  authorCompany: string | null;
  authorAvatarUrl: string | null;
  quote: string;
  rating: number | null;
  isApproved: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newT, setNewT] = useState({
    authorName: "",
    authorRole: "",
    authorCompany: "",
    authorAvatarUrl: "",
    quote: "",
    rating: 5,
    isApproved: true,
    isFeatured: false,
  });
  const [editT, setEditT] = useState({
    id: "",
    authorName: "",
    authorRole: "",
    authorCompany: "",
    authorAvatarUrl: "",
    quote: "",
    rating: 5,
    isApproved: true,
    isFeatured: false,
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  async function loadTestimonials() {
    try {
      const res = await fetch("/api/configuration/testimonials");
      const result = await res.json();
      if (result.ok) {
        setTestimonials(result.data);
      }
    } catch {
      toast.error("Failed to load testimonials");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAvatarUpload(
    event: React.ChangeEvent<HTMLInputElement>,
    target: "new" | "edit",
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/configuration/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok || !result.ok || !result.data?.url) {
        throw new Error(result.error || "Image upload failed");
      }

      if (target === "new") {
        setNewT((prev) => ({ ...prev, authorAvatarUrl: result.data.url }));
      } else {
        setEditT((prev) => ({ ...prev, authorAvatarUrl: result.data.url }));
      }
      toast.success("Profile image uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Image upload failed",
      );
    }
  }

  async function handleEditTestimonial(t: Testimonial) {
    setEditT({
      id: t.id,
      authorName: t.authorName,
      authorRole: t.authorRole || "",
      authorCompany: t.authorCompany || "",
      authorAvatarUrl: t.authorAvatarUrl || "",
      quote: t.quote,
      rating: t.rating || 5,
      isApproved: t.isApproved,
      isFeatured: t.isFeatured,
    });
    setIsEditing(true);
    setIsAdding(false);
  }

  async function handleUpdateTestimonial() {
    try {
      const { id, ...testimonialData } = editT;
      const res = await fetch(`/api/configuration/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testimonialData),
      });
      const result = await res.json();
      if (result.ok) {
        toast.success("Testimonial updated");
        setIsEditing(false);
        loadTestimonials();
      } else {
        toast.error(result.error?.message || "Failed to update testimonial");
      }
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  async function handleAddTestimonial() {
    try {
      const res = await fetch("/api/configuration/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newT),
      });
      const result = await res.json();
      if (result.ok) {
        toast.success("Testimonial added");
        setNewT({
          authorName: "",
          authorRole: "",
          authorCompany: "",
          authorAvatarUrl: "",
          quote: "",
          rating: 5,
          isApproved: true,
          isFeatured: false,
        });
        setIsAdding(false);
        loadTestimonials();
      } else {
        toast.error(result.error?.message || "Failed to add testimonial");
      }
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  async function toggleFeatured(id: string, current: boolean) {
    try {
      const res = await fetch(`/api/configuration/testimonials/${id}/feature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !current }),
      });
      if (res.ok) {
        toast.success("Visibility updated");
        loadTestimonials();
      }
    } catch {
      toast.error("Failed to update visibility");
    }
  }

  async function handleDeleteTestimonial(id: string) {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      const res = await fetch(`/api/configuration/testimonials/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Testimonial deleted");
        loadTestimonials();
      }
    } catch {
      toast.error("Failed to delete testimonial");
    }
  }

  const columns: Column<Testimonial>[] = [
    {
      header: "Author",
      accessor: (t) => (
        <div className="flex flex-col">
          <span className="font-medium">{t.authorName}</span>
          <span className="text-xs text-slate-500">
            {t.authorRole} @ {t.authorCompany}
          </span>
        </div>
      ),
    },
    {
      header: "Rating",
      accessor: (t) => (t.rating ? `⭐ ${t.rating}/5` : "N/A"),
    },
    { header: "Approved", accessor: (t) => (t.isApproved ? "✅" : "❌") },
    {
      header: "Show on Portfolio",
      accessor: (t) => (
        <input
          type="checkbox"
          className="w-4 h-4 cursor-pointer"
          checked={t.isFeatured}
          onChange={() => toggleFeatured(t.id, t.isFeatured)}
        />
      ),
    },
    {
      header: "Actions",
      accessor: (t) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handleEditTestimonial(t)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
            onClick={() => handleDeleteTestimonial(t.id)}
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
        <h1 className="text-2xl font-bold">Testimonials Management</h1>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          {isAdding ? (
            "Cancel"
          ) : (
            <>
              <Plus className="w-4 h-4" /> Add Testimonial
            </>
          )}
        </Button>
      </div>

      {isAdding && (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Author Name</label>
              <Input
                value={newT.authorName}
                onChange={(e) =>
                  setNewT({ ...newT, authorName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Role</label>
              <Input
                value={newT.authorRole}
                onChange={(e) =>
                  setNewT({ ...newT, authorRole: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Company</label>
              <Input
                value={newT.authorCompany}
                onChange={(e) =>
                  setNewT({ ...newT, authorCompany: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <label className="block text-sm font-medium">
                Profile Image (Optional)
              </label>
              <Input
                type="url"
                value={newT.authorAvatarUrl}
                onChange={(e) =>
                  setNewT({ ...newT, authorAvatarUrl: e.target.value })
                }
                placeholder="https://..."
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleAvatarUpload(e, "new")}
                className="block w-full text-sm"
              />
              {newT.authorAvatarUrl && (
                <img
                  src={newT.authorAvatarUrl}
                  alt="Profile preview"
                  className="h-12 w-12 rounded-full object-cover"
                />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Quote</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent min-h-[100px]"
              value={newT.quote}
              onChange={(e) => setNewT({ ...newT, quote: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Rating (1-5)</label>
              <Input
                type="number"
                min="1"
                max="5"
                value={newT.rating}
                onChange={(e) =>
                  setNewT({ ...newT, rating: parseInt(e.target.value) })
                }
                className="w-20"
              />
            </div>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newT.isApproved}
                  onChange={(e) =>
                    setNewT({ ...newT, isApproved: e.target.checked })
                  }
                />
                <span className="text-sm font-medium">Approved</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newT.isFeatured}
                  onChange={(e) =>
                    setNewT({ ...newT, isFeatured: e.target.checked })
                  }
                />
                <span className="text-sm font-medium">Show on Portfolio</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleAddTestimonial}>
              Save Testimonial
            </Button>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Author Name</label>
              <Input
                value={editT.authorName}
                onChange={(e) =>
                  setEditT({ ...editT, authorName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Role</label>
              <Input
                value={editT.authorRole}
                onChange={(e) =>
                  setEditT({ ...editT, authorRole: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Company</label>
              <Input
                value={editT.authorCompany}
                onChange={(e) =>
                  setEditT({ ...editT, authorCompany: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <label className="block text-sm font-medium">
                Profile Image (Optional)
              </label>
              <Input
                type="url"
                value={editT.authorAvatarUrl}
                onChange={(e) =>
                  setEditT({ ...editT, authorAvatarUrl: e.target.value })
                }
                placeholder="https://..."
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleAvatarUpload(e, "edit")}
                className="block w-full text-sm"
              />
              {editT.authorAvatarUrl && (
                <img
                  src={editT.authorAvatarUrl}
                  alt="Profile preview"
                  className="h-12 w-12 rounded-full object-cover"
                />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Quote</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent min-h-[100px]"
              value={editT.quote}
              onChange={(e) => setEditT({ ...editT, quote: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Rating (1-5)</label>
              <Input
                type="number"
                min="1"
                max="5"
                value={editT.rating}
                onChange={(e) =>
                  setEditT({ ...editT, rating: parseInt(e.target.value) })
                }
                className="w-20"
              />
            </div>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editT.isApproved}
                  onChange={(e) =>
                    setEditT({ ...editT, isApproved: e.target.checked })
                  }
                />
                <span className="text-sm font-medium">Approved</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editT.isFeatured}
                  onChange={(e) =>
                    setEditT({ ...editT, isFeatured: e.target.checked })
                  }
                />
                <span className="text-sm font-medium">Show on Portfolio</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateTestimonial}>
              Update Testimonial
            </Button>
          </div>
        </div>
      )}

      <DataTable
        data={testimonials}
        columns={columns}
        onSort={(key, dir) => console.log(`Sorting by ${key} ${dir}`)}
      />
    </div>
  );
}
