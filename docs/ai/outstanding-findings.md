# Outstanding Findings

A durable, living record of real problems a diagnostic Skill found but did not fix — because fixing wasn't explicitly authorized in that turn, per `ai-collaboration-rules.md`. Without this file, a confirmed finding exists only in one conversation's history and is lost the moment a new session starts; this file exists so it doesn't have to be rediscovered by re-running the same scan later. Any Skill whose job is to diagnose (not author or fix) should record what it finds here, not let it evaporate at the end of its report.

## How this file works

- A diagnostic Skill appends an entry here when it confirms a real problem and isn't authorized to fix it in the same turn.
- An entry is removed (not just marked done) once the underlying problem is actually fixed and re-verified — this file tracks what's still true, not a permanent history log.
- Before starting a new diagnostic scan, check here first for anything already confirmed in the same area — don't re-derive a finding that's already recorded, but do re-verify it's still accurate if the relevant file has changed since.

## Entry format

`### <short title>` — Found by: `<Skill name>` · Confirmed: `<what was independently verified, not just what a scan reported>` · Fix: `<what the correct fix is, if known>`

## Currently open

### Business System, Section 4 — Help title out of sync with Answer/Questions

Found by: `metadata-relationship-validator`. Confirmed: `assets/SystemAnswers/04_BusinessSystemAnswer.md:40` and `assets/SystemQuestions/04_BusinessSystemQuestions.md:28` both read "Revenue Matrix"; `assets/SystemHelp/04_BusinessSystemHelp.md:24` still reads "Revenue Streams Help". Fix: rename the Help Section 4 heading to "Revenue Matrix Help" to match the other two files (two-against-one split — Help is the outlier).

### Asset System, Section 4 — Questions title out of sync with Answer/Help

Found by: `metadata-relationship-validator`. Confirmed: `assets/SystemAnswers/13_AssetSystemAnswer.md:45` and `assets/SystemHelp/13_AssetSystemHelp.md:24` both read "Summary"; `assets/SystemQuestions/13_AssetSystemQuestions.md:30` reads "Assets Summary". Fix: rename the Questions Section 4 heading to "Summary" to match the other two files (two-against-one split — Questions is the outlier); confirm with the developer if "Assets Summary" was actually the intended title instead, since content alone doesn't settle which side is authoritative.

### `framework/README.md` — multiple claims stale against actual code

Found by: `architecture-doc-maintainer`. Confirmed (all verified directly against source, not assumed): claims a `src/` path that doesn't exist; claims Framework Markdown lives under `assets/OrganizationalSystems/` (the real folders are `assets/SystemAnswers/`, `SystemQuestions/`, `SystemHelp/`); lists a module structure (`interpreter/`, `validator/`, `exporter/`) that's been reorganized into `framework/engine/`, while real folders `framework/parser/` and `framework/application/` go unmentioned; claims capability generation, System Selection UI support, and PDF layout are out of scope, contradicted by `framework/engine/CapabilityDescriptions.ts` and `framework/engine/PdfExporter.ts` living inside `framework/` today. Fix: rewrite in place with corrected paths, module list, and scope — an edit, not a replacement.

### `useListAutoFormat` — cursor lands mid-word after a paste whose renumbering crosses a digit-count boundary

