# Engineering Phase Completion Report

**Project:** North Stardust Studio
**Milestone:** Conclusion of the Engineering Phase; transition to Application Development Mode
**Date:** 2 August 2026
**Reference commit:** `ca1497f` — *Engineering cleanup: fix triad title mismatches, sync docs, drop stray configs*
**Branch:** `framework-v2`

---

## Overview

North Stardust Studio's engineering foundation — Skills, AI knowledge base, verification pipeline, testing infrastructure, Git workflow, and CI — was assembled over a series of Sprint 1 iterations, partly within a sandboxed working environment that was later imported into this repository as a subdirectory. That import left the repository internally inconsistent in ways that were not visible from any single file: engineering documentation described a toolchain and a test suite that did not exist here, four configuration files from the former working root survived as untracked-by-purpose duplicates, and two Markdown content headings had drifted out of alignment with the parser that consumes them.

This cleanup resolved every one of those inconsistencies against direct repository evidence. Its most significant outcome was the discovery that two documented "heading synchronisation" items were in fact user-visible defects: because the Framework interpreter joins each System's three-file content triad by *title* rather than by section number, a mismatched heading silently discarded content at runtime with no error. The milestone matters because it establishes a verified baseline — a repository whose documentation, tooling, tests, and content are all provably consistent with one another — from which all subsequent application development can proceed without first re-deriving what is true.

---

## Scope

This was an engineering maintenance and documentation exercise. It deliberately did not extend into product work.

### Included

- Engineering verification of the complete pipeline (TypeScript, unit tests, production build)
- Repository cleanup and removal of obsolete artifacts
- Documentation synchronisation with the current implementation
- Continuous integration configuration verification
- Engineering documentation updates across `docs/ai/`
- Correction of two verified Markdown content triad defects
- Consolidation of the outstanding findings register

### Excluded

- Feature development
- Architecture redesign
- New functionality
- User interface changes
- Business logic changes
- Reintroduction of historical tooling

**The only user-visible behaviour changes in this milestone were the two verified Markdown triad corrections.** No application code was modified. No component, service, hook, parser, or engine source file was changed.

---

## Engineering Objectives

The cleanup was governed by a fixed set of decision criteria, applied consistently throughout:

1. Work only from direct evidence; verify every conclusion before acting on it.
2. Make the smallest effective change.
3. Prefer correcting existing documentation over creating new documentation.
4. Prefer removing obsolete artifacts over restoring historical infrastructure.
5. Preserve the existing architecture and engineering philosophy.
6. Do not treat a prior reference to a capability as justification for restoring it.

These criteria materially shaped the outcome. Applied to the missing Playwright suite in particular, they produced the opposite conclusion from the one an inventory-based reading of the documentation would have suggested.

---

## Repository Baseline

The engineering snapshot below reflects the repository as of the reference commit. Only technologies actually present are listed.

| Layer | Technology |
|---|---|
| UI framework | React 19.1 |
| Language | TypeScript 5.8 (strict) |
| Build tooling | Vite 7.0 |
| Desktop shell | Tauri 2 |
| Routing | React Router 7.18 |
| Testing | Vitest 4.1 with jsdom |
| Continuous integration | GitHub Actions (Node 22) |
| Icons / typography | lucide-react, Fontsource Inter |
| Content model | Markdown-driven Framework System |
| Engineering knowledge base | `docs/ai/` — nine synchronised reference documents |

### Architectural shape

The application is content-driven rather than code-driven. Its domain comprises 6 Capabilities and 24 Systems, each System authored as a three-file Markdown triad under `src/assets/` (`SystemAnswers/`, `SystemQuestions/`, `SystemHelp/` — 24 files each). Content flows through a single interpretation pipeline:

```
Markdown triad
  → FrameworkInterpreter + AnswerParser
    → FrameworkDocument (Metadata + Introduction + Section[], typed by AnswerType)
      → generic renderers (AnswerRenderer, DynamicTable, FieldRenderer)
        → InterviewSession / InterviewManager
          → ExportContentBuilder → MarkdownExporter | PdfExporter
```

Approximately ten generic renderer components serve all 24 Systems by interpreting `AnswerType`, so adding a System is a content task rather than a code task. Three hand-built editors — Process Library, Operational Log, and Roles Responsibilities — sit outside the generic path over a shared `ProcessRecordValue[]`; the conventions reference documents this as a justified exception rather than a gap.

