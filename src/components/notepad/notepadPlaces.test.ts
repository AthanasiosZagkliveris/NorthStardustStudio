import { describe, expect, it } from "vitest";

import { pagePlace } from "./notepadPlaces";

/* A PAGE OF SEVERAL SECTIONS IS SAID WHERE IT STANDS (PageGroups.ts): its group's title and its place among the pages the rail shows -- a Glossary entry or a
   note saved on either of its sections names the one page. */
describe("a page said in words", () => {

    it("names the Business System's Financials from either of its sections, at its place after the pages of one section", () => {
        expect(pagePlace(3, 4)).toBe("3. Business System → 4. Financials");
        expect(pagePlace(3, 5)).toBe("3. Business System → 4. Financials");
        expect(pagePlace(3, 3)).toBe("3. Business System → 3. Infrastructure & Capability");
    });

    it("keeps the Identity System's pages as they were", () => {
        expect(pagePlace(1, 2)).toBe("1. Identity System → 1. Definition & Purpose");
        expect(pagePlace(1, 3)).toBe("1. Identity System → 2. Legal Entity");
    });

});
