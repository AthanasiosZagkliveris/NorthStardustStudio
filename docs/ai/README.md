# AI knowledge base: `docs/ai/`

Status: **index**, written 2026-08-02, updated 2026-11-21. The map of the knowledge base for AI assistants: which file to read for which task, and what each file owns.

This folder is NorthStardustStudio's shared knowledge for AI assistants (Claude, ChatGPT, or any other coding assistant working on this project). It exists so an assistant does not have to re-derive facts about the code every session. This file is the map. It does not explain any concept itself; every concept below is owned by exactly one other file.

Elsewhere in `docs/`:
- `../README.md`: the contents of every document of the project (design, specifications, archive), with its kind and date; `../index.md`: the alphabetical index of the subjects. Both are written by `npm run docs:index`.
- `../app/01-contents.md`: the contents of the app (how it is entered, the Systems and pages, the places in the code); `../app/02-index.md`: an alphabetical list of its places; `../app/03-glossary.md`: one line per term (framework, app, questionnaire, documents), with a pointer to the document that explains it. Start there to find your way into the product.
- `../design/records/01-log.md`: every change, newest on top, and the only place a change is written; `../design/records/02-not-done-yet.md`: what is still open.
- `../archive/`: proposals that were written and not built, and finished plans; nothing there is a rule.

Documents cite one another by number ("Interface 1" is `../design/interface/01-shared-components.md`); the number is in the file name, whatever the folder.

## Read first, by task

| If you are going to... | Read first | Then |
|---|---|---|
| Do any work at all (every session) | `01-ai-collaboration-rules.md`, `03-toolchain-and-verification-playbook.md` | |
| Change or add something on screen (a table, tile, card, page, control) | `02-review.md` (section 13, the checklist), then grep `09-layout-rules.md` for the name of the thing | `08-card-kinds.md`, `10-layout-assets.md`; from `../design/interface/`: `01-shared-components.md` (use the shared components), `05-reactions.md`, `08-tooltips.md`, `07-popups.md` |
| Judge or review a screen | `02-review.md` (sections 1 to 12, the standard and how to measure it; section 13, the list to tick) | `09-layout-rules.md` |
| Change the Customer Engagement page | `09-layout-rules.md`, section 11 | `08-card-kinds.md` |
| Write or edit a System's content (the Markdown under `src/assets`) | `07-framework-dsl-grammar.md` | `06-framework-conventions-and-patterns.md` |
| Change the framework's code (parser, model, engine, export, notes) | `06-framework-conventions-and-patterns.md` | `04-code-map.md` |
| Find where something is in `src` | `04-code-map.md` | `../app/01-contents.md`, `05-folder-plan.md` (the folders outside `src`) |
| Run a diagnostic or a scan | `../design/records/02-not-done-yet.md`, section 5.9, the known open findings (check it first, add to it) | |

## The files

**Standing rules and procedure**
- `01-ai-collaboration-rules.md`: the standing rules (commit, never push without the owner's yes; no unrequested changes; ask or decide; what "done" requires) and how work flows.
- `03-toolchain-and-verification-playbook.md`: the exact procedure (typecheck, tests, the checks, build, layout check, look) and the list of expected test failures.

**Changing the screens (rules; a check enforces most of them)**
- `09-layout-rules.md`: the measured rulebook of the Foundation pages (tokens, the closed set of sizes, alignment, the reactions per kind, the Inventory) and the automatic layout check that must pass; it also holds how tiles, frames, cards, rails (the page tab) and dialogs are built, the pattern of a floating card of questions (section 8, checked by `npm run check:card`), and the Customer Engagement tables, the Channel resources table and the action markers (section 11).
- `10-layout-assets.md`: the generated numbers of each shared part (rulebook section 19), written from the contracts under `src/library` by `npm run docs:assets`.
- `08-card-kinds.md`: the kinds of card, where each one's code is and how its head is built.
- `02-review.md`: the standard a screen is judged by (type, spacing, controls, colour, tiles, cards, tables, pop-up windows, pages, data), how each is measured and the form of the report (sections 1 to 12), and the checklist to tick before saying done (section 13).

**Changing the content and the code**
- `07-framework-dsl-grammar.md`: the syntax of a System's content files.
- `06-framework-conventions-and-patterns.md`: the non-obvious architectural patterns (cross-Section sharing, auto-ordering, the tabbed layout, the three special-case editors, sources, field keys, the Notepad) and the data model.
- `04-code-map.md`: where things are in `src` (the folders and what is in each), and the rules for a new file.
- `05-folder-plan.md`: the folders of the repository (the app files, the examples, the working files, the exports) and how the app alone is exported; it was document 25.

## How these files relate

Nothing here should duplicate another file's knowledge. If two files seem to say the same thing, flag it rather than trusting whichever was read first. For the look of the Foundation pages, each fact has one home: colours, sizes and breakpoints in `src/styles/tokens/tokens.ts` (generated into the stylesheets), and an asset's geometry, states and variants in its contract under `src/library`. The rulebook, the page specifications and `../design/foundation/01-current-design.md` describe them in words; where one of them disagrees with the code, the latest dated decision wins (`../standard.md`, section 3).

Skills (kept outside this folder) point at files here by path; this folder is the single source of truth they read, and a skill carries no copy of it. Do not move or rename a file here.

## Writing or changing a document

Follow `docs/standard.md`: where the document goes, its number, its head (title and status line), its kind, and how it is written. `npm run docs:standard` checks it, and `npm run docs:check` runs it.
