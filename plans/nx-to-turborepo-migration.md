# Migration Plan: Nx → Turborepo

**Date:** 2026-05-04  
**Scope:** `fbs2.0` monorepo — 3 apps (backend, frontend, frontend2), 2 libs (types, utils)  
**Current Nx version:** 22.4.5

---

## 1. Current Nx Inventory

| Item | Detail |
|------|--------|
| Nx version | 22.4.5 with Nx Cloud remote cache |
| Active plugins | `@nx/vite`, `@nx/webpack`, `@nx/eslint`, `@nx/jest` |
| Projects | `backend` (NestJS/webpack), `frontend` (Vite, legacy), `frontend2` (React 19/Vite), `types` (lib), `utils` (lib) |
| Inferred targets | `build`, `test`, `lint`, `serve`, `preview` — auto-detected by plugins from tool configs |
| Explicit targets | `backend:serve` (depends on `backend:build`) |
| Caching | Named inputs (`default`, `production`, `sharedGlobals`); `.github/workflows/ci.yml` in `sharedGlobals` |
| Build outputs | `dist/apps/backend`, `dist/apps/frontend2`, `dist/out-tsc` |
| Module resolution | TypeScript path aliases (`@fbs2.0/types`, `@fbs2.0/utils`) — **not** npm workspace packages |
| Root scripts | None — all tasks run via `npx nx <target> <project>` |

---

## 2. What Needs to Change

### 2.1 Package structure

Turborepo is driven by **npm workspaces** — each workspace member must have its own `package.json` with a `name` field and npm-style `scripts`. Currently only the root has a `package.json`; the projects have `project.json` files (Nx concept).

**Action:** Add a `package.json` to each of the 5 projects.

### 2.2 Remove Nx-specific files

| File | Action |
|------|--------|
| `nx.json` | Delete |
| `apps/*/project.json` | Delete (targets move to `package.json` scripts) |
| `libs/*/project.json` | Delete |
| `jest.config.ts` (root, uses `getJestProjectsAsync`) | Rewrite |
| `jest.preset.js` (uses `@nx/jest/preset`) | Rewrite |
| `.eslintrc.json` (`@nx/enforce-module-boundaries`) | Rewrite |

### 2.3 Replace `nxViteTsPaths` plugin

Both `apps/frontend/vite.config.ts` and `apps/frontend2/vite.config.ts` use `nxViteTsPaths` from `@nx/vite/plugins/nx-tsconfig-paths.plugin`.

**Replace with:** `vite-tsconfig-paths` (standard, Nx-independent):

```typescript
import tsconfigPaths from "vite-tsconfig-paths";

plugins: [react(), tsconfigPaths()],
```

### 2.4 Remote cache

