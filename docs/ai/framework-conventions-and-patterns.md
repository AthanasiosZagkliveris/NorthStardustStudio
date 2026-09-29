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

## References come only from accepted sources

Every reference the app shows (an "i" note's "Source:"/"Based on:" link today; help text, document notes, glossary and checklists later) is a `Source { title, publisher, url, checked }` registered in `SOURCES` in `src/framework/engine/Sources.ts`, and InfoNote only links a `Source` whose URL passes `isAcceptedUrl`. Accepted: government and regulator sites (`.gov`, `gov.uk` and other `gov.<cc>`, `europa.eu`, central banks), universities and their business schools, libraries, law institutes and extension/SBDC centres (`.edu`, `ac.uk` and other `edu.<cc>`/`ac.<cc>`), official standard setters and professional bodies (named domains: W3C, IFRS, FASB, AICPA, ACCA, ICAEW, CIMA), and author-named open textbooks (OpenStax, Rice University). Rejected: Wikipedia and other open-edit or anonymous sources, content farms, marketing blogs, vendor sites and commercial explainer/training sites (CFI, Wall Street Prep, WallStreetMojo, Investopedia, Klipfolio, Umbrex, ...). A domain on the list is necessary, not sufficient: open the page, confirm it is the organisation's own and supports the exact wording, and record the date in `checked`. If no accepted source supports a statement, reword it to what one does, or drop the link — never leave an unsupported claim. `Sources.test.ts` scans every file under `src/` for external URLs and fails on any unaccepted domain; its `NOT_REFERENCES` list (XML namespaces, localhost) is the only exception.

## No em dash in the app's own sentences

Introductions, help and instruction bullets, "i" notes, labels, placeholders and messages never use " — " in a sentence: rewrite with a colon, a comma, a full stop or parentheses. The em dash stays only as a title separator ("3. Business System — 4. Financial Foundation" in the page header and the Continue line); the opening screen's dialogue dash before the guiding question is U+2015, drawn by CSS. The user's own answers and the examples' answer text are data and are left alone. `src/test/noEmDash.test.ts` scans the source (comments removed, tests excluded) and the content Markdown, with the allowed title constructions listed in it.

## Field keys, flags and notes

Every answerable value, section or card is addressed by one `FieldKey` (`src/framework/engine/FieldKeys.ts`): `"<system>.<section>:<path>"`, the path being a column id or a section's rail id (`sectionSegment`), then the card anchor, then the label's slug (`"1.3:organization/legal-form"`). Flags and notes (`Annotations.ts`) are kept per Organization under `annotations`, keyed this way, and travel with Export/Import. The flag button (`fieldAnnotations.tsx`: `FieldFlagButton` beside a label, `FieldStatus` under it) finds its key from where it sits: the page from `AnnotationProvider` (Conversation wraps every page in one), the section from the nearest `data-rail`, the card from the nearest `data-anchor` inside it; a column or section heading passes its `section` id. To enable flags on another page or label component, render those two components beside the label; nothing else is needed. The flag ("Needs investigation") is offered ONLY on the researchable fields listed in `FieldKinds.ts` (outside facts: the market and customers, external figures, legal and tax requirements), named where they are drawn (`flag` on `BusinessField`, `BusinessNote`, `BusinessGroup`, `FieldFlagButton`) or by address in its `FLAGGABLE` table; "Doesn't apply" only on the legal and tax items (`investigation-or-not-applicable`). Every other field has no flag. A field's KIND is `answer` (can be noted) or `none` (`NoneReason`: derived, binary, optional tick box, status, own not-yet option, link, display setting, name); the markup settles the first three, `NONE_LABELS` the rest. A card flagged as a whole passes `card`. "Doesn't apply" on a column or a section counts it as answered (validator, page and section status); on a single field inside a bespoke section it only affects the documents and the Review page. "Needs investigation" anywhere on a page puts the page and its section in review (`PageStatus.needsReview`, `SectionStatus.sectionNeedsReview`), and so does a built-in status that means the same (a Resource's "Needs Investigation", `BuiltInFlags.ts`, merged into the marks with `withBuiltInFlags`). An older "Not sure yet" reads as Needs investigation (`normalizeAnnotations`). The Business Documents print a flagged answer with "(to be confirmed)", an empty one as "To be confirmed: needs investigation (<what to find out>)" (`confirmedText`), and leave out what does not apply.

## Stability

Expected to grow in small, additive increments — one short section per newly-established pattern. Don't rewrite existing entries unless they turn out to be wrong; append.