`FrameworkRegistry` holds raw Markdown for all Systems eagerly but defers parsing until a System is opened, then caches the result. Route-level code splitting in `App.tsx` ensures this cost is not paid on the landing page.

---

## Work Completed

### 1. Framework content triad corrections

**Root cause.** `src/framework/engine/FrameworkInterpreter.ts:146-163` joins a System's Answer, Questions, and Help files by *normalised title*, not by section number, and falls back to `DEFAULT_ANSWER = { type: FreeText }` when a lookup misses. The fallback is silent — no warning, no validation error. A single mismatched heading therefore discards the authored answer structure, the help content, or both, while the application continues to render normally.

**Business System, Section 4.** Repository history shows commit `819d698` renamed Section 4 from "Revenue Streams" to "Revenue Matrix" in both the Answer and Questions files, leaving the Help file unchanged. The canonical title is therefore **Revenue Matrix**, and the Help file was the sole outlier. Its heading was corrected to match.

**Asset System, Section 4.** Repository history shows the Questions file was authored on 26 July with the heading "Assets Summary", while the Answer and Help files were both authored later, on 27 July, with "Summary". The canonical title is therefore **Summary**. Cross-System evidence supports this reading: the Research and Knowledge Systems use qualified section names consistently across their file pairs, the Client and Innovation Systems use the bare form consistently, and the Asset System was the only System whose files disagreed with one another. Correcting the Questions file was also the single-file resolution rather than the two-file one. Its heading was corrected to match.

**Verified effect.** Re-running the interpreter across the content produced the following before-and-after state:

| System / Section | Before | After |
|---|---|---|
| Business §4 | `answer=table`, `blocks=1` (help absent) | `answer=table`, `blocks=2` |
| Asset §4 | `answer=free-text`, `blocks=1` (help absent) | `answer=fixed-variant-text`, `blocks=2` |

Asset Section 4 is authored as Fixed Variant Text with five variants (Key Assets, Active Assets, Update Priorities, Key Takeaway, Next Review). Before the correction it rendered as a single plain free-text box, discarding the authored structure entirely. Both Sections now resolve correctly.

A scan of all 24 Systems confirmed the defect class is fully closed: **no System has an unjoined help block.** Other Sections resolving to free text were verified against their Answer files as legitimately authored that way.

### 2. Removal of obsolete configuration files

Four files under `src/` — `package.json`, `tsconfig.json`, `vite.config.ts`, and `index.html` — were confirmed obsolete through nine independent checks:

| # | Verification | Result |
|---|---|---|
| 1 | Repository-wide reference search | Zero references to any of the four |
| 2 | TypeScript configuration chain | Root config references only `./tsconfig.node.json` |
| 3 | Vite build entry | `dist/index.html` derives from the root `index.html` |
| 4 | TypeScript program membership | `src/vite.config.ts` was compiled as dead application source |
| 5 | `workspaces` field | Absent; not a monorepo |
| 6 | Build output | Single HTML entry produced |
| 7 | Runtime imports | No source file imports `package.json` from `src/` |
| 8 | Git history | Added in `476fb77`; never modified since |
| 9 | Branch comparison | Absent from `main` entirely |

The decisive structural evidence is the difference in entry points: `src/index.html` loads `/main.tsx`, whereas the root `index.html` loads `/src/main.tsx`. That single distinction identifies `src/` as a former standalone application root, imported wholesale in commit `476fb77` along with its own build configuration.

Beyond redundancy, these files carried a concrete risk: `src/tsconfig.json` set `noUnusedLocals` and `noUnusedParameters` to `false`, against the root configuration's `true`. Any editor or tool resolving the *nearest* configuration from a source file therefore applied weaker checking than CI enforces, allowing unused-symbol errors to surface only after push.

All four were removed. TypeScript compilation and the production build were re-verified immediately afterwards and both pass.

### 3. Resolution of the Playwright verification question

Repository history establishes that **no `verify_*.mjs` script has ever existed in this repository**, on any branch, in any commit. Playwright has never been a declared dependency. The suite referenced throughout the engineering documentation belonged to the prior sandboxed environment and was never part of this codebase.

