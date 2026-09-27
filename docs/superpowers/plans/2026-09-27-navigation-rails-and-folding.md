# Navigation Rails and Card Folding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Foundation interview simpler to move around and far shorter to scroll: fewer clicks to enter a System, remembered capability on Back, repeatable cards collapsed by default, and two fixed bullet rails (pages left, sections right).

**Architecture:** Four independent deliverables, done in the agreed order 2 → 1 → 3 → 4 (numbered here as Parts A–D). Part A/B are small edits to `SystemSelection.tsx`, `CapabilityList.tsx` and the Back links. Part C adds one shared fold hook (`useItemFolds`) plus a `FoldAllToggle` and a `summary` slot on `BusinessCard`, then migrates each bespoke editor's *item* folds to it (structural section folds stay on each editor's existing `collapsed` set). Part D adds pure rail-item helpers, a presentational `BulletRail`, an active-section hook, `data-rail` markers in the editors, and wires both rails into `Conversation.tsx`.

**Tech Stack:** React 19 + TypeScript 5.8, react-router-dom, plain CSS (`src/styles/*.css`), Vitest 4 + @testing-library/react (jsdom), Tauri 2 desktop shell.

**Spec:** The design agreed in the 2026-09-27 session (UX review → "What do you think?" reply). The binding decisions are copied into *Global Constraints* and *Design Decisions* below, so this plan is self-contained.

## Global Constraints

- Code style: match the surrounding code — 4-space indent, double quotes, semicolons, blank lines between statements inside components, explanatory `//` / `/** */` comments at the same density as neighbouring code.
- No new runtime dependencies. Plain CSS only (no Tailwind); new styles go in new files under `src/styles/`.
- Fold state is UI-only: never persisted to localStorage or into saved answers.
- Every fold toggle keeps `className="strategy-box-toggle"` and a correct `aria-expanded` — `jumpTo.ts` (`src/components/interview/jumpTo.ts:75-79`) opens folded cards by clicking toggles whose `aria-expanded="false"`, and the CSS triangle (`conversation.css:7679-7735`) draws from `aria-expanded`.
- Rail colours: current bullet = green `#639922` with a `#C0DD97` ring ("bloom"); every other bullet = ice blue `#B5D4F4`. Current bullet is also larger and its label bold (never colour alone), with `aria-current`.
- Honour `prefers-reduced-motion: reduce` (no bloom transition).
- Tests: `npx vitest run <file>`; type check: `npx tsc --noEmit`. Both must pass at the end of every task.
- Commit messages end with: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`

## Design Decisions

1. **Remove popups.** Clicking a capability only selects it; its description moves inline (tagline + a native `<details>` "About …" disclosure). Clicking a System opens it immediately and **resumes where the user left off** (no more reset to Section 1 — that reset was only safe behind the confirm dialog).
2. **Remember capability on Back.** Every Back to `/assistant` carries `state.capability`; `SystemSelection` initialises from it.
3. **Collapsed repeatable cards.** User-added/repeated items start collapsed, show a one-line summary when collapsed, newly added items start open, and each group has an "Expand all / Collapse all" control (hidden for groups with fewer than 2 items). Structural section folds and Business Foundation *Segment* cards stay open by default.
4. **Bullet rails.** Left rail = one bullet per page of the current System (`"N. Title"`). Right rail = one bullet per sub-section of the current page (hidden when fewer than 2). Click left = go to page; click right = scroll to section (opening it if folded) and focus its first field. The right rail's current bullet follows the focused field, otherwise the scroll position. Rails are hidden on the Introduction screen. Wide windows (≥1700px) show labels; narrower windows show dots only with the label on hover/focus.

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `src/pages/SystemSelection.tsx` | Modify | Remove both dialogs, inline capability description, init capability from router state, open System directly |
| `src/components/CapabilityList.tsx` | Modify | Click/Enter only selects |
| `src/components/OrganizationCalendarPanel.tsx` | Modify | `onCapabilityOpen` becomes optional |
| `src/components/SystemConfirmation.tsx`, `src/components/CapabilityDescriptionDialog.tsx` | Delete | No longer used |
| `src/styles/workspace.css` | Modify | Inline description styles |
| `src/pages/Conversation.tsx`, `src/pages/BusinessDocuments.tsx` | Modify | Back carries capability; rails wiring (Part D) |
| `src/pages/SystemSelection.test.tsx` | Create | Parts A/B tests |
| `src/components/interview/useItemFolds.ts` (+ `.test.tsx`) | Create | Shared "open item ids" state |
| `src/components/interview/FoldAllToggle.tsx` (+ `.test.tsx`) | Create | Expand all / Collapse all button |
| `src/components/interview/cardSummary.ts` (+ `.test.ts`) | Create | One-line summary text helpers |
| `src/components/interview/BusinessCardFields.tsx` | Modify | `summary` prop on `BusinessCard` |
| `src/framework/engine/ExportRenderers.ts` | Modify | Export `costText` |
| `src/components/interview/BusinessFoundationEditor.tsx` | Modify | Profile / Competitor / Offering folds |
| `src/components/interview/BusinessCapabilityEditor.tsx` | Modify | Resource / Founder / Activity / Partner folds |
| `src/components/interview/FinancialFoundationEditor.tsx`, `FinancialSustainabilityEditor.tsx` | Modify | Funding source / Revenue stream folds |
| `src/components/interview/BusinessEngagementEditor.tsx` | Modify | Per-Offering blocks and reference entries fold as items |
| `src/components/interview/LegalEntityEditor.tsx` | Modify | New folds for Requirement / Expense cards |
| `src/components/interview/*.test.tsx` (one per editor) | Create | Fold behaviour tests |
| `src/styles/card-folding.css` | Create | Summary + FoldAllToggle styles |
| `src/components/interview/rails/railItems.ts` (+ `.test.ts`) | Create | Pure: page items, section items, `railId`, `pickActiveRail` |
| `src/components/interview/rails/BulletRail.tsx` (+ `.test.tsx`) | Create | Presentational rail |
| `src/components/interview/rails/useActiveRailSection.ts` (+ `.test.tsx`) | Create | Active section from focus/scroll; `scrollToRailSection` |
| `src/styles/bullet-rail.css` | Create | Rail layout, colours, responsive |
| `src/styles/conversation-layout.css` | Modify | Reserve rail gutters |
| `AnswerRenderer.tsx`, `LegalEntityEditor.tsx`, `BrandStyleEditor.tsx`, `BrandInventoryEditor.tsx`, `BusinessFoundationEditor.tsx`, `BusinessEngagementEditor.tsx`, `BusinessCapabilityEditor.tsx`, `FinancialFoundationEditor.tsx`, `FinancialSustainabilityEditor.tsx`, `StrategyFoundationEditor.tsx`, `StrategicPeriodEditor.tsx`, `StrategicRoadmapEditor.tsx` | Modify | Add `data-rail` markers |

---

## Task 0: Prepare the branch

The working tree currently has ~108 uncommitted files on `framework-v2` that belong to the user.

- [ ] **Step 1:** Stop and ask the user to commit (or confirm) their pending work on `framework-v2`. Do not stash or commit it yourself.
- [ ] **Step 2:** Once clean, create the branch:

```bash
git checkout -b ux/navigation-rails-and-folding
```

- [ ] **Step 3:** Baseline: `npx vitest run` and `npx tsc --noEmit` both pass. Record any pre-existing failures before starting.

---

## Part A (user item 1) — Remove the confirm popup and the capability popup

### Task 1: Open Systems directly and show the capability description inline

**Files:**
- Modify: `src/pages/SystemSelection.tsx`
- Modify: `src/components/CapabilityList.tsx`
- Modify: `src/components/OrganizationCalendarPanel.tsx:55,233,840-841`
- Modify: `src/styles/workspace.css` (append)
- Delete: `src/components/SystemConfirmation.tsx`, `src/components/CapabilityDescriptionDialog.tsx`
- Test: `src/pages/SystemSelection.test.tsx`

**Interfaces:**
- Produces: `CapabilityList` props become `{ capabilities, activeCapability, onActiveCapabilityChange }`. `OrganizationCalendarPanel`'s `onCapabilityOpen` becomes optional.

- [ ] **Step 1: Write the failing test**

Create `src/pages/SystemSelection.test.tsx`:

```tsx
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import SystemSelection from "./SystemSelection";

// The page bounces to "/" without a selected Organization, and the
// Navigator rail reads a whole Organization document -- neither is
// what these tests are about, so both are stubbed.
vi.mock("../services/OrganizationService", () => ({
    OrganizationService: {
        getSelected: () => "org-1",
        getSummary: () => ({ id: "org-1", name: "Test Org" })
    }
}));

vi.mock("../components/OrganizationCalendarPanel", () => ({
    default: () => null
}));

// Stands in for the Conversation page: shows which System it was
// opened with, so a test can see where a click landed.
function IntroductionProbe() {

    const location = useLocation();

    return <p>Opened {location.state?.system?.title}</p>;

}

function renderAt(state?: unknown) {

    return render(
        <MemoryRouter initialEntries={[{ pathname: "/assistant", state }]}>
            <Routes>
                <Route path="/assistant" element={<SystemSelection />} />
                <Route path="/introduction" element={<IntroductionProbe />} />
            </Routes>
        </MemoryRouter>
    );

}

afterEach(cleanup);

describe("SystemSelection without popups", () => {

    it("selects a capability on click without opening a dialog, and shows its description inline", () => {

        renderAt();

        fireEvent.click(screen.getByRole("button", { name: "Foundation" }));

        expect(screen.queryByRole("dialog")).toBeNull();
        expect(screen.getByText("Developing organizational alignment")).toBeTruthy();
        expect(screen.getByText("About Foundation")).toBeTruthy();

    });

    it("opens a System immediately, with no confirmation step", () => {

        renderAt();

        fireEvent.click(screen.getByRole("button", { name: "Foundation" }));
        fireEvent.click(screen.getByRole("button", { name: /Identity System/ }));

        expect(screen.getByText("Opened Identity System")).toBeTruthy();

    });

});
```

(`"Developing organizational alignment"` is Foundation's tagline in `src/assets/organization-framework-capabilities.md`; if the System title in `src/data/systems.ts` differs from `"Identity System"`, use the real title in both assertions.)

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/pages/SystemSelection.test.tsx`
Expected: FAIL — a dialog is present / "Opened Identity System" not found.

- [ ] **Step 3: Implement**

`src/components/CapabilityList.tsx` — delete the `onCapabilityOpen` prop (interface, destructuring, and its doc comment) and make click/Enter only select:

```tsx
                    onClick={() =>
                        onActiveCapabilityChange(capability.id)
                    }
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onActiveCapabilityChange(capability.id);
                        }
                    }}
```

`src/components/OrganizationCalendarPanel.tsx` — make the prop optional (`onCapabilityOpen?: (capability: Capability) => void;` at :55) and call it as `onCapabilityOpen?.(capability);` at :841.

`src/pages/SystemSelection.tsx`:
1. Remove imports of `SystemConfirmation`, `CapabilityDescriptionDialog`, `StorageService`, `FrameworkSystem`'s now-unused siblings if any; keep `getCapabilityDescription`.
2. Delete state `selectedSystem`, `confirmationOpen`, `openCapability`, and the functions `startInterview`.
3. Replace `handleSystemSelection` with:

```tsx
    // Opens the System straight away and resumes wherever the user
    // last left it (Conversation.tsx's loading effect restores the
    // saved position). There used to be a "Begin …?" confirmation
    // here that also reset the position to Section 1; without the
    // dialog a reset would silently lose the user's place, so the
    // saved position is simply kept.
    function handleSystemSelection(system: FrameworkSystem) {

        navigate("/introduction", {

            state: {
                system
            }

        });

    }
```

4. Escape handler: remove the `confirmationOpen` and `openCapability` branches and drop them from the dependency array (`[railOpen, navigate]`). Update its comment: "close the Navigator rail first, then act as Back".
5. `OrganizationCalendarPanel` props: remove `onCapabilityOpen` and `suppressClose`.
6. `CapabilityList`: remove `onCapabilityOpen`.
7. Under the `<h2 className="workspace-current-capability">`, add:

```tsx
                            {/* The Capability's description, inline rather than
                                in a popup that opened on every click. The
                                tagline is always visible; the full text is
                                one native disclosure away. */}
                            {activeDescription && (
                                <div className="workspace-capability-description">
                                    <p className="workspace-capability-tagline">
                                        {activeDescription.tagline}
                                    </p>
                                    <details className="workspace-capability-details">
                                        <summary>About {capabilityTitle}</summary>
                                        {activeDescription.paragraphs.map((paragraph, index) => (
                                            <p key={index}>{paragraph}</p>
                                        ))}
                                        {activeDescription.corePrinciple && (
                                            <p className="workspace-capability-principle">
                                                {activeDescription.corePrinciple}
                                            </p>
                                        )}
                                    </details>
                                </div>
                            )}
