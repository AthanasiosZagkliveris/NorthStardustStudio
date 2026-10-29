# Folders: the app files, the examples and the working files

Status: **current design**, updated 2026-10-29. The owner needs the app's files only, kept apart from the examples and the working files. The three steps of the plan (ignore the working folders, one copy of the examples, the app's export and the `tools/` folder) were done on 2026-10-22; the log (`04-log.md`) has them.

## Where things are

| Kind | Where | Ships with the app? |
|---|---|---|
| **The app** | `src/` without the tests, `src/library/`, `src/docs/` and `src/test/`, and without the development-only pages that `App.tsx` marks | yes |
| The desktop shell | `src-tauri/` | yes (the desktop build) |
| The page and its settings | `index.html`, `public/`, `package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `tsconfig.node.json` | yes (the build reads them) |
| **Tests** | `src/**/*.test.*` and `src/test/` | no |
| **The component library** | `src/library/`; its gallery is reached only by `npm run dev` (`import.meta.env.DEV` in `App.tsx`) and is absent from the build | no (development only) |
| **The examples** | `src/data/examples/` (two organisations; the app loads them through `services/ExampleOrganizations.ts`); one copy only (`ExampleDrift.test.ts` updates it) | yes (they are the demo data) |
| **Documents** | `docs/` and `src/docs/` (the tests of the documents) | no |
| **Working tools** | `tools/scripts/` (library, catalogue, docs, lint, tokens, layout check, cards, export) and `tools/catalogue/` (measures, probes, scans, exports) | no |
| Automation | `.github/workflows/ci.yml` | no |
| Not tracked | `dist/`, `exports/`, `.claude/`, `.vscode/`, `.playwright-mcp/`, `node_modules/`, `.superpowers/`, `.scratch/` (all in `.gitignore`) | no |

The root holds `src/`, `src-tauri/`, `public/`, `docs/`, `tools/` and the settings files. `src/library/` stays in `src/`: it is development-only and the app does not import it.

## The export of the app files

`npm run export:app` (`tools/scripts/export/app.mjs`) copies exactly the app into a clean folder (default `exports/app/`, which git ignores):
- **Included:** `src/` without `*.test.*`, `src/test/`, `src/docs/` and `src/library/` (except the library files the app itself imports); `src-tauri/`; `public/`; `index.html`; `package.json` (the scripts that point at tools removed) and `package-lock.json`; `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`.
- **Left out:** `docs/`, `tools/scripts/`, `tools/catalogue/`, `.github/`, the tests, the library and everything ignored.
- **Proof it is complete:** the command then runs `npm run build` inside that folder. If the app needs a file that was left out, the build fails and says which.
- `App.tsx` loads the library's gallery pages only in development; those lines sit between `dev-only:start` and `dev-only:end` markers, and the export leaves them out.
- `npm run export:app -- --clean` goes further: it installs (`npm ci`) and builds in the exported folder alone, which also proves the dependency list. Without it the build uses this project's `node_modules` (fast).
- `tokens.ts` holds the three corner numbers itself (a test in `library/componentTokens.test.ts` keeps them equal to the library's), so the styles do not pull the library into the app.

## Result

The app files alone are one command away (`npm run export:app`), the examples exist once, and the working files are under `tools/`.
