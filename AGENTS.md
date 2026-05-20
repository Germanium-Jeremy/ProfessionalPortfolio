# AGENTS.md — Portfolio + Admin CMS

> **Read this entire file before writing any code.**
> This document is the single source of truth for the project. If something is
> ambiguous, choose the option that is simpler to maintain and note the
> assumption in `DECISIONS.md`.

---

## 0. TL;DR for the Agent

Build a **single full-stack Next.js application** that contains:

1. A **public portfolio site** (Me, Skills, Experience, Projects, Testimonials, Contact).
2. A **small private admin area** (`/admin`) where a single owner can CRUD all of
   that content.
3. A **PostgreSQL database** accessed through Prisma.
4. **Field-level encryption (AES-256-GCM)** for personal/contact data, with a
   per-record `isPublic` flag controlling what is decrypted and shown publicly.

The owner must be able to add a new project, skill, experience, testimonial, or
contact channel **from the admin UI and see it live on the site without a
redeploy and without touching code**.

---

## 1. Product Requirements

### 1.1 Public site
A professional, polished, *fun* portfolio. Sections (in order, order configurable):

| # | Section | Source of truth |
|---|---------|-----------------|
| 1 | **Hero** — name, headline, avatar, CTA buttons | `Profile` |
| 2 | **Me / About** — bio, fun facts, current status | `Profile` |
| 3 | **Skills** — grouped, with level indicators | `Skill` |
| 4 | **Experience / Profession** — timeline | `Experience` (+ related `Skill`s) |
| 5 | **Projects** — filterable grid + detail pages | `Project`, `ProjectLink`, `ProjectFact` |
| 6 | **Testimonials** — carousel/grid of *featured only* | `Testimonial` where `isFeatured = true` |
| 7 | **Contact** — public contact channels + socials | `ContactChannel` where `isPublic = true` |
| 8 | **Footer** — nav, copyright, theme toggle | static + `SiteSetting` |

### 1.2 Admin site (`/admin`)
Small, fast, keyboard-friendly. No design awards needed — clarity over flair.

Required capabilities:
- **Login / logout** (single owner account).
- **Profile**: edit name, headline, tagline, long bio, avatar, location,
  availability status, résumé URL.
- **Skills**: create / edit / delete / reorder, assign category + level + icon.
- **Experience**: create / edit / delete / reorder, mark current role, attach skills.
- **Projects**: create / edit / delete / publish-unpublish / feature / reorder.
  - Add **any number of links** of **any type** (see §6).
  - Add **arbitrary key/value facts** (e.g. `Team size: 4`, `Engine: Unity 6`).
  - Attach **skills used**.
  - Upload or paste cover image + gallery images.
- **Testimonials**: create / edit / delete, and a **single toggle**
  “Show on portfolio” (`isFeatured`).
- **Contacts**: create / edit / delete channels (email, phone, WhatsApp,
  LinkedIn, GitHub, X, Discord, website, other). Each has an **`isPublic`**
  toggle. Values are encrypted at rest.
- **Settings**: section visibility/order, SEO title/description, theme accent.

### 1.3 Hard requirements
- **No redeploy to publish content.** Public pages must reflect DB changes on
  the next request (see §10).
- **Personal data encrypted at rest.** Never stored in plaintext (see §5).
- **Private data never reaches the browser.** Filtering happens server-side.
- **Projects have dynamic link sets** — some have a live deploy, some only
  GitHub, some Google Drive, some Unity Cloud, some nothing at all. The schema
  must not hardcode a fixed set of link columns.

---

## 2. Tech Stack (locked unless the user says otherwise)

| Layer | Choice |
|---|---|
| Framework | **Next.js 15** (App Router, React Server Components, TypeScript, strict) |
| Styling | **Tailwind CSS v4** + CSS variables for theming |
| Components | **shadcn/ui** primitives (copied in, not a dependency) |
| Animation | **Framer Motion** (respect `prefers-reduced-motion`) |
| DB | **PostgreSQL** (Neon / Supabase / local Docker) |
| ORM | **Prisma** |
| Validation | **Zod** (shared between API and forms) |
| Forms | **react-hook-form** + `@hookform/resolvers/zod` |
| Auth | Custom: bcrypt password hash + signed **JWT in httpOnly cookie** (`jose`) |
| Rich text | Markdown stored, rendered with `react-markdown` + `remark-gfm` + `rehype-sanitize` |
| Uploads | Local `/public/uploads` in dev; **Vercel Blob** (or S3-compatible) in prod, behind a `StorageAdapter` interface |
| Email (contact form) | **Resend** (optional, behind a flag) |
| Testing | **Vitest** (unit) + **Playwright** (one smoke E2E) |
| Package manager | **pnpm** |
| Deployment | Vercel + managed Postgres |

