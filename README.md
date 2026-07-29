# IranArchive

IranArchive is a Nuxt 3 static site and data archive for documenting victims, incidents, global solidarity events, evidence, country alignment, and public/entity positions related to Iran.

## Project Structure

- `pages/`, `components/`, `layouts/`: Nuxt application UI.
- `server/`: API routes used during static generation and local development.
- `data/victims/`: Victim records as YAML files, plus `data/victims/img/` for local victim photos.
- `data/incidents/`: Incident YAML files.
- `data/evidences/`: Evidence YAML sidecars and referenced media files.
- `data/events/`: Global solidarity event YAML files.
- `data/countries/`, `data/campaigns/`, `data/entities/`: Alignment and campaign tracking data.
- `public/index/`: Generated JSON indexes consumed by country/entity/campaign pages.
- `scripts/`: Validation, metadata, migration, and index-generation utilities.
- `content/docs/`: Public contribution guidance rendered by the site.

## Setup

Use Node.js 22 or later.

Install dependencies:

```bash
npm ci
```

Start the local development server:

```bash
npm run dev
```

Build the production site:

```bash
npm run build
```

Run the full local quality gate:

```bash
npm run check
```

This validates data, typechecks the app, produces the GitHub Pages output, and runs browser smoke tests over the main public routes.

## Data Validation

Use these commands before submitting changes:

```bash
npm run validate
npm run validate:entities
npm run typecheck
```

`npm run validate` checks the current YAML data layout:

- Victim YAML records in `data/victims/`
- Evidence YAML sidecars and their referenced media under `data/evidences/`
- Incident YAML records in `data/incidents/`
- Campaign, country, entity, and update data
- Markdown docs in `content/`

Legacy JSON source/evidence/victim validation still runs if the old directories/files are present.

## Generated Data

When country, entity, campaign, or update data changes, regenerate indexes:

```bash
npm run gen-indexes
```

When evidence media files change, regenerate evidence metadata:

```bash
npm run gen-metadata
```

## Media Architecture

Evidence files, campaign images, and victim photos are stored in the repository but are not copied into the static build output. Runtime URLs are generated from GitHub raw paths by `utils/mediaUrl.ts`.

Media locations:

- `data/evidences/**`: Evidence media and YAML sidecars
- `data/campaigns/img/**`: Campaign thumbnail images
- `data/victims/img/**`: Victim photos

Environment variables:

| Variable | Default | Description |
| --- | --- | --- |
| `NUXT_PUBLIC_MEDIA_REPO_OWNER` | `sepehrhn` | GitHub repository owner |
| `NUXT_PUBLIC_MEDIA_REPO_NAME` | `IranArchive` | GitHub repository name |
| `NUXT_PUBLIC_MEDIA_REPO_REF` | `main` locally; deployment commit SHA in CI | Git branch, tag, or immutable commit ref used for media URLs |
| `NUXT_PUBLIC_MEDIA_BASE_RAW_URL` | `https://raw.githubusercontent.com` | Base URL for raw media |

Local development also loads media from GitHub raw URLs, so an internet connection is required for media previews.

## Deployment

GitHub Pages deployment is defined in `.github/workflows/deploy.yml`.

The workflow:

1. Installs dependencies with `npm ci`.
2. Runs `npm run check`.
3. Builds the GitHub Pages output.
4. Uploads `.output/public`.
5. Deploys with GitHub Pages.

The custom domain is preserved through `public/CNAME`.

Production deploys set `NUXT_PUBLIC_MEDIA_REPO_REF` to the commit SHA, so published media URLs are immutable for each release.

`public/robots.txt`, `public/sitemap.xml`, and `public/og-image.png` provide crawl and social-preview metadata.

## Submission safety

Public uploads are limited to ten files, 50 MB per file, and 75 MB per submission. They are held for review before publication. See `/docs/submission-safety` for retention, correction, and takedown guidance.