Nx Cloud → **Vercel Remote Cache** (Turborepo's native provider, free tier available).

---

## 3. Step-by-Step Migration

### Step 1 — Install Turborepo

```bash
npm install turbo --save-dev
```

### Step 2 — Configure npm workspaces in root `package.json`

```json
{
  "workspaces": [
    "apps/*",
    "libs/*"
  ]
}
```

> The root already uses a flat `node_modules` layout, so this changes nothing about dependency hoisting.

### Step 3 — Add `package.json` to each project

**`apps/backend/package.json`**
```json
{
  "name": "@fbs2.0/backend",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build": "webpack --config webpack.config.js",
    "serve": "nx serve backend",
    "test": "jest --config jest.config.ts",
    "lint": "eslint ."
  }
}
```

**`apps/frontend2/package.json`**
```json
{
  "name": "@fbs2.0/frontend2",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build": "vite build",
    "serve": "vite",
    "preview": "vite preview",
    "test": "vitest run",
    "lint": "eslint ."
  }
}
```

**`libs/types/package.json`**
```json
{
  "name": "@fbs2.0/types",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "scripts": {
    "build": "tsc --project tsconfig.lib.json",
    "lint": "eslint ."
  }
}
```

**`libs/utils/package.json`**
```json
{
  "name": "@fbs2.0/utils",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "scripts": {
    "build": "tsc --project tsconfig.lib.json",
    "lint": "eslint ."
  }
}
```

### Step 4 — Create `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "tsconfig*.json", "vite.config.*", "webpack.config.*"],
      "outputs": ["../../dist/apps/$TURBO_PACKAGE_NAME/**", "../../dist/out-tsc/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "tsconfig*.json", "jest.config.*", "vitest.config.*"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "inputs": ["src/**", ".eslintrc*", "eslint.config.*"],
      "outputs": []
    },
    "serve": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    },
    "preview": {
      "cache": false,
      "persistent": true
    }
  }
}
```

Key points:
- `^build` means "build all dependencies first" — this replaces Nx's automatic project graph.
- `serve` and `preview` are marked `cache: false, persistent: true` because they are long-running dev servers.
- `outputs` paths use workspace-relative paths from the package root.

### Step 5 — Replace root `jest.config.ts`

Remove `getJestProjectsAsync` and list projects explicitly:

```typescript
export default {
  projects: [
    "<rootDir>/apps/backend",
    "<rootDir>/libs/types",
    "<rootDir>/libs/utils",
  ],
};
```

Replace `jest.preset.js`:

```javascript
module.exports = {
  testEnvironment: "node",
  transform: { "^.+\\.[tj]sx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }] },
};
```

Each project's `jest.config.ts` will extend its own local config (no `nxPreset` import needed).

### Step 6 — Replace `vite.config.ts` Nx plugin

```bash
npm install vite-tsconfig-paths --save-dev
```

In `apps/frontend2/vite.config.ts` (and `apps/frontend/vite.config.ts`):

```diff
-import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
+import tsconfigPaths from "vite-tsconfig-paths";

-  plugins: [react(), nxViteTsPaths()],
+  plugins: [react(), tsconfigPaths()],
```

### Step 7 — Update `.eslintrc.json`

Remove `@nx` plugin and `@nx/enforce-module-boundaries` rule (no Turborepo equivalent):

```json
{
  "root": true,
  "ignorePatterns": ["**/*"],
  "overrides": [
    {
      "files": ["*.ts", "*.tsx"],
      "extends": ["plugin:@typescript-eslint/recommended"],
      "rules": {}
    },
    {
      "files": ["*.js", "*.jsx"],
      "rules": {}
    },
    {
      "files": ["*.spec.ts", "*.spec.tsx", "*.spec.js", "*.spec.jsx"],
      "env": { "jest": true },
      "rules": {}
    }
  ]
}
```

### Step 8 — Update root `package.json` scripts

Turborepo commands replace all `npx nx` calls:

```json
{
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "serve:backend": "turbo run serve --filter=@fbs2.0/backend",
    "serve:frontend2": "turbo run serve --filter=@fbs2.0/frontend2"
  }
}
```

### Step 9 — Remove Nx dependencies

```bash
npm uninstall nx nx-cloud @nx/eslint @nx/eslint-plugin @nx/jest @nx/js @nx/nest @nx/node @nx/react @nx/vite @nx/web @nx/webpack @nx/workspace
```

### Step 10 — Set up remote caching (optional)

```bash
npx turbo login
npx turbo link
```

This connects to Vercel Remote Cache. Alternatively, self-host with `@turbo/remote-cache`.

---

## 4. Risk Analysis & Problem Areas

### HIGH — No project graph / cross-project awareness

**Problem:** Nx builds an automatic dependency graph from TypeScript imports and project tags. Turborepo does not — it only knows about explicit `dependsOn` relationships in `turbo.json` and `package.json` `dependencies` fields.

Currently the libs (`@fbs2.0/types`, `@fbs2.0/utils`) are resolved via **TypeScript path aliases**, not npm workspace references. Turborepo will not know that `frontend2` depends on `types` unless this is expressed as a real `dependencies` entry.

**Fix:** Add workspace dependencies to each app's `package.json`:
```json
{
  "dependencies": {
    "@fbs2.0/types": "*",
    "@fbs2.0/utils": "*"
  }
}
```
Then Turborepo resolves `^build` correctly.

### HIGH — `@nx/enforce-module-boundaries` has no equivalent

**Problem:** The root `.eslintrc.json` uses `@nx/enforce-module-boundaries` to prevent cross-package imports. Turborepo has no linting concept; there is no direct replacement.

**Mitigation options:**
- Use `eslint-plugin-import` with `no-restricted-imports` rules configured per package.
- Accept reduced enforcement and rely on code review.
- Adopt `@rushstack/eslint-plugin-security` or `eslint-plugin-boundaries` for a partial replacement.

### MEDIUM — Loss of inferred targets

**Problem:** Nx automatically infers `build`, `test`, `lint`, `serve` targets from tool config files (vite.config.ts, jest.config.ts, eslint.config.js) via plugins. Turborepo requires every task to be an explicit `npm` script in the package's `package.json`.

**Fix:** Add the scripts manually to each package (covered in Step 3). This is boilerplate but straightforward.

### INMEDIUM — `backend:serve` depends on `backend:build`

**Problem:** The backend's explicit `dependsOn: ["build"]` in `project.json` means `serve` always rebuilds first. In `turbo.json` this can be replicated:
```json
"serve": { "dependsOn": ["build"], "cache": false, "persistent": true }
```
But `turbo run serve --filter=@fbs2.0/backend` will trigger a **build of all transitive dependencies** first, which is the desired behavior.

### MEDIUM — Nx Cloud → Vercel Remote Cache

**Problem:** The Nx Cloud access token (`nxCloudAccessToken` in `nx.json`) provides distributed task caching and optionally distributed execution. Vercel Remote Cache provides only remote artifact caching — there is no distributed execution equivalent in Turborepo.

**Impact:** If CI relies on Nx's distributed task execution (DTE), that feature is lost. For this repo (5 projects, no `targetDefaults.executor` for DTE), the impact is low.

### MEDIUM — `sharedGlobals` named input includes CI config

**Problem:** `nx.json` has `"sharedGlobals": ["{workspaceRoot}/.github/workflows/ci.yml"]` which invalidates all caches when CI config changes. In Turborepo the global cache key is set via `globalDependencies` in `turbo.json`:
```json
{
  "globalDependencies": [".github/workflows/ci.yml"]
}
```
This must be added manually or cache misses may occur unexpectedly in CI.

### MEDIUM — `dist/out-tsc` shared output path for libs

**Problem:** Both libs write compiled output to `dist/out-tsc`. Turborepo tracks cache outputs per-package; if two packages share the same output path there will be cache collisions.

**Fix:** Point each lib to its own output directory:
```json
"outDir": "../../dist/libs/types"   // in tsconfig.lib.json for types
"outDir": "../../dist/libs/utils"   // in tsconfig.lib.json for utils
```

### LOW — Root `package.json` has no scripts today

All developer commands are `npx nx ...`. After migration, muscle memory and documentation must shift to `turbo run ...` or the new root scripts. Update `README.md` and `CLAUDE.md` accordingly.

### LOW — `cacheDir` in `vite.config.ts`

Vite's `cacheDir` is set to `../../node_modules/.vite/apps/frontend2`. This is fine; Turborepo manages task-level cache separately. No change needed.

### LOW — `apps/frontend` (legacy app)

The legacy `apps/frontend` has no meaningful targets and is not used. It can be excluded from Turborepo's workspace by omitting its `package.json`, or kept with a minimal one. Recommended: **exclude from workspace** or delete.

---

## 5. Feature Comparison

| Feature | Nx 22 | Turborepo |
|---------|-------|-----------|
| Automatic project graph | Yes (from imports) | No (explicit deps only) |
| Inferred targets from tool configs | Yes (plugins) | No (explicit scripts only) |
| Module boundary enforcement | `@nx/enforce-module-boundaries` | No equivalent |
| Remote caching | Nx Cloud | Vercel Remote Cache / self-host |
| Distributed execution | Nx Cloud DTE | No |
| Code generators (`nx generate`) | Yes | No |
| Interactive project graph UI | `nx graph` | `turbo run --graph` (basic) |
| Local task cache | `.nx/cache` | `.turbo` |
| Config location | `nx.json` + `project.json` | `turbo.json` + `package.json` scripts |
| Learning curve | Higher (Nx DSL) | Lower (npm scripts + turbo.json) |

---

## 6. Effort Estimate

| Task | Effort |
|------|--------|
| Add `package.json` to 5 projects | 1h |
| Write `turbo.json` pipeline | 1h |
| Replace Vite plugin in 2 configs | 0.5h |
| Rewrite ESLint config | 1h |
| Rewrite root Jest config | 0.5h |
| Fix `tsconfig.lib.json` output dirs | 0.5h |
| Remove Nx deps, verify builds | 2h |
| Update CI pipeline (`.github/workflows/`) | 1h |
| Update docs (README, CLAUDE.md) | 0.5h |
| **Total** | **~8h** |

---

## 7. Recommendation

For this repo size (5 projects, small team), the migration is **low-risk and feasible in a single day**. The biggest trade-off is losing Nx's automatic project graph and `enforce-module-boundaries` — both valuable guardrails. If those are important, keep Nx; if the team wants a simpler mental model with less Nx DSL, Turborepo is a reasonable choice.

**Suggested approach:** migrate on a feature branch, run both `nx affected` and `turbo run build` in parallel CI for one sprint to validate parity before removing Nx.
