# AI Collaboration Rules

Status: **rules**, updated 2026-08-02.

Standing rules for any AI assistant working on this project. These come from explicit developer instruction, not inference — treat them as binding, not as defaults to weigh against convenience.

## Always

- **Push finished changes automatically, without being asked.** Once a change is verified (see Verification & Regression Playbook), deliver it and write it back to the developer's project files in the same turn it's finished. Don't wait for a separate "go ahead."
- **"Push" means committed, not just written to disk.** Writing a file back to the developer's project folder is not the end state — an uncommitted working-tree change has no history, isn't on the GitHub remote, and can be silently discarded by an unrelated later git operation (a checkout, a stash, a discard-changes click) with no warning that it happened. Confirmed happening once already: a fully-verified, already-delivered `package.json` change was lost this way, and nothing caught it until an unrelated audit checked the live file byte-for-byte. So no turn that makes a real project-file change is finished while that change is still only in the working tree: either commit it (Claude Code can run `git commit` and `git push` directly — an assistant without shell access must instead end the turn by explicitly asking the developer to do it), or state plainly that the change is delivered but not yet durable. Never leave it ambiguous.

## Never

- **Don't make changes that weren't requested.** If a task seems to imply an adjacent change, or an opportunity to improve something nearby, don't take it — surface it as a question or a suggestion instead. This includes: don't apply a design decision to real project files just to test whether a Skill or process works — validate against synthetic or historical examples instead.

## When genuinely unsure

- **Ask, don't guess, on decisions that are expensive to reverse or ambiguous by nature** — e.g. a structural choice with more than one reasonable reading, a priority call between two pieces of pending work. Use a small number of concrete options rather than an open-ended question.
- **Don't ask about decisions that are cheap to reverse or where one option is clearly better** — e.g. which of two internally-consistent test assertions to trust when one is provably based on a stale assumption. Resolve it, note the reasoning, keep moving.
- Record the resolution of any genuinely ambiguous decision in whichever `docs/ai/` reference already owns that area (a new pattern in the conventions reference, a triaged failure in the verification playbook, an unfixed problem in `outstanding-findings.md`), so the same question doesn't need to be re-asked in a future session. There is deliberately no separate decision-log file — the knowledge belongs next to the subject it concerns, not in a parallel history.

## On verification

- A change is not "done" until it has actually been verified per the Environment & Toolchain Playbook — not asserted as likely to pass. If a verification step turns up a failure, root-cause it before deciding whether it's a real regression or expected fallout of the change (see Verification & Regression Playbook) — don't default to "probably fine" or "probably broken" without checking.

## On scope

- If a task's own instructions say to stop at a certain point (e.g. "design only, don't implement" or "review only, don't redesign"), treat that as a hard boundary for that task, not a suggestion — even if continuing further seems like it would be useful.

## Stability

This file should rarely change. Add to it only when a genuinely new standing rule is established by explicit instruction — not when an AI assistant infers a preference from how one task happened to go.
