This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

It is a personal portfolio whose content is managed entirely from an admin area at `/configuration` — projects, experience, skills, testimonials, contacts, certificates, and site settings are all added through the CMS, so publishing new content does not require code changes.

## Certificates & awards

Certificates and awards have a dedicated admin tab and a public section, so a new credential can be published as soon as it is earned.

- **Admin tab:** `/configuration/certificates` (sidebar: _Certificates_). Create, edit, and delete records, toggle **Show on Portfolio**, and reorder entries with the up/down controls.
- **Fields:** title, issuing company, issued date, optional expiry date, optional credential ID, optional verification URL, optional markdown description, and a source-material file.
- **Source material:** upload a PNG, JPEG, WebP, or PDF. The file is stored in [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) through `POST /api/configuration/upload`, and the returned blob URL is stored on the record. Both the admin table and the public card link to it (`target="_blank"`) so reviewers can open the original document.
- **Public section:** _Certificates & awards_ renders between Testimonials and Contact (section `07`, Contact is `08`). It is ordered by the admin ordering, and it renders nothing while there are no visible certificates.

To enable uploads, set `BLOB_READ_WRITE_TOKEN` in `.env` (create a Blob store in the Vercel dashboard or run `vercel env pull`). Apply the database change with `pnpm prisma:migrate:deploy` before using the tab.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
