import { describe, expect, it } from "vitest";

import { fitPositioningToStage } from "./shared.tsx";

const organisation = (patch: Partial<{ customerType: string[]; marketType: string; audience: string[]; outcome: string[] }>) => ({ customerType: [], marketType: "", audience: [], outcome: [], ...patch });

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

    it("clears an option the stage locks, only in the question that holds it", () => {
        const held = organisation({ customerType: ["b2g"], audience: ["central", "smb"], outcome: ["cost"] });
        expect(fitPositioningToStage(held, "manage")).toBe(held);
        const early = fitPositioningToStage(held, "launch");
        expect(early.audience).toEqual(["smb"]);
        expect(early.customerType).toEqual(["b2g"]);
    });

    it("leaves a growing business free, and keeps the side outcomes only where each side asks", () => {
        const many = organisation({ customerType: ["b2b", "b2c", "b2g"], audience: ["solo", "smb", "mid"], outcome: ["cost", "convenience", "premium"] });
        expect(fitPositioningToStage(many, "grow")).toBe(many);
        const sides = organisation({ customerType: ["b2b", "b2c"], marketType: "multi", outcome: ["b2b:cost", "b2c:premium"] });
        expect(fitPositioningToStage(sides, "manage")).toBe(sides);
        // Back to launching: one question, so the side answers go.
        expect(fitPositioningToStage(sides, "launch").outcome).toEqual([]);
        // A platform's side answers over the stage's limit go side by side.
        expect(fitPositioningToStage(organisation({ customerType: ["b2b", "b2c"], marketType: "multi", outcome: ["b2b:cost", "b2b:convenience", "b2b:premium", "b2c:premium"] }), "manage").outcome).toEqual(["b2c:premium"]);
    });

});