---

## 3. Repository Structure

```
.
├── AGENTS.md
├── DECISIONS.md
├── README.md
├── .env.example
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                # single-page portfolio
│   │   │   └── projects/[slug]/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx              # auth guard + shell
│   │   │   ├── login/page.tsx
│   │   │   ├── page.tsx                # dashboard
│   │   │   ├── profile/page.tsx
│   │   │   ├── skills/page.tsx
│   │   │   ├── experience/page.tsx
│   │   │   ├── projects/page.tsx
│   │   │   ├── projects/[id]/page.tsx
│   │   │   ├── testimonials/page.tsx
│   │   │   ├── contacts/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── api/
│   │   │   ├── admin/…                 # authenticated mutations
│   │   │   └── public/contact/route.ts # optional contact form
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── globals.css
│   ├── components/
│   │   ├── public/                     # Hero, About, SkillGrid, Timeline, …
│   │   ├── admin/                      # DataTable, SortableList, FieldRow, …
│   │   └── ui/                         # shadcn primitives
│   ├── lib/
│   │   ├── db.ts                       # Prisma singleton
│   │   ├── crypto.ts                   # AES-256-GCM encrypt/decrypt
│   │   ├── auth.ts                     # session, hashing, guards
│   │   ├── validation/                 # Zod schemas (one file per entity)
│   │   ├── repositories/               # data access, encryption boundary
│   │   ├── storage.ts                  # StorageAdapter
│   │   └── utils.ts
│   ├── types/
│   └── middleware.ts                   # protects /admin/*
└── tests/
```

---

## 4. Environment Variables

Create `.env.example` with these keys and document each:

```dotenv
DATABASE_URL="postgresql://user:pass@localhost:5432/portfolio"

# 32 random bytes, base64. Generate: openssl rand -base64 32
ENCRYPTION_KEY=""

# Session signing secret. Generate: openssl rand -base64 48
AUTH_SECRET=""

# Seeded owner account
ADMIN_EMAIL="owner@example.com"
ADMIN_PASSWORD="ChangeMe123!"          # hashed on seed, never stored raw

# Storage
STORAGE_DRIVER="local"                 # "local" | "blob"
BLOB_READ_WRITE_TOKEN=""

# Optional
RESEND_API_KEY=""
CONTACT_TO_EMAIL=""
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_ANALYTICS_ID=""
```

**Rule:** `ENCRYPTION_KEY` and `AUTH_SECRET` must never be committed. The app
must **fail fast at boot** with a clear error if `ENCRYPTION_KEY` is missing or
not exactly 32 bytes.

---

## 5. Encryption Strategy (critical)

### 5.1 Algorithm
- **AES-256-GCM**, key = `ENCRYPTION_KEY` (32 bytes).
- Fresh random **12-byte IV per encryption**. Never reuse an IV.
- Store the **auth tag**; verify on decrypt; throw on tamper.

### 5.2 Wire format
Store three columns per encrypted field (do **not** store a single blob):

```
<field>Ciphertext  Bytes   // ciphertext only
<field>Iv          Bytes   // 12 bytes
<field>Tag         Bytes   // 16 bytes
```

Example for `ContactChannel.value`:
`valueCiphertext`, `valueIv`, `valueTag`.

### 5.3 `src/lib/crypto.ts` API
```ts
export function encrypt(plaintext: string): { ciphertext: Buffer; iv: Buffer; tag: Buffer };
export function decrypt(input: { ciphertext: Buffer; iv: Buffer; tag: Buffer }): string;
export function encryptString(plaintext: string): string;  // "v1:<iv>:<tag>:<ct>" base64url
export function decryptString(packed: string): string;
export function blindIndex(value: string): string;         // HMAC-SHA256, for lookups
```
- `decryptString` must handle the `v1:` prefix for forward-compatible key rotation.
- Include a `rotateKey` script stub (out of scope to fully implement, but leave
  the version prefix in place).

