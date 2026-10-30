# Outstanding Findings

Status: **living list**, updated 2026-10-29 (the three entries were re-checked on that date).

A durable, living record of real problems a diagnostic Skill found but did not fix — because fixing wasn't explicitly authorized in that turn, per `ai-collaboration-rules.md`. Without this file, a confirmed finding exists only in one conversation's history and is lost the moment a new session starts; this file exists so it doesn't have to be rediscovered by re-running the same scan later. Any Skill whose job is to diagnose (not author or fix) should record what it finds here, not let it evaporate at the end of its report.

## How this file works

- A diagnostic Skill appends an entry here when it confirms a real problem and isn't authorized to fix it in the same turn.
- An entry is removed (not just marked done) once the underlying problem is actually fixed and re-verified — this file tracks what's still true, not a permanent history log.
- Before starting a new diagnostic scan, check here first for anything already confirmed in the same area — don't re-derive a finding that's already recorded, but do re-verify it's still accurate if the relevant file has changed since. A scan of an area with an existing entry confirms or corrects that entry; it does not add a second one beside it, and no entry is left stale.

## Entry format

`### <short title>` — Found by: `<Skill name>` · Confirmed: `<what was independently verified, not just what a scan reported>` · Fix: `<what the correct fix is, if known>`

## Currently open

### `useListAutoFormat` — cursor lands mid-word after a paste whose renumbering crosses a digit-count boundary

Found by: `code-reviewer`. Confirmed (independently re-verified against source, not taken on the reviewing agent's word alone): `src/hooks/useListAutoFormat.ts:309-330`, the block-paste branch of `handleChange`, computes `pendingSelection.current = cursor + (normalizedInserted.length - insertedText.length)` — a delta that only accounts for `normalizeBulletLines`'s output — while the value actually committed via `onChange` two lines later is `rewritten = renumberNumberedBlocks(candidateValue)`, not `candidateValue` itself. Pasting a numbered block that continues an existing run past a digit-count boundary (e.g. pasting "1. New X\n2. New Y" directly after an existing "9. Item I" line, so renumbering produces "10. New X\n11. New Y") grows the pasted text by one character per renumbered line — growth `pendingSelection` never accounts for — so the `useLayoutEffect`'s `setSelectionRange` lands the cursor mid-word instead of at the end of the paste. Now encoded as an executable regression test marked `it.fails` — `src/hooks/useListAutoFormat.test.tsx`, `keeps the cursor at the end of a pasted numbered block whose renumbering adds a digit` (see `toolchain-and-verification-playbook.md`) — so `npm test` and CI both stay fully green today, and this entry can be removed the moment the fix lands and that same test starts reporting as an (expected, un-ignorable) failure, rather than needing a manual re-check. Fix: derive `pendingSelection` from the actual `rewritten` string (re-diff `nextValue` vs. `rewritten`, or track a target line/column and re-resolve its index within `rewritten` after renumbering) instead of only compensating for the bullet-normalization delta.

### `npm audit`: two high-severity advisories in development dependencies

Found by: `npm audit`. Confirmed (2026-10-29): `npm audit` reports `nanoid` below 3.3.18 (GHSA-2v37-7h3g-55p8, custom generators can loop when the size is zero) and `source-map-js` 1.0.0 to 1.2.1 (GHSA-68fv-2mgg-jv7q, event-loop denial of service through source-map section offsets); `npm audit --omit=dev` reports 0, so neither ships with the app (they come in through the build tooling). The earlier `react-router` advisory is gone: the lock file resolves 7.18.4. Fix: `npm audit fix` (the report says a fix is available); run the verify steps in `toolchain-and-verification-playbook.md` after it.

### `.vscode/extensions.json` is gitignored, so its recommendation is never actually shared

Found by: a review of the IDE-layer tooling (direct inspection). Confirmed: `.gitignore` excludes the whole `.vscode/` folder wholesale; `.vscode/extensions.json` (which recommends `tauri-apps.tauri-vscode` and `rust-lang.rust-analyzer`) exists locally but is untracked by git, so cloning this repo fresh — the actual real-world case this file exists to help with — never surfaces that recommendation. Low priority (a one-time inconvenience, not a correctness risk), recorded for completeness rather than urgency. Fix: add `!.vscode/extensions.json` (and, if wanted, `!.vscode/settings.json` for any genuinely shared workspace settings) as an exception line in `.gitignore`, immediately after the existing `.vscode/` line — the common, standard pattern for sharing recommended extensions while still ignoring personal editor state.
