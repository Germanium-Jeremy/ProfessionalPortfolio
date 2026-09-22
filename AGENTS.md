# Application Findings

## Implemented Portfolio Features (2026-09-22)

- Project order is controlled from the admin Projects page with up/down controls. The controls persist contiguous `sortOrder` values through the existing project `PATCH` endpoint, and the public page already reads projects in ascending order.
- Public visitors can open the testimonial form in the Testimonials section and submit their name, role, company, optional email, rating, and quote through `/api/public/testimonials`.
- Public testimonial submissions are always created with `isApproved: false` and `isFeatured: false`. An administrator must approve and feature them before they appear publicly.
- Project cards show a separate GitHub repository action whenever a GitHub project link exists and is not already the selected primary action.
- No Prisma migration was required for these features. The existing `Project.sortOrder` and `Testimonial.isApproved`/`isFeatured` fields provide the persistence contract.

The older findings below remain as follow-up items from the earlier review.

This document records the current compile, runtime, and configuration-save risks found during a local review on 2026-09-13. No application files were changed as part of this review.

## Confirmed Validation Results

- `pnpm exec tsc --noEmit` passes with no TypeScript diagnostics.
- `pnpm lint` fails with 51 errors and 54 warnings. The errors include many `no-explicit-any` violations in API routes and the project editor, a declaration-order violation in [src/app/configuration/(admin)/projects/page.tsx](<src/app/configuration/(admin)/projects/page.tsx>), `react-hooks/set-state-in-effect` in [src/components/theme-toggle.tsx](src/components/theme-toggle.tsx), and `no-empty-object-type` in [src/components/ui/input.tsx](src/components/ui/input.tsx). The lint script therefore cannot be used as a passing CI check.
- `pnpm build` did not reach Next.js compilation. `prisma generate` failed with Windows `EPERM` while renaming `query_engine-windows.dll.node.tmp...` to the Prisma query-engine DLL. A running Node/Next process, antivirus, or another process holding the generated Prisma engine can cause this. Stop processes using the workspace's Prisma client and rerun generation/build; if it persists, investigate the file lock rather than treating it as a source compile result.

## Configuration Save Findings

### 1. Most configuration list pages cannot edit existing records

The Contacts, Experience, Skills, and Testimonials pages render Pencil buttons without an `onClick` handler or edit form. They support create/delete (and testimonial feature toggling), but clicking the edit control does nothing. Existing records therefore cannot be updated from these pages.

Affected files:

- [src/app/configuration/(admin)/contacts/page.tsx](<src/app/configuration/(admin)/contacts/page.tsx>)
- [src/app/configuration/(admin)/experience/page.tsx](<src/app/configuration/(admin)/experience/page.tsx>)
- [src/app/configuration/(admin)/skills/page.tsx](<src/app/configuration/(admin)/skills/page.tsx>)
- [src/app/configuration/(admin)/testimonials/page.tsx](<src/app/configuration/(admin)/testimonials/page.tsx>)
- The corresponding existing PATCH routes are [src/app/api/configuration/contacts/[id]/route.ts](src/app/api/configuration/contacts/[id]/route.ts), [src/app/api/configuration/experience/[id]/route.ts](src/app/api/configuration/experience/[id]/route.ts), [src/app/api/configuration/skills/[id]/route.ts](src/app/api/configuration/skills/[id]/route.ts), and [src/app/api/configuration/testimonials/[id]/route.ts](src/app/api/configuration/testimonials/[id]/route.ts).

Recommended fix: add an edit state/form and connect each Pencil button to the matching PATCH endpoint, including response/error handling and list refresh.

### 2. Project nested fields are discarded by the save handler

The project editor loads and edits `links`, `facts`, and `gallery`, but `onSubmit` destructures `links` and `facts` out of the payload and sends neither of them. `gallery` is not included in the request contract used by the handler. The project PATCH route only updates scalar project fields and `skillIds`; the separate link/fact routes only create individual records. Consequently, saving a project reports success while link, fact, and gallery changes are lost.

Affected files:

- [src/app/configuration/(admin)/projects/[id]/page.tsx](<src/app/configuration/(admin)/projects/[id]/page.tsx>)
- [src/app/api/configuration/projects/[id]/route.ts](src/app/api/configuration/projects/[id]/route.ts)
- [src/app/api/configuration/projects/[id]/links/route.ts](src/app/api/configuration/projects/[id]/links/route.ts)
- [src/app/api/configuration/projects/[id]/facts/route.ts](src/app/api/configuration/projects/[id]/facts/route.ts)
- [src/lib/validation/project.ts](src/lib/validation/project.ts)

Recommended fix: choose one atomic save contract. Either extend PATCH to replace links/facts and serialize `gallery` into the Project column, or explicitly call the nested endpoints from the editor and add/update/delete operations for the complete current collections. Add a regression test that reloads a saved project and compares all edited fields.

