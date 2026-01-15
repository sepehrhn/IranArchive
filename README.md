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
