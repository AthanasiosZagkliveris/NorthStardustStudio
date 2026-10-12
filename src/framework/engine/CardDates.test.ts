import { describe, expect, it } from "vitest";

import { asBusinessCapabilityValue, asLegalEntityValue, createBusinessResourceSlot } from "./AnswerUtils";
import { asFinancialFoundationValue, consolidateCosts, costSchedule } from "./FinancialModel";

/* A card's Start date places its cost in a month of the cash flow; its End date stops a recurring cost (cost model, section 2). */

const cost = (price: string, frequency: string) => ({ price, frequency, frequencyOther: "", unit: "", currency: "" });
const PLAN = { month: "01", year: "2027" };

function schedule(fields: Record<string, unknown>) {
    const base = asBusinessCapabilityValue(undefined);
    const slot = { ...createBusinessResourceSlot(), id: "s", name: "Thing", status: "costs", ...fields };
    const capability = asBusinessCapabilityValue({ ...base, resources: { digital: [{ id: "software-web", name: "", slots: [slot] }] } });
    const foundation = { ...asFinancialFoundationValue({}), planStart: PLAN, planYears: "1" };
    const lines = consolidateCosts(foundation, { legalEntity: asLegalEntityValue({}), capability, resourceGroupLabels: {}, subsectionLabels: {}, currency: "EUR", foundersLinked: false });
    return costSchedule(lines.find(line => line.id === "s")!, PLAN);
}

describe("a card's dates in the cash flow", () => {

    it("a monthly cost runs from the month of its Start date", () => {
        const months = schedule({ cost: cost("30", "monthly"), startDate: "2027-04-10" });
        expect(months.slice(0, 6)).toEqual([0, 0, 0, 30, 30, 30]);
    });

    it("an End date stops it in that month", () => {
        const months = schedule({ cost: cost("30", "monthly"), startDate: "2027-02-01", endDate: "2027-05-31" });
        expect(months.slice(0, 7)).toEqual([0, 30, 30, 30, 30, 0, 0]);
    });

    it("a one-time cost falls in the month of its Start date", () => {
        const months = schedule({ cost: cost("200", "one-time"), startDate: "2027-03-15" });
        expect(months.slice(0, 4)).toEqual([0, 0, 200, 0]);
    });

    it("an annual cost recurs from its month", () => {
        const months = schedule({ cost: cost("120", "annually"), startDate: "2027-02-20" });
        expect(months[1]).toBe(120);
        expect(months[13]).toBe(120);
        expect(months[0]).toBe(0);
    });

});
