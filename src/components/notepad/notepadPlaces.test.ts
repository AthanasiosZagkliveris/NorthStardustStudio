import { describe, expect, it } from "vitest";

import { pagePlace } from "./notepadPlaces";

/* A PAGE OF SEVERAL SECTIONS IS SAID WHERE IT STANDS (PageGroups.ts): its group's title and its place among the pages the rail shows -- a Glossary entry or a
   note saved on either of its sections names the one page. */
describe("a page said in words", () => {

    it("names the Business System's joined pages from either of their sections, each at its place among the rail's pages", () => {
        expect(pagePlace(3, 1)).toBe("3. Business System → 1. Foundation & Engagement");
        expect(pagePlace(3, 2)).toBe("3. Business System → 1. Foundation & Engagement");
        expect(pagePlace(3, 3)).toBe("3. Business System → 2. Infrastructure & Capability");
        expect(pagePlace(3, 4)).toBe("3. Business System → 3. Financials");
        expect(pagePlace(3, 5)).toBe("3. Business System → 3. Financials");
    });

    it("names the Identity System's one page from any of its sections, as the Brand System's is named", () => {
        expect(pagePlace(1, 1)).toBe("1. Identity System → Identity System");
        expect(pagePlace(1, 2)).toBe("1. Identity System → Identity System");
        expect(pagePlace(1, 3)).toBe("1. Identity System → Identity System");
        expect(pagePlace(2, 2)).toBe("2. Brand System → Brand System");
    });

});
