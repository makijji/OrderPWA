# OrderPWA

Offline-first Progressive Web App for monthly stock replenishment orders.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Dexie (IndexedDB)
- React Hook Form + Zod
- SheetJS (`xlsx`) for Excel export
- `jsPDF` for PDF export
- `vite-plugin-pwa` for installable offline support

## Core Capabilities

- Product catalog management with search/filter/sort, add/edit/archive/reactivate/duplicate.
- Monthly order drafts with product snapshots, grouped item editing, quick add, auto-save.
- Order history with reopen, duplicate, delete, and re-export.
- Import products from CSV/JSON with preview, row-level validation, and import modes.
- Export orders to XLSX, CSV, PDF.
- Share export via Web Share API where available; fallback to file download.
- Settings for labels, theme, export preferences, naming pattern, and JSON backup/restore.

## Data Providers

Provider is selected by `VITE_DATA_PROVIDER`:

- `indexeddb` (default)
- `mock` (optional fallback only)

Example `.env.local`:

```bash
VITE_DATA_PROVIDER=indexeddb
```

## Local Development (VS Code)

1. Open folder in VS Code: `OrderPWA`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```
4. Open shown URL in browser (same network/device for phone testing).

Recommended VS Code extensions:

- ESLint
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features (built-in)

## Build and Preview

```bash
npm run build
npm run preview
```

## Tests

```bash
npm run test
```

Current tests cover:

- Import validation/execution logic
- Export row mapping logic

## Import Formats

### CSV

Expected headers:

`name,category,unit,location,minStock,defaultOrderQty,supplier,sku,notes,isActive`

See sample: [`docs/examples/products-import.csv`](docs/examples/products-import.csv)

### JSON

Array of product objects with matching fields.

See sample: [`docs/examples/products-import.json`](docs/examples/products-import.json)

### Import Modes

- `add-new-only`: creates only missing products.
- `update-existing`: updates existing by SKU or name; creates if missing.
- `skip-duplicates`: skips rows matching existing or repeated import rows.

## PWA Install Instructions

### Android (Chrome)

1. Open app URL in Chrome.
2. Tap browser menu (`⋮`) and choose `Install app` / `Add to Home screen`.
3. Launch installed app from home screen for standalone mode.

### iPhone (Safari)

1. Open app URL in Safari.
2. Tap `Share` button.
3. Choose `Add to Home Screen`.
4. Launch from home screen.

Notes:

- The app works offline after first successful load.
- Updates are applied via in-app refresh prompt.

## Deployment (GitHub Pages)

Automatic deployment is configured via GitHub Actions:

- Workflow file: `.github/workflows/deploy-pages.yml`
- Trigger: push to `main` or `master`
- Build env:
  - `VITE_BASE_PATH=/<repo-name>/`
  - `VITE_ROUTER_MODE=hash`

Setup once in GitHub repo settings:

1. `Settings` -> `Pages`
2. `Build and deployment` -> `Source` -> select `GitHub Actions`

After that, each push to `main`/`master` publishes automatically.

URL format:

- `https://<github-username>.github.io/<repo-name>/`

## Deployment (Other Static Hosts)

This app is static and can be deployed to any static host.

- Build output directory: `dist/`
- Ensure HTTPS is enabled (required for service workers and installability).

## Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
