# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Media Architecture

### Overview
Media files (evidences, campaign images, victim photos) are stored in the Git repository but are **NOT copied** into the static build output. Instead, they are loaded at runtime directly from GitHub raw URLs.

### Media Directories
- `/data/evidences/**` - Evidence images, videos, and documents
- `/data/campaigns/img/**` - Campaign thumbnail images  
- `/data/victims/img/**` - Victim photos

### How It Works
1. YAML files reference media by **filename** or **relative path**
2. The `utils/mediaUrl.ts` utility generates GitHub raw URLs at render time
3. Components use `getMediaUrl()` to convert paths to full URLs
4. Example: `2026/jan/video.mp4` → `https://raw.githubusercontent.com/sepehrhn/IranArchive/main/data/evidences/2026/jan/video.mp4`

### Configuration
Configure media loading via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `NUXT_PUBLIC_MEDIA_REPO_OWNER` | `sepehrhn` | GitHub repository owner |
| `NUXT_PUBLIC_MEDIA_REPO_NAME` | `IranArchive` | GitHub repository name |
| `NUXT_PUBLIC_MEDIA_REPO_REF` | `main` | Git branch/tag/ref to load from |
| `NUXT_PUBLIC_MEDIA_BASE_RAW_URL` | `https://raw.githubusercontent.com` | Base URL for raw content |

### Local Development
Media files are loaded from GitHub even during local development. Ensure you have an internet connection when running `npm run dev`.

### Limitations
- **GitHub file size limit**: 100MB per file
- **Rate limiting**: GitHub raw URLs may be rate-limited under heavy traffic
- **Internet required**: Media won't load without internet connection (including development)

### Benefits
- **Smaller deployments**: Static output excludes all media files
- **Faster builds**: No need to copy large media files during build
- **Direct source**: Media always loads from the repository source of truth

## Deployment (GitHub Pages)

This project is configured to deploy automatically to GitHub Pages using GitHub Actions.

### Workflow

The deployment workflow is defined in `.github/workflows/deploy.yml`:
1.  Triggers on push to `main` or manual dispatch.
2.  Builds the site using `npm run build` with the `github_pages` preset.
3.  Uploads the `.output/public` directory.
4.  Deploys to GitHub Pages environment.

### Custom Domain

The file `public/CNAME` ensures the custom domain `iranarchive.net` is preserved.

### Setup Required

To enable deployment:
1.  Go to the repository **Settings** > **Pages**.
2.  Under **Build and deployment**, select **Source** as **GitHub Actions**.
