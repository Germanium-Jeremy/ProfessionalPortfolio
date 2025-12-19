"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Award, BadgeCheck, ExternalLink, FileText } from "lucide-react";
import { SectionHeading } from "@/components/public/SectionHeading";

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
}

interface CertificatesProps {
  certificates: Certificate[];
}

const date = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

function expiryLabel(certificate: Certificate) {
  if (!certificate.expiresAt) return null;
  const isExpired = new Date(certificate.expiresAt).getTime() < Date.now();
  return `${isExpired ? "Expired" : "Valid until"} ${date(
    certificate.expiresAt,
  )}`;
}

function DocumentPreview({ certificate }: { certificate: Certificate }) {
  if (certificate.fileUrl && certificate.fileType === "image") {
    return (
      <Image
        src={certificate.fileUrl}
        alt={`${certificate.title} certificate`}
        fill
        sizes="(max-width: 768px) 100vw, 32vw"
        className="object-cover"
      />
    );
  }

  return (
    <div className="certificate-document-placeholder">
      {certificate.fileUrl ? (
        <>
          <FileText className="h-8 w-8" />
          <span>PDF document</span>
        </>
      ) : (
        <>
          <Award className="h-8 w-8" />
          <span>Credential</span>
        </>
      )}
    </div>
  );
}

export function Certificates({ certificates }: CertificatesProps) {
  if (certificates.length === 0) return null;

  return (
    <section
      id="certificates"
      style={{ background: "var(--section-credentials)" }}
    >
      <div className="mx-auto max-w-360 px-5 py-20 md:px-10 lg:py-28">
        <SectionHeading index="07" title="Certificates & awards">
          Credentials I have earned — open the original document, or follow the
          verification link.
        </SectionHeading>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {certificates.map((certificate, index) => {
            const expiry = expiryLabel(certificate);

            return (
              <article
                key={certificate.id}
                className="certificate-card"
                aria-label={certificate.title}
              >
                <div className="certificate-document">
                  <DocumentPreview certificate={certificate} />
                </div>

                <div className="certificate-body">
                  <p className="certificate-index">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="type-display text-2xl leading-tight">
                    {certificate.title}
                  </h3>
                  <p className="type-muted mt-2 text-base">
                    {certificate.issuer}
                  </p>
                  <p className="certificate-meta mt-1">
                    Issued {date(certificate.issuedAt)}
                    {expiry ? ` · ${expiry}` : ""}
                  </p>

                  {certificate.description ? (
                    <div className="portfolio-prose type-muted certificate-description">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                      >
                        {certificate.description}
                      </ReactMarkdown>
                    </div>
                  ) : null}

                  {certificate.credentialId ? (
                    <p className="certificate-meta mt-3">
                      Credential ID · {certificate.credentialId}
                    </p>
                  ) : null}

                  <div className="certificate-actions">
                    {certificate.fileUrl ? (
                      <a
                        href={certificate.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost"
                      >
                        {certificate.fileType === "pdf"
                          ? "View PDF"
                          : "View certificate"}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : null}
                    {certificate.credentialUrl ? (
                      <a
                        href={certificate.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost"
                      >
                        Verify
                        <BadgeCheck className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
