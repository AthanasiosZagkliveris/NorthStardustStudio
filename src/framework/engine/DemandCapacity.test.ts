import { describe, expect, it } from "vitest";

import { DemandSource, DemandValue, asDemandValue, createDemand, createDemandSource, demandResult, capacityCheck, createDelivery, deliveryAllocation, deliveryEffort, founderDeliveryHours, WEEKS_PER_MONTH, founderWorkingHours } from "./DemandCapacity.ts";

/** Saved before several sources: one model and its inputs, read as it is on loading. */
function demand(model: string, inputs: Record<string, string>): DemandValue {
    return asDemandValue({ model, inputs });
}

function source(type: string, patch: Partial<DemandSource> = {}): DemandSource {
    return { ...createDemandSource(type), ...patch };
}

describe("demandResult: answers saved with one model", () => {

    it("gives nothing without a model", () => {
        expect(demandResult(undefined).expected).toBeNull();
        expect(demandResult(createDemand()).expected).toBeNull();
    });

    it("direct estimate", () => {
        expect(demandResult(demand("direct", { sales: "4" })).expected).toBe(4);
        expect(demandResult(demand("direct", {})).expected).toBeNull();
    });

    it("sales funnel: 40 prospects, 15% qualified, 25% buy gives 1.5", () => {
        const result = demandResult(demand("funnel", { prospects: "40", qualified: "15", buy: "25" }));
        expect(result.expected).toBe(1.5);
        expect(result.recurring).toBe(false);
        expect(result.working).toContain("1.5 a month");
    });

    it("sales funnel is incomplete without every figure", () => {
        expect(demandResult(demand("funnel", { prospects: "40", qualified: "15" })).expected).toBeNull();
    });

    it("referrals: 3 at 40% gives 1.2", () => {
        expect(demandResult(demand("referrals", { referrals: "3", buy: "40" })).expected).toBe(1.2);
    });

    it("repeat customers: 120 buying 3 times a year gives 30 a month", () => {
        expect(demandResult(demand("repeat", { customers: "120", perYear: "3" })).expected).toBe(30);
    });

    it("contracts: 12 bids, 25% won, 1 unit gives 0.25 a month", () => {
        const result = demandResult(demand("contracts", { bids: "12", win: "25", units: "1" }));
        // 12 * 0.25 * 1 / 12 = 0.25: two decimals keep it.
        expect(result.expected).toBeCloseTo(0.25, 5);
    });

    it("contracts: units default to 1", () => {
        expect(demandResult(demand("contracts", { bids: "24", win: "50" })).expected).toBe(1);
    });

    it("marketplace: 800 visitors at 2% gives 16", () => {
        expect(demandResult(demand("marketplace", { visitors: "800", buy: "2" })).expected).toBe(16);
    });

    it("subscription: 1 new at 5% cancelling levels at 20 active in about 45 months", () => {
        const result = demandResult(demand("subscription", { joining: "1", cancel: "5" }));
        expect(result.recurring).toBe(true);
        expect(result.expected).toBe(20);
        expect(result.monthsToNormal).toBe(45);
    });

    it("subscription with no cancellation has no level", () => {
        const result = demandResult(demand("subscription", { joining: "1", cancel: "0" }));
        expect(result.expected).toBeNull();
        expect(result.recurring).toBe(true);
        expect(result.joining).toBe(1);
    });

    it("a direct estimate becomes an Other figure; a funnel stays calculated", () => {
        expect(demand("direct", { sales: "4" }).sources[0]).toMatchObject({ type: "other", estimate: "4", calculate: false });
        expect(demand("funnel", { prospects: "40" }).sources[0]).toMatchObject({ type: "funnel", calculate: true });
    });

});

describe("demandResult: several customer sources", () => {

    it("adds the sources: a funnel of 0.9 and referrals of 0.6 give 1.5", () => {
        const result = demandResult({
            ...createDemand(),
            sources: [
                source("funnel", { calculate: true, inputs: { prospects: "24", qualified: "15", buy: "25" } }),
                source("referrals", { calculate: true, inputs: { referrals: "1.5", buy: "40" } })
            ]
        });
        expect(result.sources.map(part => part.expected)).toEqual([0.9, 0.6]);
        expect(result.expected).toBe(1.5);
        expect(result.working).toContain("Together about 1.5 a month");
    });

    it("a source can be a figure, whatever its type", () => {
        const result = demandResult({ ...createDemand(), sources: [source("funnel", { estimate: "2", inputs: { prospects: "40" } })] });
        expect(result.expected).toBe(2);
    });

    it("an incomplete source is left out, the others still count", () => {
        const result = demandResult({
            ...createDemand(),
            sources: [source("other", { estimate: "1" }), source("funnel", { calculate: true, inputs: { prospects: "40" } }), source("")]
        });
        expect(result.expected).toBe(1);
        expect(result.sources[1].expected).toBeNull();
    });

    it("repeat customers come from the customers the other sources bring", () => {
        const result = demandResult({
            ...createDemand(),
            sources: [
                source("repeat", { calculate: true, inputs: { again: "30", times: "2" } }),
                source("marketplace", { calculate: true, inputs: { visitors: "800", buy: "2" } })
            ]
        });
        // 16 a month won, 30% buy twice more: 9.6 repeat sales a month.
        expect(result.sources[0].expected).toBe(9.6);
        expect(result.expected).toBe(25.6);
    });

    it("repeat customers need another source to count", () => {
        const result = demandResult({ ...createDemand(), sources: [source("repeat", { calculate: true, inputs: { again: "30" } })] });
        expect(result.expected).toBeNull();
    });

    it("a recurring Offering: the sources give new clients, cancellations the active ones", () => {
        const result = demandResult({
            ...createDemand(),
            recurring: true,
            cancel: "10",
            sources: [
                source("other", { estimate: "0.3" }),
                source("referrals", { calculate: true, inputs: { referrals: "0.5", buy: "40" } }),
                source("repeat", { estimate: "5" })
            ]
        });
        // Repeat purchases are not counted for a subscription.
        expect(result.sources).toHaveLength(2);
        expect(result.joining).toBe(0.5);
        expect(result.expected).toBe(5);
        expect(result.monthsToNormal).toBe(22);
    });

    it("keeps the sources through saving and loading", () => {
        const saved = { ...createDemand(), recurring: true, cancel: "10", sources: [source("other", { estimate: "0.5", basis: "Half of builds" })] };
        expect(asDemandValue(JSON.parse(JSON.stringify(saved)))).toEqual(saved);
    });

});

