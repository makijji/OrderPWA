# OrderPWA Architecture

## 1) Architecture Overview

OrderPWA is a local-first, installable PWA built with React + TypeScript and no backend dependency.

- UI: React + Tailwind CSS, mobile-first with safe-area and keyboard-friendly controls.
- Data abstraction: repository interfaces in `src/domain/repositories.ts`.
- Runtime providers:
  - `indexeddb` provider (default) for local persistence via Dexie.
  - `mock` repository provider (optional, only when explicitly enabled by env).
- Import pipeline: `ImportRepositoryImpl` for CSV/JSON preview, row validation, and execution modes.
- Export pipeline: XLSX/CSV/PDF generation with Web Share API fallback to download.
- PWA: `vite-plugin-pwa` with service worker precache + runtime caching and update prompt.

Flow:
1. Feature screens consume `useAppData()`.
2. Repositories implement all CRUD/import/export-oriented operations.
3. Orders auto-save locally (draft state) and are always available offline.
4. Backup/restore serializes full local database to JSON.

## 2) Folder Structure

```
src/
  app/
    App.tsx
    AppShell.tsx
    data-context.tsx
    feedback-context.tsx
    PwaUpdatePrompt.tsx
    ThemeBootstrap.tsx
  domain/
    models.ts
    schemas.ts
    constants.ts
    repositories.ts
  data/
    db/
      appDb.ts
      seedDexie.ts
    seed/
      mockData.ts
    repositories/
      factory.ts
      importRepository.ts
      repositoryUtils.ts
      mock/
      indexeddb/
  features/
    dashboard/
    products/
    orders/
    import/
    export/
    settings/
  shared/
    components/
    hooks/
    utils/
  tests/
```

## 3) Domain Models

Primary entities:

- `Product`: catalog item with category, unit, location, supplier, stock rules, SKU, notes, active state, timestamps.
- `Order`: monthly draft/ready document with period, status, timestamps, item list.
- `OrderItem`: keeps snapshot fields (`snapshotName`, `snapshotUnit`, `snapshotCategory`, `snapshotLocation`) to preserve historical context.
- `AppSettings`: labels, theme, preferred export format, email recipient, naming pattern, last export date.
- `DatabaseBackup`: portable JSON payload with products/orders/settings.

Supporting abstractions:

- `ProductRepository`, `OrderRepository`, `SettingsRepository`, `ImportRepository`.
- `DataContext`: single app-facing contract to repositories + summary/backup/restore actions.

## 4) Seed Data

- Seed dataset at runtime:
  - 596 products imported from `inventory_items_cleaned.csv`
  - 11 categories
  - 9 units
  - no pre-generated sample orders
- Import examples:
  - CSV: `docs/examples/products-import.csv`
  - JSON: `docs/examples/products-import.json`

## 5) Implementation Checklist

- [x] App shell + routing
- [x] Mock data layer and repository abstraction
- [x] Product catalog (search/filter/sort/add/edit/archive/reactivate/duplicate)
- [x] Product form with React Hook Form + Zod + duplicate-name detection
- [x] Order workflow with draft creation, grouped items, quick add, hide-zero toggle, auto-save
- [x] Order history with reopen, duplicate, re-export, delete confirmation
- [x] Import screen (CSV/JSON preview, validation, row errors, modes)
- [x] Export pipeline (XLSX, CSV, PDF)
- [x] Share flow (Web Share API + fallback download), copy subject/summary
- [x] Settings (labels, theme, preferred export, naming, backup/restore)
- [x] IndexedDB persistence via Dexie
- [x] PWA hardening (manifest, SW, offline support, update prompt)
- [x] Basic tests for import validation and export mapping
