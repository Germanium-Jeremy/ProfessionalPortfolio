import assert from "node:assert/strict";
import test from "node:test";
import { certificateSchema, certificateUpdateSchema } from "./certificate";

const basePayload = {
  title: "AWS Certified Solutions Architect",
  issuer: "Amazon Web Services",
  issuedAt: "2026-04-18",
};

test("accepts a complete certificate", () => {
  const result = certificateSchema.safeParse({
    ...basePayload,
    expiresAt: "2029-04-18",
    credentialId: "ABC-123456",
    credentialUrl: "https://aws.amazon.com/verification",
    description: "Covers designing distributed systems on AWS.",
    fileUrl: "https://example.public.blob.vercel-storage.com/cert.pdf",
    fileType: "pdf",
    fileName: "cert.pdf",
    sortOrder: 2,
    isVisible: true,
  });
  assert.equal(result.success, true);
});

test("normalises blank optional fields to null", () => {
  const result = certificateSchema.safeParse({
    ...basePayload,
    expiresAt: "",
    credentialId: "",
    credentialUrl: "",
    description: "",
    fileUrl: "",
    fileName: "",
  });
  assert.equal(result.success, true);
  assert.deepEqual(
    result.success
      ? [
          result.data.expiresAt,
          result.data.credentialId,
          result.data.credentialUrl,
          result.data.description,
          result.data.fileUrl,
          result.data.fileName,
        ]
      : [],
    [null, null, null, null, null, null],
  );
});

test("rejects blank required text and invalid dates", () => {
  assert.equal(
    certificateSchema.safeParse({ ...basePayload, title: "  " }).success,
    false,
  );
  assert.equal(
    certificateSchema.safeParse({ ...basePayload, issuer: "" }).success,
    false,
  );
  assert.equal(
    certificateSchema.safeParse({ ...basePayload, issuedAt: "" }).success,
    false,
  );
  assert.equal(
    certificateSchema.safeParse({ ...basePayload, issuedAt: "not-a-date" })
      .success,
    false,
  );
});

test("rejects malformed URLs and unknown files types", () => {
  assert.equal(
    certificateSchema.safeParse({
      ...basePayload,
      credentialUrl: "not-a-url",
    }).success,
    false,
  );
  assert.equal(
    certificateSchema.safeParse({ ...basePayload, fileType: "docx" }).success,
    false,
  );
});

test("rejects extra fields", () => {
  assert.equal(
    certificateSchema.safeParse({ ...basePayload, extra: true }).success,
    false,
  );
});

test("partial updates only carry the submitted fields", () => {
  const visibility = certificateUpdateSchema.safeParse({ isVisible: false });
  assert.equal(visibility.success, true);
  assert.deepEqual(visibility.success ? visibility.data : {}, {
    isVisible: false,
  });

  const order = certificateUpdateSchema.safeParse({ sortOrder: 3 });
  assert.equal(order.success, true);
  assert.deepEqual(order.success ? order.data : {}, { sortOrder: 3 });
});

test("partial updates still validate the fields they receive", () => {
  assert.equal(
    certificateUpdateSchema.safeParse({ credentialUrl: "nope" }).success,
    false,
  );
  assert.equal(certificateUpdateSchema.safeParse({ title: "" }).success, false);
  assert.equal(
    certificateUpdateSchema.safeParse({ isVisible: "yes" }).success,
    false,
  );
});