This finding reversed an earlier working assumption. An initial repository assessment had characterised the absent suite as the project's most significant blocking issue, on the basis that documentation referenced it extensively. Repository history confirms that framing was incorrect: the artifacts were never removed, because they were never present. The current Vitest and CI strategy, introduced on 2 August in commit `2fccc47`, is the more recent engineering decision and supersedes the sandbox suite rather than being an incomplete substitute for it.

Reconstructing ten historical scripts was accordingly rejected. Independent of the environment question, the documentation itself recorded five of those ten as failing due to stale assertions — outdated placeholder text, superseded layouts, and a sub-pixel comparison already classified as rendering jitter — and offered no root cause for four others.

**No Playwright tooling was introduced.** Documentation references to the suite were removed instead.

### 4. Outstanding findings consolidation

The findings register was reduced to entries that are current, actionable, and correctly referenced.

**Closed — resolved by this milestone (2):** Business System Section 4 and Asset System Section 4, both fixed and re-verified.

**Closed — obsolete (2):** the entries concerning `framework/README.md` and `framework/ARCHITECTURE.md`. Both files were deleted in commit `476fb77` on 28 July, before the findings that describe them were written; the findings targeted files that no longer existed.

**Retained (3):**

- **`useListAutoFormat` cursor positioning.** Confirmed still open, with line references re-verified as exact (`src/hooks/useListAutoFormat.ts:306-329`). The block-paste branch derives `pendingSelection` from the bullet-normalisation delta alone, while committing the renumbered string, so a paste whose renumbering crosses a digit-count boundary lands the cursor mid-word. Encoded as an `it.fails` regression test, which keeps the suite green while guaranteeing the fix is detected when it lands.
- **`react-router` advisory.** GHSA-qwww-vcr4-c8h2, reproduced verbatim via `npm audit`. Specific to React Server Components mode; this application is a client-only Vite and Tauri SPA, so real exposure is low. The available remediation is a breaking downgrade requiring deliberate compatibility assessment.
- **`.vscode/extensions.json` excluded by `.gitignore`.** A one-time onboarding inconvenience rather than a correctness risk.

A mechanical check across all nine `docs/ai/` documents confirmed that **every repository path referenced now resolves to a real file** — 34 references verified. One token, `SKILL.md`, denotes the Skill file format rather than a repository path and is correct as written.

---

## Verified Results

All results below were produced by direct execution against the reference commit.

| Verification | Result | Detail |
|---|---|---|
| TypeScript | **Pass** | `npx tsc --noEmit`, exit 0, clean |
| Unit tests | **Pass** | `npm test` — 3 passed, 1 expected fail |
| Production build | **Pass** | `npm run build`, exit 0 |
| CI configuration | **Pass** | Diff is comment-only; workflow logic byte-identical |
| Dependency integrity | **Pass** | `npm ci --dry-run`, exit 0 — lockfile and manifest in sync |
| Git working tree | **Clean** | No modified, staged, or untracked files |
| Documentation consistency | **Pass** | 34 path references verified; zero references to absent infrastructure |

The single expected unit-test failure is the documented `it.fails` entry for the `useListAutoFormat` cursor defect. It is intentional: the marker runs the real assertions and reports currently-broken behaviour as a pass, so the suite stays green as a hard gate, while an eventual genuine fix converts it into a visible, un-ignorable failure that signals the entry can be closed.

### Recorded warnings

Warnings are reported separately from failures. None blocks development.

- **`npm audit`** — two high-severity `react-router` advisories, corresponding to the tracked finding above. Unchanged by design.
- **`npm ci`** — advisory notice that `esbuild@0.28.1` carries uncovered install scripts. Pre-existing; applies identically in CI.
- **Git line endings** — LF to CRLF conversion notices on Windows. Cosmetic; no `.gitattributes` change was made, as this fell outside scope.
- **CI execution** — the workflow was verified by configuration review and by executing its three exact commands locally. It was not observed running on GitHub, as the `gh` CLI is unavailable in the verification environment. This distinction is recorded rather than glossed.

---

## Documentation Improvements

Four documents were synchronised with the repository. In every case the correction removed obsolete material rather than adding new material.

