# NorthStardust

An app that interviews a founder and builds their business documents. Every document about it is in `docs/`; start from `docs/README.md` (contents), `docs/app/index.md` (where each part of the app is and which document describes it) and `docs/standard.md` (how a document is written).

Standing rules for any assistant working here: `docs/ai/ai-collaboration-rules.md` (binding). In short:

- Change only what is asked; reuse the existing components and styles.
- Verify before saying done (`docs/ai/toolchain-and-verification-playbook.md`, `docs/ai/review-checklist.md`), and say what was and was not looked at. A UI change is checked in the browser.
- One owner per fact; documents describe the present; a change is written only in `docs/design/core/04-log.md`; never edit a generated document by hand (`docs/README.md` says which).
- Commit finished, verified work (only what was changed); do not push, merge or tag without the owner's yes.

The checks: `npm run docs:check`, `npm run tables:check`, `npm run library:check`, `npx vitest run`, `npx tsc --noEmit -p .`. Where the code and a document differ, the code is right and the document is fixed.
