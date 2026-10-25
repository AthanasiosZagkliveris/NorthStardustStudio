# Glossary

Status: **reference**, updated 2026-10-25.

Canonical, one-line definitions. Each term has exactly one owner document, linked below — read that document for the full explanation; this file exists for fast lookup and to keep terminology consistent across every other document and Skill, not to explain anything itself.

## Project domain

**Capability** — one of 6 top-level groupings (e.g. Foundation, Deliver Value) that the 24 Systems are organized under. *Owned by: `framework-conventions-and-patterns.md`.*

**System** — one of 24 top-level units of the Framework (e.g. Identity System, Operations System), each delivered as a structured interview. *Owned by: `framework-conventions-and-patterns.md`.*

**Section** — a numbered subdivision of a System (`## N. Title`), the unit a `Structure:` and its content belong to. *Owned by: `framework-dsl-grammar.md`.*

**Content triad** — the three Markdown files that together define one System: its Answer file (structure), Questions file (plain-language prompts), and Help file (explanatory text). All three must stay in sync section-by-section. *Owned by: `framework-dsl-grammar.md`.*

**AnswerType / AnswerDefinition** — the typed structure a Section's content parses into (Table, Free Text, Multi-Part, and others); `AnswerDefinition` is one specific Section's instance of an `AnswerType`. *Owned by: `framework-conventions-and-patterns.md`.*

**Field / Field Registry** — a shared, named dropdown option set (Status, Scale, Frequency, Category, Platform) that a Table column can reference by suffix instead of repeating its own option list. *Owned by: `framework-dsl-grammar.md`.*

**dynamicSource** — a column whose options are sourced live from another Section's own column, via the `- Dynamic Field (Section: Column)` suffix, rather than a static list. *Owned by: `framework-dsl-grammar.md`.*

**Tab Group / tabbed Multi-Part** — a Multi-Part Section rendered as a single flat tab bar (one tab per part, each part able to use a different Structure), enabled by a `**Tab Group:** Yes` marker. *Owned by: `framework-dsl-grammar.md`.*

**The three special-case editors** — Process Library, Operational Log, and Roles Responsibilities: hand-built application code (not generic-renderer output) for the one genuinely hierarchical/derived relationship in the Framework. *Owned by: `framework-conventions-and-patterns.md`.*

## The app (Foundation pages)

**Page** — one screen of a System, with its title and rails. **Chapter** — a frame on a page that holds Master Tiles. *Owned by: `design/01-current-design.md`, C.0.*

**Master Tile / Tile** — the square on a page that opens a dialog (the page tile), and the other tile drawings (a section tile in a dialog, a category tile, a card tile); all are drawn by one `Tile` component. A **Diagram tile** is a Master Tile that stands for a drawing (the Roadmap). *Owned by: `tile-and-card-pattern.md`, `design/22-shared-components.md`.*

**Card / Floating card** — an opened tile; a floating card is a card placed over the page (a placement, not a type). A card of a completed activity is grey. *Owned by: `card-kinds.md`, `tile-and-card-pattern.md`.*

**Help tile** — a tile that holds no information of its own and only filters and presents records: the **Inventory** (every card with its cost, as tiles or a table, with a filter and sort window) and **Completed**. They stand in the footer band of page 3. *Owned by: `layout-rules.md`, section 12.*

**Rail / page tab** — the bullets and page tags at the side of a page, and the tab that holds them with the Back button. *Owned by: `tile-and-card-pattern.md`.*

**Reading mode** — light, sepia, dark or auto; the colours are tokens per mode. **Token** — a named colour or size in `src/styles/tokens/tokens.ts`, generated into the stylesheets. *Owned by: `layout-rules.md`, section 2.*

**Shared component** — a control or part drawn once and used everywhere (`AddButton`, `RemoveButton`, `NavArrow`, `FoldArrow`, `RadioChoice`, `TextLink`, `OptionPicker` and the rest). A look is a token or a global rule, never a page's own. *Owned by: `design/22-shared-components.md`.*

**Tooltip** — a dark label above a pressed control that says what a click does, in one sentence beginning "Click to ...". *Owned by: `design/25-tooltips.md`.*

**Layout check** — the automatic check of every Foundation page against the rulebook (`npm run check:layout`), with a baseline of known findings. *Owned by: `layout-rules.md`, section 18.*

**Library / contract / placement** — the assets library records every asset once with its variants and a contract (`src/library`); a placement says where an asset stands in the app; two logs record changes. *Owned by: `design/08-library-system.md`.*

**Global Settings** — the per-organization settings in the header (the Business stages, Plan Start, tax, reserves, useful life and others). **Opening Date** — the date the organization opens, set on the Organization tile; the budget before it is the cash to raise. **Business stage** — Planning, Launching, Managing or Growing, worked out from the Opening Date and the four durations in the Global Settings; it sets the limits and locks of the Positioning questions. **Key dates** — the milestones of the organization (plan start, registration, opening, the end of each stage's window), on the Review and the Calendar. *Owned by: `app-guide.md`; the stage and the key dates by `design/28-questionnaire-specification.md`, 8.2a.*

**Early Positioning** — the Positioning tile, named by the stage (Early Positioning, Core Market Positioning, Corporate & Portfolio Positioning): market structure, seller and buyer relationship, audience and outcome. A *multi-sided market* is a platform of two or more distinct groups; a buyer who is not the user is not one. *Owned by: `design/28-questionnaire-specification.md`, 8.2.*

## Documents and working

**Reference** — a stable knowledge file in this folder (`docs/ai/`) that skills and assistants consume rather than duplicate. *Owned by: `README.md`.*

**Playbook** — a procedure plus a living record, as opposed to a static spec (`toolchain-and-verification-playbook.md`, with its list of expected failures). *Owned by: `toolchain-and-verification-playbook.md`.*

**Skill** — a packaged set of instructions (a `SKILL.md`) that an assistant uses for one kind of task. It owns behaviour; facts stay in a reference. *Owned by: `ai-collaboration-rules.md`.*

**Outstanding Finding** — a real, confirmed problem found by a diagnostic and not fixed in that turn, recorded so it is not lost. *Owned by: `outstanding-findings.md`.*

**Log** — `design/04-log.md`: every change, newest row on top, and nowhere else. **Generated document** — written by a script; never edited by hand (`docs/README.md` says which).
