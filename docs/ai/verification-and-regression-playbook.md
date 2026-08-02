# Verification & Regression Playbook

The procedure lives in the Environment & Toolchain Playbook. This file is the part that actually saves time: a maintained, reasoned record of which `verify_*.mjs` failures are expected and why — so that reasoning doesn't get re-derived from scratch on every regression run. Read this *before* concluding any red result is a real regression, and *before* concluding a green suite means nothing needs a second look.

## How to use this file

1. Run the full suite.
2. For every failure, check this list first.
3. If it's listed and the reason still applies to the current change, note it as expected and move on.
4. If it's listed but the *reason no longer clearly applies* (e.g. the file it concerns was just touched by this change), don't trust the old entry blindly — re-verify.
5. If it's a new failure, root-cause it before shipping: read what the assertion actually checks, and decide whether the app is wrong or the assertion's assumption is stale. Only add it below once you're confident which.
6. Update this list in the same session you triage a failure — an out-of-date list is worse than no list, because it invites waving away a real new regression as "probably another known one."

**Preferred long-term form:** where practical, encode a known-expected failure as an inline marker or skip annotation in the `verify_*.mjs` file itself, not only as a line here — code-level annotations drift out of sync less easily than a separate document does. This file remains the authoritative index either way (the reasoning belongs somewhere greppable and human-readable regardless of what the test file itself does).

## Currently known expected failures

**Unit tests (`npm test`):**
- `src/hooks/useListAutoFormat.test.tsx` → `keeps the cursor at the end of a pasted numbered block whose renumbering adds a digit` — marked `it.fails`, not a plain `it` and not `it.skip`. It documents a confirmed, real bug (full description and fix in `docs/ai/outstanding-findings.md`, "`useListAutoFormat` — cursor lands mid-word after a paste whose renumbering crosses a digit-count boundary"), not a stale assertion — don't "fix" this by loosening the assertion. `it.fails` runs the real assertions and reports the *current, still-broken* behavior as an overall PASS, which is why `npm test` and CI stay fully green today despite this being a real, open bug — the moment the underlying fix lands, these assertions start succeeding, and `it.fails` turns that into a visible FAILURE (an unexpectedly-passing "expected to fail" test). That failure is the signal to remove the `.fails` modifier and close this entry — don't remove either one preemptively.

**Pre-existing (predate the current round of changes — root cause not re-derived in this pass; confirm still valid before relying on this entry, and backfill the specific reason the next time one of these is actually investigated):**
- `verify_business_changes.mjs`
- `verify_round10_changes.mjs`
- `verify_round16_oplog.mjs`
- `verify_round3_calendar_frequency_dates.mjs`

**From the most recent content-standardization round — each confirmed to fail for a stated, intentional reason, not a bug:**
- `verify_finance_stakeholder.mjs` — asserts the old stacked Multi-Part Financial Model layout and a separate 4-part Financial Risk structure; both were deliberately restructured (tab group, single table). Also asserts a "Communication Frequency" header that was deliberately renamed to "Frequency".
- `verify_handbook_t_card.mjs` — asserts a textarea grows taller under a specific sample text length; that sample no longer wraps past two lines at the app's new, deliberately wider layout. Confirmed the underlying auto-grow behavior still works correctly with longer text — the assertion's fixture text is stale, not the feature.
- `verify_round16_fixes.mjs` — asserts sub-pixel (<1px) alignment between two independently-laid-out tables; traced to a shared width constant that's clamped to a fixed value regardless of the (also intentionally changed) column label text, so the constant itself is provably unaffected. Reads as rendering jitter, not a regression.
- `verify_round19_notes_placeholder.mjs`, `verify_round20_framework_notes_columns.mjs` — both assert the old "Add a note (optional)" placeholder text, which was deliberately changed to drop "(optional)".

## Stability

This is the fastest-changing file in the reference set, and that's expected — it should gain roughly one short entry per verification pass that finds something new to triage, and shrink an entry only if a "known failure" gets genuinely fixed (at which point remove it, don't leave a stale note).
