import { describe, expect, it } from "vitest";

import { summaryText } from "./cardSummary";

describe("summaryText", () => {

    it("joins the non-empty parts with a middle dot", () => {

        expect(summaryText("Costs", "", null, " $35 monthly ", undefined, false)).toBe("Costs · $35 monthly");

    });

    it("is empty when nothing is filled in", () => {

        expect(summaryText("", "  ", null)).toBe("");

    });

});