describe("capacity: the founders' hours", () => {

    const founder = { id: "f", name: "Founder", hours: "160", deliveryHours: "96", deliveryShare: "" };

    it("delivery hours are given, or working hours times the share", () => {
        expect(founderDeliveryHours(founder)).toBe(96);
        expect(founderDeliveryHours({ name: "Old", hours: "160", deliveryShare: "60" })).toBe(96);
        expect(founderDeliveryHours({ name: "None", hours: "160", deliveryShare: "" })).toBeNull();
    });

    it("recurring work comes first; external hours are not capacity", () => {
        const delivery = {
            retainer: { ...createDelivery(), hours: { f: "6" } },
            build: { ...createDelivery(), hours: { f: "18", dev: "12" } }
        };
        const check = capacityCheck(
            [founder],
            { retainer: [5.5, 5.5], build: [2, 3] },
            delivery, 2, new Set(["retainer"]), { dev: "Developer" }
        )!;
        // 5.5 clients x 6 h = 33 h committed; 96 - 33 = 63 h remaining.
        expect(check.committed[0]).toBe(33);
        expect(check.founders[0].available - check.founders[0].recurring[0]).toBe(63);
        // The build's founder hours only: 2 x 18 = 36.
        expect(check.founders[0].other[0]).toBe(36);
        expect(check.needed[0]).toBe(69);
        // The developer's 12 h a build is beside the capacity, not in it.
        expect(check.external).toEqual([{ id: "dev", name: "Developer", hours: [24, 36], peak: 36 }]);
        expect(check.available).toBe(96);
        expect(check.firstShortfall).toBeNull();
    });

    it("a founder over their hours is a shortfall, from that month", () => {
        const check = capacityCheck([founder], { build: [2, 6] },
            { build: { ...createDelivery(), hours: { f: "18" } } }, 2)!;
        expect(check.firstShortfall).toBe(1);
    });

    it("effort from before the split counts on its first deliverer", () => {
        expect(deliveryAllocation({ ...createDelivery(), effort: "30", deliverers: ["f"] })).toEqual({ f: 30 });
        expect(deliveryEffort({ ...createDelivery(), hours: { f: "18", dev: "12" } })).toBe(30);
    });

});

describe("hours a week or a month", () => {

    it("weekly hours become monthly at 52 / 12 weeks a month", () => {
        expect(WEEKS_PER_MONTH).toBeCloseTo(4.333, 3);
        const weekly = { name: "F", hours: "40", deliveryHours: "22", deliveryShare: "", hoursPeriod: "week" as const };
        expect(founderWorkingHours(weekly)).toBeCloseTo(173.33, 2);
        expect(founderDeliveryHours(weekly)).toBeCloseTo(95.33, 2);
        // Given a month, or before the choice existed: unchanged.
        expect(founderDeliveryHours({ name: "F", hours: "160", deliveryHours: "96", deliveryShare: "" })).toBe(96);
    });

    it("a retainer's weekly hours per client count as monthly", () => {
        const retainer = { ...createDelivery(), hours: { f: "1.5" }, mode: "monthly" as const, period: "week" as const };
        expect(deliveryAllocation(retainer).f).toBeCloseTo(6.5, 5);
        // Per unit, a week is not a period: the hours stand.
        expect(deliveryAllocation({ ...retainer, mode: "unit" }).f).toBe(1.5);
    });

});

describe("numbers as typed", () => {

    it("reads a single comma or point as the decimal separator", () => {
        const funnel = (buy: string) => demandResult(demand("funnel", { prospects: "100", qualified: "10", buy })).expected;
        expect(funnel("12,5")).toBe(1.25);
        expect(funnel("12.5")).toBe(1.25);
        expect(funnel("12.500")).toBe(1.25);
    });

    it("reads numbers glued together by other characters as nothing", () => {
        expect(demandResult(demand("referrals", { referrals: "2x 30", buy: "50" })).expected).toBeNull();
    });

});
