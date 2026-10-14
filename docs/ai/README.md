# AI Knowledge Base — docs/ai/

This folder is NorthStardustStudio's shared knowledge for AI assistants (Claude, ChatGPT, or any other coding assistant working on this project). It exists so an assistant doesn't have to re-derive facts about this codebase from source every session. This file is the map — it doesn't explain any project concept itself; every concept below is owned by exactly one other file.

## Read this first, every session

1. **`ai-collaboration-rules.md`** — standing behavioral rules (when to push automatically, when to ask before acting, what "done" requires). Short, meant to be re-read every session.
2. **`environment-and-toolchain-playbook.md`** — the exact toolchain procedure: sync, typecheck, build, preview, verify.

## Read these when the task needs them

- **`framework-dsl-grammar.md`** — authoring or editing a System's content? Read this before touching any Markdown file.
- **`framework-conventions-and-patterns.md`** — the non-obvious architectural patterns (cross-Section sharing, auto-ordering, the tabbed layout, the three justified special-case editors) and the data model. Read alongside the grammar reference for any non-trivial content change.
- **`layout-rules.md`** — changing how a Foundation page's cards, fields or lists are laid out? The measured rulebook (tokens, the closed set of sizes, alignment, interactions) and the automated layout check that must pass.
- **`tile-and-card-pattern.md`** — how tiles, cards, rails (the page tab) and dialogs are built, and the rules that are global. Read it with `layout-rules.md` when changing a tile, a card or a rail.
- **`card-kinds.md`** — the list of the kinds of card, where each one's code is and how its head is built.
- **`verification-and-regression-playbook.md`** — after any change, before calling it done. Contains the living list of currently-known expected test failures and why each one is expected.
- **`outstanding-findings.md`** — before running a diagnostic Skill (`metadata-relationship-validator`, `architecture-doc-maintainer`), check here first for anything already confirmed in the same area. Contains the living list of real, confirmed problems a diagnostic Skill found but wasn't authorized to fix in that turn — the same "living record" pattern as the verification playbook's known-failures list, generalized to any diagnostic finding instead of just automated test results.

## Read these for orientation or vocabulary, not step-by-step instructions

- **`ai-development-methodology.md`** — how a change is expected to flow end to end (request → implement → validate → integrate), how AI assistants should load context progressively, and when new reusable knowledge should be created versus reused. Read this when building or evolving a Skill, not for routine tasks.
- **`glossary.md`** — fast lookup for project-specific terms (System, Section, Field, dynamicSource, Pack, Skill, and others). Each entry is one line plus a pointer to whichever file above actually explains it in depth.

## How these files relate

Nothing in this folder should duplicate another file's knowledge. `glossary.md` points into the technical references rather than re-explaining them; `ai-development-methodology.md` points at `ai-collaboration-rules.md` for turn-level rules rather than restating them. If two files ever seem to say the same thing, that's a bug in the knowledge base — flag it rather than trusting whichever one was read first. For the look of the Foundation pages, each fact has one home: colours, sizes and breakpoints in `src/styles/tokens/tokens.ts` (generated into the stylesheets), and an asset's geometry, states and variants in its contract under `src/library`. The rulebook, `tile-and-card-pattern.md`, the page specifications and `docs/design/01-current-design.md` describe them in words; where one of them disagrees with the code, the code is right and the document is the one to fix.

## Relationship to the AI Skills library

Skills (delivered separately, outside this folder) reference specific files here by path — for example, `framework-content-author` reads the DSL grammar and conventions references before authoring content; `regression-verifier` reads the toolchain and verification playbooks. This folder is the single source of truth those Skills consume; a Skill should never carry a copy of anything that belongs here.

## The app's own map

- **`app-guide.md`**: where each part of the app is, what it is for and what it holds (systems, pages, Global Settings, the Calendar, the tile and card pattern), with the code locations. Start here to find your way in the product.