### 5.4 Encryption boundary — **repositories only**
- **All** encryption/decryption happens in `src/lib/repositories/*`.
- Components and route handlers never import `crypto.ts` directly.
- Repositories expose two shapes:
  - `getAdminX()` → returns **decrypted** values (admin UI only).
  - `getPublicX()` → returns **decrypted values only for `isPublic === true`
    records**; private records are omitted entirely (not returned as `null`,
    not returned as masked strings — simply absent).

### 5.5 What gets encrypted
| Entity | Field | Notes |
|---|---|---|
| `ContactChannel` | `value` | **Always** encrypted. Emails, phones, URLs. |
| `Profile` | `privateNotes` | Admin-only scratchpad. Never returned publicly. |
| `Profile` | `legalName`, `dateOfBirth` | Optional; encrypted; never public. |
| `Testimonial` | `authorEmail` | Encrypted; admin-only. |
| `User` | `passwordHash` | bcrypt (cost 12). Not "encrypted" but never plaintext. |

Public-safe fields (`Profile.headline`, `Profile.bio`, `Project.title`, …) are
stored plaintext — encrypting them would break search, sorting, and SSR perf.

### 5.6 Rules
1. **Never** log decrypted values. Add a `redact()` helper for error logs.
2. **Never** send a private contact value to the client, even in a hidden field
   or in RSC payload. Verify with a test.
3. Contact values may optionally be revealed behind a **click-to-reveal** on the
   public site, but only for `isPublic = true` channels, and the value is
   delivered through a `POST /api/public/reveal` endpoint — never pre-embedded
   in HTML. (Protects against naive scrapers.)

---

## 6. Data Model (`prisma/schema.prisma`)

> Use `cuid()` ids, `createdAt`/`updatedAt` on every model, and
> `@@map` snake_case table names.

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String?
  lastLoginAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  auditLogs    AuditLog[]
}

