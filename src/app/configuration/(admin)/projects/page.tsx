"use client";

import React, { useEffect, useState } from "react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Plus, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: string;
  isFeatured: boolean;
  sortOrder: number;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadProjects() {
    try {
      const res = await fetch("/api/configuration/projects");
      const result = await res.json();
      if (result.ok) {
        setProjects(result.data);
      }
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteProject(id: string) {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`/api/configuration/projects/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Project deleted");
        loadProjects();
      }
    } catch {
      toast.error("Failed to delete project");
    }
  }

  async function moveProject(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const reordered = [...projects];
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];
    setProjects(reordered);

    try {
      const responses = await Promise.all(
        reordered.map((project, sortOrder) =>
          fetch(`/api/configuration/projects/${project.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder }),
          }),
        ),
      );
      if (responses.some((response) => !response.ok)) {
        throw new Error("Failed to save project order");
      }
      toast.success("Project order updated");
    } catch {
      toast.error("Failed to save project order");
      loadProjects();
    }
  }

  useEffect(() => {
    setTimeout(() => {
      loadProjects();
    }, 0);
  }, []);

  const columns: Column<Project>[] = [
    { header: "Title", accessor: "title", sortable: true },
    { header: "Slug", accessor: "slug", sortable: true },
    {
      header: "Status",
      accessor: (p) => (
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium",
            p.status === "published"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
          )}
        >
          {p.status}
        </span>
      ),
    },
    { header: "Featured", accessor: (p) => (p.isFeatured ? "✅" : "❌") },
    {
      header: "Order",
      accessor: (p) => {
        const index = projects.findIndex((project) => project.id === p.id);
        return (
          <div className="flex items-center gap-1">
            <span className="w-5 text-center">{index + 1}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={index === 0}
              onClick={() => moveProject(index, -1)}
              aria-label={`Move ${p.title} up`}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={index === projects.length - 1}
              onClick={() => moveProject(index, 1)}
              aria-label={`Move ${p.title} down`}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      header: "Actions",
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
        <Button
          onClick={() => router.push("/configuration/projects/new")}
          className="gap-2"
        >
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
  return classes.filter(Boolean).join(" ");
}
