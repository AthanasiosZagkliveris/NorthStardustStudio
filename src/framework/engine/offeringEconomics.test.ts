import { describe, expect, it } from "vitest";

import { offeringEconomics, type CostLine, type StreamAnalysis } from "./financial/FinancialModel.ts";
import { createRevenueStream } from "./financial/FinancialModel.ts";

/** A stream as break even reads it. */
function analysis(offeringId: string, price: number, variable: number, volume: number): StreamAnalysis {
    return {
        stream: { ...createRevenueStream(), id: "stream-" + offeringId, offeringId },
        price, variable, variableOverridden: false, contribution: price - variable, volume, revenue: price * volume, breakEvenAlone: null
    };
}

/** A running cost a month that serves `offeringIds` alone (none: shared by every Offering). */
function monthly(name: string, amount: number, offeringIds: string[] = []): CostLine {
    return { name, amount, frequency: "monthly", offeringIds, counted: true, behaviour: "fixed" } as unknown as CostLine;
}

describe("the cost of each Offering (doc 48, 15.2: time-driven activity-based costing by the founders' delivery hours)", () => {

    // Two Offerings; $2,000 of running costs a month, $200 of them the workshop's own; 100 delivery hours available a month.
    const outlook = { inputs: { fixed: 2000 }, streams: [analysis("product", 160, 90, 10), analysis("workshop", 85, 25, 20)] };
    const lines = [monthly("Studio rent", 1800), monthly("Loom hire", 200, ["workshop"])];

    it("shares the running costs at a rate for each delivery hour available, and charges an Offering's own costs to it alone", () => {
        const result = offeringEconomics(outlook, lines, 100, { product: 4, workshop: 2 });
        expect(result).toMatchObject({ running: 2000, own: 200, shared: 1800, hoursAvailable: 100, rate: 18 });
        const [product, workshop] = result.rows;
        // 4 hours x $18 = $72 a product; its direct $90: $162 in full, just above its $160 price.
        expect(product).toMatchObject({ direct: 90, runningOfOne: 72, full: 162, contribution: 70, sharedBy: "hours" });
        expect(product.margin).toBeCloseTo(-2 / 160, 6);
        // 2 hours x $18 + $200 / 20 = $46 a place; with its $25 direct, $71.
        expect(workshop).toMatchObject({ direct: 25, ownMonthly: 200, runningOfOne: 46, full: 71 });
        expect(workshop.margin).toBeCloseTo(14 / 85, 6);
        // Hours left over (100 - 40 - 40 = 20) stay free: what is shared out is less than the shared costs, never more.
        const sharedOut = result.rows.reduce((sum, row) => sum + (row.runningOfOne * row.sales - row.ownMonthly), 0);
        expect(sharedOut).toBeCloseTo(1440, 6);
        expect(sharedOut).toBeLessThanOrEqual(result.shared);
    });

    it("shares by revenue where an Offering gives no hours per sale, and where no delivery hours are known", () => {
        const noHours = offeringEconomics(outlook, lines, 100, { product: 4, workshop: null });
        // The workshop's revenue is $1,700 of $3,300: its share of the $1,800, over 20 places, and its own $10.
        expect(noHours.rows[1].sharedBy).toBe("revenue");
        expect(noHours.rows[1].runningOfOne).toBeCloseTo(1800 * (1700 / 3300) / 20 + 10, 6);
        const unknown = offeringEconomics(outlook, lines, null, { product: 4, workshop: 2 });
        expect(unknown.rate).toBeNull();
        expect(unknown.rows.every(row => row.sharedBy === "revenue")).toBe(true);
        // Shared by revenue, every running cost is placed: the total is the running costs.
        expect(unknown.rows.reduce((sum, row) => sum + row.runningOfOne * row.sales, 0)).toBeCloseTo(2000, 6);
    });

    it("says what a sale gives where its price is below its direct cost", () => {
        const below = offeringEconomics({ inputs: { fixed: 0 }, streams: [analysis("trade", 48, 72, 30)] }, [], 100, { trade: 1 });
        expect(below.rows[0]).toMatchObject({ contribution: -24, full: 72 });
        expect(below.rows[0].margin).toBeCloseTo(-0.5, 6);
    });

});
