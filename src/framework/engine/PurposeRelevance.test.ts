import { describe, expect, it } from "vitest";

import { PURPOSE_IDS } from "./PositioningIds.ts";
import { orderedByRelevance, purposeOrderAbout, purposeRelevance, RELATIONSHIP_INTENT } from "./PurposeRelevance.ts";

const none = { models: [], categories: [], relationships: [] };

describe("the relevance of a purpose to the buyer (the owner's tables of 2026-10-30)", () => {

    it("says nothing, and keeps the list as it is, until something is answered", () => {
        expect(purposeRelevance(none)).toBeNull();
        expect(purposeOrderAbout(none)).toBe("");
        const options = PURPOSE_IDS.map(id => ({ id }));
        expect(orderedByRelevance(options, null).map(option => option.id)).toEqual([...PURPOSE_IDS]);
    });

    it("reads the seller and buyer relationship table: Business Growth is a business purpose, Entertainment and Everyday Needs are consumer ones", () => {
        expect(purposeRelevance({ ...none, models: ["b2b"] })).toMatchObject({ growth: 2, entertainment: 0, everyday: 0, health: 1, access: 1, compliance: 2 });
        expect(purposeRelevance({ ...none, models: ["b2c"] })).toMatchObject({ growth: 0, entertainment: 2, everyday: 2, compliance: 1, learning: 2 });
        // Both relationships: the most relevant of the two.
        expect(purposeRelevance({ ...none, models: ["b2b", "b2c"] })).toMatchObject({ growth: 2, entertainment: 2, compliance: 2 });
        expect(purposeOrderAbout({ ...none, models: ["b2c"] })).toBe("the seller and buyer relationship");
    });

    it("reads the buyer's category table when a category is chosen: a Direct Buyer does not gift, a Proxy Buyer does", () => {
        const direct = purposeRelevance({ ...none, models: ["b2c"], categories: ["b2c:direct"] })!;
        const proxy = purposeRelevance({ ...none, models: ["b2c"], categories: ["b2c:proxy"] })!;
        const dual = purposeRelevance({ ...none, models: ["b2c"], categories: ["b2c:dual"] })!;
        expect([direct.gifting, proxy.gifting, dual.gifting]).toEqual([0, 2, 1]);
        expect([direct.social, proxy.social, dual.social]).toEqual([2, 0, 2]);
        expect([direct.growth, proxy.growth, dual.growth]).toEqual([2, 2, 2]);
        expect(purposeOrderAbout({ ...none, categories: ["b2c:proxy"] })).toBe("the buyer's category");
    });

    it("reads the buyer and user relationship table of a consumer buyer first: a friend does not buy for productivity, a Commercial & Professional buyer does not buy entertainment", () => {
        const friend = purposeRelevance({ models: ["b2c"], categories: ["b2c:proxy"], relationships: ["rel:friend"] })!;
        expect(friend).toMatchObject({ productivity: 0, entertainment: 2, gifting: 2, health: 1 });
        const commercial = purposeRelevance({ models: ["b2c"], categories: ["b2c:proxy"], relationships: ["rel:commercial"] })!;
        expect(commercial).toMatchObject({ entertainment: 0, social: 0, growth: 2, compliance: 2, learning: 2 });
        const parent = purposeRelevance({ models: ["b2c"], categories: ["b2c:proxy"], relationships: ["rel:parent"] })!;
        expect(parent).toMatchObject({ growth: 0, everyday: 2, protection: 2, social: 1 });
        expect(purposeOrderAbout({ models: ["b2c"], categories: ["b2c:proxy"], relationships: ["rel:parent"] })).toBe("the buyer and user relationship");
        // A business relationship has no table of its own: the buyer's category is used.
        expect(purposeOrderAbout({ models: ["b2b"], categories: ["b2b:proxy"], relationships: ["rel:employer"] })).toBe("the buyer's category");
    });

    it("puts the primary purposes first, then the possible ones, then the rest, and takes none away", () => {
        const relevance = purposeRelevance({ ...none, models: ["b2b"], categories: ["b2b:direct"] })!;
        const ordered = orderedByRelevance(PURPOSE_IDS.map(id => ({ id })), relevance).map(option => option.id);
        expect(ordered).toHaveLength(12);
        expect(new Set(ordered).size).toBe(12);
        const levels = ordered.map(id => relevance[id]);
        expect(levels).toEqual([...levels].sort((a, b) => b - a));
        // (Within a level the order of the list stays.)
        expect(ordered.slice(0, 3)).toEqual(["learning", "health", "entertainment"]);
    });

    it("says how each consumer relationship usually reads: proxy, dual-intent or either (the owner's table)", () => {
        expect(RELATIONSHIP_INTENT).toEqual({ "rel:parent": "proxy", "rel:caregiver": "proxy", "rel:family": "either", "rel:partner": "dual", "rel:friend": "proxy", "rel:commercial": "proxy", "rel:otherpersonal": "either" });
    });
});