model Profile {
  id             String   @id @default(cuid())
  fullName       String
  headline       String                       // "Full-Stack Developer & Game Dev"
  tagline        String?
  bio            String   @db.Text            // markdown
  avatarUrl      String?
  location       String?
  availability   String?                      // "Open to freelance"
  resumeUrl      String?
  funFacts       Json?                        // string[]
  // encrypted
  legalNameCiphertext Bytes?
  legalNameIv         Bytes?
  legalNameTag        Bytes?
  privateNotesCiphertext Bytes?
  privateNotesIv         Bytes?
  privateNotesTag        Bytes?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model ContactChannel {
  id       String  @id @default(cuid())
  kind     String  // "email" | "phone" | "whatsapp" | "linkedin" | "github"
                   // | "x" | "discord" | "website" | "youtube" | "other"
  label    String  // display label, e.g. "Work email"
  iconKey  String?
  isPublic Boolean @default(false)
  sortOrder Int    @default(0)
  // encrypted value
  valueCiphertext Bytes
  valueIv         Bytes
  valueTag        Bytes
  valueBlindIndex String?  @index   // HMAC, for dedupe/lookup only
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Skill {
  id        String  @id @default(cuid())
  name      String  @unique       // "C#", "CSS", "CI/CD"
  category  String                // "language" | "framework" | "tool"
                                  // | "devops" | "design" | "soft"
  level     Int     @default(3)   // 1..5
  iconKey   String?
  sortOrder Int     @default(0)
  isFeatured Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  experiences ExperienceSkill[]
  projects    ProjectSkill[]
}

model Experience {
  id             String    @id @default(cuid())
  role           String
  company        String
  companyUrl     String?
  employmentType String?   // "Full-time" | "Contract" | "Freelance" | "Internship"
  location       String?
  startDate      DateTime
  endDate        DateTime? // null = current
  description    String    @db.Text  // markdown
  highlights     Json?               // string[]
  sortOrder      Int       @default(0)
  isVisible      Boolean   @default(true)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  skills         ExperienceSkill[]
}

model ExperienceSkill {
  experienceId String
  skillId      String
  experience   Experience @relation(fields: [experienceId], references: [id], onDelete: Cascade)
  skill        Skill      @relation(fields: [skillId], references: [id], onDelete: Cascade)
  @@id([experienceId, skillId])
}

model Project {
  id           String    @id @default(cuid())
  slug         String    @unique
  title        String
  summary      String    @db.Text          // 1–2 sentence card blurb
  description  String?   @db.Text          // markdown, detail page
  coverImageUrl String?
  gallery      Json?                       // string[]
  startDate    DateTime?
  endDate      DateTime?
  status       String    @default("draft") // "draft" | "published"
  isFeatured   Boolean   @default(false)
  sortOrder    Int       @default(0)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  links   ProjectLink[]
  facts   ProjectFact[]
  skills  ProjectSkill[]
}

model ProjectLink {
  id        String  @id @default(cuid())
  projectId String
  kind      String  // "live" | "github" | "gdrive" | "unity_cloud" | "itch"
                    // | "figma" | "video" | "npm" | "docs" | "play_store"
                    // | "app_store" | "other"
  label     String  // free text, e.g. "Playable build (Unity Cloud)"
  url       String
  isPrimary Boolean @default(false)  // the big CTA button on the card
  isPublic  Boolean @default(true)
  sortOrder Int     @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  @@index([projectId])
}

model ProjectFact {
  id        String  @id @default(cuid())
  projectId String
  label     String  // "Team size"
  value     String  // "4"
  sortOrder Int     @default(0)
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  @@index([projectId])
}

model ProjectSkill {
  projectId String
  skillId   String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  skill     Skill   @relation(fields: [skillId], references: [id], onDelete: Cascade)
  @@id([projectId, skillId])
}

model Testimonial {
  id            String  @id @default(cuid())
  authorName    String
  authorRole    String?
  authorCompany String?
  authorAvatarUrl String?
  quote         String  @db.Text
  rating        Int?    // 1..5
  sourceUrl     String?
  isApproved    Boolean @default(false)
  isFeatured    Boolean @default(false)   // <-- controls public display
  sortOrder     Int     @default(0)
  // encrypted
  authorEmailCiphertext Bytes?
  authorEmailIv         Bytes?
  authorEmailTag        Bytes?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model SiteSetting {
  key       String  @id
  value     Json
  updatedAt DateTime @updatedAt
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String   // "create" | "update" | "delete" | "login" | "login_failed"
  entity    String   // "Project"
  entityId  String?
  diff      Json?    // redacted diff — NEVER include decrypted values
  createdAt DateTime @default(now())
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  @@index([entity, entityId])
}
```

### 6.1 Why `ProjectLink` instead of fixed columns
A project may have **zero, one, or many** links of **any type**. Modelling them
as rows keeps the schema stable as new platforms appear (Unity Cloud, Itch,
Figma, YouTube…). The `kind` field drives the icon and the CTA label; unknown
kinds fall back to `"other"`.

### 6.2 Project card CTA logic
1. If exactly one link has `isPrimary = true` → that's the main button.
2. Else if a `live` link exists → main button = that.
3. Else if a `github` link exists → main button = that.
4. Else → no main button; show a "Details" button that opens the detail page.
5. All other public links render as secondary icon buttons.

---

## 7. Authentication & Authorization

- Single-owner account seeded from `ADMIN_EMAIL` / `ADMIN_PASSWORD`
  (bcrypt cost **12**). Upsert on `prisma db seed` so re-seeding is idempotent.
- `POST /api/admin/auth/login`:
  - Zod-validated body.
  - **Rate limit**: 5 attempts / 15 min per IP (in-memory Map is fine for a
    single instance; note the limitation in `DECISIONS.md`).
  - Constant-time compare; generic error message ("Invalid credentials").
  - On success: sign a JWT (`{ sub: userId }`, 7-day expiry) with `jose`,
    set it in an **httpOnly, Secure, SameSite=Lax** cookie named `portfolio_session`.
  - Write an `AuditLog` row.
- `POST /api/admin/auth/logout` clears the cookie.
- `src/middleware.ts` matches `/admin/:path*` **except** `/admin/login` and
  redirects unauthenticated requests to `/admin/login?next=…`.
- **Every** `/api/admin/*` route handler must independently call
  `requireSession()` — middleware alone is not sufficient.
- No public signup. No password reset UI (document a CLI script instead).

---

## 8. Public Site Specification

### 8.1 Visual direction
- **Dark-first** with a light mode toggle. Store preference in a cookie
  (`theme`) and apply the class on `<html>` **before paint** (inline script in
  `<head>`) to avoid flash.
- One **accent gradient** (configurable via `SiteSetting.accent`) used for
  buttons, link hovers, focus rings, and section underlines.
- Generous whitespace, max content width `72rem`, readable measure for prose.
- **Fun, not childish:** subtle grain/noise overlay, soft glow orbs, a
  magnetic cursor effect on desktop only, spring-y hover states, animated
  section reveals on scroll (once, never re-triggering), and a playful 404.
- Typography: one geometric sans for headings (e.g. `Space Grotesk`), one
  highly legible sans for body (e.g. `Inter`), one mono for code (e.g.
  `JetBrains Mono`). Load via `next/font`.
- **Accessibility is non-negotiable**: WCAG 2.1 AA contrast, visible focus
  rings, full keyboard nav, semantic landmarks, `aria-label`s on icon buttons.
- Respect `prefers-reduced-motion` — disable parallax, cursor effects, and
  scroll animations.

### 8.2 Section details

**Hero**
- Avatar (with a subtle gradient ring), full name, headline, tagline.
- Availability pill (`Profile.availability`) with a pulsing dot.
- CTAs: "View projects" (anchor) + "Download résumé" (if `resumeUrl`).
- Small row of primary public social icon links.

**Me / About**
- Rendered markdown bio.
- Optional "fun facts" chips from `Profile.funFacts`.
- Quick stat row (e.g. years of experience, projects shipped, derived from DB).

**Skills**
- Grouped by `category`, each group a labelled cluster.
- Level shown as a 1–5 dot/bar indicator plus a text label for screen readers
  (never colour alone).
- Hover shows skill name + level; no hover-only information.

**Experience**
- Vertical timeline, most recent first (`endDate DESC NULLS FIRST`, then
  `startDate DESC`).
- Each entry: role, company (linked if `companyUrl`), type, location, date range
  (formatted as "Jan 2023 — Present"), markdown description, bullet highlights,
  and attached skill chips.

**Projects**
- Responsive grid (1 / 2 / 3 cols).
- Each card: cover image (or a deterministic gradient placeholder derived from
  the slug), title, summary, top 3–5 skill chips, and CTAs per §6.2.
- **Filter bar**: by skill and by category, driven by a URL search param so
  filters are shareable and back-button friendly.
- Detail page `/projects/[slug]`: gallery lightbox, full markdown description,
  facts table, all public links, all skills, and prev/next project nav.
- `generateStaticParams` is *not* used — pages must reflect DB edits immediately
  (see §10).

**Testimonials**
- Only `isApproved = true AND isFeatured = true`.
- Card with quote, avatar, name, role @ company, star rating, optional source link.
- If more than 3, show a horizontally scrollable row with snap points; fall back
  to a grid on mobile. Keyboard accessible.

**Contact**
- Public channels only, grouped by kind, each with icon + label + action.
- Email → `mailto:`, phone → `tel:`, URLs → `target="_blank" rel="noopener noreferrer"`.
- Optional contact form (`POST /api/public/contact`): Zod-validated, honeypot
  field, per-IP rate limit, sends via Resend. If `RESEND_API_KEY` is unset,
  hide the form and show channels only.
- **Never** render a private channel, and never render a channel's value in the
  HTML unless `isPublic` (or use the click-to-reveal endpoint from §5.6).

### 8.3 SEO & metadata
- `generateMetadata()` per page using `Profile` + `SiteSetting`.
- Open Graph + Twitter card images (use the avatar or a generated gradient card).
- `sitemap.ts` includes the home page and every `published` project.
- `robots.ts` disallows `/admin`.
- JSON-LD `Person` schema on the home page.

---

## 9. Admin UI Specification

### 9.1 Shell
- Left sidebar (collapsible on mobile) with: Dashboard, Profile, Skills,
  Experience, Projects, Testimonials, Contacts, Settings.
- Top bar: "View site" link, theme toggle, logout.
- Toasts for success/error (`sonner`).
- Confirm dialog before every destructive action.
- Optimistic updates for toggles (publish, feature, visibility); revert on error.

### 9.2 Shared components
- `<DataTable>` — sortable, filterable, with drag-to-reorder rows.
- `<SortableList>` — drag handle + keyboard reorder (arrow keys), persists
  `sortOrder` on drop via `PATCH /api/admin/reorder`.
- `<MarkdownEditor>` — textarea + live preview tab (no heavy WYSIWYG).
- `<ImageUploader>` — drag & drop, paste-URL fallback, preview, alt-text field.
- `<RepeatableField>` — add/remove rows, used for `ProjectLink`,
  `ProjectFact`, `Experience.highlights`, `Project.gallery`.
- `<SecretField>` — input with show/hide, used for all encrypted values.
  **Never** populate a private value into a client component; fetch it on demand
  from an authenticated endpoint when the admin clicks "Reveal".

### 9.3 Projects editor (most complex screen)
Tabs within the project form:
1. **Basics** — title, slug (auto-generated, editable), summary, cover, dates,
   status, featured, sort order.
2. **Description** — markdown editor.
3. **Links** — repeatable rows: `kind` (select), `label`, `url`, `isPrimary`,
   `isPublic`, drag to order.
4. **Facts** — repeatable `label` / `value` rows.
5. **Skills** — multi-select with search + "create new skill inline".
6. **Gallery** — multi-image uploader with reorder.

Slug collisions must be handled server-side (append `-2`, `-3`, …).

### 9.4 Testimonials screen
A table with columns: Author, Company, Rating, Approved, **Show on portfolio**,
Order, Actions. The "Show on portfolio" column is a **single-click toggle** —
this is the primary requirement.

### 9.5 Contacts screen
A table with: Kind (icon), Label, Value (masked as `••••••••` with a
**Reveal** button), **Public** toggle, Order, Actions. Editing a value
re-encrypts it and updates the blind index.

---

## 10. Data Flow, Caching & Revalidation

**Requirement: publishing content must not require a redeploy.**

- Public pages are **Server Components** that read through repository functions.
- After any successful admin mutation, call:
  ```ts
  revalidatePath('/');
  revalidatePath('/projects/' + slug);
  revalidatePath('/projects');   // if you add a listing page
  ```
  Use a small helper `revalidatePublic(slug?)`.
- Set `export const revalidate = 60` on public pages as a safety net, **and**
  call `revalidatePath` for instant updates. Do **not** use
  `export const dynamic = 'force-dynamic'` unless a page genuinely needs
  per-request data — prefer ISR + on-demand revalidation for performance.
- Admin pages are always dynamic (auth-protected, no caching).

---

## 11. API Surface

All `/api/admin/*` routes: `requireSession()` → Zod validate → repository call
→ `revalidatePublic()` → `AuditLog` → JSON response.

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/admin/auth/login` | Log in |
| POST | `/api/admin/auth/logout` | Log out |
| GET/PUT | `/api/admin/profile` | Read/update profile |
| GET/POST | `/api/admin/skills` | List / create |
| PATCH/DELETE | `/api/admin/skills/[id]` | Update / delete |
| GET/POST | `/api/admin/experience` | List / create |
| PATCH/DELETE | `/api/admin/experience/[id]` | Update / delete |
| GET/POST | `/api/admin/projects` | List / create |
| GET/PATCH/DELETE | `/api/admin/projects/[id]` | Read / update / delete |
| POST/PATCH/DELETE | `/api/admin/projects/[id]/links[/linkId]` | Manage links |
| POST/PATCH/DELETE | `/api/admin/projects/[id]/facts[/factId]` | Manage facts |
| GET/POST | `/api/admin/testimonials` | List / create |
| PATCH/DELETE | `/api/admin/testimonials/[id]` | Update / delete |
| POST | `/api/admin/testimonials/[id]/feature` | Toggle `isFeatured` |
| GET/POST | `/api/admin/contacts` | List / create |
| PATCH/DELETE | `/api/admin/contacts/[id]` | Update / delete |
| POST | `/api/admin/contacts/[id]/reveal` | Return decrypted value |
| POST | `/api/admin/reorder` | Bulk `sortOrder` update |
| GET/PUT | `/api/admin/settings` | Site settings |
| POST | `/api/admin/upload` | Image upload |
| POST | `/api/public/contact` | Contact form |
| POST | `/api/public/reveal` | Click-to-reveal a public contact value |

**Response envelope**
```ts
type Ok<T>  = { ok: true; data: T };
type Err    = { ok: false; error: { code: string; message: string; fields?: Record<string,string[]> } };
```
Map Zod errors to `fields`, Prisma unique-constraint errors to `409`, not-found
to `404`, unauthenticated to `401`.

---

## 12. Validation (Zod)

Create one schema file per entity under `src/lib/validation/`. Rules:

- Reuse schemas between API routes and client forms.
- `kind` fields for `ContactChannel` and `ProjectLink` use `z.enum([...])` with
  an `"other"` escape hatch.
- URLs validated with `z.string().url()`; allow empty string → `undefined`.
- Markdown fields: `z.string().max(20_000)`.
- Reject unknown keys (`.strict()`) on write schemas.
- All dates accepted as ISO strings and coerced to `Date`.

---

## 13. Security Checklist

- [ ] Parameterized queries only (Prisma guarantees this — never raw SQL with interpolation).
- [ ] Sanitize all rendered markdown (`rehype-sanitize` with a strict allowlist).
- [ ] Escape all user-supplied strings; never `dangerouslySetInnerHTML` with raw DB text.
- [ ] `httpOnly` + `Secure` + `SameSite=Lax` cookies.
- [ ] CSRF: since cookies are `SameSite=Lax`, mutating routes also require a
      custom header (`x-requested-with: fetch`) checked server-side.
- [ ] Rate limit login, contact form, and reveal endpoints.
- [ ] Upload validation: MIME allowlist (`image/png|jpeg|webp|avif`), max 5 MB,
      re-encode or at minimum validate magic bytes; store outside the web root
      when possible.
- [ ] Redact secrets and decrypted values from logs and `AuditLog.diff`.
- [ ] `ENCRYPTION_KEY` length validated at boot.
- [ ] Dependencies audited (`pnpm audit`); no `eval`.
- [ ] Admin routes excluded from `sitemap.ts` and disallowed in `robots.ts`.

---

## 14. Seed Data (`prisma/seed.ts`)

Idempotent (`upsert`). Populate:
- The owner `User` from env.
- A `Profile` with realistic placeholder copy.
- ~12 `Skill`s across categories (including `CSS`, `C#`, `CI/CD`,
  `TypeScript`, `React`, `Unity`, `PostgreSQL`, `Docker`).
- 3 `Experience` entries with attached skills.
- 4 `Project`s demonstrating **every link shape**:
  1. Live deploy + GitHub + skills.
  2. GitHub only.
  3. Google Drive assets + Unity Cloud build + facts.
  4. No links at all (private/NDA) — proves the layout degrades gracefully.
- 4 `Testimonial`s, 3 with `isFeatured = true`.
- 3 `ContactChannel`s: one public email, one public GitHub, one **private** phone
  (to prove filtering works).
- Default `SiteSetting` rows.

---

## 15. Testing

**Unit (Vitest)**
- `crypto.ts`: round-trip encrypt/decrypt; tampered ciphertext throws; wrong key
  throws; unique IVs across calls.
- Repositories: `getPublicContacts()` **excludes** private rows (assert absence,
  not null).
- Project card CTA selection logic (§6.2) — all five branches.
- Zod schemas: valid/invalid payloads.

**E2E (Playwright)** — one happy path:
1. Log in at `/admin/login`.
2. Create a project with a live link and two skills.
3. Visit `/` → project card is visible with the correct CTA.
4. Toggle a testimonial's "Show on portfolio" → it appears/disappears.
5. Log out → `/admin` redirects to login.

**Manual check before "done":** add content in admin, refresh the public site in
a **production build** (`pnpm build && pnpm start`) and confirm it appears
without a rebuild.

---

## 16. Build Order (do it in this sequence)

1. Scaffold Next.js + TypeScript + Tailwind + shadcn/ui; commit.
2. `prisma/schema.prisma` + first migration + `db.ts` singleton.
3. `crypto.ts` + unit tests. **Do not proceed until tests pass.**
4. `auth.ts` + seed script + login page + middleware.
5. Admin shell + `DataTable` / `SortableList` / `RepeatableField` / `SecretField`.
6. Skills CRUD → Experience CRUD → Profile editor.
7. Projects CRUD (all six tabs) — the biggest chunk.
8. Testimonials CRUD + feature toggle.
9. Contacts CRUD + reveal + encryption + public filtering.
10. Public site: Hero → About → Skills → Experience → Projects → Testimonials →
    Contact → Footer.
11. Project detail page + filters + gallery lightbox.
12. SEO, sitemap, robots, OG images, 404.
13. Polish pass: animations, reduced-motion, light mode, empty states,
    loading skeletons, error boundaries.
14. E2E test, README, `.env.example`, `DECISIONS.md`, deploy.

---

## 17. Definition of Done

The project is complete when **all** of these are true:

- [ ] `pnpm install && pnpm prisma migrate dev && pnpm prisma db seed && pnpm dev`
      works from a clean clone with only `.env` filled in.
- [ ] `pnpm build` and `pnpm lint` and `pnpm test` pass with zero errors.
- [ ] Logging in at `/admin` works; `/admin` is inaccessible when logged out.
- [ ] Every section listed in §1.1 renders and is populated from the database.
- [ ] The owner can add a project, experience, skill, testimonial, and contact
      channel entirely from the admin UI.
- [ ] Newly added content appears on the public site **without a redeploy**.
- [ ] Toggling `isFeatured` on a testimonial immediately changes the public site.
- [ ] Contact values are unreadable in the raw database (`SELECT` shows only
      ciphertext/iv/tag) but display correctly when `isPublic = true`.
- [ ] Private contact channels never appear in the public HTML or RSC payload.
- [ ] A project with no links, one with only GitHub, one with Google Drive +
      Unity Cloud, and one with a live deploy all render correctly.
- [ ] Every project lists its associated skills.
- [ ] Lighthouse ≥ 90 on Performance, Accessibility, Best Practices, SEO
      (mobile, production build).
- [ ] Site is fully usable with keyboard only and with `prefers-reduced-motion`.
- [ ] Light and dark modes both look intentional.
- [ ] `README.md` documents setup, env vars, seeding, and deployment.
- [ ] `DECISIONS.md` lists every assumption made.

---

## 18. Commands

```bash
pnpm install
pnpm prisma migrate dev --name init
pnpm prisma db seed
pnpm dev                 # http://localhost:3000
pnpm build && pnpm start # production smoke test
pnpm lint
pnpm test
pnpm test:e2e
pnpm prisma studio       # inspect data
```

---

## 19. Guardrails — Do Not

- ❌ Do **not** store contact values, emails, or phone numbers in plaintext.
- ❌ Do **not** add fixed columns like `githubUrl`, `unityUrl`, `driveUrl` to
  `Project` — use `ProjectLink` rows.
- ❌ Do **not** send private data to the client and hide it with CSS.
- ❌ Do **not** require a redeploy or rebuild to publish content.
- ❌ Do **not** use `any`; keep `strict: true` in `tsconfig.json`.
- ❌ Do **not** add heavy dependencies without noting them in `DECISIONS.md`.
- ❌ Do **not** implement a WYSIWYG editor — markdown + preview is enough.
- ❌ Do **not** build multi-user roles, signup, or password reset.
- ❌ Do **not** skip `revalidatePath()` after mutations.
- ❌ Do **not** hardcode the owner's personal details in components — everything
  comes from the database.

---

## 20. Working Agreement for the Agent

1. **Plan first.** Before each milestone in §16, write a short plan and the files
   you'll touch.
2. **Small commits**, one logical change each, conventional-commit messages.
3. **Ask before assuming** on anything that affects the schema or security.
   Otherwise, pick the simpler option and log it in `DECISIONS.md`.
4. **Keep `AGENTS.md` updated** if requirements evolve — it is the contract.
5. **Never leave the build broken.** Run `pnpm build && pnpm lint && pnpm test`
   before declaring a milestone done.
6. **Verify security claims with tests**, not assertions in prose.

### Core Modules and Design Decisions

The spec centers on three pillars that keep the portfolio easy to maintain and secure.

- **Encrypted personal data** — contact values and private notes are stored as ciphertext, IV, and auth tag. Only records marked `isPublic` are decrypted server-side and rendered publicly; everything else stays invisible to the browser.
- **Flexible project links** — instead of fixed columns like `githubUrl` or `unityUrl`, projects use a `ProjectLink` table with a `kind` field. This lets you add any platform (Google Drive, Unity Cloud, itch.io, etc.) without a schema change.
- **Admin-driven publishing** — the admin panel at `/admin` gives you CRUD screens for skills, experience, projects, testimonials, and contacts. After each save, `revalidatePath` refreshes the public site immediately, so new content appears without a rebuild or redeploy.
---

**Optimization Tip:** Update `ENCRYPTION_KEY`, `AUTH_SECRET`, and `ADMIN_PASSWORD` in `.env` before deployment, and adjust the seed data in `prisma/seed.ts` to match your real profile and projects.