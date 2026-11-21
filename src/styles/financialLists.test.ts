import { describe, expect, it } from "vitest";

import { stylesheet } from "../test/stylesheet";

/* Every label-and-amount list of the financial pages spaces its rows by
   one shared token and stands each amount on its label's first line. */
describe("the financial label-and-amount lists", () => {

    const css = stylesheet("conversation.css");

    it("space their rows by --space-field, in one rule", () => {
        // (The coverage, obligations and mix lists were the Financial Position's and the Break-Even's, records now in the Workbook: Questions 20, section 14.)
        expect(css).toMatch(/\.financial-cost-inputs\s*\{[^}]*gap:\s*var\(--space-field\)/);
    });

    it("put each amount on the first line of its label", () => {
        for (const row of [".financial-cost-inputs > li"]) {
            const escaped = row.replace(/[.>]/g, m => "\\" + m);
            expect(css, row).toMatch(new RegExp(escaped + "\\s*\\{[^}]*align-items:\\s*first baseline"));
        }
    });
});
