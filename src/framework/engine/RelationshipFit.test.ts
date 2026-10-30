import { describe, expect, it } from "vitest";

import { RELATION_IDS_B2B, RELATION_IDS_B2C } from "./PositioningIds.ts";
import { RELATIONSHIP_FITS, categoryOfModel, relationshipFits, userStageFits } from "./RelationshipFit.ts";
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
});
