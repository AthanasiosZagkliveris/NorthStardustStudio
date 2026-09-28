# Framework Content DSL — Grammar Reference

This is the complete syntax for authoring a System's content in plain Markdown. Every rule below was confirmed directly against `framework/parser/AnswerParser.ts` — if this file and the parser ever disagree, the parser wins and this file is out of date and needs fixing.

Read this instead of the parser source when authoring or auditing System content. Only open the parser itself if this reference doesn't answer the question.

## File triad

Each System is authored as three separate Markdown files:
- `NN_<Name>SystemAnswer.md` — the structural definition (this grammar).
- `NN_<Name>SystemQuestions.md` — the plain-language questions shown per Section.
- `NN_<Name>SystemHelp.md` — longer explanatory help text per Section.

**Naming is not perfectly consistent across a triad — verify, don't assume.** At least one System's Answer/Help files use a literal `&` in the name while its Questions file spells the word out as "And" instead. Before editing, list the directory rather than guessing the filename.

**Section numbers must match across all three files for the same System**, and if a change adds, removes, or merges Sections, all three files need updating together, plus a check for any code that hardcodes that System's section numbers (rare, but exists for at least one System — grep for a constant naming pattern like `<SYSTEM>_<SECTION>_SECTION` before assuming section numbers are purely content).

## Section structure

Each Section is a `## N. Title` heading. Inside it, structure is declared with a `**Structure:**` (or unbolded `Structure:`) label followed by one of these exact values (case-insensitive):

`Free Text` · `Fixed Variant Text` · `T-Layout Text` · `Table` · `Checklist` · `Card List` · `Profile Cards` · `Process Library` · `Operational Log` · `Roles Responsibilities` (no ampersand, despite the System's display name using one)

The Foundation Systems (01-04) also use a set of page-level keywords for hand-built editors, plus `Shared Answer` — see "Foundation page structures" below.

A Section with no `Structure:` line, sitting before the first labeled sub-part of a Multi-Part Section, is dropped as unattributed leading content — this is how the `Tab Group: Yes` marker (below) can sit above a Multi-Part Section without needing a Structure of its own.

## Table columns

`**Columns:**` followed by a list: `- Column N: Title[ - Suffix][ [Tag] [Tag] ...]`

**`Number of Columns:` is documentation only — never parsed.** Writing the wrong count doesn't break anything functionally, but keep it accurate for human readers.

**Column 1 is always `#` and is always discarded by the parser.** Every Table's first authored column entry (`- Column 1: #`) is dropped outright — the parser slices it off before building the real column list. This is a real, load-bearing convention, not decoration: omit it and your actual first content column silently becomes invisible to the parser (it becomes the discarded one). Always author `- Column 1: #` first, then start real content at Column 2.

### Column suffixes (mutually exclusive — checked in this order)

1. **`- Dynamic Field (Section: Column)`** — this column's options are sourced live from another Section's own column of the same name. Cross-System form: `- Dynamic Field (System Title / Section Title: Column Title)`. Omit the System part to stay scoped to the current System.
2. **`- Autofill`** — column value is computed, not user-entered.
3. **`- <Word> Field`** — column draws its options from a shared Field definition (see Field Registry). The word before "Field" becomes the field's internal id (slugified). Known shared Fields: Status, Scale, Frequency, Category, Platform.

If none of these match, the column is a plain free-entry column.

### Column tags (any combination, trailing, each in its own brackets)

`[Repeatable]` · `[Repeatable Value]` · `[Sum Check]` · `[Group Sum Check]`

A column can carry more than one, e.g. `Method Mix (%) [Repeatable Value] [Group Sum Check]`. `Sum Check`/`Group Sum Check` mark that a set of value columns should sum to 100; `Repeatable`/`Repeatable Value` mark list-valued columns kept in lock-step with the nearest preceding one.

## Fixed Variant Text / Card List / Profile Cards

Same list pattern with a different keyword: `**Variants:**` → `- Variant N: Title`, or `**Cards:**` → `- Card N: Title`. `Number of Variants:`/`Number of Cards:` are documentation-only, same as `Number of Columns:`.

## Field-column ordering (automatic — do not hand-order)

Any column whose suffix resolves to a shared Field id in `[scale, category, frequency, status]` is automatically moved to the end of that Table's column list at parse time, in that fixed relative order, after every non-Field column. **`Platform` is deliberately excluded from this rule** and stays wherever it's authored. This applies to every Table in the Framework, including Tables nested inside a Multi-Part Section — don't hand-order these columns in the Markdown; author them in whatever order reads naturally and let the parser place them.

## Multi-Part Sections

A Section with more than one labeled sub-part (each its own `**Label**` followed by its own `**Structure:**` block) renders as a Multi-Part answer — each part can use a different Structure (a Table alongside several Free Text parts, for example).

**`**Tab Group:** Yes`** — placed on its own line anywhere before the first labeled part — switches rendering from the default stacked-with-headings layout to a single flat tab bar, one tab per part, each tab showing only its own part's editor. Use this when the parts are genuinely alternative facets of one thing (e.g. "Revenue Streams" as a Table alongside "Funding Sources"/"Objectives"/"Principles" as Free Text, all under one Financial Model) rather than a sequence meant to be read top to bottom.

**`**Layout:** Columns`** — placed on its own line before the first labeled part, the same way as `Tab Group: Yes` — lays the parts out side by side as equal-width columns, each under its own label, instead of stacked (see `AnswerDefinition.columns`). Deliberately not spelled `Columns:`, which is the Table structure's own keyword. If a Section declares both, `Tab Group` wins. Used by Identity's Definition and Ethics pages and Brand's Ambassador page.

**`**Numbering:** Nested`** — on its own line beside the Layout line (or under a page-level Structure) — numbers the Section's units on their own (1-4, 1-4, 1-6, under a page title carrying the Section's number) instead of one running count across the System (see `AnswerDefinition.nestedNumbering`). A System picks one convention and every Section in it declares the same thing; all four Foundation Systems use Nested.