```

with, next to `capabilityTitle`:

```tsx
    const activeDescription = capabilityTitle
        ? getCapabilityDescription(capabilityTitle) ?? null
        : null;
```

8. Delete the `<SystemConfirmation … />` and `<CapabilityDescriptionDialog … />` elements.

Append to `src/styles/workspace.css`:

```css
/* The active Capability's description, shown inline under its name. */
.workspace-capability-description {

    margin: -12px 0 20px;

    max-width: 44ch;

}

.workspace-capability-tagline {

    margin: 0 0 6px;

    font-style: italic;
    color: #5f6368;

}

.workspace-capability-details summary {

    cursor: pointer;

    font-size: 13px;
    color: #0b57d0;

}

.workspace-capability-details p {

    font-size: 14px;
    line-height: 1.55;

}

.workspace-capability-principle {

    padding-left: 12px;
    border-left: 3px solid #1f2937;

}
```

Delete `src/components/SystemConfirmation.tsx` and `src/components/CapabilityDescriptionDialog.tsx`. Then `grep -rn "capability-description.css\|system-confirmation" src` — delete any stylesheet that is now imported nowhere; leave shared selectors in `workspace.css` alone.

- [ ] **Step 4: Run tests and type check**

Run: `npx vitest run src/pages/SystemSelection.test.tsx` → PASS. Run: `npx tsc --noEmit` → no errors.

- [ ] **Step 5: Verify in the app**

Preview (`preview_start` name `vite`, or `navigate` to `http://localhost:1420` if already running) → Landing → pick an Organization → System Selection → click Foundation: no popup, tagline + "About Foundation" visible → click "Identity System": interview opens on the last page you were on. Screenshot.

- [ ] **Step 6: Commit**

```bash
git add -A src/pages/SystemSelection.tsx src/pages/SystemSelection.test.tsx src/components/CapabilityList.tsx src/components/OrganizationCalendarPanel.tsx src/components/SystemConfirmation.tsx src/components/CapabilityDescriptionDialog.tsx src/styles
git commit -m "Open Systems directly and show capability descriptions inline

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Part B (user item 2) — Keep the selected capability on Back

### Task 2: Carry the capability through Back

**Files:**
- Modify: `src/pages/SystemSelection.tsx` (initial `activeCapability`)
- Modify: `src/pages/Conversation.tsx:821` (Escape) and `:2469` (footer Back)
- Modify: `src/pages/BusinessDocuments.tsx:309`
- Test: `src/pages/SystemSelection.test.tsx`

**Interfaces:**
- Produces: route state contract for `/assistant`: `{ capability?: string }` (a capability id such as `"foundation"`).

- [ ] **Step 1: Write the failing test** — add to `SystemSelection.test.tsx`:

```tsx
describe("SystemSelection capability memory", () => {

    it("starts with the capability passed back in router state", () => {

        renderAt({ capability: "foundation" });

        expect(screen.getByRole("button", { name: /Identity System/ })).toBeTruthy();
        expect(screen.getByText("Developing organizational alignment")).toBeTruthy();

    });

    it("starts with nothing selected when no capability is passed", () => {

        renderAt();

        expect(screen.queryByRole("button", { name: /Identity System/ })).toBeNull();

    });

});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/pages/SystemSelection.test.tsx` → first new test FAILS.

- [ ] **Step 3: Implement**

`SystemSelection.tsx`: import `useLocation` from `react-router-dom`, then:

```tsx
    const location = useLocation();

    // Coming Back from a System (or the Business Documents page)
    // passes the Capability it belonged to, so the list reopens on
    // that Capability instead of making the user pick it again.
    const [activeCapability, setActiveCapability] =
        useState<string | null>(() => location.state?.capability ?? null);
```

`Conversation.tsx` — both `navigate("/assistant")` calls (Escape handler :821 and `AppFooter onBack` :2469) become:

```tsx
navigate("/assistant", { state: { capability: system?.capability } })
```

`BusinessDocuments.tsx:309`:

```tsx
            <AppFooter onBack={() => navigate("/assistant", { state: { capability: "foundation" } })} />
```

- [ ] **Step 4:** `npx vitest run src/pages/SystemSelection.test.tsx` → PASS; `npx tsc --noEmit` → clean.
- [ ] **Step 5: Verify in the app:** open Business System → "← Back" → Foundation is still selected with its four Systems listed. Also press Escape inside a System → same result.
- [ ] **Step 6: Commit**

```bash
git add src/pages/SystemSelection.tsx src/pages/SystemSelection.test.tsx src/pages/Conversation.tsx src/pages/BusinessDocuments.tsx
git commit -m "Keep the selected capability when going Back

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Part C (user item 3) — Collapse repeatable cards by default

### Task 3: Shared fold building blocks

**Files:**
- Create: `src/components/interview/useItemFolds.ts`, `src/components/interview/useItemFolds.test.tsx`
- Create: `src/components/interview/FoldAllToggle.tsx`, `src/components/interview/FoldAllToggle.test.tsx`
- Create: `src/components/interview/cardSummary.ts`, `src/components/interview/cardSummary.test.ts`
- Create: `src/styles/card-folding.css`
- Modify: `src/components/interview/BusinessCardFields.tsx:490-608` (`BusinessCard`)
- Modify: `src/framework/engine/ExportRenderers.ts:199` (export `costText`)

**Interfaces (Produces — every later Part C task uses these exact names):**

```ts
// useItemFolds.ts
export interface ItemFolds {
    isOpen(id: string): boolean;
    toggle(id: string): void;
    expand(id: string): void;
    setAll(ids: readonly string[], open: boolean): void;
    allOpen(ids: readonly string[]): boolean;
}
export function useItemFolds(): ItemFolds;

// FoldAllToggle.tsx
export default function FoldAllToggle(props: { ids: readonly string[]; folds: ItemFolds; label: string }): JSX.Element | null;

// cardSummary.ts
export function summaryText(...parts: (string | null | undefined | false)[]): string;

// BusinessCard gains:  summary?: ReactNode   (rendered in the head only when !open)

// ExportRenderers.ts:  export function costText(cost: BusinessCostValue, currency: string): string;
```

