import assert from "node:assert/strict";
import test from "node:test";
import { contactMessageSchema } from "./contactMessage";

test("accepts a complete contact message", () => {
  const result = contactMessageSchema.safeParse({
    name: "Ada Lovelace",
    email: "ada@example.com",
    subject: "Hello",
    message: "I would like to talk about a project together.",
  });
  assert.equal(result.success, true);
});

test("rejects a short message", () => {
  const result = contactMessageSchema.safeParse({
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "Too short",
  });
  assert.equal(result.success, false);
});

test("rejects extra fields", () => {
  const result = contactMessageSchema.safeParse({
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "I would like to talk about a project together.",
    extra: true,
  });
  assert.equal(result.success, false);
});
