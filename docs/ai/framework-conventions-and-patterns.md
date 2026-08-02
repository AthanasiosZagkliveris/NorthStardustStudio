# Framework Conventions & Patterns Reference

Non-obvious architectural patterns that govern how content and structure interact — not covered by the DSL grammar itself, and not discoverable from any single file. Each entry exists because it was actually rediscovered the hard way at least once; add a new entry the same session a new pattern like this gets established, while the reasoning is still fresh.

## Data model, in order

`Capability` (static, 6 top-level groupings) → `System` (static, 24, each `{number, id, title, capability}`) → `FrameworkDocument` (`Metadata + Introduction + Section[]`, built from the three-file content triad) → `Section` (`{number, title, AnswerDefinition}`) → `AnswerDefinition` (typed by `AnswerType`; a Table's columns are `TableColumnDefinition[]`, each optionally carrying a `fieldId` for shared Fields or a `dynamicSource` for cross-Section sharing).

The rendering layer never hardcodes a System's fields — roughly ten generic renderer components serve all 24 Systems by interpreting `AnswerType`. Adding a System means writing content, not code. Adding a genuinely new *shape* of answer (an eleventh `AnswerType`) means touching parser, model, renderer, and CSS together — treat that as a deliberate, reviewed decision, not a casual one, and check first whether an existing `AnswerType` (especially Multi-Part with `Tab Group: Yes`) already covers the need.

## `dynamicSource` sharing pattern

When one Section's column should offer exactly the same set of options as another Section's column (e.g. a "Data Asset" picked in one place should be selectable from the same list defined somewhere else), use `- Dynamic Field (Section: Column)` rather than duplicating a Variant list. This is resolved live at render time, not baked in at parse time — so the source Section's actual entered data (not just its column definition) is what populates the dropdown. Cross-System form exists (`System Title / Section Title: Column Title`) for sharing across Systems, not just within one.

## Field-column ordering

Covered in the DSL grammar reference as a rule; the reason it exists is worth keeping here: Scale/Category/Frequency/Status columns read better grouped at the end of a table regardless of authoring order, so this is enforced structurally rather than by convention — content authors don't need to remember to order columns a certain way, and shouldn't try to.

## The `tabbed` Multi-Part pattern

Reuses the exact same CSS classes as Fixed Variant Text's own tab-card rendering (`answer-variant-cards-wrapper` / `answer-variant-cards` / `answer-variant-card` / `answer-variant-card-check`), rather than inventing new tab UI. When adding a new tabbed use case, check whether the existing tab styling still fits before creating anything new — the whole point of reusing those classes was visual and code consistency with the one existing tab pattern in the app.

## The three justified special-case editors

Process Library, Operational Log, and Roles Responsibilities all share one underlying `ProcessRecordValue[]` and are hand-built React components, not generic-renderer output — this is correct, not a gap to "fix":

- **Process Library** is a true three-level hierarchy (Process → SOP → Step) with collapsing, ID auto-numbering, and schedule-aware date/weekday pickers. Genuinely can't be expressed as a flat Table.
- **Operational Log** is entirely derived — every row is auto-generated from Process Library edits, every field read-only except a Note. There's no independent "add a log entry" UI; editing happens in Process Library.
- **Roles Responsibilities** is a pure collector — every Process with an Owner becomes a row automatically. No add/remove UI here either.

Don't build a fourth special-case editor without a comparably strong reason (a genuine multi-level hierarchy or derived-data relationship) — for anything expressible as a flat Table or Multi-Part, use those instead.

## What export keeps and strips

The export path builds an intermediate `ExportContent` structure that keeps System identity, Capability label, and each Section's number/title/answer — and strips Help text, Question text, and System Scope text (those are authoring/UX aids, not part of the delivered document). Any new export format should consume this same intermediate structure rather than re-deriving its own view of what to include — that's the single point where "what counts as the deliverable content" is decided.

## Naming quirks, confirmed by direct listing

At least one System's file triad is internally inconsistent: the Answer and Help files use a literal `&` in the filename, while the Questions file spells out "And" instead. This is exactly the kind of thing a filename guess gets wrong — always list the directory before assuming a naming pattern holds across a whole triad.

## Stability

Expected to grow in small, additive increments — one short section per newly-established pattern. Don't rewrite existing entries unless they turn out to be wrong; append.