- [ ] **Step 1: Write the failing tests**

`src/components/interview/useItemFolds.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useItemFolds } from "./useItemFolds";

describe("useItemFolds", () => {

    it("starts with every item closed", () => {

        const { result } = renderHook(() => useItemFolds());

        expect(result.current.isOpen("a")).toBe(false);

    });

    it("toggles one item and expands a new one", () => {

        const { result } = renderHook(() => useItemFolds());

        act(() => result.current.toggle("a"));
        expect(result.current.isOpen("a")).toBe(true);

        act(() => result.current.toggle("a"));
        expect(result.current.isOpen("a")).toBe(false);

        act(() => result.current.expand("b"));
        act(() => result.current.expand("b"));
        expect(result.current.isOpen("b")).toBe(true);

    });

    it("opens and closes a whole group", () => {

        const { result } = renderHook(() => useItemFolds());

        act(() => result.current.setAll(["a", "b"], true));
        expect(result.current.allOpen(["a", "b"])).toBe(true);

        act(() => result.current.setAll(["a"], false));
        expect(result.current.isOpen("a")).toBe(false);
        expect(result.current.isOpen("b")).toBe(true);
        expect(result.current.allOpen(["a", "b"])).toBe(false);

    });

    it("treats an empty group as not all open", () => {

        const { result } = renderHook(() => useItemFolds());

        expect(result.current.allOpen([])).toBe(false);

    });

});
```

`src/components/interview/FoldAllToggle.test.tsx`:

```tsx
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import FoldAllToggle from "./FoldAllToggle";
import { useItemFolds } from "./useItemFolds";

function Harness({ ids }: { ids: string[] }) {

    const folds = useItemFolds();

    return (
        <>
            <FoldAllToggle ids={ids} folds={folds} label="profiles" />
            {ids.map(id => <span key={id}>{id}:{folds.isOpen(id) ? "open" : "closed"}</span>)}
        </>
    );

}

afterEach(cleanup);

describe("FoldAllToggle", () => {

    it("is hidden for fewer than two items", () => {

        render(<Harness ids={["a"]} />);

        expect(screen.queryByRole("button")).toBeNull();

    });

    it("expands then collapses the whole group", () => {

        render(<Harness ids={["a", "b"]} />);

        fireEvent.click(screen.getByRole("button", { name: "Expand all profiles" }));
        expect(screen.getByText("a:open")).toBeTruthy();
        expect(screen.getByText("b:open")).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Collapse all profiles" }));
        expect(screen.getByText("a:closed")).toBeTruthy();

    });

});
```

`src/components/interview/cardSummary.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { summaryText } from "./cardSummary";

describe("summaryText", () => {

    it("joins the non-empty parts with a middle dot", () => {

        expect(summaryText("Costs", "", null, " $35 monthly ", undefined, false)).toBe("Costs · $35 monthly");

    });

    it("is empty when nothing is filled in", () => {

        expect(summaryText("", "  ", null)).toBe("");

    });

});
```

And a `BusinessCard` test in its own file:

```tsx
// src/components/interview/BusinessCard.test.tsx
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { BusinessCard } from "./BusinessCardFields";

afterEach(cleanup);

describe("BusinessCard summary", () => {

    it("shows the summary only while folded", () => {

        const { rerender } = render(
            <BusinessCard kind="Resource" number={1} name="Notion" open={false} onToggle={() => {}} summary="Costs · $10 monthly">
                <p>body</p>
            </BusinessCard>
        );

        expect(screen.getByText("Costs · $10 monthly")).toBeTruthy();
        expect(screen.queryByText("body")).toBeNull();

        rerender(
            <BusinessCard kind="Resource" number={1} name="Notion" open={true} onToggle={() => {}} summary="Costs · $10 monthly">
                <p>body</p>
            </BusinessCard>
        );

        expect(screen.queryByText("Costs · $10 monthly")).toBeNull();
        expect(screen.getByText("body")).toBeTruthy();

    });

});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/components/interview/useItemFolds.test.tsx src/components/interview/FoldAllToggle.test.tsx src/components/interview/cardSummary.test.ts src/components/interview/BusinessCard.test.tsx`
Expected: FAIL (modules / prop missing).

- [ ] **Step 3: Implement**

`src/components/interview/useItemFolds.ts`:

```ts
import { useCallback, useMemo, useState } from "react";

/**
 * Which repeatable item cards (Profiles, Resources, Funding Sources…)
 * are open. The inverse of each editor's own `collapsed` set: items
 * start CLOSED so a long list reads as a short list of one-line rows,
 * and only the item being worked on is open. A newly added item is
 * opened with `expand` so it can be filled in straight away.
 *
 * UI state only -- never stored with the answer.
 */
export interface ItemFolds {
    isOpen(id: string): boolean;
    toggle(id: string): void;
    expand(id: string): void;
    setAll(ids: readonly string[], open: boolean): void;
    allOpen(ids: readonly string[]): boolean;
}

export function useItemFolds(): ItemFolds {

    const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());

    const toggle = useCallback((id: string) => {
        setExpanded(current => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }, []);

    const expand = useCallback((id: string) => {
        setExpanded(current => current.has(id) ? current : new Set(current).add(id));
    }, []);

    const setAll = useCallback((ids: readonly string[], open: boolean) => {
        setExpanded(current => {
            const next = new Set(current);
            ids.forEach(id => open ? next.add(id) : next.delete(id));
            return next;
        });
    }, []);

    return useMemo(() => ({
        isOpen: (id: string) => expanded.has(id),
        toggle,
        expand,
        setAll,
        allOpen: (ids: readonly string[]) => ids.length > 0 && ids.every(id => expanded.has(id))
    }), [expanded, toggle, expand, setAll]);

}
```

`src/components/interview/FoldAllToggle.tsx`:

```tsx
import type { ItemFolds } from "./useItemFolds";

import "../../styles/card-folding.css";

/**
 * "Expand all" / "Collapse all" for one group of item cards. Hidden
 * for a group of fewer than two, where it would only duplicate the
 * card's own arrow.
 */
export default function FoldAllToggle({

    ids,

    folds,

    label

}: {

    ids: readonly string[];
    folds: ItemFolds;
    /** What the group holds, plural and lower case: "profiles". */
    label: string;

}) {

    if (ids.length < 2) {
        return null;
    }

    const allOpen = folds.allOpen(ids);

    return (
        <button
            type="button"
            className="fold-all-toggle"
            aria-label={(allOpen ? "Collapse all " : "Expand all ") + label}
            onClick={() => folds.setAll(ids, !allOpen)}
        >
            {allOpen ? "Collapse all" : "Expand all"}
        </button>
    );

}
```

`src/components/interview/cardSummary.ts`:

```ts
/**
 * The one line a folded item card shows next to its name, e.g.
 * "Costs · $35 monthly". Empty parts are skipped, so a half-filled
 * card still reads cleanly.
 */
export function summaryText(...parts: (string | null | undefined | false)[]): string {

    return parts
        .map(part => (typeof part === "string" ? part.trim() : ""))
        .filter(part => part.length > 0)
        .join(" · ");

}
```

`src/framework/engine/ExportRenderers.ts:199` — change `function costText(` to `export function costText(`.

`BusinessCardFields.tsx` `BusinessCard`: add the prop (after `anchor`):

```tsx
    /**
     * One line shown in the head while the card is folded, so a
     * folded list can still be read ("Costs · $35 monthly").
     */
    summary?: ReactNode;
```

destructure `summary,` and render it right after the name input / static name span, before `{actions}`:

```tsx
                {!open && summary && (
                    <span className="business-card-summary">{summary}</span>
                )}
```

`src/styles/card-folding.css` (import it at the top of `BusinessCardFields.tsx` too):

```css
/* A folded item card's one-line summary, beside its name. */
.business-card-summary {

    flex: 0 1 auto;
    min-width: 0;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    font-size: 12px;
    color: #5f6368;

}

/* "Expand all / Collapse all", a quiet text control beside a group title. */
.fold-all-toggle {

    margin-left: auto;
    padding: 2px 8px;

    border: none;
    background: none;
    cursor: pointer;

    font-size: 12px;
    color: #0b57d0;

}

.fold-all-toggle:hover {

    text-decoration: underline;

}

.fold-all-toggle:focus-visible {

    outline: 2px solid #0b57d0;
    outline-offset: 2px;

}
```

- [ ] **Step 4:** Run the four test files → PASS; `npx tsc --noEmit` → clean; `npx vitest run src/framework/engine/ExportRenderers.test.ts` still PASS.
- [ ] **Step 5: Commit**