Found by: `code-reviewer`. Confirmed (independently re-verified against source, not taken on the reviewing agent's word alone): `hooks/useListAutoFormat.ts:306-329`, the block-paste branch of `handleChange`, computes `pendingSelection.current = cursor + (normalizedInserted.length - insertedText.length)` — a delta that only accounts for `normalizeBulletLines`'s output — while the value actually committed via `onChange` two lines later is `rewritten = renumberNumberedBlocks(candidateValue)`, not `candidateValue` itself. Pasting a numbered block that continues an existing run past a digit-count boundary (e.g. pasting "1. New X\n2. New Y" directly after an existing "9. Item I" line, so renumbering produces "10. New X\n11. New Y") grows the pasted text by one character per renumbered line — growth `pendingSelection` never accounts for — so the `useLayoutEffect`'s `setSelectionRange` lands the cursor mid-word instead of at the end of the paste. Now encoded as an executable regression test marked `it.fails` — `src/hooks/useListAutoFormat.test.tsx`, `keeps the cursor at the end of a pasted numbered block whose renumbering adds a digit` (see `verification-and-regression-playbook.md`) — so `npm test` and CI both stay fully green today, and this entry can be removed the moment the fix lands and that same test starts reporting as an (expected, un-ignorable) failure, rather than needing a manual re-check. Fix: derive `pendingSelection` from the actual `rewritten` string (re-diff `nextValue` vs. `rewritten`, or track a target line/column and re-resolve its index within `rewritten` after renumbering) instead of only compensating for the bullet-normalization delta.

### `react-router` — known high-severity advisory in the resolved dependency range

Found by: `npm audit`, run while adding unit-test tooling this iteration (not a project-content or documentation scan — recorded here anyway, since it's a real, confirmed, unfixed finding with nowhere else to live). Confirmed: `npm audit` against the current `package-lock.json` reports `react-router` (pulled in transitively by `react-router-dom@^7.18.1`) resolves within `7.12.0 - 8.2.0`, matching GHSA-qwww-vcr4-c8h2 ("RSC Mode CSRF Bypass Allows Action Execution Before 400 Response"). Caveat, also confirmed by reading the advisory: it's specific to React Server Components mode; this app is a client-only Vite/Tauri SPA with no RSC or server usage, so the advisory's actual exploitability here is unconfirmed and likely low — flagging it as a known finding to track, not as an urgent/exploitable one. Fix: `npm audit fix --force` resolves to `react-router-dom@7.11.0`, which `npm` itself flags as a breaking downgrade from the currently pinned `^7.18.1` — needs a deliberate version-compatibility check (what actually changed between 7.11 and 7.18 that the app depends on), not a blind `--force`, before applying.

### `ai-collaboration-rules.md` references a "Decision Log" that doesn't exist

Found by: this iteration's ecosystem review (direct inspection, not a Skill's automated scan). Confirmed: `docs/ai/ai-collaboration-rules.md`'s "When genuinely unsure" section instructs logging ambiguous-decision resolutions "in the Decision Log," but no file by that name (or any file serving that purpose) exists anywhere in `docs/ai/` — confirmed by listing the folder. Every ambiguous decision resolved so far in this project's AI-assisted work has therefore had nowhere to actually be logged, silently defeating the stated purpose ("so the same question doesn't need to be re-asked in a future session"). Fix: either create a minimal `decision-log.md` (a living, append-only record, same shape as the Playbooks) and wire it into `README.md`'s navigation, or — if no ambiguous decision has actually needed logging yet — soften the rule's wording until one does, rather than pointing at a document that was never built. Needs a decision on which, not just an edit.

### `.vscode/extensions.json` is gitignored, so its recommendation is never actually shared

Found by: this iteration's ecosystem review (direct inspection while checking IDE-layer tooling). Confirmed: `.gitignore` excludes the whole `.vscode/` folder wholesale; `.vscode/extensions.json` (which recommends `tauri-apps.tauri-vscode` and `rust-lang.rust-analyzer`) exists locally but is untracked by git, so cloning this repo fresh — the actual real-world case this file exists to help with — never surfaces that recommendation. Low priority (a one-time inconvenience, not a correctness risk), recorded for completeness rather than urgency. Fix: add `!.vscode/extensions.json` (and, if wanted, `!.vscode/settings.json` for any genuinely shared workspace settings) as an exception line in `.gitignore`, immediately after the existing `.vscode/` line — the common, standard pattern for sharing recommended extensions while still ignoring personal editor state.

### `framework/ARCHITECTURE.md` — mislabeled, not an architecture document

Found by: `architecture-doc-maintainer`. Confirmed: ~90% of the file's 13,720 lines is a verbatim pasted PDF-to-Markdown conversion prompt/chat log (includes a literal Greek chat-UI timestamp and a stray conversational aside), not documentation prose. The final ~380 lines resemble architecture writing but are themselves already stale (same drift as `framework/README.md`) and use non-canonical terminology. Fix: relabel/relocate this file's actual content (it's a content-conversion log, not architecture) and author a real `ARCHITECTURE.md` from what's true today — a replacement, not an edit.

## Stability

Expected to grow and shrink irregularly — a new entry whenever a diagnostic Skill confirms something it can't fix in-turn, and an entry removed whenever a fix lands and gets re-verified. Never let an entry go stale silently; if a diagnostic Skill re-scans an area with an existing entry, it should confirm or correct that entry, not just add a new one alongside it.
