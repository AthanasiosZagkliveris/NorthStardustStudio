import { describe, expect, it } from "vitest";

import { stylesheet } from "../test/stylesheet";

/* Every label-and-amount list of the financial pages spaces its rows by
   one shared token and stands each amount on its label's first line. */
describe("the financial label-and-amount lists", () => {

    const css = stylesheet("conversation.css");

    it("space their rows by --space-field, in one rule", () => {
        expect(css).toMatch(/\.financial-coverage,\s*\.financial-obligations,\s*\.financial-mix-legend,\s*\.financial-cost-inputs\s*\{[^}]*gap:\s*var\(--space-field\)/);
    });

    it("put each amount on the first line of its label", () => {
        for (const row of [".financial-cost-inputs > li", ".financial-mix-legend > li", ".financial-obligations > li"]) {
            const escaped = row.replace(/[.>]/g, m => "\\" + m);
            expect(css, row).toMatch(new RegExp(escaped + "\\s*\\{[^}]*align-items:\\s*first baseline"));
        }
    });
});
