# AI Development Methodology

Status: **reference**, updated 2026-08-02.

This owns the *shape* of how AI-assisted work happens on this project — the lifecycle, the context-loading strategy, and the rules for when new shared knowledge should be created. It does not own specific technical facts (those live in the technical references) or turn-level behavioral rules (those live in `ai-collaboration-rules.md`). Read this when building or evolving a Skill, or when deciding whether something just learned should become a permanent reference.

## Philosophy

Knowledge should be captured once and reused, not re-derived under time pressure every time it's needed. Every reusable reference in this knowledge base exists because re-deriving the same fact cost real time more than once — not because it seemed like good practice in the abstract. That's the bar for adding to this base: proven, repeated need, not anticipated need.

## Context-loading strategy

Load only what a task actually needs, not everything available. Each Skill's own References section names the specific files it depends on — read those, in the order given, before falling back to source code. If a reference doesn't answer a real question, that's a signal the reference is incomplete, not a license to read source silently and move on; fix the reference once the answer is found, in the same session, while the reasoning is still fresh.

## Implementation lifecycle

1. **Select.** Identify the highest-value missing piece of work — a Skill, a fix, a reference update — and state why it's next: what depends on it, what it unblocks.
2. **Analyse dependencies.** For everything the work touches, decide explicitly: reuse existing knowledge as-is, extend it, or create something new. Never duplicate.
3. **Identify knowledge gaps.** If something is missing, decide what kind of resource it should become (see below) — or decide it's specific enough to this one piece of work that it should stay local and not become a shared reference at all.
4. **Implement.** Keep the implementation focused on one responsibility. If it's a Skill: behavior and decision logic belong in the Skill; facts belong in a reference the Skill points to.
5. **Validate against a real task**, not a synthetic one, whenever real data or a real historical scenario is available. A design that only looks correct on paper hasn't been tested yet.
6. **Integrate.** Update anything that now has a stale description of how work flows — a Skill whose hand-off target now exists, a reference that turned out to be incomplete.
7. **Report** what was built, what was reused, what was found, and what's next — plainly, so the next session (AI or human) doesn't have to reconstruct the reasoning.

## Validation lifecycle

Prefer a real, currently-true scenario over an invented one whenever the project has one available — a live scan of actual content, a historical change with a known-correct outcome, the project's own current regression-suite state. When a fresh, context-blind check is useful (to test whether a reference is self-sufficient), run one deliberately: give only the candidate reference material to something with no other context, withhold the expected answer, and grade the result against ground truth afterward. A synthetic example is the fallback only when no real one exists — and if that happens repeatedly for the same kind of task, that's itself worth noting, since it may mean the project doesn't yet have enough real history to validate against safely.

Before building more than one new piece of work on top of an unproven design, validate one instance of it first. Building an entire set on an untested assumption risks discovering the same structural problem many times instead of once.

## Knowledge-improvement workflow

When implementation surfaces something that isn't captured anywhere:

- **Becomes a shared reference** if it's a stable fact likely to be needed by more than one future task (a syntax rule, an architectural pattern, a toolchain step).
- **Becomes part of an existing reference** (extend, don't create a new file) if it's the same kind of knowledge a reference already owns — a new pattern belongs in the patterns reference, a newly-triaged test failure belongs in the regression playbook, not in a new file each time.
- **Stays inside the Skill that found it** if it's specific to that one Skill's behavior and unlikely to be needed elsewhere.
- **Doesn't get written down at all** if it would go stale immediately — a snapshot of "current state" (e.g., every relationship that exists in the content right now) belongs to live discovery at run time, not a static file that's wrong the moment content changes again.

Update the reference in the same session the gap is found, not as a follow-up — that's when the reasoning is cheapest to capture correctly.

## Collaboration model

This knowledge base owns facts. Skills own behavior built on those facts. The developer owns decisions this base and the Skills can't make on their own — genuinely ambiguous or expensive-to-reverse calls get surfaced as a question, per `ai-collaboration-rules.md`, rather than guessed at here.