### 3. Project editor controls can submit the form accidentally

The shared [src/components/admin/RepeatableField.tsx](src/components/admin/RepeatableField.tsx) Add and Remove buttons do not set `type="button"`. The project editor also has Add New, gallery upload, and gallery delete buttons without an explicit non-submit type. Because these controls are rendered inside the project form, clicking them can trigger form submission and validation in addition to their intended action.

Affected files:

- [src/components/admin/RepeatableField.tsx](src/components/admin/RepeatableField.tsx)
- [src/app/configuration/(admin)/projects/[id]/page.tsx](<src/app/configuration/(admin)/projects/[id]/page.tsx>)

Recommended fix: set `type="button"` on every non-save button inside a form; reserve `type="submit"` for the actual save action.

### 4. Profile saves can fail when optional URL inputs are blank

The profile form uses text inputs for optional `avatarUrl` and `resumeUrl`. Browser inputs commonly submit an empty string when left blank, but [src/lib/validation/profile.ts](src/lib/validation/profile.ts) accepts `null` or an omitted value, not `""`, because `.url()` is still applied to the empty string. The API then returns `400 VALIDATION_ERROR`, and the UI only shows the generic validation message unless the user inspects the response fields.

Affected files:

- [src/app/configuration/(admin)/profile/page.tsx](<src/app/configuration/(admin)/profile/page.tsx>)
- [src/lib/validation/profile.ts](src/lib/validation/profile.ts)
- [src/app/api/configuration/profile/route.ts](src/app/api/configuration/profile/route.ts)

Recommended fix: normalize blank optional strings to `null` before validation or use a shared Zod helper that accepts `""` and transforms it to `null`. Display field-level API errors in the form.

### 5. Settings JSON values are stored as JSON strings

The settings PUT route calls `JSON.stringify` for every object/array before writing to Prisma's `Json` column, then casts the result to `any`. This stores `sectionOrder` and `sectionVisibility` as JSON string values rather than JSON arrays/objects. The GET route compensates by parsing strings that look like objects or arrays, but this creates an inconsistent database contract and can break other consumers, migrations, direct Prisma reads, or values such as `null`.

Affected files:

- [src/app/api/configuration/settings/route.ts](src/app/api/configuration/settings/route.ts)
- [src/lib/validation/settings.ts](src/lib/validation/settings.ts)
- [prisma/schema.prisma](prisma/schema.prisma)

Recommended fix: write validated arrays/objects directly as Prisma JSON values, remove the string-parsing compatibility path after existing data is migrated, and replace the `any` casts with Prisma-compatible JSON typing.

### 6. Successful project saves may leave public pages stale

The project PATCH route revalidates `/configuration/projects` but does not revalidate the public home page or the public project slug page. A save can succeed in the database while the public portfolio continues showing cached project data until another invalidation occurs.

Affected files:

- [src/app/api/configuration/projects/[id]/route.ts](src/app/api/configuration/projects/[id]/route.ts)
- [src/app/(public)/page.tsx](<src/app/(public)/page.tsx>)
- [src/app/(public)/projects/[slug]/page.tsx](<src/app/(public)/projects/[slug]/page.tsx>)

Recommended fix: revalidate the public paths affected by the project, including the previous and new slug when a slug changes.

## Runtime and Deployment Checks

- [src/lib/auth.ts](src/lib/auth.ts) throws during module initialization if `AUTH_SECRET` is missing. `DATABASE_URL`, `AUTH_SECRET`, and `ENCRYPTION_KEY` must be valid in the environment before the application can start reliably; the expected names and local defaults are listed in [.env.example](.env.example).
- The Prisma datasource is PostgreSQL, so the database must be reachable and the migration must be applied with `pnpm prisma:migrate:deploy` before configuration saves can work.
- Configuration API routes protect requests with the session cookie. A missing/expired `portfolio_session` returns `401`; the client pages generally show only a generic save/load error. Check the browser Network response before diagnosing persistence.
- [src/lib/repositories/profileRepository.ts](src/lib/repositories/profileRepository.ts) stores `funFacts` as a JSON string in a text column, while public reads parse it. Keep this representation consistent or migrate the column if it is changed.

## Suggested Repair Order

1. Resolve the Prisma Windows file lock and rerun `pnpm build` so the real production build result is visible.
2. Fix the profile empty-URL normalization and add a focused profile PUT test.
3. Implement edit flows for Contacts, Experience, Skills, and Testimonials.
4. Define and implement an atomic project save contract for links, facts, skills, and gallery; add a reload-based regression test.
5. Add explicit button types, correct settings JSON persistence, and public-path revalidation.
6. Clear the lint errors, then make `pnpm lint` part of CI.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
