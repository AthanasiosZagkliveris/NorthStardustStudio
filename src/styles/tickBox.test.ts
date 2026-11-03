import { describe, expect, it } from "vitest";

import { stylesheet } from "../test/stylesheet";

describe("one tick box", () => {

    it("gives every checkbox one fixed size that a wrapping label cannot squeeze, beside its label's first line", () => {
        const css = stylesheet("global.css");
        expect(css).toContain("input[type=\"checkbox\"] { flex: none; width: var(--size-mark); height: var(--size-mark); margin: 0; font: inherit; line-height: inherit;");
        expect(css).toContain("label:has(> input[type=\"checkbox\"]) { align-items: flex-start;");
        expect(css).toContain("label:has(> input[type=\"checkbox\"]) > input[type=\"checkbox\"] { margin-top: calc((1lh - var(--size-mark)) / 2); }");
    });

    it("leaves no checkbox a size of its own", () => {
        for (const name of ["conversation.css", "global.css", "notepad.css"]) {
            const css = stylesheet(name);
            // A rule for a checkbox's own class that sets a width.
            expect(css).not.toMatch(/answer-checklist-checkbox\s*\{[^}]*width:\s*20px/);
            expect(css).not.toMatch(/business-foundation-tick > \.brand-tick-box\s*\{[^}]*margin-top/);
        }
    });


    it("underlines a tick-box option's words under the pointer, and gives its box a field's hover", () => {
        const css = stylesheet("global.css");
        expect(css).toContain("label:has(> input[type=\"checkbox\"]:not(:disabled)):hover > :not(input),");
        // A tick box that is not inside its label (a Text Hierarchy level's)
        // reacts the same, under the pointer on the box itself.
        expect(css).toContain(".brand-tick:has(> input[type=\"checkbox\"]:not(:disabled):hover) > :not(input) { text-decoration: underline;");
        // The box itself takes a field's hover: the soft glow round it (no wire), flat when ticked.
        expect(css).toContain("input[type=\"checkbox\"]:hover:not(:disabled):not(:focus-visible) { box-shadow: var(--cell-inset-recess), var(--choice-glow); }");
        expect(css).toContain("input[type=\"checkbox\"]:checked { box-shadow: none;");
    });

});

describe("a tick box's click area", () => {

    it("is only the box and its words: the label is as wide as they are", () => {
        const css = stylesheet("global.css");
        expect(css).toMatch(/label:has\(> input\[type="checkbox"\]\) \{[^}]*width: fit-content;[^}]*max-width: 100%;/);
    });

});

describe("a radio's reaction", () => {

    it("reacts under the pointer as a tick box does: its words underlined and the round's glow ring", () => {
        const css = stylesheet("radio-choice.css");
        // The round is drawn (a circle in the box's own look), so its ring is a ring: 4px at 18% round it, as a tick box's.
        expect(css).toContain(".radio-choice-option > input[type=\"radio\"] { appearance: none; flex: none; box-sizing: border-box; width: var(--size-radio); height: var(--size-radio); margin: 0; border: 1px solid transparent; border-radius: 50%;");
        expect(css).toContain(".radio-choice-option > input[type=\"radio\"]:hover:not(:disabled):not(:focus-visible) { box-shadow: var(--cell-inset-recess), var(--choice-glow); }");
        expect(css).toContain(".radio-choice-option:has(> input[type=\"radio\"]:not(:disabled)):hover > :not(input) { text-decoration: underline;");
    });

});