## Foundation page structures

Each of these keywords opts a whole Section into a hand-built React editor. As with the three editors under "What's NOT in this grammar", the page's fields, columns and sections are declared by the editor itself, so the Markdown carries nothing but the `Structure:` line (and, where used, `Numbering: Nested`):

| `Structure:` value | Used by | Editor |
|---|---|---|
| `Legal Entity` | `01_IdentitySystemAnswer.md` — 03. Legal Entity | `LegalEntityEditor` |
| `Brand Style` | `02_BrandSystemAnswer.md` — 02. Style | `BrandStyleEditor` |
| `Brand Inventory` | `02_BrandSystemAnswer.md` — 03. Inventory | `BrandInventoryEditor` |
| `Business Foundation` | `03_BusinessSystemAnswer.md` — 01. Foundation | `BusinessFoundationEditor` |
| `Business Engagement` | `03_BusinessSystemAnswer.md` — 02. Customer Engagement | `BusinessEngagementEditor` |
| `Business Capability` | `03_BusinessSystemAnswer.md` — 03. Infrastructure & Capability | `BusinessCapabilityEditor` |
| `Financial Foundation` | `03_BusinessSystemAnswer.md` — 04. Financial Foundation | `FinancialFoundationEditor` |
| `Financial Sustainability` | `03_BusinessSystemAnswer.md` — 05. Financial Sustainability | `FinancialSustainabilityEditor` |
| `Strategy Foundation` | `04_StrategySystemAnswer.md` — 01. Situation & Direction | `StrategyFoundationEditor` |
| `Strategic Period` | `04_StrategySystemAnswer.md` — 02. Goals & Objectives | `StrategicPeriodEditor` |
| `Strategic Roadmap` | `04_StrategySystemAnswer.md` — 03. Roadmap | `StrategicRoadmapEditor` |

**`Shared Answer`** mirrors another System's Section instead of holding data of its own: it takes a `**Source:** <System Title> / <Section Title>` line (the same "System / Section" shape as a cross-System `Dynamic Field`), renders that Section's editor, and reads and writes that System's saved response. No System uses it at present.

## Shared Field Registry

Referenced by suffix (`- Status Field`, `- Frequency Field`, etc.), defined once in the Field Registry reference, not repeated per System. If a Table needs a new *shared* option set, add it to the registry rather than inlining a one-off Variant list on a Fixed Variant Text Section that's really acting as a dropdown definition.

## What's NOT in this grammar

The three hand-built editors — Process Library, Operational Log, Roles Responsibilities — use these same `Structure:` keywords to opt in, but their actual field-level behavior (the Process→SOP→Step hierarchy, auto-generated log rows, derived role collection) is real application code, not further Markdown DSL. See the Framework Conventions & Patterns Reference for what that code does — don't try to express their behavior by adding more columns/tags here.
