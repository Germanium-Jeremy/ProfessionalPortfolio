"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string | null;
  credentialId: string | null;
  credentialUrl: string | null;
  description: string | null;
  fileUrl: string | null;
  fileType: string | null;
  fileName: string | null;
  sortOrder: number;
  isVisible: boolean;
}

interface CertificateFormState {
  title: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
  credentialId: string;
  credentialUrl: string;
  description: string;
  fileUrl: string;
  fileType: "" | "image" | "pdf";
  fileName: string;
  isVisible: boolean;
}

const EMPTY_FORM: CertificateFormState = {
  title: "",
  issuer: "",
  issuedAt: "",
  expiresAt: "",
  credentialId: "",
  credentialUrl: "",
  description: "",
  fileUrl: "",
  fileType: "",
  fileName: "",
  isVisible: true,
};

const ACCEPTED_FILE_TYPES =
  "image/png,image/jpeg,image/webp,application/pdf";

function dayValue(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toFormState(certificate: Certificate): CertificateFormState {
  return {
    title: certificate.title,
    issuer: certificate.issuer,
    issuedAt: dayValue(certificate.issuedAt),
    expiresAt: dayValue(certificate.expiresAt),
    credentialId: certificate.credentialId ?? "",
    credentialUrl: certificate.credentialUrl ?? "",
    description: certificate.description ?? "",
    fileUrl: certificate.fileUrl ?? "",
    fileType:
      certificate.fileType === "image" || certificate.fileType === "pdf"
        ? certificate.fileType
        : "",
    fileName: certificate.fileName ?? "",
    isVisible: certificate.isVisible,
  };
}

function toPayload(form: CertificateFormState) {
  return {
    title: form.title.trim(),
    issuer: form.issuer.trim(),
    issuedAt: form.issuedAt,
    expiresAt: form.expiresAt || null,
    credentialId: form.credentialId.trim() || null,
    credentialUrl: form.credentialUrl.trim() || null,
    description: form.description.trim() || null,
    fileUrl: form.fileUrl.trim() || null,
    fileType: form.fileType || null,
    fileName: form.fileName.trim() || null,
    isVisible: form.isVisible,
  };
}

interface CertificateFormProps {
  value: CertificateFormState;
  onChange: (value: CertificateFormState) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  idPrefix: string;
}

function CertificateForm({
  value,
  onChange,
  onUpload,
  idPrefix,
}: CertificateFormProps) {
  function set(patch: Partial<CertificateFormState>) {
    onChange({ ...value, ...patch });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            className="block text-sm font-medium"
            htmlFor={`${idPrefix}-title`}
          >
            Title
          </label>
          <Input
            id={`${idPrefix}-title`}
            value={value.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="e.g. AWS Certified Solutions Architect"
          />
        </div>
        <div className="space-y-2">
          <label
            className="block text-sm font-medium"
            htmlFor={`${idPrefix}-issuer`}
          >
            Issuing company
          </label>
          <Input
            id={`${idPrefix}-issuer`}
            value={value.issuer}
            onChange={(e) => set({ issuer: e.target.value })}
            placeholder="e.g. Amazon Web Services"
          />
        </div>
        <div className="space-y-2">
          <label
            className="block text-sm font-medium"
            htmlFor={`${idPrefix}-issued`}
          >
            Issued date
          </label>
          <Input
            id={`${idPrefix}-issued`}
            type="date"
            value={value.issuedAt}
            onChange={(e) => set({ issuedAt: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label
            className="block text-sm font-medium"
            htmlFor={`${idPrefix}-expires`}
          >
            Expiry date (optional)
          </label>
          <Input
            id={`${idPrefix}-expires`}
            type="date"
            value={value.expiresAt}
            onChange={(e) => set({ expiresAt: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label
            className="block text-sm font-medium"
            htmlFor={`${idPrefix}-credential-id`}
          >
            Credential ID (optional)
          </label>
          <Input
            id={`${idPrefix}-credential-id`}
            value={value.credentialId}
            onChange={(e) => set({ credentialId: e.target.value })}
            placeholder="e.g. ABC-123456"
          />
        </div>
        <div className="space-y-2">
          <label
            className="block text-sm font-medium"
            htmlFor={`${idPrefix}-credential-url`}
          >
            Verification URL (optional)
          </label>
          <Input
            id={`${idPrefix}-credential-url`}
            type="url"
            value={value.credentialUrl}
            onChange={(e) => set({ credentialUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          className="block text-sm font-medium"
          htmlFor={`${idPrefix}-description`}
        >
          Description (optional, markdown)
        </label>
        <textarea
          id={`${idPrefix}-description`}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent min-h-25"
          value={value.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="What this certificate or award covers."
        />
      </div>

      <div className="space-y-2">
        <label
          className="block text-sm font-medium"
          htmlFor={`${idPrefix}-file-url`}
        >
          Source material (image or PDF)
        </label>
        <Input
          id={`${idPrefix}-file-url`}
          type="url"
          value={value.fileUrl}
          onChange={(e) => set({ fileUrl: e.target.value })}
          placeholder="Upload a file below or paste a link"
        />
        <input
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={onUpload}
          className="block w-full text-sm"
        />
        {value.fileUrl && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {value.fileType === "image" ? (
              <Image
                src={value.fileUrl}
                alt="Certificate source preview"
                width={64}
                height={48}
                className="h-12 w-16 rounded border border-slate-200 object-cover dark:border-slate-700"
              />
            ) : (
              <FileText className="h-8 w-8 text-slate-400" />
            )}
            <a
              href={value.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              {value.fileName || "Open source file"}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => set({ fileUrl: "", fileType: "", fileName: "" })}
            >
              Remove file
            </Button>
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={value.isVisible}
          onChange={(e) => set({ isVisible: e.target.checked })}
        />
        <span className="text-sm font-medium">Show on portfolio</span>
      </label>
    </div>
  );
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newCertificate, setNewCertificate] =
    useState<CertificateFormState>(EMPTY_FORM);
  const [editCertificate, setEditCertificate] =
    useState<CertificateFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");

  useEffect(() => {
    loadCertificates();
  }, []);

  async function loadCertificates() {
    try {
      const res = await fetch("/api/configuration/certificates");
      const result = await res.json();
      if (result.ok) {
        setCertificates(result.data);
      } else {
        toast.error(result.error?.message || "Failed to load certificates");
      }
    } catch {
      toast.error("Failed to load certificates");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>,
    target: "new" | "edit",
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");
    if (!isPdf && !isImage) {
      toast.error("Upload a PNG, JPEG, WebP image or a PDF");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/configuration/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok || !result.ok || !result.data?.url) {
        throw new Error(result.error || "Upload failed");
      }

      const patch = {
        fileUrl: result.data.url as string,
        fileType: (isPdf ? "pdf" : "image") as "image" | "pdf",
        fileName: file.name,
      };
      if (target === "new") {
        setNewCertificate((prev) => ({ ...prev, ...patch }));
      } else {
        setEditCertificate((prev) => ({ ...prev, ...patch }));
      }
      toast.success("Source file uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    }
  }

  function handleEditCertificate(certificate: Certificate) {
    setEditingId(certificate.id);
    setEditCertificate(toFormState(certificate));
    setIsEditing(true);
    setIsAdding(false);
  }

  async function handleAddCertificate() {
    if (!newCertificate.title.trim() || !newCertificate.issuer.trim()) {
      toast.error("Title and issuing company are required");
      return;
    }
    if (!newCertificate.issuedAt) {
      toast.error("Issued date is required");
      return;
    }

    try {
      const res = await fetch("/api/configuration/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(newCertificate)),
      });
      const result = await res.json();
      if (result.ok) {
        toast.success("Certificate added");
        setNewCertificate(EMPTY_FORM);
        setIsAdding(false);
        loadCertificates();
      } else {
        toast.error(result.error?.message || "Failed to add certificate");
      }
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  async function handleUpdateCertificate() {
    if (editingId === "") return;

    try {
      const res = await fetch(
        `/api/configuration/certificates/${editingId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toPayload(editCertificate)),
        },
      );
      const result = await res.json();
      if (result.ok) {
        toast.success("Certificate updated");
        setIsEditing(false);
        setEditingId("");
        loadCertificates();
      } else {
        toast.error(result.error?.message || "Failed to update certificate");
      }
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  async function patchCertificate(id: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/configuration/certificates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  }

  async function toggleVisibility(id: string, current: boolean) {
    try {
      if (await patchCertificate(id, { isVisible: !current })) {
        toast.success("Visibility updated");
        loadCertificates();
      } else {
        toast.error("Failed to update visibility");
      }
    } catch {
      toast.error("Failed to update visibility");
    }
  }

  async function moveCertificate(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= certificates.length) return;

    const reordered = [...certificates];
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];
    setCertificates(reordered);

    try {
      const responses = await Promise.all(
        reordered.map((certificate, sortOrder) =>
          fetch(`/api/configuration/certificates/${certificate.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder }),
          }),
        ),
      );
      if (responses.some((response) => !response.ok)) {
        throw new Error("Failed to save certificate order");
      }
      toast.success("Certificate order updated");
    } catch {
      toast.error("Failed to save certificate order");
      loadCertificates();
    }
  }

  async function handleDeleteCertificate(id: string) {
    if (!confirm("Are you sure you want to delete this certificate?")) return;
    try {
      const res = await fetch(`/api/configuration/certificates/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Certificate deleted");
        loadCertificates();
      } else {
        toast.error("Failed to delete certificate");
      }
    } catch {
      toast.error("Failed to delete certificate");
    }
  }

  const columns: Column<Certificate>[] = [
    {
      header: "Certificate",
      accessor: (certificate) => (
        <div className="flex flex-col">
          <span className="font-medium">{certificate.title}</span>
          <span className="text-xs text-slate-500">{certificate.issuer}</span>
        </div>
      ),
    },
    {
      header: "Issued",
      accessor: (certificate) => (
        <div className="flex flex-col">
          <span>{formatDate(certificate.issuedAt)}</span>
          {certificate.expiresAt && (
            <span className="text-xs text-slate-500">
              Expires {formatDate(certificate.expiresAt)}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Source material",
      accessor: (certificate) =>
        certificate.fileUrl ? (
          <a
            href={certificate.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
          >
            <FileText className="h-4 w-4" />
            {certificate.fileType === "pdf" ? "PDF" : "Image"}
          </a>
        ) : (
          <span className="text-slate-400">Not attached</span>
        ),
    },
    {
      header: "Show on Portfolio",
      accessor: (certificate) => (
        <input
          type="checkbox"
          className="w-4 h-4 cursor-pointer"
          checked={certificate.isVisible}
          onChange={() => toggleVisibility(certificate.id, certificate.isVisible)}
        />
      ),
    },
    {
      header: "Order",
      accessor: (certificate) => {
        const index = certificates.findIndex(
          (item) => item.id === certificate.id,
        );
        return (
          <div className="flex items-center gap-1">
            <span className="w-5 text-center">{index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={index === 0}
              onClick={() => moveCertificate(index, -1)}
              aria-label={`Move ${certificate.title} up`}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={index === certificates.length - 1}
              onClick={() => moveCertificate(index, 1)}
              aria-label={`Move ${certificate.title} down`}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      header: "Actions",
      accessor: (certificate) => (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handleEditCertificate(certificate)}
            aria-label={`Edit ${certificate.title}`}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
            onClick={() => handleDeleteCertificate(certificate.id)}
            aria-label={`Delete ${certificate.title}`}
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
        <div>
          <h1 className="text-2xl font-bold">Certificates & Awards</h1>
          <p className="text-sm text-slate-500">
            Add credentials once and they appear in the portfolio&rsquo;s
            Certificates &amp; awards section.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setIsAdding(!isAdding);
            setIsEditing(false);
            setNewCertificate(EMPTY_FORM);
          }}
          className="gap-2"
        >
          {isAdding ? (
            "Cancel"
          ) : (
            <>
              <Plus className="w-4 h-4" /> Add Certificate
            </>
          )}
        </Button>
      </div>

      {isAdding && (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
          <CertificateForm
            idPrefix="new-certificate"
            value={newCertificate}
            onChange={setNewCertificate}
            onUpload={(event) => handleFileUpload(event, "new")}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleAddCertificate}>
              Save Certificate
            </Button>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
          <CertificateForm
            idPrefix="edit-certificate"
            value={editCertificate}
            onChange={setEditCertificate}
            onUpload={(event) => handleFileUpload(event, "edit")}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setEditingId("");
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateCertificate}>
              Update Certificate
            </Button>
          </div>
        </div>
      )}

      <DataTable
        data={certificates}
        columns={columns}
        onSort={(key, dir) => console.log(`Sorting by ${key} ${dir}`)}
      />
    </div>
  );
}
