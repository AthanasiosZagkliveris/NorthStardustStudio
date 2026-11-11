# 25. Folders: the app files, the examples and the working files

Status: **current design**, written 2026-10-22, updated 2026-11-11. Where the app's files, the examples and the working files are kept apart, and how the app alone is exported.

## Where things are

| Kind | Where | Ships with the app? |
|---|---|---|
| **The app** | `src/` without the tests, `src/library/`, `src/docs/` and `src/test/`, and without the development-only pages that `App.tsx` marks | yes |
| The desktop shell | `src-tauri/` | yes (the desktop build) |
| The page and its settings | `index.html`, `public/`, `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json` | yes (the build reads them) |
| The test and check settings | `vitest.config.ts` | no |
| **Tests** | `src/**/*.test.*` and `src/test/` | no |
| **The component library** | `src/library/`; its gallery is reached only by `npm run dev` (`import.meta.env.DEV` in `App.tsx`) and is absent from the build | no (development only) |
| **The examples** | `src/data/examples/` (two organisations; the app loads them through `services/ExampleOrganizations.ts`); one copy only (`ExampleDrift.test.ts` updates it) | yes (they are the demo data) |
| **Documents** | `docs/` and `src/docs/` (the tests of the documents) | no |
| **Working tools** | `tools/scripts/` (library, catalogue, docs, lint, tokens, layout check, cards, export) and `tools/catalogue/` (measures, probes, scans, exports) | no |
| Automation | `.github/workflows/ci.yml` | no |
| Not tracked | `dist/`, `exports/`, `.claude/`, `.vscode/`, `.playwright-mcp/`, `node_modules/`, `.superpowers/`, `.scratch/`, `claude-project/` (all in `.gitignore`; `exports/snapshots/` holds the screen snapshots while they are compared, and is emptied after) | no |

The root holds `src/`, `src-tauri/`, `public/`, `docs/`, `tools/` and the settings files. `src/library/` stays in `src/`: it is development-only and the app does not import it.

## The export of the app files

`npm run export:app` (`tools/scripts/export/app.mjs`) copies exactly the app into a clean folder (default `exports/app/`, which git ignores):
- **Included:** `src/` without `*.test.*`, `src/test/`, `src/docs/` and `src/library/` (except the library files the app itself imports); `src-tauri/`; `public/`; `index.html`; `package.json` (the scripts that point at tools removed) and `package-lock.json`; `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`.
- **Left out:** `docs/`, `tools/scripts/`, `tools/catalogue/`, `.github/`, the tests, the library and everything ignored.
- **Proof it is complete:** the command then runs `npm run build` inside that folder. If the app needs a file that was left out, the build fails and says which.
- `App.tsx` loads the library's gallery pages only in development; those lines sit between `dev-only:start` and `dev-only:end` markers, and the export leaves them out.
- `npm run export:app -- --clean` goes further: it installs (`npm ci`) and builds in the exported folder alone, which also proves the dependency list. Without it the build uses this project's `node_modules` (fast).
- `src/styles/tokens/tokens.ts` holds the three corner numbers itself (a test in `src/library/componentTokens.test.ts` keeps them equal to the library's), so the styles do not pull the library into the app.

## The layout to come

Decided (owner, 2026-11-11: "Yes", on the folder report's proposal; the reasons are in the project Library, `2026-11-11-folder-report` and `2026-11-11-app-practice-review`). Today `src/` is grouped by kind of file (`components/`, `framework/`, `services/`, `styles/`), so a change to one card touches four folders; the layout to come groups it by part of the app, and keeps the parts every page uses ready to be shared by other apps. It comes in three steps.

1. **The boundaries (in force since 2026-11-11).** The shared parts import nothing from the pages or the editors, so each can later move unchanged. Shared: `src/components/controls`, `src/hooks`, `src/styles/tokens`, `src/framework`, `src/services`, `src/data`, `src/types`. App: `src/pages` and the rest of `src/components`. `npm run lint:boundaries` (`tools/scripts/lint/boundaries.mjs`) checks it before every commit, in `npm run verify` and on GitHub; the six crossings found when it was written are listed in the script, each to go when its file moves in step 2 (`FoldArrow.tsx` and `consumeKey.ts` into the controls, `railItems.ts` and `notepadPlaces.ts` into the shared logic).
2. **One folder per part, as each page becomes Tiles.** That page's tiles, cards, rules, styles and tests move together; nothing moves before its page is rebuilt.

```
src/
  app/            the shell: routes, header, rails, start-up
  features/
    business-foundation/   its tiles, cards, rules, styles, tests
    financial-foundation/
    identity/ ...
  shared/
    controls/     the shared controls
    tokens/       the colours and sizes
    storage/      IndexedDB and the saved signal
    framework/    the System content reader and the engine
```

3. **Packages, when the Foundation becomes an app of its own.** The shared parts become packages of one repository (npm workspaces), which every app imports, so a fix to a control reaches every app at once.

```
packages/ui          the controls and the tokens
packages/framework   the content reader, the engine, the storage
packages/tools       the layout check, the screen snapshot, the documents' checks
apps/tiles           this app
apps/foundation      the Foundation web app
```

## In short

The app files alone are one command away (`npm run export:app`), the examples exist once, and the working files are under `tools/`.

## The documents folder

`docs/README.md` is the contents of the documents (by chapter) and `docs/index.md` the alphabetical index; both are written by `npm run docs:index`, which also writes a README in each design chapter folder. `docs/standard.md` is the standard every document follows; `npm run docs:standard` checks it.

| Folder | Holds |
|---|---|
| `docs/app/` | The app: contents, index of its places, glossary |
| `docs/design/questionnaire/` | The first version (33), its future features (34), the questions, the lists, the positioning decisions and the research (27 to 41) |
| `docs/design/current/` | What the app is today: the elements, the card structure, shared components, texts, pop-ups, tooltips, reactions, folders (16 to 26) |
| `docs/design/library/` | The assets library, its generated lists and its logs (8 to 15) |
| `docs/design/core/` | The current design of the Foundation, the sources, the research, the log, what is not done, the catalogue record and the structure tables (1 to 7) |
| `docs/ai/` | Rules and references for an assistant |
| `docs/specifications/` | The pages of the Business System and of the Identity System |
| `docs/archive/` | Finished or replaced documents, kept for their information (plans, proposals, the older library log) |

The numbering and the head of a document are in `docs/standard.md`.