| Document | Change | Rationale |
|---|---|---|
| `docs/ai/environment-and-toolchain-playbook.md` | Removed the sync step, preview-server commands, and Playwright steps; renumbered the procedure to 1–5; replaced step 4 with the supported way to run the application; corrected the layout section, CI section, two failure-mode entries, and the stability note | Described a Linux sandbox toolchain and a test suite that have never existed in this repository |
| `docs/ai/verification-and-regression-playbook.md` | Removed all ten `verify_*.mjs` entries; retained the `it.fails` entry unchanged | Those scripts do not exist. The document's own reasoning holds that an out-of-date known-failures list is worse than none, because it invites dismissing a real regression as already known |
| `docs/ai/ai-collaboration-rules.md` | Corrected the assertion that no tool in the environment can run `git commit`; redirected ambiguous-decision logging to the existing references | The first claim was factually incorrect and load-bearing. The second pointed at a Decision Log that was never created |
| `.github/workflows/ci.yml` | Comment-only correction: step numbering and removal of the Playwright reference | Left uncorrected, the repository would continue to reference a suite that never existed. Workflow logic was not altered |

### Content deliberately preserved

Verification confirmed the following claims remain accurate; they were left untouched:

- The `it.fails` rationale in the verification playbook
- The jsdom and `vitest.config.ts` separation explanation
- The "CI is a floor, not a replacement" reasoning
- The filename inconsistency warning — re-confirmed: System 22's Answer and Help files use a literal `&` while its Questions file spells out "And"
- The hardcoded section-number caution — re-confirmed present at `src/pages/Conversation.tsx:75,87,88`
- All engineering philosophy across every document

### Decision recorded: the Decision Log

The `ai-collaboration-rules.md` instruction to log ambiguous decisions referenced a Decision Log that had never been created. Two resolutions were available: create the file, or revise the instruction. The instruction was revised to direct such records into whichever `docs/ai/` reference already owns the relevant subject area, consistent with the established principle of correcting existing documentation in preference to creating new documentation, and with the knowledge base's own rule that knowledge belongs beside its subject rather than in a parallel history. This decision is reversible in a single edit should a dedicated log later prove necessary.

---

## Repository Changes

All changes were delivered in commit `ca1497f`.

**Modified (7)**

- `src/assets/SystemHelp/04_BusinessSystemHelp.md` — one heading
- `src/assets/SystemQuestions/13_AssetSystemQuestions.md` — one heading
- `docs/ai/environment-and-toolchain-playbook.md`
- `docs/ai/verification-and-regression-playbook.md`
- `docs/ai/ai-collaboration-rules.md`
- `docs/ai/outstanding-findings.md`
- `.github/workflows/ci.yml` — comments only

**Deleted (4)**

- `src/package.json`
- `src/tsconfig.json`
- `src/vite.config.ts`
- `src/index.html`

**Aggregate:** 11 files changed, 32 insertions, 131 deletions. Of these, the documentation and content edits account for 32 insertions and 61 deletions; the remaining 70 deletions are the four obsolete configuration files. The engineering ecosystem was reduced in size, not expanded — no new file, dependency, Skill, process, or tool was introduced.

**Verification artifacts:** temporary diagnostic probes used to confirm interpreter behaviour were removed after each use; a path-verification script was kept outside the repository. `git status --porcelain -uall` confirms no stray files remain.

---

## Lessons Learned

Each observation below is supported by evidence produced during this cleanup.

**Documentation must evolve alongside implementation.** All nine `docs/ai/` files were committed in a single commit on 2 August, describing an environment that had already been restructured on 28 July. The drift was not gradual; it was introduced wholesale at the moment of import. Documentation authored about one environment and committed into another is stale on arrival.

**Repository history should be verified before assumptions are made.** The most consequential correction in this milestone came from a single history query. Documentation referenced the Playwright suite extensively enough that its absence read as a regression; `git log --all` established that it had never existed here. Restoring it would have rebuilt infrastructure for an environment that no longer exists, against assertions already documented as stale.

**Small documentation inconsistencies can create user-visible defects.** Two heading mismatches, recorded as content-synchronisation items, were in fact silently discarding authored structure and help content at runtime. The gap between how they were classified and what they actually did was the difference between a cosmetic nit and a section rendering the wrong editor entirely.