```bash
git add src/components/interview/useItemFolds.ts src/components/interview/useItemFolds.test.tsx src/components/interview/FoldAllToggle.tsx src/components/interview/FoldAllToggle.test.tsx src/components/interview/cardSummary.ts src/components/interview/cardSummary.test.ts src/components/interview/BusinessCard.test.tsx src/components/interview/BusinessCardFields.tsx src/framework/engine/ExportRenderers.ts src/styles/card-folding.css
git commit -m "Add shared item-fold state, Expand all toggle and card summaries

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### The migration recipe (applies to Tasks 4–8)

Each editor keeps its existing `collapsed` set for *structural* folds. For each *item* type listed in the task:

1. Add `const folds = useItemFolds();` next to the existing `collapsed` state.
2. Replace `open={!collapsed.has(ITEM_KEY)}` / `onToggle={() => toggle(ITEM_KEY)}` (or the inline `setCollapsed` toggle) with `open={folds.isOpen(ITEM_KEY)}` / `onToggle={() => folds.toggle(ITEM_KEY)}`. Only for the listed item keys.
3. Rewrite the item's add handler so the new id is known, then expand it:

```tsx
() => {
    const item = createX();
    /* the existing update call, with `item` in place of `createX()` */
    folds.expand(item.id);
}
```

   (`FinancialFoundationEditor.tsx:911-919` already does this for Cost rows — follow it.)
4. Pass `summary={summaryText(...)}` to the item's `BusinessCard` using the fields listed in the task.
5. Render `<FoldAllToggle ids={items.map(i => i.id)} folds={folds} label="…" />` in the group's title row.
6. Leave `aria-expanded`, `className="strategy-box-toggle"` and `data-anchor` untouched.

Each editor test uses a controlled harness so "+ Add" really re-renders:

```tsx
function Harness({ initial }: { initial: unknown }) {
    const [value, setValue] = useState<unknown>(initial);
    return <EditorUnderTest value={value} onChange={setValue} />;
}
const toggles = (pattern: RegExp) =>
    screen.getAllByRole("button", { name: pattern }).filter(b => b.classList.contains("strategy-box-toggle"));
```

Toggle accessible names are `"Maximize " | "Minimize "` + `[ariaPrefix + ", "]` + kind + " " + number (see `BusinessCard`, `BusinessCardFields.tsx:557-569`). If a regex below does not match, print `screen.getAllByRole("button").map(b => b.getAttribute("aria-label"))` once and adjust the regex — not the component.

### Task 4: Business Foundation — Profiles, Competitors, Offerings

**Files:**
- Modify: `src/components/interview/BusinessFoundationEditor.tsx` (`card()` helper :685-733 → `open`/`onToggle` at :716-725; add handlers :975, :1125, :1371; column titles :1574, :1579, :1596)
- Test: `src/components/interview/BusinessFoundationEditor.test.tsx`

**Interfaces:** Consumes `useItemFolds`, `FoldAllToggle`, `summaryText`, `BusinessCard.summary` (Task 3).

Item keys (all go through `card()` with `key: item.id`): Profile (:824), Competitor (:1010), Offering (:1260). **Segment (:1464) stays on `collapsed` (open by default).** Because `card()` is shared by the three item kinds only, switching its `open`/`onToggle` to `folds` migrates all three at once — confirm with `grep -n "card({" BusinessFoundationEditor.tsx` that no structural caller uses it; if one does, add a `foldable: "item" | "section"` field to its options and branch on it.

Summaries (add a `summary` option to `card()` and pass it to `BusinessCard`):
- Profile: `summaryText(firstFilled(profile.goals, profile.challenges, profile.description))` where `firstFilled` returns the first non-empty string value of those `BusinessDescriptionValue` maps (write it as a local helper; inspect `BusinessDescriptionValue` in `AnswerUtils.ts` for its shape).
- Competitor: `summaryText(BUSINESS_COMPETITOR_TYPES.find(t => t.id === competitor.type)?.label)`.
- Offering: `summaryText(offering.category === "other" ? offering.categoryOther : offering.category, offering.needsAddressed.length ? offering.needsAddressed.length + " needs" : "")`.

FoldAllToggle per segment: beside each column title — Profiles `ids={segment.profiles.map(p => p.id)} label="profiles"`, Competitors `label="competitors"`, Offerings `label="offerings"`.

- [ ] **Step 1: Write the failing test**

```tsx
import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessFoundationEditor from "./BusinessFoundationEditor";
import {
    asBusinessFoundationValue,
    createBusinessCustomerProfile,
    createBusinessCustomerSegment
} from "../../framework/engine/AnswerUtils";

function Harness({ initial }: { initial: unknown }) {
    const [value, setValue] = useState<unknown>(initial);
    return <BusinessFoundationEditor value={value} onChange={setValue} />;
}

const toggles = (pattern: RegExp) =>
    screen.getAllByRole("button", { name: pattern }).filter(b => b.classList.contains("strategy-box-toggle"));

function twoProfiles() {
    const segment = createBusinessCustomerSegment([]);
    return {
        ...asBusinessFoundationValue(undefined),
        segments: [{ ...segment, profiles: [createBusinessCustomerProfile(), createBusinessCustomerProfile()] }]
    };
}

afterEach(cleanup);

describe("BusinessFoundationEditor folding", () => {

    it("starts Profile cards collapsed but the Segment open", () => {

        render(<Harness initial={twoProfiles()} />);

        toggles(/Profile \d+$/).forEach(t => expect(t.getAttribute("aria-expanded")).toBe("false"));
        toggles(/Segment \d+$/).forEach(t => expect(t.getAttribute("aria-expanded")).toBe("true"));

    });

    it("opens a newly added Profile", () => {

        render(<Harness initial={twoProfiles()} />);

        fireEvent.click(screen.getByRole("button", { name: /\+ Add Profile/ }));

        const profileToggles = toggles(/Profile \d+$/);
        expect(profileToggles).toHaveLength(3);
        expect(profileToggles[2].getAttribute("aria-expanded")).toBe("true");

    });

    it("expands all Profiles in a Segment", () => {

        render(<Harness initial={twoProfiles()} />);

        fireEvent.click(screen.getByRole("button", { name: "Expand all profiles" }));

        toggles(/Profile \d+$/).forEach(t => expect(t.getAttribute("aria-expanded")).toBe("true"));

    });

});
```

- [ ] **Step 2:** `npx vitest run src/components/interview/BusinessFoundationEditor.test.tsx` → FAIL (profiles start open).
- [ ] **Step 3:** Apply the migration recipe to Profile, Competitor, Offering as specified above.
- [ ] **Step 4:** Test → PASS; `npx tsc --noEmit` → clean.
- [ ] **Step 5: Verify in the app:** Business System page 1 (Quillfield sample) — profile/competitor/offering cards show as one-line rows with summaries; "Expand all" works; "+ Add Profile" opens the new card; an ⓘ link that jumps to a folded card still opens it. Record `document.documentElement.scrollHeight` before (10,023px at 1440×900) and after.
- [ ] **Step 6: Commit** — `git add` the editor + test; message `"Fold Business Foundation item cards by default"` + Co-Authored-By line.

### Task 5: Infrastructure & Capability — Resources, Founders, Activities, Partners

**Files:**
- Modify: `src/components/interview/BusinessCapabilityEditor.tsx`
- Test: `src/components/interview/BusinessCapabilityEditor.test.tsx`

Item keys:
- Resource — `resourceCard` :1066 (`slot.id`); adds at :1287 (`setSlots([...slots, createBusinessResourceSlot()])`) and :2840 (offering scope). Summary: `summaryText(BUSINESS_RESOURCE_STATUSES.find(s => s.id === slot.status)?.label, costText(slot.cost, organisationCurrency ?? ""))`.
- Founder — `founderCard` :1419 (`founder.id`); no add (synced from Legal Entity). Summary: `summaryText(founder.roles[0])`.
- Activity — `activityRow` :1828 (`activity.id`, inline toggle :1839-1847). The add lives in the separate `ActivityList` component (:3040, add at :3136). Add a prop `onAdded?: (id: string) => void` to `ActivityList`, call it after creating, and pass `onAdded={folds.expand}` from `activityList` (:1940-1959). Summary: the responsible person's name (look up `activity.responsibleId` among founders/partners the same way the row's own picker resolves it) or the first line of `activity.description`.
- Partner (Professional / Provider) — `partnerCard` :2003 (`partner.id`); add at :2075 (`setPartners(scope, kind, [...list, createBusinessPartner()])`). Summary: `summaryText(costText(partner.cost, organisationCurrency ?? ""), partner.description)`.

Structural keys (`"fold-section-…"`, `"fold-resources-…"`, `"fold-activities-…"`, `"fold-activity-category-…"`, `"fold-subsection-…"`, top cards `card.id` at :2961) stay on `collapsed`.

FoldAllToggles: in each resource subsection head (ids = that subsection's `slots`), each activity list head, each partner `BusinessGroup` (:2070).

- [ ] **Step 1: Write the failing test** (same harness pattern):

```tsx
import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "./BusinessCapabilityEditor";
import { asBusinessCapabilityValue } from "../../framework/engine/AnswerUtils";

function Harness() {
    const [value, setValue] = useState<unknown>(asBusinessCapabilityValue(undefined));
    return <BusinessCapabilityEditor value={value} onChange={setValue} />;
}

const toggles = (pattern: RegExp) =>
    screen.getAllByRole("button", { name: pattern }).filter(b => b.classList.contains("strategy-box-toggle"));

afterEach(cleanup);

