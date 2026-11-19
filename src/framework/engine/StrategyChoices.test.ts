import { describe, expect, it } from "vitest";

import { changeEffectLines, changeEffectsShown, changeRows, compassChoicesShown, compassDraft, growthOptions, growthStart, stanceStart, SW1_CHANGES } from "./StrategyChoices.ts";

/* SW1 AND SC1 TO SC3 (doc 49, 2.3 and 2.4). */
describe("the Strategy page's choices", () => {

    const [first, second, third] = SW1_CHANGES.map(change => change.id);

    it("starts SW1 with the Segments' changes ticked and first, then follows what the founder saves", () => {
        expect(changeEffectsShown(undefined, [second, first])).toEqual({ ticked: [second, first], ratings: {} });
        expect(changeRows([second]).map(row => row.id).slice(0, 2)).toEqual([second, first]);
        expect(changeEffectsShown({ [third]: 5, [first]: 0 }, [second])).toEqual({ ticked: [third, first], ratings: { [third]: 5 } });
    });

    it("turns a change rated 4 or 5 into an Opportunity and 1 or 2 into a Threat, 3 into neither", () => {
        const lines = changeEffectLines({ [first]: 5, [second]: 1, [third]: 3 });
        expect(lines.opportunities).toEqual(["Changes in " + SW1_CHANGES[0].label.toLowerCase() + " could help you."]);
        expect(lines.threats).toEqual(["Changes in " + SW1_CHANGES[1].label.toLowerCase() + " could hurt you."]);
    });

    it("starts SC1 from the fullest pair of quadrants, the first two lines counting double; only SO or WO early on", () => {
        const swot = { strengths: ["a"], weaknesses: ["b", "c", "d"], opportunities: [""], threats: ["e", "f"] };
        expect(stanceStart(swot, "manage")).toBe("wt");
        expect(stanceStart(swot, "plan")).toBe("wo");
        expect(stanceStart({}, "manage")).toBe("");
    });

    it("offers and starts SC2 by the stage and by PB8's reach", () => {
        expect(growthOptions("launch").map(option => option.id)[0]).toBe("launch");
        expect(growthOptions("manage").some(option => option.id === "launch")).toBe(false);
        expect(growthStart({ stage: "plan", reachBeyond: true })).toEqual(["launch", "market"]);
        expect(growthStart({ stage: "grow", reachBeyond: false })).toEqual([]);
    });

    it("writes the Compass draft, a part with no answer left out (doc 49, 2.4)", () => {
        const context = { stage: "plan", changeStarts: [], segments: [{ id: "s1", name: "Gift buyers", differentiation: ["premium"] }, { id: "s2", name: "Hotels", differentiation: [] }], reachBeyond: false };
        const shown = compassChoicesShown({ stance: "so", growth: ["launch", "penetration"] }, {}, context);
        expect(compassDraft("Jan 2027 – Dec 2029", shown, context)).toBe("Over Jan 2027 – Dec 2029, our focus is Gift buyers. We will win our first customers at launch and sell more to the customers we serve, using our strengths to seize opportunities, and stand out for high quality. This takes us towards our Vision.");
        expect(compassDraft("", compassChoicesShown({ firstSegmentId: "s2", growth: [] }, {}, context), context)).toBe("Our focus is Hotels. This takes us towards our Vision.");
        expect(compassDraft("", compassChoicesShown({}, {}, { ...context, segments: [] }), { ...context, segments: [] })).toBe("We will win our first customers at launch. This takes us towards our Vision.");
    });

});