**Silent fallbacks convert small errors into invisible ones.** The interpreter's title-based join degrades gracefully by design, substituting a default answer when a lookup misses. That graceful degradation is precisely why two defects survived undetected — the application never signalled that anything was wrong.

**Dead configuration files increase maintenance complexity and can weaken guarantees.** The four obsolete files were not merely redundant. One of them relaxed compiler strictness relative to the configuration CI enforces, creating a silent divergence between local and enforced standards.

**Diagnostic tooling is only as useful as the triage that follows it.** The `metadata-relationship-validator` Skill correctly identified both content defects. The failure was downstream: they were classified as cosmetic and left unfixed. Detection without accurate severity assessment does not prevent defects from shipping.

**Evidence-driven engineering produces smaller changes.** Applying the stated decision criteria consistently resulted in a net reduction across the repository. Every scoped issue was resolved by correcting or removing something, and none required new infrastructure.

---

## Future Engineering Considerations

The items below are **optional enhancements, not outstanding defects.** None blocks application development, and none should be actioned speculatively. Each is recorded so that if corroborating evidence arises during real development, the reasoning does not need to be re-derived.

1. **No architecture document currently exists.** Both `framework/README.md` and `framework/ARCHITECTURE.md` were deleted on 28 July and never replaced, which leaves the `architecture-doc-maintainer` Skill without a target file. Either authoring a genuine architecture document or narrowing the Skill's declared scope would restore consistency.

2. **The framework layer has no unit test coverage.** `src/framework/parser/` and `src/framework/engine/` together comprise 5,827 lines of largely deterministic logic, none of it currently covered by tests. This layer is unusually inexpensive to test, requiring no browser and no rendering. The diagnostic probe written during this cleanup identified two real defects within minutes, which suggests the return on targeted coverage here would be high.

3. **The silent title-join fallback could be made observable.** The mechanism that allowed two authoring errors to reach users remains in place. The `metadata-relationship-validator` Skill already detects this class of problem on demand. Should a third instance occur during real content work, that would constitute evidence for moving the check into code as a validation error.

4. **Business System Section 4 help prose.** The help body still opens with "Revenue Streams identify the actual sources…" beneath the corrected "Revenue Matrix Help" heading. This is editorial content rather than structure, and was deliberately left for an author's decision.

5. **Branch topology.** `framework-v2` is 57 commits ahead of `main`, and `main` holds no commits the branch lacks — a perfectly linear relationship with no divergence. Because CI's pull-request trigger targets `main` alone, that gate has not yet been exercised; the push trigger currently performs all verification. Fast-forwarding `main` to `framework-v2` and retaining `main` as the default branch would restore the pull-request gate's purpose without risk of conflict. **This is a recommendation only. No branch or repository settings were modified.**

---

## Final Repository Status

```text
Engineering Phase        Completed
Working Tree             Clean
Documentation            Synchronized
Continuous Integration   Operational
TypeScript               Passing
Unit Tests               Passing
Production Build         Passing
Outstanding Issues       Only documented, verified, non-blocking items remain
Project Status           Ready for Application Development
```

---

## Conclusion

The Engineering Phase is complete.

The repository, its engineering documentation, CI workflow, testing pipeline, Git workflow, and project structure are internally consistent and verified against direct evidence. Every scoped issue was resolved or explicitly justified: two user-visible content defects are fixed and confirmed across all 24 Systems, four obsolete files are proven obsolete and removed with the build and typecheck still passing, the documentation now describes the repository that actually exists, and every remaining finding is current, actionable, and correctly referenced.

North Stardust Studio now has a stable engineering baseline. Its documentation can be trusted as a starting point rather than treated as a hypothesis requiring verification, which is the practical measure of whether an engineering foundation is finished.

All subsequent work proceeds in **Application Development Mode**. Future effort should focus on the application itself — user experience, workflows, feature completeness, reliability, and long-term maintainability. The engineering ecosystem is to be treated as stable infrastructure and should evolve only where evidence arising from real application development demonstrates a genuine need, never through speculative improvement. Where such evidence does appear, the established procedure applies: identify the problem precisely, explain why the existing ecosystem cannot address it, weigh the benefit against the added complexity, and adopt the smallest sufficient improvement.