describe("BusinessCapabilityEditor folding", () => {

    it("opens each newly added Resource and leaves earlier ones folded", () => {

        render(<Harness />);

        const add = () => fireEvent.click(screen.getAllByRole("button", { name: /\+ Add Resource/ })[0]);
        add();
        add();

        const resources = toggles(/Resource \d+$/);
        expect(resources[resources.length - 1].getAttribute("aria-expanded")).toBe("true");

    });

    it("keeps structural sections open by default", () => {

        render(<Harness />);

        toggles(/Resources$|Activities$/).forEach(t => expect(t.getAttribute("aria-expanded")).toBe("true"));

    });

});
```

(Note: a freshly added item stays open until toggled; "earlier ones folded" is covered by the reload case in Step 5.)

- [ ] **Step 2:** Run → FAIL. **Step 3:** Migrate per the list. **Step 4:** Test PASS + `tsc` clean.
- [ ] **Step 5: Verify in the app:** Business page 3 — reload the page: all resource/activity/partner cards folded with summaries; page height well below the previous 17,644px; "Expand all" per group works; the Legal Entity → Capability links still land on the right card.
- [ ] **Step 6: Commit** — `"Fold Infrastructure & Capability item cards by default"`.

### Task 6: Financial pages — Funding Sources and Revenue Streams

**Files:**
- Modify: `src/components/interview/FinancialFoundationEditor.tsx` (`fundingCard` :1308; add :1444)
- Modify: `src/components/interview/FinancialSustainabilityEditor.tsx` (`streamCard` :597; no add — streams are derived one per Offering at :269-279)
- Test: `src/components/interview/FinancialEditors.test.tsx`

Summaries:
- Funding source: `summaryText(FUNDING_TYPES.find(t => t.id === source.type)?.label, formattedAmount, FUNDING_STATUSES.find(s => s.id === source.status)?.label)`, where `formattedAmount` is `""` when `source.amount` is blank, otherwise the amount formatted exactly as the card body already formats it (search the file for `source.amount` and reuse that expression).
- Revenue stream: `summaryText(stream.price && (stream.price + " / " + (stream.unit === "other" ? stream.unitOther : stream.unit)), stream.frequency)`.

FoldAllToggle: per funding category column (`.financial-funding-category`, ids = that category's sources, label `"funding sources"`); on the Revenue section (ids = streams, label `"revenue streams"`).

- [ ] **Step 1: Failing test:**

```tsx
import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import FinancialFoundationEditor from "./FinancialFoundationEditor";
import { asFinancialFoundationValue, createFundingSource } from "../../framework/engine/FinancialModel";

function Harness({ initial }: { initial: unknown }) {
    const [value, setValue] = useState<unknown>(initial);
    return <FinancialFoundationEditor value={value} onChange={setValue} />;
}

const toggles = (pattern: RegExp) =>
    screen.getAllByRole("button", { name: pattern }).filter(b => b.classList.contains("strategy-box-toggle"));

afterEach(cleanup);

describe("FinancialFoundationEditor folding", () => {

    it("starts funding sources collapsed and opens a new one", () => {

        const initial = {
            ...asFinancialFoundationValue(undefined),
            funding: [createFundingSource("internal"), createFundingSource("internal")]
        };

        render(<Harness initial={initial} />);

        toggles(/Source \d+$/).forEach(t => expect(t.getAttribute("aria-expanded")).toBe("false"));

        fireEvent.click(screen.getAllByRole("button", { name: /\+ Add/ }).find(b => /source/i.test(b.textContent ?? ""))!);

        const sources = toggles(/Source \d+$/);
        expect(sources[sources.length - 1].getAttribute("aria-expanded")).toBe("true");

    });

});
```

- [ ] **Steps 2–4:** FAIL → migrate both editors → PASS + `tsc`.
- [ ] **Step 5: Verify in the app:** Business pages 4 and 5 — folded rows with summaries; heights recorded vs 8,105 / 6,608px.
- [ ] **Step 6: Commit** — `"Fold funding sources and revenue streams by default"`.

### Task 7: Customer Engagement — per-Offering blocks and references

**Files:**
- Modify: `src/components/interview/BusinessEngagementEditor.tsx`
- Test: `src/components/interview/BusinessEngagementEditor.test.tsx`

These are not added on this page but repeat once per Page-1 Offering / Profile, which is where page 2's 14,221px comes from. Move these keys from `collapsed` to `folds` (so they start closed):
- `"reference-" + source.key` (:905) — read-only Profile/Offering references.
- `"relationship-offering-" + offeringId` (:1979, toggle :2092).
- `"demand-" + offeringId` (:2958, toggle :3144) — it already renders a folded summary (:3155-3161); keep it.

Keep on `collapsed` (open by default): `"reference-header-…"`, `foldingSection` keys (`-channels`, `-relationships`), `"channel-category-…"`, `"relationship-type-…"`, `"relationship-stage-…"`, `"engagement-" + segment.id`.

Summary for `relationship-offering-*` heads: number of chosen relationship types, e.g. `summaryText(types.length ? types.length + " relationship types" : "")`.

FoldAllToggle: in the "B. Customer Relationship" section head (ids = that segment's `"relationship-offering-" + id` keys, label `"offerings"`) and in the Demand & Conversion area (ids = `"demand-" + id` keys, label `"offerings"`).

- [ ] **Step 1: Failing test** — build a Page-1 `foundation` value with one segment and two offerings, render `BusinessEngagementEditor value={asBusinessEngagementValue(undefined)} foundation={foundation}`, and assert every toggle whose aria-label contains the offering name inside a relationship/demand block has `aria-expanded="false"`, while the `A. Customer Channel` / `B. Customer Relationship` toggles are `"true"`:

```tsx
import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";

import BusinessEngagementEditor from "./BusinessEngagementEditor";
import {
    asBusinessEngagementValue,
    asBusinessFoundationValue,
    createBusinessCustomerSegment,
    createBusinessOffering
} from "../../framework/engine/AnswerUtils";

function foundationWithTwoOfferings() {
    const segment = createBusinessCustomerSegment([]);
    return {
        ...asBusinessFoundationValue(undefined),
        segments: [{
            ...segment,
            name: "Firms",
            offerings: [{ ...createBusinessOffering(), name: "Audit" }, { ...createBusinessOffering(), name: "Retainer" }]
        }]
    };
}

function Harness() {
    const [value, setValue] = useState<unknown>(asBusinessEngagementValue(undefined));
    return <BusinessEngagementEditor value={value} onChange={setValue} foundation={foundationWithTwoOfferings()} />;
}

afterEach(cleanup);

describe("BusinessEngagementEditor folding", () => {

    it("folds per-Offering blocks but keeps the page sections open", () => {

        render(<Harness />);

        const all = screen.getAllByRole("button").filter(b => b.classList.contains("strategy-box-toggle"));
        const offeringBlocks = all.filter(b => /Audit|Retainer/.test(b.getAttribute("aria-label") ?? ""));
        const sections = all.filter(b => /Customer Channel|Customer Relationship/.test(b.getAttribute("aria-label") ?? ""));

        expect(offeringBlocks.length).toBeGreaterThan(0);
        offeringBlocks.forEach(b => expect(b.getAttribute("aria-expanded")).toBe("false"));
        sections.forEach(b => expect(b.getAttribute("aria-expanded")).toBe("true"));

    });

});
```

- [ ] **Steps 2–4:** FAIL → migrate → PASS + `tsc`.
- [ ] **Step 5: Verify in the app:** Business page 2 height vs 14,221px; demand folded summary still shows "Expected Sales: …".
- [ ] **Step 6: Commit** — `"Fold per-Offering engagement blocks by default"`.

### Task 8: Legal Entity — Requirement and Expense cards

**Files:**
- Modify: `src/components/interview/LegalEntityEditor.tsx` (requirement card :1831, add :1961-1971; expense card :1990, add :2190-2199)
- Test: `src/components/interview/LegalEntityEditor.test.tsx`

These cards have **no fold today**. Keep the existing `opened` set (it reveals optional fields — unrelated). Add `const folds = useItemFolds();` and, in each `.legal-entity-card-head`, before the number:

```tsx
                <button
                    type="button"
                    className="strategy-box-toggle"
                    aria-expanded={folds.isOpen(requirement.id)}
                    aria-label={(folds.isOpen(requirement.id) ? "Minimize " : "Maximize ") + "Requirement " + number}
                    onClick={() => folds.toggle(requirement.id)}
                >
                    {folds.isOpen(requirement.id) ? "▾" : "▸"}
                </button>
```

Render the card body only when open; when closed, show `<span className="business-card-summary">{summary}</span>` in the head. Same for expenses with `"Expense " + number`.

Summaries:
- Requirement: `summaryText(requirement.name, LEGAL_REQUIREMENT_TYPES.find(t => t.id === requirement.type)?.label ?? requirement.reference)` (check `LegalEntityJurisdictions.ts:200` for the id/label field names).
- Expense: `summaryText(expense.name, expense.cost && moneyText(expense.cost, currency), expense.frequency)` — `frequency` is already a label string; use the same money formatting the card body uses.

Add handlers → create, update, `folds.expand(item.id)`. FoldAllToggles in the "Additional Legal Requirements" and "Legal Entity Expenses" subsection heads. Founders (table rows) are unchanged.

- [ ] **Step 1: Failing test**

```tsx
import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import LegalEntityEditor from "./LegalEntityEditor";
import { asLegalEntityValue, createLegalEntityRequirement } from "../../framework/engine/AnswerUtils";

function Harness() {
    const [value, setValue] = useState<unknown>({
        ...asLegalEntityValue(undefined),
        requirements: [createLegalEntityRequirement(), createLegalEntityRequirement()]
    });
    return <LegalEntityEditor value={value} onChange={setValue} />;
}

const toggles = () =>
    screen.getAllByRole("button", { name: /Requirement \d+$/ }).filter(b => b.classList.contains("strategy-box-toggle"));

afterEach(cleanup);

