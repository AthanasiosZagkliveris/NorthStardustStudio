# Glossary

Status: **reference**, updated 2026-08-02.

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

## AI Skills ecosystem

**Pack** — a grouping of Skills with one shared area of responsibility (e.g. Framework Content Pack, Quality & Review Pack). *Owned by: `ai-development-methodology.md`.*

**Skill** — a scoped, packaged set of instructions (a `SKILL.md`, optionally with references/scripts/assets) that an AI assistant uses for one specific kind of task. Owns behavior and decision logic; never duplicates facts a reference already owns. *Owned by: `ai-development-methodology.md`.*

**Reference** — a stable knowledge file in this folder (`docs/ai/`) that one or more Skills consume rather than duplicate. *Owned by: `README.md`.*

**Playbook** — a reference that's primarily a procedure plus a living, updated record (e.g. the Verification & Regression Playbook's known-failures list), as opposed to a static spec. *Owned by: `ai-development-methodology.md`.*

**Definition of Done** — the explicit, checkable conditions a Skill states must be true before its task counts as complete — never just "looks right." *Owned by: `ai-development-methodology.md`.*

**Pilot validation** — building and testing exactly one instance of a new kind of work against a real task before committing to building the rest of a planned set. *Owned by: `ai-development-methodology.md`.*

**Outstanding Finding** — a real, confirmed problem a diagnostic Skill found but wasn't authorized to fix in that turn, recorded so it isn't lost or rediscovered later. *Owned by: `outstanding-findings.md`.*

**Blind validation** — testing whether a Skill and its references are self-sufficient by giving them, and only them, to a fresh AI session with no other context, then grading its output against a known-correct answer. *Owned by: `ai-development-methodology.md`.*
