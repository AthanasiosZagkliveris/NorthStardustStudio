# Folder plan: the app files, the examples and the working files

Status: **plan, nothing moved yet** (2026-10-22). Written to answer one request: at the end the owner needs the app's files only, kept apart from the examples and the working files.

## What is in the repository now

| Kind | Where | Files | Ships with the app? |
|---|---|---|---|
| **The app** | `src/` without tests, `src/library/`, `src/docs/` and `src/test/` | 497 | yes |
| The desktop shell | `src-tauri/` | 24 | yes (the desktop build) |
| The page and its settings | `index.html`, `public/`, `package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`, `tsconfig*.json` | about 8 | yes (the build reads them) |
| **Tests** | `src/**/*.test.*` (154 files) and `src/test/` (6) | 160 | no |
| **The component library** | `src/library/` (36 files besides its tests); its gallery is reached only by `npm run dev` (`import.meta.env.DEV` in `App.tsx`) and is absent from the build | 44 | no (development only) |
| **The examples** | `src/data/examples/` (two organisations; the app loads them through `services/ExampleOrganizations.ts`) and `docs/examples/` (an identical copy, kept for reading) | 4 | the first pair yes (they are the demo data), the copy no |
| **Documents** | `docs/` (58) and `src/docs/` (3 tests of the documents) | 61 | no |
| **Working tools** | `scripts/` (115: library, catalogue, docs, lint, tokens, layout check, cards) and `catalogue/` (26: measures, probes, scans, exports) | 141 | no |
| Automation | `.github/workflows/ci.yml` | 1 | no |
| Not tracked | `dist/`, `exports/`, `.claude/`, `.vscode/`, `.playwright-mcp/`, `node_modules/` (ignored); `.superpowers/` and `.scratch/` are not ignored | | no |

## What is wrong with it today

1. Nothing marks the split. The app, its tests, its library and its working files share `src/` or sit one folder above it.
2. The examples exist twice (`docs/examples/` and `src/data/examples/`); a test (`ExampleDrift.test.ts`) keeps them equal, which is a patch for having two copies.
3. `.superpowers/` shows in `git status` and `.scratch/` can end up committed by mistake.
4. "The app files only" cannot be got from a folder: it needs the exclusions listed above, and nobody has written them down as something that runs.

## The plan, in three steps (each its own small branch)

### Step 1: small and safe
- Add `.superpowers/` and `.scratch/` to `.gitignore`.
- One copy of the examples: `src/data/examples/` stays (the app uses it). `docs/examples/` is removed and the documents point to `src/data/examples/`. `ExampleDrift.test.ts` and `scripts/docs/write-index.mjs` are adjusted.
- No code moves, no import changes.

### Step 2: the export of the app files (the answer to "at the end, the app files only")
A command `npm run export:app` that copies exactly the app into a clean folder (default `exports/app/`, which git ignores):
- **Included:** `src/` without `*.test.*`, `src/test/`, `src/docs/` and `src/library/`; `src-tauri/`; `public/`; `index.html`; `package.json` and `package-lock.json` (the scripts that point at tools removed); `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`.
- **Left out:** `docs/`, `scripts/`, `catalogue/`, `.github/`, the tests, the library and everything ignored.
- **Proof it is complete:** the command then runs `npm ci`, `tsc` and `vite build` inside that folder. If the app needs a file that was left out, the build fails and says which.
- `App.tsx` already loads the library only in development, so the exported app has no import of it left to fix; the command checks that with the build.

### Step 3: the real folders (only if the owner still wants them after step 2)
Move working files under one folder so that the tree itself shows the split:
- `scripts/`, `catalogue/` and `.github` stay where tools expect them; `scripts/` and `catalogue/` go under `tools/`.
- Cost: 48 npm scripts and about 100 script files hold paths to `src/`, `docs/` and `scripts/`; the CI file and `docs/README.md` too. Every one is rewritten and the full verify and layout check run again.
- Moving `src/library/` out of `src/` is a larger change: 30 tests and `App.tsx` import it. Recommended only together with the extraction of the Foundation web app, because that extraction decides what the app keeps.

## Recommendation
Do step 1 now and step 2 next. Together they give the owner the app files on demand and one copy of the examples, without moving anything the 154 tests and 48 scripts depend on. Step 3 waits for the owner's decision.