describe("LegalEntityEditor folding", () => {

    it("starts requirement cards folded and opens a new one", () => {

        render(<Harness />);

        expect(toggles()).toHaveLength(2);
        toggles().forEach(t => expect(t.getAttribute("aria-expanded")).toBe("false"));

        // The add button's text is at LegalEntityEditor.tsx:1961-1971 ("+ Add Legal Requirement").
        fireEvent.click(screen.getByRole("button", { name: /\+ Add Legal Requirement/ }));

        const all = toggles();
        expect(all).toHaveLength(3);
        expect(all[2].getAttribute("aria-expanded")).toBe("true");

    });

});
```
- [ ] **Steps 2–4:** FAIL → implement → PASS + `tsc`.
- [ ] **Step 5: Verify in the app:** Identity page 3 height vs 6,507px; Business → Legal Entity links (e.g. `legal-expense-<id>` anchors) still open the right expense (jumpTo clicks the new toggle).
- [ ] **Step 6: Commit** — `"Fold Legal Entity requirement and expense cards by default"`.

---

## Part D (user item 4) — Page rail (left) and section rail (right)

### Task 9: Pure rail-item helpers

**Files:**
- Create: `src/components/interview/rails/railItems.ts`, `src/components/interview/rails/railItems.test.ts`

**Interfaces (Produces):**

```ts
export interface RailItem { id: string; label: string; }
export function railId(label: string): string;
export function pageRailItems(sections: readonly { number: number; title: string }[]): RailItem[];
export function sectionRailItems(answer: AnswerDefinition | undefined, themes?: readonly StrategyThemeValue[]): RailItem[];
export function pickActiveRail(tops: readonly number[], threshold: number): number;
```

- [ ] **Step 1: Failing tests**

```ts
import { describe, expect, it } from "vitest";

import { pageRailItems, pickActiveRail, railId, sectionRailItems } from "./railItems";
import { AnswerType } from "../../../framework/enums/AnswerType";
import type { AnswerDefinition } from "../../../framework/model/AnswerDefinition";

describe("railId", () => {
    it("slugs a label", () => {
        expect(railId("Offering's Capability")).toBe("offering-s-capability");
        expect(railId("Icon & Logo")).toBe("icon-logo");
    });
});

describe("pageRailItems", () => {
    it("numbers each page and strips the Strategy period placeholder", () => {
        expect(pageRailItems([
            { number: 1, title: "Situation & Direction" },
            { number: 2, title: "Goals & Objectives MM/YY - MM/YY" }
        ])).toEqual([
            { id: "page-1", label: "1. Situation & Direction" },
            { id: "page-2", label: "2. Goals & Objectives" }
        ]);
    });
});

describe("sectionRailItems", () => {
    it("uses the parts of a columns page", () => {
        const answer = {
            type: AnswerType.MultiPart,
            columns: true,
            parts: [{ id: "mission", label: "Mission" }, { id: "vision", label: "Vision" }]
        } as unknown as AnswerDefinition;
        expect(sectionRailItems(answer)).toEqual([
            { id: "mission", label: "Mission" },
            { id: "vision", label: "Vision" }
        ]);
    });

    it("uses the fixed sub-sections of a bespoke page", () => {
        const answer = { type: AnswerType.BusinessCapability } as unknown as AnswerDefinition;
        expect(sectionRailItems(answer)).toEqual([
            { id: "infrastructure", label: "Infrastructure" },
            { id: "offering-s-capability", label: "Offering's Capability" }
        ]);
    });

    it("lists Themes on the Goals and Roadmap pages", () => {
        const answer = { type: AnswerType.StrategicRoadmap } as unknown as AnswerDefinition;
        expect(sectionRailItems(answer, [
            { id: "t1", name: "Financial Stability", description: "" },
            { id: "t2", name: "", description: "" }
        ])).toEqual([
            { id: "t1", label: "Financial Stability" },
            { id: "t2", label: "Theme 2" }
        ]);
    });

    it("is empty for pages without sub-sections", () => {
        expect(sectionRailItems({ type: AnswerType.FreeText } as unknown as AnswerDefinition)).toEqual([]);
        expect(sectionRailItems(undefined)).toEqual([]);
    });
});

describe("pickActiveRail", () => {
    it("picks the last section whose top has passed the threshold", () => {
        expect(pickActiveRail([100, 600, 1400], 700)).toBe(1);
    });
    it("picks the first of several sections sharing a row", () => {
        expect(pickActiveRail([300, 300, 300, 300], 700)).toBe(0);
    });
    it("falls back to the first section before any has passed", () => {
        expect(pickActiveRail([900, 1500], 700)).toBe(0);
    });
});
```

- [ ] **Step 2:** `npx vitest run src/components/interview/rails/railItems.test.ts` → FAIL.
- [ ] **Step 3: Implement** `railItems.ts`:

```ts
import { AnswerType } from "../../../framework/enums/AnswerType";
import type { AnswerDefinition } from "../../../framework/model/AnswerDefinition";
import {
    BRAND_INVENTORY_SECTIONS,
    BRAND_STYLE_SECTIONS,
    BUSINESS_CAPABILITY_SECTIONS,
    BUSINESS_ENGAGEMENT_SECTIONS,
    BUSINESS_FOUNDATION_SUBSECTIONS,
    LEGAL_ENTITY_SECTIONS,
    STRATEGY_FOUNDATION_SECTIONS,
    titleWithPeriod,
    type StrategyThemeValue
} from "../../../framework/engine/AnswerUtils";
import {
    FINANCIAL_FOUNDATION_SECTIONS,
    FINANCIAL_SUSTAINABILITY_SECTIONS
} from "../../../framework/engine/FinancialModel";

/** One bullet on a rail. `id` matches a `data-rail` marker on the page. */
export interface RailItem {
    id: string;
    label: string;
}

/**
 * A stable, attribute-safe id from a sub-section label. The editors
 * use the same function on the same constants for their `data-rail`
 * markers, so the two can never drift apart.
 */
export function railId(label: string): string {

    return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

}

const EMPTY_PERIOD = { start: { month: "", year: "" }, end: { month: "", year: "" } };

/** The left rail: every page of the System, "N. Title". */
export function pageRailItems(sections: readonly { number: number; title: string }[]): RailItem[] {

    return sections.map(section => ({
        id: "page-" + section.number,
        // An empty period drops the Strategy pages' "MM/YY - MM/YY"
        // placeholder: the rail is a table of contents, not a header.
        label: section.number + ". " + titleWithPeriod(section.title, EMPTY_PERIOD).trim()
    }));

}

const FIXED_SECTIONS: Partial<Record<AnswerType, readonly string[]>> = {
    [AnswerType.LegalEntity]: LEGAL_ENTITY_SECTIONS,
    [AnswerType.BrandStyle]: BRAND_STYLE_SECTIONS,
    [AnswerType.BrandInventory]: BRAND_INVENTORY_SECTIONS,
    [AnswerType.BusinessFoundation]: BUSINESS_FOUNDATION_SUBSECTIONS,
    [AnswerType.BusinessEngagement]: BUSINESS_ENGAGEMENT_SECTIONS,
    [AnswerType.BusinessCapability]: BUSINESS_CAPABILITY_SECTIONS,
    [AnswerType.FinancialFoundation]: FINANCIAL_FOUNDATION_SECTIONS,
    [AnswerType.FinancialSustainability]: FINANCIAL_SUSTAINABILITY_SECTIONS,
    [AnswerType.StrategyFoundation]: STRATEGY_FOUNDATION_SECTIONS
};

/** The right rail: the current page's sub-sections. */
export function sectionRailItems(
    answer: AnswerDefinition | undefined,
    themes: readonly StrategyThemeValue[] = []
): RailItem[] {

    if (!answer) {
        return [];
    }

    if (answer.type === AnswerType.MultiPart && answer.parts) {
        return answer.parts.map(part => ({ id: part.id, label: part.label }));
    }

    if (answer.type === AnswerType.StrategicPeriod || answer.type === AnswerType.StrategicRoadmap) {
        return themes.map((theme, index) => ({
            id: theme.id,
            label: theme.name.trim() || "Theme " + (index + 1)
        }));
    }

    return (FIXED_SECTIONS[answer.type] ?? []).map(label => ({ id: railId(label), label }));

}

/**
 * Which sub-section the reader is in, from each section's top edge
 * (viewport px) and the line just under the fixed header. Sections
 * on one row (a columns page) share a top, and the first of them
 * wins -- otherwise a four-column page would always report its last
 * column.
 */
