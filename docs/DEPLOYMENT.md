# Deployment Guide

This project is configured to deploy automatically to **GitHub Pages** via GitHub Actions.

## Automated Deployment (CI/CD)

The pipeline is defined in `.github/workflows/ci-cd.yml`.

### Triggers
*   **Pull Requests:** Runs Linting, Unit Tests, and E2E Tests.
*   **Push to `main`:** Runs all tests, builds the static site, and deploys to GitHub Pages.

### Prerequisites
For the deployment to work on your GitHub repository, you must:
1.  Go to **Settings > Pages**.
2.  Under **Build and deployment**, select **Source** as **GitHub Actions**.

## Manual Deployment (Local)

If you need to deploy manually or test the build locally:

1.  **Build:**
    ```bash
    npm run build
    ```
    This generates the static site in the `out/` directory.

2.  **Serve Locally:**
    You can use `serve` or `http-server` to preview the static output:
    ```bash
    npx serve out
    ```

## Infrastructure

*   **Hosting:** GitHub Pages
*   **Mode:** Static Export (`output: 'export'` in `next.config.ts`)
*   **CI/CD:** GitHub Actions
