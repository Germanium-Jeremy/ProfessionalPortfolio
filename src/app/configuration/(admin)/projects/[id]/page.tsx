"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { projectSchema, type ProjectInput } from "@/lib/validation/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RepeatableField } from "@/components/admin/RepeatableField";
import { toast } from "sonner";
import { ChevronLeft, Save, ImageIcon, Trash2 } from "lucide-react";

type Tab = "basics" | "description" | "links" | "facts" | "skills" | "gallery";
type ProjectFormValues = z.input<typeof projectSchema>;

export default function ProjectEditor() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const isNew = projectId === "new";

  const [activeTab, setActiveTab] = useState<Tab>("basics");
  const [isLoading, setIsLoading] = useState(true);
  const [skillsList, setSkillsList] = useState<{ id: string; name: string }[]>(
    [],
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ProjectFormValues, unknown, ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      slug: "",
      title: "",
      summary: "",
      status: "draft",
      isFeatured: false,
      sortOrder: 0,
      links: [],
      facts: [],
      skillIds: [],
      gallery: [],
    },
  });
  const links = useWatch({ control, name: "links" }) ?? [];
  const facts = useWatch({ control, name: "facts" }) ?? [];
  const skillIds = useWatch({ control, name: "skillIds" }) ?? [];
  const gallery = useWatch({ control, name: "gallery" }) ?? [];
  const [isOngoing, setIsOngoing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const skillRes = await fetch("/api/configuration/skills");
        const skillData = await skillRes.json();
        if (skillData.ok) setSkillsList(skillData.data);

        if (!isNew) {
          const projRes2 = await fetch(
            `/api/configuration/projects/${projectId}`,
          );
          const projData = await projRes2.json();
          if (projData.ok) {
            const p = projData.data;
            setValue("slug", p.slug);
            setValue("title", p.title);
            setValue("summary", p.summary);
            setValue("description", p.description);
            setValue("coverImageUrl", p.coverImageUrl);
            setValue("gallery", p.gallery ? JSON.parse(p.gallery) : []);
            setValue(
              "startDate",
              p.startDate
                ? new Date(p.startDate).toISOString().slice(0, 10)
                : "",
            );
            setValue(
              "endDate",
              p.endDate ? new Date(p.endDate).toISOString().slice(0, 10) : "",
            );
            setIsOngoing(!p.endDate);
            setValue("status", p.status);
            setValue("isFeatured", p.isFeatured);
            setValue("sortOrder", p.sortOrder);
            setValue(
              "links",
              p.links.map(
                (l: {
                  kind: string;
                  label: string;
                  url: string;
                  isPrimary: boolean;
                  isPublic: boolean;
                  sortOrder: number;
                }) => ({
                  kind: l.kind,
                  label: l.label,
                  url: l.url,
                  isPrimary: l.isPrimary,
                  isPublic: l.isPublic,
                  sortOrder: l.sortOrder,
                }),
              ),
            );
            setValue(
              "facts",
              p.facts.map(
                (f: { label: string; value: string; sortOrder: number }) => ({
                  label: f.label,
                  value: f.value,
                  sortOrder: f.sortOrder,
                }),
              ),
            );
            setValue(
              "skillIds",
              p.skills.map((s: { skillId: string }) => s.skillId),
            );
          }
        }
      } catch {
        toast.error("Failed to load project data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [projectId, isNew, setValue]);

  const onSubmit = async (data: ProjectInput) => {
    try {
      const { skillIds = [], links = [], facts = [], ...projectData } = data;
      const method = isNew ? "POST" : "PATCH";
      const url = isNew
        ? "/api/configuration/projects"
        : `/api/configuration/projects/${projectId}`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...projectData, skillIds, links, facts }),
      });

      const result = await res.json();
      if (!result.ok)
        throw new Error(result.error?.message || "Failed to save project");

      toast.success("Project saved successfully");
      if (isNew) router.push(`/configuration/projects/${result.data.id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(message);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => router.back()}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold">
            {isNew ? "New Project" : "Edit Project"}
          </h1>
        </div>
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          className="gap-2"
        >
          <Save className="w-4 h-4" /> Save Project
        </Button>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-700">
        {(
          [
            "basics",
            "description",
            "links",
            "facts",
            "skills",
            "gallery",
          ] as Tab[]
        ).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2",
              activeTab === tab
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 space-y-6"
      >
        {activeTab === "basics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Title</label>
              <Input {...register("title")} />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Slug</label>
              <Input {...register("slug")} />
              {errors.slug && (
                <p className="text-xs text-red-500">{errors.slug.message}</p>
              )}
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium">Summary</label>
              <Input {...register("summary")} />
              {errors.summary && (
                <p className="text-xs text-red-500">{errors.summary.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Start Date</label>
              <Input type="date" {...register("startDate")} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">End Date</label>
              <Input
                type="date"
                disabled={isOngoing}
                {...register("endDate")}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isOngoing}
                  onChange={(event) => {
                    const ongoing = event.target.checked;
                    setIsOngoing(ongoing);
                    if (ongoing) setValue("endDate", "");
                  }}
                />
                Currently working on it
              </label>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isFeatured")}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Featured Project</span>
              </label>
              <select
                {...register("status")}
                className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === "description" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Description (Markdown)
            </label>
            <textarea
              {...register("description")}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent min-h-[300px]"
            />
            {errors.description && (
              <p className="text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>
        )}

        {activeTab === "links" && (
          <RepeatableField
            label="Project Links"
            items={links}
            onAdd={() => {
              const current = links;
              setValue("links", [
                ...current,
                {
                  kind: "other",
                  label: "",
                  url: "",
                  isPrimary: false,
                  isPublic: true,
                  sortOrder: current.length,
                },
              ]);
            }}
            onRemove={(index) => {
              const current = links;
              setValue(
                "links",
                current.filter((_, i) => i !== index),
              );
            }}
            renderItem={(link, index) => (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Kind</label>
                  <select
                    value={link.kind}
                    onChange={(e) => {
                      const current = [...links];
                      const existing = current[index];
                      if (!existing) return;
                      current[index] = { ...existing, kind: e.target.value };
                      setValue("links", current);
                    }}
                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-transparent text-xs"
                  >
                    <option value="live">Live</option>
                    <option value="github">GitHub</option>
                    <option value="gdrive">Google Drive</option>
                    <option value="unity_cloud">Unity Cloud</option>
                    <option value="itch">Itch.io</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Label</label>
                  <Input
                    value={link.label}
                    onChange={(e) => {
                      const current = [...links];
                      const existing = current[index];
                      if (!existing) return;
                      current[index] = { ...existing, label: e.target.value };
                      setValue("links", current);
                    }}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">URL</label>
                  <Input
                    value={link.url}
                    onChange={(e) => {
                      const current = [...links];
                      const existing = current[index];
                      if (!existing) return;
                      current[index] = { ...existing, url: e.target.value };
                      setValue("links", current);
                    }}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={link.isPrimary}
                      onChange={(e) => {
                        const current = links.map((l, i) => ({
                          ...l,
                          isPrimary: i === index ? e.target.checked : false,
                        }));
                        setValue("links", current);
                      }}
                    />
                    Primary
                  </label>
                </div>
              </div>
            )}
          />
        )}

        {activeTab === "facts" && (
          <RepeatableField
            label="Project Facts"
            items={facts}
            onAdd={() => {
              const current = facts;
              setValue("facts", [
                ...current,
                { label: "", value: "", sortOrder: current.length },
              ]);
            }}
            onRemove={(index) => {
              const current = facts;
              setValue(
                "facts",
                current.filter((_, i) => i !== index),
              );
            }}
            renderItem={(fact, index) => (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Label (e.g. Team Size)"
                  value={fact.label}
                  onChange={(e) => {
                    const current = [...facts];
                    const existing = current[index];
                    if (!existing) return;
                    current[index] = { ...existing, label: e.target.value };
                    setValue("facts", current);
                  }}
                  className="h-8 text-xs"
                />
                <Input
                  placeholder="Value (e.g. 4)"
                  value={fact.value}
                  onChange={(e) => {
                    const current = [...facts];
                    const existing = current[index];
                    if (!existing) return;
                    current[index] = { ...existing, value: e.target.value };
                    setValue("facts", current);
                  }}
                  className="h-8 text-xs"
                />
              </div>
            )}
          />
        )}

        {activeTab === "skills" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">
                Associated Skills
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="New skill name..."
                  className="h-8 w-48 text-xs"
                  id="new-skill-input"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={async () => {
                    const input = document.getElementById(
                      "new-skill-input",
                    ) as HTMLInputElement;
                    const name = input.value.trim();
                    if (!name) return;

                    try {
                      const res = await fetch("/api/configuration/skills", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name,
                          category: "tool",
                          level: 3,
                          isFeatured: false,
                        }),
                      });
                      const result = await res.json();
                      if (result.ok) {
                        const newSkill = result.data;
                        setSkillsList((prev) => [...prev, newSkill]);
                        setValue("skillIds", [...skillIds, newSkill.id]);
                        input.value = "";
                        toast.success(`Skill "${name}" added`);
                      } else {
                        toast.error(
                          result.error?.message || "Failed to add skill",
                        );
                      }
                    } catch {
                      toast.error("An unexpected error occurred");
                    }
                  }}
                >
                  Add New
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 p-3 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-900">
              {skillsList.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-2 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={skillIds.includes(s.id)}
                    onChange={(e) => {
                      const ids = e.target.checked
                        ? [...skillIds, s.id]
                        : skillIds.filter((id) => id !== s.id);
                      setValue("skillIds", ids);
                    }}
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="space-y-4">
            <label className="block text-sm font-medium">Gallery Images</label>
            <div className="grid grid-cols-3 gap-4">
              {gallery.map((url: string, index: number) => (
                <div
                  key={index}
                  className="relative aspect-video bg-slate-100 dark:bg-slate-700 rounded-md overflow-hidden border border-slate-200 dark:border-slate-600"
                >
                  <img
                    src={url}
                    alt="Gallery"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    type="button"
                    onClick={() => {
                      const current = gallery;
                      setValue(
                        "gallery",
                        current.filter((_: string, i: number) => i !== index),
                      );
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="aspect-video border-dashed flex flex-col items-center justify-center gap-2"
                onClick={async () => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;

                    try {
                      const formData = new FormData();
                      formData.append("file", file);

                      const res = await fetch("/api/configuration/upload", {
                        method: "POST",
                        body: formData,
                      });
                      const result = await res.json();
                      if (result.ok) {
                        const current = gallery;
                        setValue("gallery", [...current, result.data.url]);
                        toast.success("Image uploaded");
                      } else {
                        toast.error(result.error || "Upload failed");
                      }
                    } catch {
                      toast.error("An unexpected error occurred");
                    }
                  };
                  input.click();
                }}
              >
                <ImageIcon className="w-6 h-6 text-slate-400" />
                <span className="text-xs">Upload Image</span>
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