export function pickActiveRail(tops: readonly number[], threshold: number): number {

    let active = 0;

    tops.forEach((top, index) => {
        if (top <= threshold && top > tops[active] + 1) {
            active = index;
        }
    });

    return active;

}
```

(If `titleWithPeriod`'s parameter type is stricter than `EMPTY_PERIOD`, import its range type from `AnswerUtils.ts:2894` and type the constant with it. If `AnswerPartDefinition` names its label field differently, use that field.)

- [ ] **Step 4:** Test → PASS; `tsc` clean.
- [ ] **Step 5: Commit** — `"Add rail item helpers"`.

### Task 10: `data-rail` markers on every Foundation page

**Files:** Modify the editors below; import `railId` from `./rails/railItems` where constants are used.

| Page | Element to mark | Value |
|---|---|---|
| Columns pages (Identity 1–2, Brand 1) | `AnswerRenderer.tsx:899-908` `div.answer-column-editor` | `data-rail={part.id}` |
| Legal Entity | `subsection()` `section.legal-entity-section` (:662-680) | `railId(LEGAL_ENTITY_SECTIONS[index])` |
| Brand Style | the three `div.brand-style-body` (:434, :537, :610) | `railId(BRAND_STYLE_SECTIONS[0..2])` |
| Brand Inventory | `div.brand-style-body` (:425, :450) | `railId(BRAND_INVENTORY_SECTIONS[0..1])` |
| Business Foundation | inside each segment card: `.business-foundation-description` **and** `.business-foundation-profiles` → A; `.business-foundation-competitors` → B; `.business-foundation-proposition` → C; `.business-foundation-offerings` → D (:1560-1606) | `railId(BUSINESS_FOUNDATION_SUBSECTIONS[i])` |
| Business Engagement | `div.business-engagement-section` from `foldingSection` (:982) — channels → [0], relationships → [1] | `railId(BUSINESS_ENGAGEMENT_SECTIONS[i])` |
| Business Capability | the two top cards (:2964-2967) | `railId(BUSINESS_CAPABILITY_SECTIONS[i])` |
| Financial Foundation | `sectionCard` `div.financial-section` (:393-403), mapping ids `financial-costs/need/funding/position` → [0..3] | `railId(FINANCIAL_FOUNDATION_SECTIONS[i])` |
| Financial Sustainability | `sectionCard` (~:532) — revenue → [0], break-even → [1] | `railId(FINANCIAL_SUSTAINABILITY_SECTIONS[i])` |
| Strategy Foundation | four `div.brand-style-body` (:401, :433, :456, :469) | `railId(STRATEGY_FOUNDATION_SECTIONS[i])` |
| Strategic Period | `section.strategy-theme-panel` (:311-313) | `theme.id` |
| Strategic Roadmap | `div.roadmap-theme-box` (:331-351) | `theme.id` |

Repeated markers (Business Foundation/Engagement per segment) are intended: scrolling uses the first match, focus-tracking uses `closest("[data-rail]")`.

- [ ] **Step 1:** Add the attributes as listed.
- [ ] **Step 2:** `npx tsc --noEmit` clean; `npx vitest run` all green (earlier editor tests still pass).
- [ ] **Step 3: Verify in the app** on each of the 14 Foundation pages, via `javascript_tool`:

```js
[...new Set([...document.querySelectorAll("[data-rail]")].map(e => e.dataset.rail))]
```

The result must equal the ids from `sectionRailItems` for that page (Identity 1: `description, mission, positioning, vision` part ids; Business 3: `infrastructure, offering-s-capability`; etc.).

- [ ] **Step 4: Commit** — `"Mark page sub-sections for the section rail"`.

### Task 11: `BulletRail` component and styles

**Files:**
- Create: `src/components/interview/rails/BulletRail.tsx`, `src/components/interview/rails/BulletRail.test.tsx`, `src/styles/bullet-rail.css`

**Interfaces (Produces):**

```ts
export default function BulletRail(props: {
    items: readonly RailItem[];
    activeId: string | null;
    onSelect: (id: string) => void;
    side: "left" | "right";
    label: string;            // nav aria-label: "Pages" | "Sections"
}): JSX.Element | null;       // null when items.length < 2
```

- [ ] **Step 1: Failing test**

```tsx
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BulletRail from "./BulletRail";

const items = [{ id: "a", label: "1. Definition" }, { id: "b", label: "2. Ethics" }];

afterEach(cleanup);

describe("BulletRail", () => {

    it("marks the active bullet as current", () => {
        render(<BulletRail items={items} activeId="b" onSelect={() => {}} side="left" label="Pages" />);
        expect(screen.getByRole("button", { name: "2. Ethics" }).getAttribute("aria-current")).toBe("true");
        expect(screen.getByRole("button", { name: "1. Definition" }).getAttribute("aria-current")).toBeNull();
    });

    it("reports the chosen bullet", () => {
        const onSelect = vi.fn();
        render(<BulletRail items={items} activeId="a" onSelect={onSelect} side="left" label="Pages" />);
        fireEvent.click(screen.getByRole("button", { name: "2. Ethics" }));
        expect(onSelect).toHaveBeenCalledWith("b");
    });

    it("renders nothing for a single item", () => {
        const { container } = render(<BulletRail items={[items[0]]} activeId="a" onSelect={() => {}} side="right" label="Sections" />);
        expect(container.firstChild).toBeNull();
    });

});
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Implement**

`BulletRail.tsx`:

```tsx
import type { RailItem } from "./railItems";

import "../../../styles/bullet-rail.css";

/**
 * A fixed column of bullets beside the interview card: pages on the
 * left, the current page's sections on the right. The current bullet
 * "blooms" green and grows; the rest stay ice blue. Its label turns
 * bold too, and it carries aria-current, so the state never rests on
 * colour alone.
 */
export default function BulletRail({

    items,

    activeId,

    onSelect,

    side,

    label

}: {

    items: readonly RailItem[];
    activeId: string | null;
    onSelect: (id: string) => void;
    side: "left" | "right";
    label: string;

}) {

    if (items.length < 2) {
        return null;
    }

    return (
        <nav className={"bullet-rail bullet-rail-" + side} aria-label={label}>

            <ol className="bullet-rail-list">

                {items.map(item => {

                    const active = item.id === activeId;

                    return (
                        <li key={item.id}>
                            <button
                                type="button"
                                className={"bullet-rail-item" + (active ? " active" : "")}
                                aria-current={active ? "true" : undefined}
                                title={item.label}
                                onClick={() => onSelect(item.id)}
                            >
                                <span className="bullet-rail-dot" aria-hidden="true" />
                                <span className="bullet-rail-label">{item.label}</span>
                            </button>
                        </li>
                    );

                })}

            </ol>

        </nav>
    );

}
```

`src/styles/bullet-rail.css`:

```css
/* ==========================================================
   Bullet rails -- pages (left) and sections (right), fixed in
   the gutters beside the interview card, between the fixed
   header (80px) and the fixed Previous/Next bar + footer.
========================================================== */

:root {

    --rail-dot: #B5D4F4;          /* ice blue: every other bullet */
    --rail-dot-active: #639922;   /* green: where the user is */
    --rail-bloom: #C0DD97;        /* the bloom ring around it */
    --rail-gutter: 56px;          /* dots-only width */

}

.bullet-rail {

    position: fixed;
    top: 104px;
    bottom: 160px;
    z-index: 25;

    display: flex;
    align-items: center;

    width: var(--rail-gutter);

}

.bullet-rail-left { left: 0; justify-content: flex-start; padding-left: 16px; }

.bullet-rail-right { right: 0; justify-content: flex-end; padding-right: 16px; }

.bullet-rail-list {

    display: flex;
    flex-direction: column;
    gap: 18px;

    margin: 0;
    padding: 0;

    list-style: none;

}

.bullet-rail-item {

    position: relative;

    display: flex;
    align-items: center;
    gap: 10px;

    padding: 2px 0;

    border: none;
    background: none;
    cursor: pointer;

    font: inherit;
    font-size: 13px;
    color: #5f6368;
    text-align: left;

}

.bullet-rail-right .bullet-rail-item { flex-direction: row-reverse; text-align: right; }

.bullet-rail-dot {

    flex: none;

    width: 12px;
    height: 12px;

    border-radius: 50%;
    background: var(--rail-dot);

    transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;

}

.bullet-rail-item.active { color: #1f2937; font-weight: 600; }

.bullet-rail-item.active .bullet-rail-dot {

    background: var(--rail-dot-active);
    box-shadow: 0 0 0 4px var(--rail-bloom);
    transform: scale(1.45);

}

.bullet-rail-item:hover .bullet-rail-dot { transform: scale(1.2); }

.bullet-rail-item.active:hover .bullet-rail-dot { transform: scale(1.45); }

.bullet-rail-item:focus-visible { outline: 2px solid #0b57d0; outline-offset: 4px; border-radius: 4px; }

/* Narrow windows: dots only; the label appears beside the dot on
   hover/focus, over the page, like a tooltip. */
.bullet-rail-label {

    position: absolute;
    top: 50%;

    padding: 4px 8px;

    border-radius: 6px;
    background: #1f2937;
    color: #ffffff;

    white-space: nowrap;
    font-weight: 500;

    transform: translateY(-50%);
    opacity: 0;
    pointer-events: none;

}

.bullet-rail-left .bullet-rail-label { left: 24px; }

.bullet-rail-right .bullet-rail-label { right: 24px; }

.bullet-rail-item:hover .bullet-rail-label,
.bullet-rail-item:focus-visible .bullet-rail-label { opacity: 1; }

/* Wide windows: the gutters have room, so labels sit inline. */
@media (min-width: 1700px) {

    :root { --rail-gutter: 220px; }

    .bullet-rail-label {

        position: static;

        max-width: 180px;
        padding: 0;

        overflow: hidden;
        text-overflow: ellipsis;

        background: none;
        color: inherit;
        font-weight: inherit;

        transform: none;
        opacity: 1;

    }

}

@media (prefers-reduced-motion: reduce) {

    .bullet-rail-dot { transition: none; }

}
```

- [ ] **Step 4:** Test → PASS; `tsc` clean.
- [ ] **Step 5: Commit** — `"Add BulletRail component"`.

### Task 12: Active-section tracking and scroll-to

**Files:**
- Create: `src/components/interview/rails/useActiveRailSection.ts`, `src/components/interview/rails/useActiveRailSection.test.tsx`

**Interfaces (Produces):**

```ts
export const RAIL_TOP_CLEARANCE = 104;   // fixed header 80 + 24
export function useActiveRailSection(ids: readonly string[], resetKey: unknown): string | null;
export function scrollToRailSection(id: string): void;
```

- [ ] **Step 1: Failing test**

