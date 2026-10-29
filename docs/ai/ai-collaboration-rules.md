# AI Collaboration Rules

Status: **rules**, updated 2026-10-21. It also holds what was in `ai-development-methodology.md` (merged here).

Standing rules for any AI assistant working on this project. They come from explicit instruction by the owner, not from inference: treat them as binding, not as defaults to weigh against convenience.

## Always

- **Commit finished, verified work; do not push without the owner's yes.** A change that is only in the working tree has no history and can be lost by an unrelated git operation (a checkout, a stash, a discard). So a turn that changes project files ends with the change committed (only what was changed), or with a plain statement that it is not yet committed. Pushing, merging and tagging wait for the owner. Today the branch `chore/light-cleanup` is not pushed and `main` has not moved; after the owner has tried the app once: merge, push, tag (`design/core/05-not-done-yet.md`).
- **Update the documents with the change**: the log row (`design/core/04-log.md`), the rule or the shared-component state where one changed, the examples (`docs/examples`) when the interface changed, then `npm run docs:index`. Documents are Markdown; PDFs are exports only and are not kept in the project.
- **Verify before saying done** (`toolchain-and-verification-playbook.md`, `review-checklist.md`). Say what was looked at and what was not.

## Never

- **Do not make changes that were not requested.** If a task suggests an adjacent change, surface it as a question or a suggestion. Do not apply a design decision to real project files just to test a process; use a synthetic or historical example.
- **Do not change the layout, style or structure of the app** when the task is content or logic; reuse the existing components and styles (`review-checklist.md`, section 1). A look is fixed in a shared token or component, not in one page.
- **Do not edit a generated document by hand** (`docs/README.md` says which are generated and by which command).

## When genuinely unsure

- **Ask, do not guess, where the decision is expensive to reverse or ambiguous by nature**: a structural choice with more than one reasonable reading, a priority between two pending pieces of work. Offer a few concrete options, not an open question.
- **Do not ask where the decision is cheap to reverse or one option is clearly better**: which of two assertions to trust when one rests on a stale assumption. Resolve it, note the reason, go on.
- **Record the resolution** in the document that already owns the area (a pattern in the conventions reference, a triaged failure in the playbook, an unfixed problem in `outstanding-findings.md`, a decision in the log). There is no separate decision file: the knowledge sits next to its subject.

## On scope

If a task says to stop at a point ("design only", "review only"), that is a hard boundary for that task.

## How work flows

1. **Select** the most valuable piece of work and say why it is next.
2. **Analyse dependencies**: reuse what exists, extend it, or create something new; never duplicate.
3. **Fill the gaps** where the knowledge is missing: a stable fact needed by more than one task becomes a shared reference; the same kind of knowledge as an existing reference extends it; a fact that goes stale at once (a snapshot of the content) is not written down.
4. **Implement** with one responsibility per piece. Behaviour belongs to a skill or a component, facts to a reference.
5. **Validate against a real task** (the real examples, a real earlier change with a known result), not an invented one. Validate one instance before building a whole set on an untested design.
6. **Integrate**: fix every document that now describes the old flow.
7. **Report** what was done, what was reused, what was found and what is next, plainly.

Load only the context a task needs. If a reference does not answer a real question, the reference is incomplete: fix it in the same session once the answer is found. Facts are owned by the references, behaviour by skills, decisions by the owner.

## Stability

This file changes rarely: when the owner sets a new standing rule, not when an assistant infers a preference from one task.
