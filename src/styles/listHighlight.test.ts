import { describe, expect, it } from "vitest";

import { stylesheet } from "../test/stylesheet";

/* Every Capability and System row -- the lists on System Selection and
   the rail's flyouts -- is highlighted by one rule, and none by its own. */
describe("the Capability and System row highlight", () => {

    const global = stylesheet("global.css");

    it("is one rule for all four kinds of row", () => {
        expect(global).toContain(".capability-item:hover, .system-item:hover, .org-rail-capability-item:hover, .org-rail-system-item:hover { background: var(--bg-list-hover); }");
        expect(global).toContain(".capability-item.active { background: var(--bg-list-selected); }");
    });

    it("leaves no list its own highlight colour", () => {
        for (const sheet of ["capability-list.css", "system-list.css", "organization-calendar.css"]) {
            const css = stylesheet(sheet);
            expect(css, sheet).not.toMatch(/(capability-item|system-item)[^{}]*:hover[^{}]*\{[^}]*background/);
            expect(css, sheet).not.toMatch(/capability-item\.active[^{}]*\{[^}]*background/);
        }
    });

    it("draws every row's text through the list ink, light and dark", () => {
        const colours = stylesheet("colors.css");
        expect(colours.match(/--capability-list-ink-weight: /g)).toHaveLength(2);
        expect(colours.match(/--bg-list-hover: /g)).toHaveLength(2);
        expect(colours.match(/--bg-list-selected: /g)).toHaveLength(2);
        expect(stylesheet("capability-list.css")).toContain("var(--capability-list-ink-weight)");
        expect(stylesheet("system-list.css")).toContain("var(--capability-list-ink-weight)");
    });

});