```tsx
import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, render, screen, fireEvent } from "@testing-library/react";

import { useActiveRailSection } from "./useActiveRailSection";

function Probe({ ids }: { ids: string[] }) {
    const active = useActiveRailSection(ids, "page-1");
    return (
        <>
            <p data-testid="active">{active}</p>
            {ids.map(id => (
                <div key={id} data-rail={id}><input aria-label={"field " + id} /></div>
            ))}
        </>
    );
}

function placeTops(tops: Record<string, number>) {
    document.querySelectorAll<HTMLElement>("[data-rail]").forEach(el => {
        const top = tops[el.dataset.rail!];
        el.getBoundingClientRect = () => ({ top, bottom: top + 100, left: 0, right: 0, width: 0, height: 100, x: 0, y: top, toJSON() {} });
    });
}

afterEach(cleanup);

describe("useActiveRailSection", () => {

    it("starts on the first section", () => {
        render(<Probe ids={["a", "b"]} />);
        expect(screen.getByTestId("active").textContent).toBe("a");
    });

    it("follows the scroll position", () => {
        render(<Probe ids={["a", "b"]} />);
        placeTops({ a: -400, b: 200 });
        act(() => { window.dispatchEvent(new Event("scroll")); });
        expect(screen.getByTestId("active").textContent).toBe("b");
    });

    it("follows the focused field", () => {
        render(<Probe ids={["a", "b", "c"]} />);
        fireEvent.focusIn(screen.getByLabelText("field c"));
        expect(screen.getByTestId("active").textContent).toBe("c");
    });

});
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Implement**

```ts
import { useEffect, useState } from "react";

import { pickActiveRail } from "./railItems";

/** Where content starts below the fixed header (80px + 24px). */
export const RAIL_TOP_CLEARANCE = 104;

// A section counts as "reached" once its top is within this band
// under the header -- about a third of a screen, so the rail moves
// on while the new section is still near the top.
const REACHED_BAND = 240;

function railElements(ids: readonly string[]): HTMLElement[] {

    return ids
        .map(id => document.querySelector<HTMLElement>('[data-rail="' + CSS.escape(id) + '"]'))
        .filter((element): element is HTMLElement => element !== null);

}

/**
 * Which of the current page's sections the user is in: the one
 * holding the focused field when there is one, otherwise the one
 * scrolled to. The page itself (the window) scrolls -- no inner
 * scroll container -- so a window scroll listener is enough.
 * `resetKey` (the page number) sends it back to the first section
 * whenever the page changes.
 */
export function useActiveRailSection(ids: readonly string[], resetKey: unknown): string | null {

    const [active, setActive] = useState<string | null>(ids[0] ?? null);
    const key = ids.join("|");

    useEffect(() => {

        setActive(ids[0] ?? null);

        function fromScroll() {
            const elements = railElements(ids);
            if (elements.length === 0) {
                return;
            }
            const index = pickActiveRail(
                elements.map(element => element.getBoundingClientRect().top),
                RAIL_TOP_CLEARANCE + REACHED_BAND
            );
            setActive(elements[index].dataset.rail ?? null);
        }

        function fromFocus(event: FocusEvent) {
            const holder = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-rail]");
            const id = holder?.dataset.rail;
            if (id && ids.includes(id)) {
                setActive(id);
            }
        }

        window.addEventListener("scroll", fromScroll, { passive: true });
        document.addEventListener("focusin", fromFocus);

        return () => {
            window.removeEventListener("scroll", fromScroll);
            document.removeEventListener("focusin", fromFocus);
        };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, resetKey]);

    return active;

}

/**
 * Takes the user to a section: opens it if it is folded (the same
 * `aria-expanded="false"` toggle jumpTo.ts relies on), scrolls it
 * just under the header, and puts the cursor in its first field.
 */
export function scrollToRailSection(id: string): void {

    const target = document.querySelector<HTMLElement>('[data-rail="' + CSS.escape(id) + '"]');

    if (!target) {
        return;
    }

    const toggle = target.querySelector<HTMLButtonElement>(':scope > * > .strategy-box-toggle[aria-expanded="false"], :scope > .strategy-box-toggle[aria-expanded="false"]');
    toggle?.click();

    window.requestAnimationFrame(() => {
        const top = target.getBoundingClientRect().top + window.scrollY - RAIL_TOP_CLEARANCE;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        target.querySelector<HTMLElement>("input:not([disabled]), textarea:not([disabled]), select:not([disabled])")
            ?.focus({ preventScroll: true });
    });

}
```

(If the project's ESLint config has no `react-hooks` plugin, drop the disable comment.)

- [ ] **Step 4:** Test → PASS; `tsc` clean.
- [ ] **Step 5: Commit** — `"Track the active section for the section rail"`.

### Task 13: Wire both rails into the interview page

**Files:**
- Modify: `src/pages/Conversation.tsx` (imports; a `goToPage` handler near `previousSection` :1137; JSX after `<AppHeader>` :2309)
- Modify: `src/styles/conversation-layout.css` (`.conversation-card` max-width)

**Interfaces:** Consumes `pageRailItems`, `sectionRailItems` (Task 9), `BulletRail` (Task 11), `useActiveRailSection`, `scrollToRailSection` (Task 12).

- [ ] **Step 1: Implement** — in `Conversation.tsx`:

Imports:

```tsx
import BulletRail from "../components/interview/rails/BulletRail";
import { pageRailItems, sectionRailItems } from "../components/interview/rails/railItems";
import { scrollToRailSection, useActiveRailSection } from "../components/interview/rails/useActiveRailSection";
```

Next to `previousSection()`:

```tsx
    // The page rail's own jump: the same bookkeeping Next and
    // Previous do (commit the Process Library, save, redraw, back
    // to the top), to any page at once.
    function goToPage(index: number) {

        if (!session || index === session.getCurrentSectionIndex()) {
            return;
        }

        commitProcessLibraryChangesToOperationalLog();

        if (session.goToSection(index)) {
            persistAndRedraw(session);
            scrollToTop();
        }

    }
```

Hooks must run before the early returns (`loadingError` / `!session` at ~:1609-1615). Compute rail inputs defensively above them:

```tsx
    // The two bullet rails. Computed before the early returns below
    // (hooks), and simply empty while nothing is loaded.
    const railPages = session ? pageRailItems(session.getSections()) : [];
    const railSectionIndex = session?.getCurrentSectionIndex() ?? 0;
    const railSections = session
        ? sectionRailItems(railAnswer(session), railThemes(session))
        : [];
    const activeRailSection = useActiveRailSection(railSections.map(item => item.id), railSectionIndex);
```

`railAnswer(session)` must return the same answer definition the page renders — the value of `effectiveAnswer` at :1672 (shared answers resolved). Move the `effectiveAnswer` computation into a small function `resolveEffectiveAnswer(session)` defined above the component's early returns and use it both at :1672 and here, so they cannot differ. `railThemes(session)` returns `asStrategyFoundationValue(session.getResponse(strategyFoundationSection.number)).themes` when the System has a Strategy Foundation section, else `[]` — factor it out of the existing computation at :2017-2019 the same way.

JSX, right after `<AppHeader … />` (:2309), only when not on the Introduction:

```tsx
            {!showIntroduction && (
                <>
                    <BulletRail
                        side="left"
                        label="Pages"
                        items={railPages}
                        activeId={"page-" + currentSection.number}
                        onSelect={id => goToPage(Number(id.replace("page-", "")) - 1)}
                    />
                    <BulletRail
                        side="right"
                        label="Sections"
                        items={railSections}
                        activeId={activeRailSection}
                        onSelect={scrollToRailSection}
                    />
                </>
            )}
```

Replace the comment at :2303-2308 ("deliberately no side rail") with one describing the two rails.

`src/styles/conversation-layout.css` — keep the card clear of the rails:

```css
.conversation-card {

    width: 100%;
    max-width: min(1400px, calc(100vw - 2 * var(--rail-gutter, 56px)));

    /* …existing declarations unchanged… */

}
```

- [ ] **Step 2:** `npx tsc --noEmit` clean; `npx vitest run` all green.
- [ ] **Step 3: Verify in the app** (1440×900 and 1920×1080, via `resize_window`):
  - Intro screen: no rails.
  - Identity page 1: left rail shows "1. Definition / 2. Ethics / 3. Legal Entity", page 1 green and larger; right rail shows the four columns; clicking in the "Vision" textarea turns the Vision bullet green.
  - Click "3. Legal Entity" on the left → page changes, scrolls to top, saved on reload.
  - Legal Entity: scroll down → right bullet advances through the six sections; clicking "Legal Entity Expenses" scrolls there and focuses its first field.
  - Business page 3: clicking "Offering's Capability" unfolds that card if folded.
  - Strategy page 3: right rail lists Themes.
  - 1440px: dots only, labels on hover; 1920px: labels inline, no overlap with the card or the Previous/Next bar.
  - `read_console_messages` → no errors. Screenshot both widths.
- [ ] **Step 4: Commit** — `"Add page and section bullet rails to the interview"`.

---

## Final verification

- [ ] `npx vitest run` → all pass; `npx tsc --noEmit` → clean; `npm run build` → succeeds.
- [ ] Re-measure page heights at 1440×900 (the `__walk` script from the review) and report before/after for all 14 Foundation pages.
- [ ] Use superpowers:finishing-a-development-branch to decide merge/PR.

## Out of scope (noted for later)

- A third "done" bullet state (deeper blue) — needs a completion signal per page/section.
- Splitting Business pages into one-screen steps (the rails already support it).
- Minimum Tauri window size (`src-tauri/tauri.conf.json` is 800×600 today).
- Demand-source cards in Customer Engagement have no fold at all; left as is.
