import { describe, expect, it } from "vitest";

import { stylesheet } from "../test/stylesheet";

describe("one tick box", () => {

    it("gives every checkbox one fixed size that a wrapping label cannot squeeze, beside its label's first line", () => {
        const css = stylesheet("global.css");
        expect(css).toContain("input[type=\"checkbox\"] { flex: none; width: 18px; height: 18px; margin: 0; font: inherit; line-height: inherit;");
        expect(css).toContain("label:has(> input[type=\"checkbox\"]) { align-items: flex-start; }");
        expect(css).toContain("label:has(> input[type=\"checkbox\"]) > input[type=\"checkbox\"] { margin-top: calc((1lh - 18px) / 2); }");
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
        expect(css).toContain("label:has(> input[type=\"checkbox\"]:not(:disabled)):hover > :not(input) { text-decoration: underline;");
        expect(css).toContain("box-shadow: 0 0 0 1px var(--line-primary), 0 0 0 5px color-mix(in srgb, var(--glow-color) 18%, transparent);");
    });

});
