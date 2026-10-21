# Folder plan: the app files, the examples and the working files

Status: **plan; all three steps done 2026-10-22**. Written to answer one request: at the end the owner needs the app's files only, kept apart from the examples and the working files.

## What is in the repository now

| Kind | Where | Files | Ships with the app? |
|---|---|---|---|
| **The app** | `src/` without tests, `src/library/`, `src/docs/`, `src/test/` and the three development-only pages | 494 | yes |
| The desktop shell | `src-tauri/` | 24 | yes (the desktop build) |
| The page and its settings | `index.html`, `public/`, `package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`, `tsconfig*.json` | about 8 | yes (the build reads them) |
| **Tests** | `src/**/*.test.*` (154 files) and `src/test/` (6) | 160 | no |
| **The component library** | `src/library/` (36 files besides its tests); its gallery is reached only by `npm run dev` (`import.meta.env.DEV` in `App.tsx`) and is absent from the build | 44 | no (development only) |
| **The examples** | `src/data/examples/` (two organisations; the app loads them through `services/ExampleOrganizations.ts`) and `docs/examples/` (an identical copy, kept for reading) | 4 | the first pair yes (they are the demo data), the copy no |
| **Documents** | `docs/` (58) and `src/docs/` (3 tests of the documents) | 61 | no |
| **Working tools** | `tools/scripts/` (115: library, catalogue, docs, lint, tokens, layout check, cards) and `tools/catalogue/` (26: measures, probes, scans, exports) | 141 | no |
| Automation | `.github/workflows/ci.yml` | 1 | no |
| Not tracked | `dist/`, `exports/`, `.claude/`, `.vscode/`, `.playwright-mcp/`, `node_modules/` (ignored); `.superpowers/` and `.scratch/` are not ignored | | no |

## What is wrong with it today

1. Nothing marks the split. The app, its tests, its library and its working files share `src/` or sit one folder above it.
2. The examples exist twice (`docs/examples/` and `src/data/examples/`); a test (`ExampleDrift.test.ts`) keeps them equal, which is a patch for having two copies.
3. `.superpowers/` shows in `git status` and `.scratch/` can end up committed by mistake.
4. "The app files only" cannot be got from a folder: it needs the exclusions listed above, and nobody has written them down as something that runs.

## The plan, in three steps (each its own small branch)

### Step 1: small and safe (done 2026-10-22)
- Add `.superpowers/` and `.scratch/` to `.gitignore`.
- One copy of the examples: `src/data/examples/` stays (the app uses it). `docs/examples/` is removed and the documents point to `src/data/examples/`. `ExampleDrift.test.ts` and `tools/scripts/docs/write-index.mjs` are adjusted.
- No code moves, no import changes.

### Step 2: the export of the app files (done 2026-10-22: `npm run export:app`)
A command `npm run export:app` that copies exactly the app into a clean folder (default `exports/app/`, which git ignores):
- **Included:** `src/` without `*.test.*`, `src/test/`, `src/docs/` and `src/library/`; `src-tauri/`; `public/`; `index.html`; `package.json` and `package-lock.json` (the scripts that point at tools removed); `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`.
- **Left out:** `docs/`, `tools/scripts/`, `tools/catalogue/`, `.github/`, the tests, the library and everything ignored.
- **Proof it is complete:** the command then runs `npm ci`, `tsc` and `vite build` inside that folder. If the app needs a file that was left out, the build fails and says which.
- `App.tsx` loads the library's gallery pages only in development; those lines sit between `dev-only:start` and `dev-only:end` markers, and the export leaves them out.
- `npm run export:app -- --clean` goes further: it installs and builds in the exported folder alone, which also proves the dependency list. Without it the build uses this project's `node_modules` (fast).
- **What the first run showed, and what was done about it:** 27 library files came with the app, through `styles/tokens/tokens.ts` -> `library/componentTokens.ts` -> the whole library table (8,600 lines), and through the three development-only pages. `tokens.ts` now holds the three corner numbers itself (a test in `library/componentTokens.test.ts` keeps them equal to the library's), and the export leaves out the pages named in the `dev-only` block of `App.tsx`. The exported app is **526 files with no library file in it**, and it builds after a fresh install.

### Step 3: the real folders (done 2026-10-22)
The working files now sit under one folder, so the tree shows the split: **`tools/scripts/`** (was `scripts/`) and **`tools/catalogue/`** (was `catalogue/`). The root holds `src/` (the app and its tests), `src-tauri/`, `public/`, `docs/`, `tools/` and the settings files.
- All 43 npm scripts, the documents, the tests that read them and the scripts' own paths were rewritten (the scripts' paths to the repository root gained one `../`); every check passes from the new place.
- `src/library/` stays in `src/`: it is development-only, the app no longer imports it (see step 2), and `export:app` leaves it out.
- The historical rows of `04-log.md` and the archive keep the paths of their day only where they were not rewritten; a path in the log that starts `scripts/` or `catalogue/` now reads `tools/scripts/` or `tools/catalogue/`.

## Result
The owner asked for the three steps. The app files alone are one command away (`npm run export:app`), the examples exist once, and the working files are under `tools/`.
