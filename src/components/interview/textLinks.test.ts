import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { TEXT_LINK_CLASSES } from "./textLinks.ts";

/* One look for every text link (src/styles/text-links.css): the stylesheet and textLinks.ts name the same classes. */

describe("the text links", () => {

    const css = readFileSync("src/styles/text-links.css", "utf8");

    it("are the same classes in the stylesheet and in the list the marquee reads", () => {
        const selectors = [...css.matchAll(/:is\(((?:\.[a-z-]+(?:, )?)+)\):is\(button, a, span\)/g)].map(match => match[1].split(", ").map(name => name.slice(1)).sort());
        expect(selectors.length).toBeGreaterThan(0);
        for (const names of selectors) {
            expect(names).toEqual([...TEXT_LINK_CLASSES].sort());
        }
    });

    it("rest regular and plain and go bold and underlined under the pointer", () => {
        expect(css).toContain("font-weight: 400 !important;");
        expect(css).toContain("text-decoration: none !important;");
        expect(css).toContain("text-shadow: var(--hover-bold) !important;");
        expect(css).toContain("text-decoration: underline !important;");
        expect(css).toContain("text-underline-offset: 1px !important;");
    });

});
