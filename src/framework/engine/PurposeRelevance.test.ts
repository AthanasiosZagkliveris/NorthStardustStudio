import { describe, expect, it } from "vitest";

import { PURPOSE_IDS } from "./PositioningIds.ts";
import { differentiationByLifeStage, outcomesByLifeStage, outcomeByPurpose, userOutcomeByPurpose, differentiationByPurpose, differentiationByRelationship, differentiationRelevance, orderedByRelevance, purposeOrderAbout, purposeRelevance, RELATIONSHIP_INTENT } from "./PurposeRelevance.ts";

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
        // A business relationship has its own table (below); without one chosen the buyer's category is used.
        expect(purposeOrderAbout({ models: ["b2b"], categories: ["b2b:proxy"], relationships: [] })).toBe("the buyer's category");
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

    it("reads the table of the buyer's and the user's life stage first, and the next table for the three purposes it does not cover", () => {
        // A Student buying for a Minor: Business Growth is not relevant, Gifting and Everyday Needs are primary, Health only possible.
        const studentMinor = purposeRelevance({ models: ["b2c"], categories: ["b2c:proxy"], relationships: ["rel:friend"], buyerStages: ["young"], userStages: ["age:minor"] })!;
        expect(studentMinor).toMatchObject({ growth: 0, gifting: 2, everyday: 2, health: 1, learning: 2, productivity: 1, compliance: 0, access: 2, protection: 1 });
        // (Entertainment, Social Connection and Creation are not in that table: the relationship's table says them: a friend's Entertainment is primary, Creation possible.)
        expect(studentMinor).toMatchObject({ entertainment: 2, social: 2, creation: 1 });
        // A Worker buying for an Adult: the one place where Business Growth is primary.
        const workerAdult = purposeRelevance({ models: ["b2c"], categories: ["b2c:dual"], relationships: [], buyerStages: ["adult"], userStages: ["age:adult"] })!;
        expect(workerAdult).toMatchObject({ growth: 2, protection: 2, compliance: 2, learning: 2 });
        // A Worker or a Senior buying for a Minor or a Senior: Health, Protection and Compliance are primary (the caregiving diagonal).
        for (const [buyer, user] of [["adult", "age:senior"], ["senior", "age:senior"], ["senior", "age:minor"]]) {
            expect(purposeRelevance({ models: ["b2c"], categories: [], relationships: [], buyerStages: [buyer], userStages: [user] })!).toMatchObject({ health: user === "age:senior" ? 2 : 2, protection: 2, compliance: 2 });
        }
        expect(purposeOrderAbout({ models: ["b2c"], categories: [], relationships: [], buyerStages: ["young"], userStages: ["age:minor"] })).toBe("the buyer's and the user's life stage");
        // Gifting is relevant in every combination.
        for (const buyer of ["young", "adult", "senior"]) for (const user of ["age:minor", "age:young", "age:adult", "age:senior"]) {
            expect(purposeRelevance({ models: ["b2c"], categories: [], relationships: [], buyerStages: [buyer], userStages: [user] })!.gifting, buyer + user).toBe(2);
        }
    });

    it("reads the owner's table of the audience scale and the business buyer's category first for a business buyer", () => {
        const solo = purposeRelevance({ models: ["b2b"], categories: ["b2b:direct"], relationships: [], businessScales: ["solo"] })!;
        expect(solo).toMatchObject({ growth: 2, productivity: 2, creation: 2, learning: 2, gifting: 0, access: 0, compliance: 1 });
        const soloProxy = purposeRelevance({ models: ["b2b"], categories: ["b2b:proxy"], relationships: [], businessScales: ["solo"] })!;
        expect(soloProxy).toMatchObject({ gifting: 2, growth: 0, productivity: 0 });
        const midProxy = purposeRelevance({ models: ["b2b"], categories: ["b2b:proxy"], relationships: [], businessScales: ["mid"] })!;
        expect(midProxy).toMatchObject({ protection: 2, compliance: 2, health: 2, gifting: 2, access: 2, growth: 0, learning: 1 });
        const smbDual = purposeRelevance({ models: ["b2b"], categories: ["b2b:dual"], relationships: [], businessScales: ["smb"] })!;
        expect(smbDual).toMatchObject({ growth: 2, productivity: 2, learning: 2, compliance: 1 });
        // Entertainment (corporate hospitality) is primary for the larger Direct / Dual buyers; Everyday Needs for every scale but a solopreneur's Proxy / Dual.
        expect(smbDual).toMatchObject({ entertainment: 2, everyday: 2 });
        expect(soloProxy.everyday).toBe(0);
        expect(purposeOrderAbout({ models: ["b2b"], categories: ["b2b:dual"], relationships: [], businessScales: ["smb"] })).toBe("the audience scale and the buyer's category");
    });

    it("orders the differentiations by the business buyer's audience scale and category", () => {
        const levels = (scale: string, category: string) => differentiationRelevance({ models: ["b2b"], categories: ["b2b:" + category], relationships: [], businessScales: [scale] });
        expect(levels("solo", "direct")).toEqual({ cost: 2, convenience: 2, compliance: 0, premium: 1, performance: 2, ecosystem: 1 });
        expect(levels("mid", "proxy")).toEqual({ cost: 1, convenience: 1, compliance: 2, premium: 0, performance: 1, ecosystem: 2 });
        expect(levels("enterprise", "dual")).toEqual({ cost: 0, convenience: 2, compliance: 2, premium: 2, performance: 2, ecosystem: 2 });
        expect(differentiationRelevance({ models: ["b2b"], categories: ["b2b:dual"], relationships: [] })).toBeNull();
    });

    it("reads the owner's tables of the business buyer and user relationships before the audience scale", () => {
        const base = { models: ["b2b"], businessScales: ["mid"] };
        const employer = purposeRelevance({ ...base, categories: ["b2b:proxy"], relationships: ["rel:employer"] })!;
        expect(employer).toMatchObject({ learning: 2, health: 2, gifting: 2, protection: 2, compliance: 2, everyday: 2, entertainment: 1, productivity: 1, access: 1 });
        // (Business Growth is not in the proxy table: the audience scale's table says it.)
        expect(employer.growth).toBe(purposeRelevance({ ...base, categories: ["b2b:proxy"], relationships: [] })!.growth);
        const intermediary = purposeRelevance({ ...base, categories: ["b2b:proxy"], relationships: ["rel:intermediary"] })!;
        expect(intermediary).toMatchObject({ access: 2, protection: 2, entertainment: 0, health: 1 });
        const partner = purposeRelevance({ models: ["b2b"], categories: ["b2b:dual"], relationships: ["rel:copartner"] })!;
        expect(partner).toMatchObject({ growth: 2, productivity: 2, everyday: 2, learning: 1, health: 0, gifting: 0 });
        const serving = purposeRelevance({ models: ["b2b"], categories: ["b2b:dual"], relationships: ["rel:serving"] })!;
        expect(serving).toMatchObject({ learning: 2, entertainment: 2, health: 0 });
        expect(purposeOrderAbout({ models: ["b2b"], categories: ["b2b:dual"], relationships: ["rel:serving"] })).toBe("the buyer and user relationship");
    });

    it("says which differentiations the purposes chosen drive", () => {
        expect(differentiationByPurpose([])).toBeNull();
        expect(differentiationByPurpose(["compliance"])).toEqual({ cost: 0, convenience: 0, compliance: 2, premium: 0, performance: 0, ecosystem: 2 });
        expect(differentiationByPurpose(["growth", "protection"])).toEqual({ cost: 0, convenience: 2, compliance: 2, premium: 2, performance: 2, ecosystem: 2 });
        expect(differentiationByPurpose(["access"])).toEqual({ cost: 2, convenience: 2, compliance: 1, premium: 0, performance: 0, ecosystem: 0 });
        expect(differentiationByPurpose(["entertainment"])).toEqual({ cost: 0, convenience: 1, compliance: 0, premium: 2, performance: 0, ecosystem: 0 });
    });

    it("says which differentiations a business buyer and user relationship drives", () => {
        expect(differentiationByRelationship(["age:minor"])).toBeNull();
        expect(differentiationByRelationship(["rel:copartner"])).toEqual({ cost: 0, convenience: 1, compliance: 1, premium: 2, performance: 2, ecosystem: 2 });
        expect(differentiationByRelationship(["rel:employer"])).toEqual({ cost: 1, convenience: 2, compliance: 2, premium: 0, performance: 0, ecosystem: 2 });
        expect(differentiationByRelationship(["rel:sponsor"])).toEqual({ cost: 2, convenience: 0, compliance: 2, premium: 0, performance: 0, ecosystem: 1 });
        expect(differentiationByRelationship(["rel:otherbusiness"])).toEqual({ cost: 2, convenience: 2, compliance: 1, premium: 0, performance: 0, ecosystem: 1 });
    });

    it("says which outcomes the purposes chosen drive: the buyer's, by the category, and the user's", () => {
        expect(outcomeByPurpose([], ["b2c:direct"])).toBeNull();
        expect(outcomeByPurpose(["productivity"], [])).toBeNull();
        expect(outcomeByPurpose(["productivity"], ["b2c:direct"])).toEqual({ savings: 1, time: 2, assurance: 0, prestige: 0 });
        expect(outcomeByPurpose(["everyday"], ["b2c:direct"])).toEqual({ savings: 2, time: 2, assurance: 0, prestige: 0 });
        expect(outcomeByPurpose(["everyday"], ["b2c:proxy"])).toEqual({ savings: 1, time: 2, assurance: 0, prestige: 0 });
        expect(outcomeByPurpose(["gifting"], ["b2c:direct"])).toEqual({ savings: 0, time: 0, assurance: 0, prestige: 0 });
        expect(outcomeByPurpose(["gifting", "compliance"], ["b2b:dual"])).toEqual({ savings: 0, time: 0, assurance: 2, prestige: 2 });
        expect(userOutcomeByPurpose([])).toBeNull();
        expect(userOutcomeByPurpose(["learning", "protection"])).toEqual({ enjoy: 0, comfort: 0, safety: 2, learning: 2, belong: 0, practical: 0 });
        expect(userOutcomeByPurpose(["access"])).toMatchObject({ comfort: 2, practical: 0 });
    });

    it("makes the life stages, once both are answered, the first key of the differentiations and the outcomes", () => {
        // Not before both are answered.
        expect(differentiationByLifeStage(["young"], [])).toBeNull();
        expect(outcomesByLifeStage([], ["age:minor"])).toBeNull();
        // The buyer's life stage prefers: a Student cost and convenience, a Worker convenience and compliance, a Senior compliance and premium.
        expect(differentiationByLifeStage(["young"], ["age:minor"])).toEqual({ cost: 2, convenience: 2, compliance: 0, premium: 0, performance: 0, ecosystem: 0 });
        expect(differentiationByLifeStage(["adult"], ["age:senior"])).toEqual({ cost: 0, convenience: 2, compliance: 2, premium: 0, performance: 0, ecosystem: 0 });
        expect(differentiationByLifeStage(["senior"], ["age:adult"])).toEqual({ cost: 0, convenience: 0, compliance: 2, premium: 2, performance: 0, ecosystem: 0 });
        // A Worker buying for a Senior: health, protection and compliance are primary, so the legal cover (buyer) and safety and care (user) come out first.
        const workerSenior = outcomesByLifeStage(["adult"], ["age:senior"])!;
        // (Health, protection and compliance make the legal cover and the safety and care score at the top; everyday needs and access tie them, so they are among the first, not alone.)
        const first = (scores: Record<string, number>) => Object.keys(scores).filter(id => scores[id] === Math.max(...Object.values(scores)));
        expect(first(workerSenior.buyer)).toContain("assurance");
        expect(first(workerSenior.user)).toContain("safety");
        expect(workerSenior.user.learning).toBe(0);
    });
});
