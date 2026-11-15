# Watt Wise

A responsive Thai household electricity cost estimator built with React, TypeScript, and Vite.

## Run locally

```sh
npm ci
npm run dev
```

Create a production build with `npm run build`.

## Deploy

Pushing to `main` builds and deploys the site to GitHub Pages using the workflow in `.github/workflows/deploy.yml`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The app uses browser local storage for saved estimates.
