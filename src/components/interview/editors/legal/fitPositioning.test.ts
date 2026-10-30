import { describe, expect, it } from "vitest";

import { fitPositioningToStage } from "./shared.tsx";

const organisation = (patch: Partial<{ customerType: string[]; marketType: string; audience: string[]; outcome: string[]; buyerCategory: string[]; purpose: string[]; endUser: string[] }>) => ({ customerType: [], marketType: "single", audience: [], outcome: [], ...patch });

describe("the Positioning answers follow the business stage", () => {

    it("keeps answers that fit the stage, and returns the same object", () => {
        const fits = organisation({ customerType: ["b2b"], audience: ["smb"], outcome: ["cost", "premium"] });
        expect(fitPositioningToStage(fits, "launch")).toBe(fits);
    });

    it("sends a question with more answers than the stage allows back to its default (empty)", () => {
        // Managing allowed two scales and two outcomes; launching allows one scale and two outcomes.
        const fitted = fitPositioningToStage(organisation({ customerType: ["b2b"], audience: ["smb", "mid"], outcome: ["cost", "premium"] }), "launch");
        expect(fitted.audience).toEqual([]);
        expect(fitted.outcome).toEqual(["cost", "premium"]);
        // Planning allows one outcome too.
        expect(fitPositioningToStage(organisation({ customerType: ["b2b"], outcome: ["cost", "premium"] }), "plan").outcome).toEqual([]);
        // Two relationships go back while launching.
        expect(fitPositioningToStage(organisation({ customerType: ["b2b", "b2c"] }), "launch").customerType).toEqual([]);
    });

    it("holds the purpose to the same limit as the outcome", () => {
        const held = organisation({ customerType: ["b2c"], purpose: ["learning", "gifting"] });
        expect(fitPositioningToStage(held, "launch")).toBe(held);
        expect(fitPositioningToStage(held, "plan").purpose).toEqual([]);
    });

    it("leaves a growing business free", () => {
        const many = organisation({ customerType: ["b2b", "b2c"], audience: ["solo", "smb", "mid"], outcome: ["cost", "convenience", "premium"], purpose: ["learning", "gifting", "access"] });
        expect(fitPositioningToStage(many, "grow")).toBe(many);
    });

});

describe("fitPositioningToStage: the buyer's category and the End User", () => {
    const base = { customerType: ["b2c"], marketType: "single", audience: ["adult"], outcome: [] as string[], buyerCategory: ["b2c:proxy"] };

    it("keeps the End User's answers that fit the stage", () => {
        const held = { ...base, endUser: ["rel:parent", "rel:family", "age:minor", "age:young"] };
        expect(fitPositioningToStage(held, "manage")).toBe(held);
    });

    it("empties a group with more answers than the stage allows, and the others stay", () => {
        const held = { ...base, endUser: ["rel:parent", "rel:family", "age:minor"] };
        expect(fitPositioningToStage(held, "launch").endUser).toEqual(["age:minor"]);
    });

    it("keeps the End User for a Dual-Intent buyer too, and drops it for a Direct Buyer", () => {
        expect(fitPositioningToStage({ ...base, buyerCategory: ["b2c:dual"], endUser: ["rel:parent"] }, "grow").endUser).toEqual(["rel:parent"]);
        expect(fitPositioningToStage({ ...base, buyerCategory: ["b2c:direct"], endUser: ["rel:parent", "age:minor"] }, "grow").endUser).toEqual([]);
    });

    it("asks the user's life stage of a consumer buyer only, and the business relationships of a business buyer", () => {
        const business = { ...base, customerType: ["b2b"], audience: ["smb"], buyerCategory: ["b2b:proxy"], endUser: ["rel:employer", "age:minor", "rel:parent"] };
        expect(fitPositioningToStage(business, "grow").endUser).toEqual(["rel:employer"]);
    });

    it("drops the buyer's category of a relationship that is no longer chosen, and the End User with it", () => {
        const fitted = fitPositioningToStage({ ...base, customerType: ["b2b"], audience: ["smb"], endUser: ["rel:parent"] }, "grow");
        expect(fitted.buyerCategory).toEqual([]);
        expect(fitted.endUser).toEqual([]);
    });

    it("takes a relationship that cannot be the category away: a partner is not a Proxy Buyer's", () => {
        const held = { ...base, endUser: ["rel:partner", "rel:parent"] };
        expect(fitPositioningToStage(held, "grow").endUser).toEqual(["rel:parent"]);
        expect(fitPositioningToStage({ ...base, buyerCategory: ["b2c:dual"], endUser: ["rel:friend", "rel:partner"] }, "grow").endUser).toEqual(["rel:partner"]);
    });

    it("keeps the user's outcome only while a buyer is a Proxy or Dual-Intent Buyer, to the stage's limit", () => {
        expect(fitPositioningToStage({ ...base, outcomeUser: ["safety"] }, "grow").outcomeUser).toEqual(["safety"]);
        expect(fitPositioningToStage({ ...base, buyerCategory: ["b2c:direct"], outcomeUser: ["safety"] }, "grow").outcomeUser).toEqual([]);
        expect(fitPositioningToStage({ ...base, outcomeUser: ["safety", "enjoy", "comfort"] }, "manage").outcomeUser).toEqual([]);
    });

    it("gives a parent or legal guardian a minor or a young adult as the user: an adult or a senior goes", () => {
        const held = { ...base, endUser: ["rel:parent", "age:minor", "age:adult", "age:senior"] };
        expect(fitPositioningToStage(held, "grow").endUser).toEqual(["rel:parent", "age:minor"]);
        expect(fitPositioningToStage({ ...held, endUser: ["rel:caregiver", "age:adult", "age:senior"] }, "grow").endUser).toEqual(["rel:caregiver", "age:adult", "age:senior"]);
    });
});
