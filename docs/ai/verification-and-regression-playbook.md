# Verification & Regression Playbook

Status: **playbook**, updated 2026-08-02.

The procedure lives in the Environment & Toolchain Playbook. This file is the part that actually saves time: a maintained, reasoned record of which test failures are expected and why — so that reasoning doesn't get re-derived from scratch on every verification run. Read this *before* concluding any red result is a real regression, and *before* concluding a green run means nothing needs a second look.

## How to use this file

1. Run the verification pipeline.
2. For every failure, check this list first.
3. If it's listed and the reason still applies to the current change, note it as expected and move on.
4. If it's listed but the *reason no longer clearly applies* (e.g. the file it concerns was just touched by this change), don't trust the old entry blindly — re-verify.
5. If it's a new failure, root-cause it before shipping: read what the assertion actually checks, and decide whether the app is wrong or the assertion's assumption is stale. Only add it below once you're confident which.
6. Update this list in the same session you triage a failure — an out-of-date list is worse than no list, because it invites waving away a real new regression as "probably another known one."

**Preferred long-term form:** where practical, encode a known-expected failure as an inline marker in the test file itself (`it.fails`, or a comment on the assertion), not only as a line here — code-level annotations drift out of sync less easily than a separate document does. This file remains the authoritative index either way (the reasoning belongs somewhere greppable and human-readable regardless of what the test file itself does).

## Currently known expected failures

**Unit tests (`npm test`):**
- `src/hooks/useListAutoFormat.test.tsx` → `keeps the cursor at the end of a pasted numbered block whose renumbering adds a digit` — marked `it.fails`, not a plain `it` and not `it.skip`. It documents a confirmed, real bug (full description and fix in `docs/ai/outstanding-findings.md`, "`useListAutoFormat` — cursor lands mid-word after a paste whose renumbering crosses a digit-count boundary"), not a stale assertion — don't "fix" this by loosening the assertion. `it.fails` runs the real assertions and reports the *current, still-broken* behavior as an overall PASS, which is why `npm test` and CI stay fully green today despite this being a real, open bug — the moment the underlying fix lands, these assertions start succeeding, and `it.fails` turns that into a visible FAILURE (an unexpectedly-passing "expected to fail" test). That failure is the signal to remove the `.fails` modifier and close this entry — don't remove either one preemptively.

That is the complete list. `npm test` is otherwise expected to be fully green, and CI enforces it on every push.

## Stability

This is the fastest-changing file in the reference set, and that's expected — it should gain roughly one short entry per verification pass that finds something new to triage, and shrink an entry only if a "known failure" gets genuinely fixed (at which point remove it, don't leave a stale note).
