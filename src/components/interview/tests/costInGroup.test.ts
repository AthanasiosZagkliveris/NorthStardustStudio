import { describe, expect, it } from "vitest";

import { unitsOf, type BusinessCostValue } from "../../../framework/engine/AnswerUtils.ts";
import { costInGroup } from "../editors/BusinessCapabilityEditor.tsx";

const cost = { frequency: "monthly", frequencyOther: "x", price: "10", unit: "kg" } as unknown as BusinessCostValue;

describe("a card that changes its category or group starts its Frequency again", () => {

    it("says Select (empty) for a group that offers several, and keeps nothing of the old frequency", () => {
        const next = costInGroup(cost, "infrastructure", "devices-tools");
        expect(next.frequency).toBe("");
        expect(next.frequencyOther).toBe("");
        expect(next.unit).toBe("");
        expect(next.price).toBe("10");
    });

    it("takes the only frequency a group offers", () => {
        expect(costInGroup(cost, "infrastructure", "premises").frequency).toBe("one-time");
        expect(costInGroup(cost, "infrastructure", "premises-utilities").frequency).toBe("monthly");
        expect(costInGroup(cost, "offering", "site-hire").frequency).toBe("per-project");
    });

    it("takes the unit with an only Per unit frequency", () => {
        const next = costInGroup(cost, "infrastructure", "furniture-fittings");
        expect(next.frequency).toBe("per-unit");
        expect(next.unit).toBe(unitsOf("infrastructure", "furniture-fittings")[0] ?? "unit");
    });

    it("says Select where there is no group", () => {
        expect(costInGroup(cost, "infrastructure", "").frequency).toBe("");
    });

});
