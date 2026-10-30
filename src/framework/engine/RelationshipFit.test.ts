import { describe, expect, it } from "vitest";

import { RELATION_IDS_B2B, RELATION_IDS_B2C } from "./PositioningIds.ts";
import { RELATIONSHIP_FITS, categoryOfModel, relationshipFits, relationshipFitsUserStages, orderedByCategory, userStageFits } from "./RelationshipFit.ts";
import { RELATIONSHIP_INTENT } from "./PurposeRelevance.ts";

describe("which buyer and user relationships fit the buyer's category", () => {

    it("knows every relationship of the first version, each fitting at least one category", () => {
        for (const id of [...RELATION_IDS_B2C, ...RELATION_IDS_B2B]) expect(RELATIONSHIP_FITS[id]?.length, id).toBeGreaterThan(0);
    });

    it("agrees with the owner's table of the usual intent: a proxy relationship is never hidden from a Proxy Buyer, a dual one never from a Dual-Intent Buyer", () => {
        for (const [id, intent] of Object.entries(RELATIONSHIP_INTENT)) {
            if (intent === "proxy") expect(relationshipFits(id, "proxy"), id).toBe(true);
            if (intent === "dual") expect(relationshipFits(id, "dual"), id).toBe(true);
            if (intent === "either") { expect(relationshipFits(id, "proxy"), id).toBe(true); expect(relationshipFits(id, "dual"), id).toBe(true); }
        }
    });

    it("reads the category of a model, and offers everything where there is no Proxy or Dual-Intent category", () => {
        expect(categoryOfModel(["b2c:proxy", "b2b:dual"], "b2b")).toBe("dual");
        expect(categoryOfModel(["b2c:direct"], "b2c")).toBe("");
        expect(categoryOfModel([], "b2c")).toBe("");
        expect(relationshipFits("rel:partner", "")).toBe(true);
        expect(relationshipFits("rel:partner", "proxy")).toBe(false);
        expect(relationshipFits("rel:friend", "dual")).toBe(false);
    });

    it("gives a parent or legal guardian a minor or a young adult as the user, never an adult or a senior", () => {
        expect(["age:minor", "age:young", "age:adult", "age:senior"].map(id => userStageFits(["rel:parent"], id))).toEqual([true, true, false, false]);
        expect(["age:minor", "age:young", "age:adult", "age:senior"].map(id => userStageFits(["rel:caregiver"], id))).toEqual([true, true, true, true]);
        expect(userStageFits([], "age:senior")).toBe(true);
    });

    it("reads the owner's matrix of the buyer's life stage and the relationship for the user's life stage", () => {
        const stages = (rel: string[], buyer: string[]) => ["age:minor", "age:young", "age:adult", "age:senior"].filter(id => userStageFits(rel, id, buyer));
        expect(stages(["rel:parent"], ["young"])).toEqual(["age:minor"]);
        expect(stages(["rel:parent"], ["adult"])).toEqual(["age:minor", "age:young"]);
        expect(stages(["rel:parent"], ["senior"])).toEqual(["age:minor", "age:adult"]);
        expect(stages(["rel:caregiver"], ["senior"])).toEqual(["age:adult", "age:senior"]);
        expect(stages(["rel:partner"], ["young"])).toEqual(["age:young", "age:adult"]);
        // Several choices: a stage is offered when any combination offers it. None chosen: all.
        expect(stages(["rel:parent", "rel:partner"], ["adult"])).toEqual(["age:minor", "age:young", "age:adult", "age:senior"]);
        expect(stages([], ["young"])).toHaveLength(4);
        expect(stages(["rel:family"], [])).toHaveLength(4);
    });

    it("does not offer the parent to a buyer who cares for an adult or a senior", () => {
        expect(relationshipFitsUserStages("rel:parent", ["adult"], ["age:adult"])).toBe(false);
        expect(relationshipFitsUserStages("rel:parent", ["adult"], ["age:senior"])).toBe(false);
        expect(relationshipFitsUserStages("rel:parent", ["adult"], ["age:adult", "age:minor"])).toBe(true);
        expect(relationshipFitsUserStages("rel:parent", ["senior"], ["age:adult"])).toBe(true);
        expect(relationshipFitsUserStages("rel:caregiver", ["adult"], ["age:senior"])).toBe(true);
        expect(relationshipFitsUserStages("rel:parent", [], ["age:adult"])).toBe(true);
    });

    it("puts first the differentiations the buyer's category usually pairs with, and takes none away", () => {
        const all = ["cost", "convenience", "compliance", "premium"].map(id => ({ id }));
        const order = (categories: string[]) => orderedByCategory(all, categories).map(option => option.id);
        expect(order([])).toEqual(["cost", "convenience", "compliance", "premium"]);
        expect(order(["b2c:proxy"])).toEqual(["cost", "compliance", "convenience", "premium"]);
        expect(order(["b2c:direct"])).toEqual(["cost", "convenience", "compliance", "premium"]);
        expect(order(["b2b:dual"])).toEqual(["convenience", "premium", "cost", "compliance"]);
        expect(order(["b2c:proxy", "b2b:dual"])).toEqual(["cost", "convenience", "compliance", "premium"]);
    });
});
