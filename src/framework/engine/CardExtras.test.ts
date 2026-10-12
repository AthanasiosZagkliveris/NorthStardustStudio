import { describe, expect, it } from "vitest";

import { asBusinessCapabilityValue, asLegalEntityValue, createBusinessPartner } from "./AnswerUtils";
import { calculatedLines } from "./CalculatedLines";
import { financialForecast } from "./FinancialForecast";
import { asFinancialFoundationValue, asFinancialSustainabilityValue, consolidateCosts, createRevenueStream } from "./FinancialModel";
import { createGlobalSettings } from "./GlobalSettings";

/* X6, X7, P1: the extras that are a rate or a floor become lines or a purchase rule: customs duty and other duties on the goods, a person's commission, a minimum order. */

const cost = (price: string, frequency: string, unit = "") => ({ price, frequency, frequencyOther: "", unit, currency: "" });
const PLAN = { month: "01", year: "2027" };

function producer(fields: Record<string, unknown> = {}) {
    return { ...createBusinessPartner("Wool mill", "suppliers"), id: "mill", name: "Wool mill", group: "producers-wholesalers", offeringIds: ["o1"], startDate: "2027-01-01", cost: cost("2", "per-unit", "kg"), ...fields };
}

function consolidated(partner: object, extra: object = {}) {
    const base = asBusinessCapabilityValue(undefined);
    const capability = asBusinessCapabilityValue({ ...base, ...extra, offering: { ...base.offering, ...(extra as { offering?: object }).offering, providers: [partner] } });
    const foundation = { ...asFinancialFoundationValue({}), planStart: PLAN, planYears: "1" };
    const lines = consolidateCosts(foundation, { legalEntity: asLegalEntityValue({}), capability, resourceGroupLabels: {}, subsectionLabels: {}, currency: "EUR", foundersLinked: false });
    return { capability, foundation, lines };
}

describe("customs duty and other duties (percent of cost)", () => {

    it("are lines of the goods' own kind: the card's price times the rate, per unit like the goods", () => {
        const { lines } = consolidated(producer({ extras: { "customs-duty": "5", "other-duties": "2" } }));
        const duty = lines.find(line => line.id === "mill:customs-duty")!;
        const other = lines.find(line => line.id === "mill:other-duties")!;
        expect(duty.amount).toBe(0.1);
        expect(duty.frequency).toBe("per-unit");
        expect(other.amount).toBe(0.04);
        expect(lines.find(line => line.id === "mill")!.amount).toBe(2);
    });

    it("clearance and handling stays one line per shipment", () => {
        const { lines } = consolidated(producer({ extras: { "clearance-handling": "40" } }));
        const clearance = lines.find(line => line.id === "mill:clearance-handling")!;
        expect(clearance.amount).toBe(40);
        expect(clearance.frequency).toBe("per-project");
    });

    it("an extra not ticked (no figure) adds nothing", () => {
        const { lines } = consolidated(producer({ extras: { "customs-duty": "" } }));
        expect(lines.some(line => line.id === "mill:customs-duty")).toBe(false);
    });

});

describe("a person's commission (percent of revenue)", () => {

    it("is a calculated line of the revenue it follows, not a fixed cost", () => {
        const base = asBusinessCapabilityValue(undefined);
        const slot = {
            id: "seller", name: "Seller", status: "costs", category: "hr", group: "delivery-team", offeringIds: ["o1"], startDate: "2027-01-01",
            cost: cost("1000", "monthly"), extras: { commission: "3" }
        };
        const capability = asBusinessCapabilityValue({ ...base, offering: { ...base.offering, resources: [{ ...base.offering.resources[0], ...slot }] } });
        const foundation = { ...asFinancialFoundationValue({}), planStart: PLAN, planYears: "1" };
        const lines = consolidateCosts(foundation, { legalEntity: asLegalEntityValue({}), capability, resourceGroupLabels: {}, subsectionLabels: {}, currency: "EUR", foundersLinked: false });
        const commission = lines.find(line => line.id === "seller:commission");
        expect(commission?.frequency).toBe("usage-based");
        expect(commission?.billing).toBe("percentage");
        expect(commission?.amount).toBe(3);
    });

});

describe("the minimum order (X6)", () => {

    function run(minimum: string, demand: number) {
        const { capability, foundation, lines } = consolidated(producer({ extras: { "minimum-order": minimum } }));
        // (300 units a month, from month 1.)
        const streams = [{ ...createRevenueStream(), id: "s", offeringId: "o1", price: "100", volume: String(demand), start: { month: "01", year: "2027" }, frequency: "monthly" as const, itemsPerOrder: "1" }];
        const revenuePage = asFinancialSustainabilityValue({ streams });
        const calculated = calculatedLines({ foundation, revenuePage, lines, capability, settings: createGlobalSettings(), openingDate: "2027-01-01", drawings: false });
        const forecast = financialForecast(foundation, revenuePage, lines, asLegalEntityValue({}), String, calculated);
        return forecast.profitAndLoss.rows.find(row => row.label === "Cost of sales (variable costs)")!.values.slice(0, 4);
    }

    it("without a minimum the cost follows the units sold", () => {
        expect(run("", 300)).toEqual([600, 600, 600, 600]);
    });

    it("buys the minimum when a purchase is needed, carries the excess, and buys nothing while stock covers the demand", () => {
        // Minimum 500 at 2: month 1 buys 500 (1,000), carries 200; month 2 needs 100 from the market, buys 500 (1,000), carries 400; month 3 is met from stock (0); month 4 buys again.
        expect(run("500", 300)).toEqual([1000, 1000, 0, 1000]);
    });

});
