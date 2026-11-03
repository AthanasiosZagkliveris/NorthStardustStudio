import { describe, expect, it } from "vitest";

import { positioningLacks } from "./OpenItems.ts";

const none = { customerType: [] as string[], audience: [] as string[], buyerCategory: [] as string[], purpose: [] as string[], differentiation: [] as string[], outcome: [] as string[] };

describe("what the Positioning tile still lacks (the Review's open item)", () => {

    it("says every question of an empty tile, the audience and the category only once a relationship is chosen", () => {
        expect(positioningLacks(none)).toEqual(["the seller and buyer relationship", "the purpose", "the differentiation", "the outcome"]);
        expect(positioningLacks({ ...none, customerType: ["b2c"] })).toEqual(["the audience", "the buyer's category", "the purpose", "the differentiation", "the outcome"]);
    });

    it("asks the audience and the category of each relationship chosen, and nothing of a complete tile", () => {
        const b2cDone = { ...none, customerType: ["b2c", "b2b"], audience: ["adult"], buyerCategory: ["b2c:direct"], purpose: ["creation"], differentiation: ["premium"], outcome: ["prestige"] };
        expect(positioningLacks(b2cDone)).toEqual(["the audience", "the buyer's category"]);
        expect(positioningLacks({ ...b2cDone, audience: ["adult", "mid"], buyerCategory: ["b2c:direct", "b2b:proxy"] })).toEqual([]);
    });

});
